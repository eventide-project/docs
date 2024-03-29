# Log Tags

Each library in the toolkit tags its log messages with its own log tags.

Some modules within a library may use more specific tags in addition to the library-level log tags.

For more information on using log tags to control logger output, see the [logging user guide](./#control-by-log-tag).

## Handlers

The following tags are applied to log messages recorded by a handler, as well as all implementation in the `Messaging` namespace:

| Tag | Description |
| --- | --- |
| dispatch | Applied to all log messages recorded by a handler when a message is dispatched to a handler, before the handler determines whether it will in fact handle the message |
| messaging | Applied to all log messages recorded inside the `Messaging` namespace |

The following tags _may_ be applied to log messages recorded by a handler:

| Tag | Description |
| --- | --- |
| handle | Applied to log entries recorded when a message dispatched to a handler is handled by the handler |
| message_data | Applied to log messages that address the handling of a MessageData instance |
| message | Applied to log messages that address the handling of a typed message |
| data | Applied to log messages that record the data content of a typed message or a MessageData instance |

See the [handler user guide](/user-guide/handlers.md) for more information on handlers.

## Entity Projection

The following tags are applied to log messages recorded by an entity projection:

| Tag | Description |
| --- | --- |
| projection | Applied to all log messages recorded by an entity projection |
| apply | Applied to log messages recorded when applying a typed message or MessageData to an entity |

The following tags _may_ be applied to log messages recorded by an entity projection:

| Tag | Description |
| --- | --- |
| message | Applied to log messages that record the projection of a typed message instance |
| message_data | Applied to log messages that record the projection of a MessageData instance |
| data | Applied to log messages that record the data content of a typed message or a MessageData instance |

See the [entity projection user guide](/user-guide/projection.md) for more information on entity projections.

## Entity Store

The following tags are applied to log messages recorded by an entity store:

| Tag | Description |
| --- | --- |
| entity_store | Applied to all log messages recorded by an entity store |

The following tags _may_ be applied to log messages recorded by an entity store:

| Tag | Description |
| --- | --- |
| fetch | Applied to log messages recorded while fetching an entity |
| get | Applied to log messages recorded while getting an entity |
| refresh | Applied to log messages recorded while refreshing an entity |
| entity | Applied to log messages that record the data content of an entity |
| data | Applied to log messages that record the data content of an entity |

See the [entity store user guide](/user-guide/entity-store/) for more information on entity stores.

## Entity Cache

The following tags are applied to log messages recorded by an entity cache:

| Tag | Description |
| --- | --- |
| cache | Applied to all log messages recorded by an entity cache |

The following tags _may_ be applied to log messages recorded by an entity cache:

| Tag | Description |
| --- | --- |
| get | Applied to log messages recorded while getting an entity from the cache |
| miss | Applied to log messages recorded when getting an entity from the cache and the entity is not in the cache |
| hit | Applied to log messages recorded when getting an entity from the cache and the entity is found in the cache |
| put | Applied to log messages recorded while putting an entity into the cache |
| restore | Applied to log messages recorded while restoring an entity to the cache |

See the [entity cache user guide](/user-guide/entity-store/entity-cache.md) for more information on entity caches.

## Entity Snapshot

The following tags are applied to log messages recorded by an entity snapshot:

| Tag | Description |
| --- | --- |
| snapshot | Applied to all log messages recorded by an entity snapshot |
| cache | Applied to all log messages recorded by an entity snapshot |

The following tags _may_ be applied to log messages recorded by an entity snapshot:

| Tag | Description |
| --- | --- |
| get | Applied to log messages recorded while getting an entity from the snapshot store |
| miss | Applied to log messages recorded when getting an entity from the snapshot store and the entity snapshot is not stored |
| hit | Applied to log messages recorded when getting an entity from the snapshot store and the entity is found |
| put | Applied to log messages recorded while putting an entity into the snapshot store |

See the [entity snapshotting user guide](/user-guide/entity-store/snapshotting.md) for more information on entity snapshotting.

## Reader

The following tags are applied to log messages recorded by a reader:

| Tag | Description |
| --- | --- |
| read | Applied to all log messages recorded by a reader |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

See the [reader user guide](/user-guide/readers/) for more information on readers.

## Get

The following tags are applied to log messages recorded by a `Get`:

| Tag | Description |
| --- | --- |
| get | Applied to all log messages recorded by a `Get` |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

The following tags _may_ be applied to log messages recorded by a `Get`:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that record the data content of a MessageData instance |
| data | Applied to log messages that record the data content of a MessageData instance |

See the [Get user guide](/user-guide/retrieving/batch.md) for more information on the `Get` class.

## Get::Stream::Last

The following tags are applied to log messages recorded by a `Get::Stream::Last`:

| Tag | Description |
| --- | --- |
| get | Applied to all log messages recorded by a `Get::Last` |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

The following tags _may_ be applied to log messages recorded by a `Get::Last`:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that record the data content of a MessageData instance |
| data | Applied to log messages that record the data content of a MessageData instance |

See the [Get::Stream::Last user guide](/user-guide/retrieving/last.md) for more information on the `Get::Stream::Last` class.

## Consumer

The following tags are applied to log messages recorded by a consumer:

| Tag | Description |
| --- | --- |
| consumer | Applied to all log messages recorded by a consumer |

The following tags _may_ be applied to log messages recorded by a consumer:

| Tag | Description |
| --- | --- |
| position_store | Applied to log messages recorded by the consumer's position store |
| get | Applied to log messages recorded while getting an position record from the position store |
| put | Applied to log messages recorded while putting a position record to the position store |

See the [consumer user guide](/user-guide/consumers.md) for more information on consumers.

## Component Host

The following tags are applied to log messages recorded by the component host:

| Tag | Description |
| --- | --- |
| component_host | Applied to all log messages recorded inside the `ComponentHost` namespace |

The following tags _may_ be applied to log messages recorded by the component host:

| Tag | Description |
| --- | --- |
| component | Applied to messages that pertain to a component |
| actor | Applied to messages recorded by [actors](https://github.com/ntl/actor) |
| lifecycle | Applied to messages that pertain to the lifecycle of a actors |
| crash | Applied to messages recorded while the host is terminating due to an error |
| signal | Applied to messages recorded when handling operating system signals |
| start | Applied to messages recorded when starting an actor |
| stop | Applied to messages recorded when stopping an actor |

See the [component host user guide](/user-guide/component-host.md) for more information on the component host.

## Session

The following tags are applied to log messages recorded by a session:

| Tag | Description |
| --- | --- |
| session | Applied to all log messages recorded by a session |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

The following tags _may_ be applied to log messages recorded by a session:

| Tag | Description |
| --- | --- |
| sql | Applied to log messages that record the SQL commands sent to the message store through the session |
| data | Applied to log messages that record the content of data |

See the [session user guide](/user-guide/session.md) for more information on sessions.










## Message Writer

The following tags are applied to log messages recorded by a message writer, as well as all implementation in the `Messaging` namespace::

| Tag | Description |
| --- | --- |
| write | Applied to all log messages recorded by a message writer |
| messaging | Applied to all log messages recorded inside the `Messaging` namespace |

The following tags _may_ be applied to log messages recorded by a message writer:

| Tag | Description |
| --- | --- |
| reply | Applied to log messages written by the message writer when replying to a message |
| message | Applied to log messages that record the writing of a typed message |
| data | Applied to log messages that record the data content of a typed message |

See the [message writer user guide](/user-guide/writers/message-writer.md) for more information on message writers.

## Message Data Writer

The following tags are applied to log messages recorded by a message data writer:

| Tag | Description |
| --- | --- |
| write | Applied to all log messages recorded by a message data writer |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

The following tags _may_ be applied to log messages recorded by a message data writer:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that record the writing of a MessageData instance |
| data | Applied to log messages that record the data content of a MessageData instance |

See the [message data writer user guide](/user-guide/writers/message-data-writer.md) for more information on message data writers.
