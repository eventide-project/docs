# Entity Cache

The [entity store](./) uses the entity cache to optimize the retrieval of entities.

When an entity is "retrieved", the events in its event stream are read and projected onto the entity.

Each time an entity is retrieved, the resulting entity is recorded in a cache. Any subsequent retrieval of the entity requires that only the events recorded since the previous retrieval are read and projected onto the entity.

As a further optimization, to avoid the cost of projecting all of an entity's events when the entity is not in the cache (as when a service has just been started), an entity is periodically persisted to disk in a snapshot stream. If an entity is retrieved and there's no cache entry for it, the latest [snapshot](./snapshotting.md) will be retrieved and cached before the latest events are read and projected.

The entity cache is composed of two parts: the in-memory cache that stores any entity retrieved by a its store, and the on-disk persistent cache of entity snapshots that are used to create an entity's cache record if one is not already present in the cache at the time of the retrieval.

<div class="note custom-block">
  <p>
    Note: It's quite rare to have to interact directly with the entity cache. Entities are cached automatically by "retrieving" an entity from an entity store. The entity cache is transparent and in the background for the vast majority of uses. This user guide is provided as an affordance, but it's unlikely to be necessary to the use of the whole toolkit.
  </p>
</div>

## Entity Cache Facts

- The cache stores not only the entities, but also their stream version
- Caches are not shared between stores
- The cache data lifecycle can last for the life of the Ruby process, the life of the current thread, or the just life of the cache object itself
- Entities are not cleared from the cache once they are inserted into it
- The cache is made of two stores: the in-memory _internal_ cache, and an optional _external_ entity [snapshot](./snapshotting.md) writer and reader
- The on-disk snapshot of an entity is only retrieved when an entity retrieval is actuated and there is no existing cache record for the entity in the cache

## Cache Record

An entity that has been cached is contained in a _cache record_.

The cache record contains the entity as well as metadata about the caching of the entity in both the internal, in-memory cache and the optional external snapshot store.

``` ruby
# Cache record definition
Record = Struct.new(
  :id,
  :entity,
  :version,
  :time,
  :persisted_version,
  :persisted_time
)
```

**Attributes**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the cached entity | String |
| entity | This cached entity | Object |
| version | The stream version of the cached entity | Integer |
| time | Time that the entity was cached | Time |
| persisted_versiion | Version of the most recent entity snapshot stored | Integer |
| persisted_time | Time that the most recent entity snapshot was stored | Time |

## Caching an Entity

<div class="note custom-block">
  <p>
    Entities are cached automatically by "retrieving" an entity from an entity store. The entity cache is transparent and in the background for the vast majority of uses. See the <a href="./#retrieving-an-entity">entity store user guide</a> for more details on the entity store.
  </p>
</div>

``` ruby
put(id, entity, version, time: clock.now, persisted_version: nil, persisted_time: clock.now)
```

**Returns**

The cache record that was either created and inserted into the cache, or the cache record that was updated if there was already a record in the cache for the entity.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the entity being cached | String |
| entity | This entity being cached | Object |
| version | The stream version of the entity being cached | Integer |
| time | Time that the entity is cached | Time |
| persisted_versiion | Version of the most recent entity snapshot stored | Integer |
| persisted_time | Time that the most recent entity snapshot was stored | Time |

## Get a Record from the Cache

``` ruby
get(id)
```

**Returns**

The cache record corresponding to the ID, or `nil` if no cache record is found.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the entity for the cache record being retrieved | String |

<div class="note custom-block">
  <p>
    Note: If the external <a href="./snapshotting.md">snapshot store</a> is configured, and if no cache record is found in the internal cache, a retrieval of the latest snapshot is actuated. If a snapshot is retrieved, it is inserted into the cache, and subsequently returned to the caller of the <code>get</code> method.
  </p>
</div>

## Deleting Cache Records from the Internal Store

``` ruby
delete(id)
```

**Returns**

Returns the cache record that corresponds to the ID, or `nil` if there is no cache record for the ID.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The entity ID of the cache record being deleted | String |

## Counting Cache Records in the Internal Store

``` ruby
count()
```

**Returns**

Returns the count of records in the internal store.

## Determining Whether the Cache's Internal Store Has Any Records

``` ruby
empty?()
```

**Returns**

Returns `false` if the internal store has any cache records, and `true` if the internal store has no records.

## Scoping

A cache's _scope_ controls whether and how a cache is shared between different instances of the same entity store class.

