# Entity Store

An entity store is the primary means of retrieving [entities](/user-guide/entities.md) from the message store database.

Entity data is stored as events in an [event stream](/glossary.md#event-stream). Each entity has it's own stream. When an entity is "retrieved", its events are applied to the entity by a projection.

An entity store combines a [projection](/user-guide/projection.md), a [reader](/user-guide/reader.md), an temporary in-memory [cache](./entity-cache.md), and an durable on-disk cache to provide a simple and efficient interface for retrieving entities.

An entity's event stream is read by the reader specified by the `reader` macro, and projected by the projection specified by the `projection` macro. The entity returned from a retrieval operation is an instance of the class specified by the `entity` macro. The `category` macro declares the [category](/glossary.md#category) of the stream name that will be read when a retrieval operation is invoked.

To avoid the cost of projecting every event in an entity's stream when an entity is retrieved, the entity is cached when it is retrieved. The next time an entity is retrieved, only events that have been recorded since the last time the entity was retrieved are read and projected.

To avoid the cost of projecting all of an entity's events when the entity is not in the cache (as when a service has just been started), an entity is periodically persisted to disk in a snapshot stream. If an entity is retrieved and there's no cache entry for it, the latest snapshot will be retrieved and cached before the latest events are read and projected.

## Example

``` ruby
class Store
  include EntityStore

  category :account
  entity Account
  projection Projection
  reader MessageStore::Postgres::Read

  # Snapshotting is optional and can be omitted
  snapshot EntitySnapshot::Postgres, interval: 5
end

store = Store.build

deposited = Deposited.new()
deposited.account_id = '123'
deposited.amount = 11

MessageStore::Postgres::Write.(deposited, 'account-123')

account, version = store.fetch('123', include: :version)

account.balance
# => 11

version
# => 0

withdrawn = Withdrawn.new()
withdrawn.account_id = '123'
withdrawn.amount = 1

MessageStore::Postgres::Write.(withdrawn, 'account-123')

deposited = Deposited.new()
deposited.account_id = '123'
deposited.amount = 111

MessageStore::Postgres::Write.(deposited, 'account-123')

account, version = store.fetch('123', include: :version)

account.balance
# => 121

version
# => 2
```

## Entity Store Facts

- An entity store projects an entity's events when it is retrieved
- The entity store caches the retrieved entity
- Only events recorded since the last cached retrieval are projected
- An entity is retrieved by its ID
- An entity store can only be used to retrieve the entity class and category it's defined for
- An entity store's cache is only cleared when its service is restarted
- A store will optionally write snapshots of an entity on a specified interval

## EntityStore Module

A class becomes a store by including the `EntityStore` module from the [`EntityStore` library](./libraries.md#entity-store) and namespace.

The `EntityStore` module affords the receiver with:

- The `fetch` method for retrieving an entity by its ID (does not return nil)
- The `get` method for retrieving an entity by its ID (may return nil)
- The `get_version` method for retrieving just the stream's current version
- The `category` macro for declaring the stream category used to compose the entity's stream name
- The `entity` macro for declaring the class of the entity that the store manages
- The `projection` macro for declaring the projection class that the store uses
- The `reader` macro for declaring the platform-specific reader implementation to be used by the store
- The `snapshot` macro for declaring the snapshot implementation to be used by the store

## Retrieving an Entity

Entities can be retrieved in one of two ways:

- Via the `fetch` method
- Via the `get` method

The significant difference between the `fetch` and `get` methods is the return value when a non-existent entity is attempted to be retrieved. The `fetch` method will return a newly-constructed instance of the store's declared entity class. The `get` method will return a `nil`.

It's more common in handler business logic to use the `fetch` method so that the returned entity does not have to be checked for a `nil` value before being used.

### Fetch

``` ruby
fetch(id, include: nil)
```

**Returns**

Instance of the store's entity class with the identified stream's data projected onto it.

If the optional `include` argument is specified, data from the entity's cache record can be returned as well.

<div class="note custom-block">
  <p>
    Note: The <code>fetch</code> method never returns a <code>nil</code> when the entity retrieved does not exist (ie: There's no entity stream with the entity's ID). When the entity does not exist, rather than returning a <code>nil</code>, the <code>fetch</code> method will return a newly-constructed instance of the store's declared entity class.
  </p>
</div>

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the entity to retrieve | String |
| include | List of cache record attributes to retrieve | Symbol or Array |

#### Including Cache Record Data in the Returned Values

The `include` named parameter returns selected data from the entity's cache record along with the entity.

It's important to know that the cache record is updated _before_ any data is returned.

The most common use of the `include` parameter is to retrieve the entity's version along with the entity.

``` ruby
entity, version = store.fetch(some_id, include: :version)
```

Any number of cache record attributes can be returned by specifying a list of cache record attribute names.

``` ruby
entity, version, time = store.fetch(some_id, include: :version, :time)
```

#### Cache Record Attributes That Can Be Included

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the cached entity | String |
| entity | The cached entity itself | Object |
| version | The stream version of the cached entity at the time it was cached | Integer |
| time | The UTC time that the entity was cached | Time |
| persisted_version | The version of the entity that may have been persisted as a snapshot | Integer |
| persisted_time | The UTC time that the entity may have been persisted as a snapshot | Time |

#### The no_stream Stream Version

When an attempt is made to retrieve an entity that does not exist, the symbol `:no_stream` is returned as the value of `version`.

``` ruby
entity, version = store.fetch(some_non_existant_id, include: :version)

version
# => :no_stream
```

The `:no_stream` symbol is equivalent to a stream version of `-1`.

#### Retrieval Stream Name

The `category` macro declares the category of the stream name that will be read when a retrieval operation is invoked.

When an entity whose ID is `123` is retrieved from the store, the store's category is concatenated with the ID to form the event stream name to read.

``` ruby
class SomeStore
  include EntityStore

  category :some_entity
  # ...
end

store = SomeStore.build

# The store's reader reads from the stream "someEntity-123"
some_entity = store.fetch('123')

store.stream_name
# => "someEntity-123"
```

### Get

``` ruby
get(id, include: nil)
```

The `get` method is almost identical to the `fetch` method.

The significant difference between the `get` and `fetch` methods is the return value when a non-existent entity is attempted to be retrieved. The `get` method will return a `nil`. Whereas the `fetch` method will return a newly-constructed instance of the store's declared entity class.

The `get` method isn't typically a good choice in handler business logic, as it will require a `nil` check for each entity returned from the store due to the possibility that an entity returned from `get` may be `nil`

## Retrieving an Entity's Version

``` ruby
get_version(id)
```

**Returns**

Stream version of the stream identified by the `id` argument and the store's declared category.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the entity whose version to retrieve | String |

<div class="note custom-block">
  <p>
    Note: Retrieving the version will cause a normal reading and projecting of recent, unprojected events and an update of the cache with the results.
  </p>
</div>

## Constructing Entity Stores

Entity stores can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

``` ruby
self.build(snapshot_interval: nil, session: nil)
```

**Returns**

Instance of the class that includes the `EntityStore` module.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| snapshot_interval | Optional interval in number of messages after which a snapshot is persisted if a snapshot writer is configured | Integer |
| session | Optionally, an existing [session](./session.md) object to use, rather than allowing the store to create a new session | MessageStore::Postgres::Session |

### Via the Initializer

``` ruby
self.new()
```

**Returns**

Instance of the class that includes the `EntityProjection` module.

By constructing a store using the initializer, the store's dependencies are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](./useful-objects.md#substitutes) user guide for background on inert substitutes.
:::
