# Snapshotting

The entity snapshotting implementation is the second level of storage of the [entity cache](./entity-cache.md) that periodically records an entity's current state to a snapshot stream.

Snapshots are an optimization that helps avoid the cost of projecting all of an entity's events when the entity is not in the cache (as when a service has just been started). If an entity is retrieved and there's no cache record in the in-memory cache for it, the latest snapshot will be retrieved and inserted into the in-memory cached before the latest events are read and projected.

An entity snapshot is a representation of entity state that is stored periodically in a snapshot stream.

The interval between an entity's snapshots is measured in number of events read and projected onto the entity.

## Snapshot Facts

- A snapshot is only read when an attempt is made to retrieve an entity from the cache and there is no cache record for the entity having previously been inserted into the cache
- An entity is transformed into JSON when recorded into its snapshot stream
- A JSON snapshot is transformed into an entity instance when retrieving a snapshotted entity from its snapshot stream
- If an entity doesn't implement the protocol explicitly, it will not be able to be converted to and from JSON for snapshotting (there is no default implementation)
- While many external services may read an entity's stream and its snapshots, only the service to which an entity is native should write snapshots
- Attribute names in the raw JSON representation are converted between camelCase and underscore_case when writing and reading snapshots
- The interval between an entity's snapshots is measured in number of events read and projected between snapshots
- The snapshot interval is tuned based on the throughput of the particular service hosting it, so there is no default snapshot interval
- There is no automatic disposal of previous snapshots, but it is relatively trivial to clean snapshot streams if it ever becomes an issue.

## The EntitySnapshot::Postgres Class