Entity store instances can be constructed and destructed as often as [messages](/user-guide/messages-and-message-data/) are dispatched to [handlers](/user-guide/handlers.md). However, the entity caches should not be garbage collected when their entity store goes out of scope and is garbage collected.

The reason for this is that an entity cache has accumulated current projections of entities from their event streams, and loosing those caches when a store instance is garbage collected would have a detrimental and noticeable impact on performance.

A cache's scope can be one of:

- `:thread`
- `:global`
- `:exclusive`

### Thread

The thread scope is the default scope.

The thread scope will store an entity store's cache in thread-local storage. This keeps stores of the same class that are operating independently in separate threads isolated from each other and free of concurrency collisions or contention.

### Global

The global scope means that the cache is scoped to the lifecycle of a particular entity store class.

Ruby classes remain in scope for the entire lifecycle of a Ruby process. Therefore, a store's cache will remain in-memory until the process is terminated.

The global scope is rarely used in-practice except for certain circumstances where a store might be used in a utility script.

### Exclusive

Exclusive scope means that a cache is used _exclusively_ by one instance of an entity store. When the entity store goes out of scope and is garbage collected, the cache will be garbage collected as well.

The exclusive scope is useful in development when testing. In such situations, having a cache that out-lives the lifecycle of a store can create false and unexpected test results.

## ENTITY_CACHE_SCOPE Environment Variable

The `ENTITY_CACHE_SCOPE` environment variable can be used to override the default value.

It can be set to one of the following values:

- `thread`
- `global`
- `exclusive`

``` bash
ENTITY_CACHE_SCOPE=global start_service.sh
```

### Set ENTITY_CACHE_SCOPE on a Development Machine

On a development machine, the `ENTITY_CACHE_SCOPE` environment variable should be set to `exclusive`. This is because the other scopes would cause the same cache instance to be reused by a particular entity store class for the life of a Ruby process.

The effect of this is that the same entity cache instance would be used for the entirety of a test run, which would allow dirty state to interfere potentially in tests that use the store. And this could cause non-deterministic test results and false test results.

In bench testing work on a development machine, an individual cache instance should not be shared with other instances of the same entity store class.

It's good practice on development machines to export the `ENTITY_CACHE_SCOPE` environment variable in the user profile scripts on a development machine.

``` bash
export ENTITY_CACHE_SCOPE=exclusive
```

## Clearing the In-Memory Cache

The entity cache is never cleared in an operational system. Once an entity is inserted into the entity cache, it remains there until the Ruby process that the cache is running in is terminated.

Because services are restarted for upgrades or other maintenance and operational reasons, entity caches are typically cleared on a sufficiently-regular basis such that memory utilization does not become an issue.

However, long-lived services that are very stable and have no maintenance or operational reasons to be restarted will accumulate cache records in-memory indefinitely. In practice, this is usually not an issue and can be counteracted easily with system-level process monitoring tools that simply restarts a service when it reaches a given memory consumption threshold.

This is a perfectly safe operation because services are designed to be both autonomous and idempotent as a matter of course, and the [component host](/user-guide/component-host.md) infrastructure does service shutdown in a safe and graceful way. If a service is either not autonomous or idempotent, then serious malfunctions will be evident long before memory consumption becomes an issue.

## Constructing an Entity Cache

Entity caches can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

``` ruby
self.build(subject, scope: thread, persist_interval: nil, external_store: nil, external_store_session: nil)
```

The constructor not only instantiates the cache, but also invokes the cache's `configure` instance method, which constructs the cache's operational dependencies.

**Returns**

Instance of the `EntityCache` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| subject | The entity class that the cache manages | Class |
| scope | One of the three entity cache scopes, :thread, :global, or :exclusive | Symbol |
| persist_interval | Interval, in messages read and projected, in which the entity state is written to its snapshot stream | Integer |
| external_store | A class that implements the snapshotting protocol | Class |
| external_store_session | An optional, existing [session](./session.md) object that the snapshot implementation uses to interact with the database, rather than allowing the cache to create a new session | MessageStore::Postgres::Session |


``` ruby
cache = Write.build(
  SomeEntity,
  scope: :thread,
  persist_interval: 100,
  external_store: EntitySnapshot::Postgres,
  external_store_session: MessageStore::Postgres::Session.build
)
```

### Via the Initializer

``` ruby
self.new(subject)
```

**Returns**

Instance of the `EntityCache` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| subject | The entity class that the cache manages | Class |

By constructing a cache using the initializer, the cache's dependencies are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](/user-guide/useful-objects.md#substitutes) user guide for background on inert substitutes.
:::