The `EntitySnapshot::Postgres` class is a concrete class from the [`EntitySnapshot::Postgres` library](../libraries.md#entity-snapshot-postgres) and namespace.

The `EntitySnapshot::Postgres` class provides:

- The `get` method for retrieving a snapshot by the snapshotted entity's ID
- The `put` method for storing an entity snapshot

The `EntitySnapshot::Postgres` class includes the `EntityCache::Store::External` module, and implements the snapshotting protocol that the module defines.

## Transforming Entities to and from JSON

An entity that is stored as a snapshot is written to the entity's [snapshot stream](#snapshot-streams) as a `Recorded` event type.

In order to store the entity state as an event in the entity's snapshot stream it must be transformed into JSON when writing the snapshot, and transformed from JSON when reading the snapshot.

For an entity to be JSON-transformable, it must implement the _Transform_ protocol.

<div class="note custom-block">
  <p>
    Note: Refer to the Transform library for more details about the transform protocol:<br />
    <a href="https://github.com/eventide-project/transform/blob/master/README.md">https://github.com/eventide-project/transform/blob/master/README.md</a>
  </p>
</div>

### Example

``` ruby
class SomeEntity
  include Schema::DataStructure

  attribute :id, String
  attribute :time, Time

  module Transform
    def self.instance(raw_data)
      raw_data[:time] = Time.parse(raw_data[:time])
      SomeEntity.build(raw_data)
    end

    def self.raw_data(instance)
      data = instance.to_h
      data[:time] = Clock.iso_8601(data[:time])
      data
    end
  end
end
```

### Reading

The `instance` method is invoked when raw data is retrieved from the message store and converted into an instance of the entity.

The method receives a hash and returns an instance. The hash key names are already in underscore_case when passed to the `instance` method.

Any conversion from formats that are specific to serialized JSON is done at this stage of the transformation. For example, converting time from the ISO 8601 format that is used for JSON message encoding to natural time values that are used on Ruby entities.

### Writing

The `raw_data` method is invoked when an instance is being converted from an instance of the entity to a hash that can be ultimately converted into JSON text for storage in the message store.

The method receives am instance of the entity and returns an hash. The hash key names will be converted to JSON camelCase before being written to the message store.

Any conversion to formats that are specific to serialized JSON is done at this stage of the transformation. For example, natural Ruby time values to the ISO 8601 format this is used for JSON message encoding.

## Storing a Snapshot

``` ruby
put(id, entity, version, time)
```

**Returns**

The stream position of the recorded snapshot event that is written.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the entity for the snapshot being retrieved | String |
| entity | The entity to be converted to a snapshot and stored | Object |
| version | The version of the entity when stored as a snapshot | Integer |
| time | The time at which the entity was stored as a snapshot | Time |

When an entity snapshot is stored, it is first converted to hash data using the `raw_data` method of the `Transform` protocol. The message writer converts that hash to JSON text before it is sent to the store.

## Retrieving a Snapshot

``` ruby
get(id)
```

**Returns**

The entity, the version stored with the entity, and the time that the snapshot was stored.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the entity for the snapshot being retrieved | String |

``` ruby
entity, version, time = snapshot.get(some_id)
```

When an entity snapshot is retrieved, it is received as a raw hash. The hash is converted into an instance of the entity using the `instance` method of the `Transform` protocol.

## Snapshot Interval

The snapshot interval is assigned using the [entity store's `snapshot` macro](./#the-snapshot-macro).

The interval is an integer that specified how often a snapshot should be recorded. The interval is measured in _number of events projected before recording a snapshot_.

A snapshot interval of 100 would result in a snapshot of the entity being recorded after _at least_ 100 events projected by the store.

### When Snapshots Are Recorded

Snapshots aren't guaranteed to be recorded precisely on the snapshot interval. The snapshot interval should be considered a _minimum_ interval.

Snapshots are only recorded once a [store](./) has completed recording all outstanding events.

If the snapshot interval is set to 100, and there are more than 100 outstanding events that have not been projected yet, than all of the outstanding events will be projected before the snapshot is written.

If the snapshot interval is set to 100, and there are less than 100 outstanding events that have not been projected yet, than all of the outstanding events will be projected, but no snapshot will be written.

### No Default Snapshot Interval Value

There is no default value of the snapshot interval. It's something that can only be tuned based on the particular capacities of a particular service. Snapshotting should only be used when cache warming latencies have been characterized.

## Snapshot Streams

### Snapshot Stream Name

Snapshots are recorded to _snapshot streams_.

A snapshot stream is named after the entity class that is snapshotted, and has a category type of `snapshot`.

``` ruby
class SomeEntity
end

snapshot = EntitySnapshot::Postgres.build(SomeEntity)

id = '123'

snapshot.snapshot_stream_name(id)
# => "someEntity:snapshot-123"
```

### Snapshot Expiration

Snapshots are not expired once written to the snapshot stream. They remain in storage indefinitely.

Typically, snapshot storage is a fraction of total message storage, and so the indefinite storage of snapshots is almost never an impact on total storage.

In the rare cases where snapshot storage could create a storage capacity problem, snapshot records can be deleted. In practice, only the most recent snapshot is necessary to serve the function of the snapshot in initializing a cache record.

Deleting snapshot records is a matter of using a Postgres client to execute the SQL required to remove specific records, or a group of records. It's beyond the scope of this user guide to recommend specific approaches to database administration tasks, such as deleting snapshot records.

::: danger
Only delete snapshot records if you are absolutely confident in your SQL skills. It's an easy operation to perform with even rudimentary SQL skills, but a mistake in the SQL command's condition can cause the accidental deletion of messages other than snapshot records. While deleting snapshot records is relatively harmless, deleting any other kinds of messages can be catastrophic.
:::

## ReadOnly Snapshot

::: danger
While many external services may read an entity's stream and its snapshots, only the service to which an entity is native should write snapshots.
:::

In the case where a service projects an entity stream from another service, it's useful to _read_ that entity's snapshot stream so that the entire stream does not have to be projected.

It's critical in these cases that the service does not write to that external service's snapshot stream while projecting the external service's entity.

In such a case, the store can be configured with a read only snapshot. The read only snapshot will not write snapshots, but it will read them.

``` ruby{9}
class Store
  include EntityStore

  entity Account
  category :account
  projection Projection
  reader MessageStore::Postgres::Read

  snapshot EntitySnapshot::Postgres::ReadOnly
end
```

## Constructing Entity Snapshots

Entity snapshots can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

``` ruby
self.build(subject, session: nil)
```

**Returns**

Instance of the `EntitySnapshot::Postgres` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| subject | Entity class that the snapshots are recorded for | Class |
| session | Optionally, an existing [session](./session.md) object to use, rather than allowing the store to create a new session | MessageStore::Postgres::Session |

### Via the Initializer

``` ruby
self.new(subject)
```

**Returns**

Instance of the `EntitySnapshot::Postgres` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| subject | Entity class that the snapshots are recorded for | Class |
