# Log Tags

Each library in the toolkit tags its log messages with its own log tags.

Some modules within a library may use more specific tags in addition to the library-level log tags.

For more information on using log tags to control logger output, see the [logging user guide](./#control-by-log-tag).

## Handlers

The following tags are applied to log messages written by a handler, as well as all implementation in the `Messaging` namespace:

| Tag | Description |
| --- | --- |
| handle | Applied to all log messages recorded by a handler |
| messaging | Applied to all log messages recorded inside the `Messaging` namespace |

The following tags _may_ be applied to log messages logged by a handler:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that address the handling of a MessageData instance |
| message | Applied to log messages that address the handling of a typed message |
| data | Applied to log messages that record the data content of a typed message or a MessageData instance |

See the [handler user guide](/user-guide/handlers.md) for more information on handlers.

## Entity Projection

The following tags are applied to log messages written by an entity projection:

| Tag | Description |
| --- | --- |
| projection | Applied to all log messages recorded by an entity projection |
| apply | Applied to log messages recorded when applying a typed message or MessageData to an entity |

The following tags _may_ be applied to log messages logged by an entity projection:

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

The following tags _may_ be applied to log messages logged by an entity projection:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that record the projection of a typed message instance |
| message_data | Applied to log messages that record the projection of a MessageData instance |
| data | Applied to log messages that record the data content of a typed message or a MessageData instance |

See the [entity projection user guide](/user-guide/projection.md) for more information on entity projections.

## Message Writer

The following tags are applied to log messages recorded by a message writer, as well as all implementation in the `Messaging` namespace::

| Tag | Description |
| --- | --- |
| write | Applied to all log messages recorded by a message writer |
| messaging | Applied to all log messages recorded inside the `Messaging` namespace |

The following tags _may_ be applied to log messages logged by a message writer:

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

The following tags _may_ be applied to log messages logged by a message data writer:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that record the writing of a MessageData instance |
| data | Applied to log messages that record the data content of a MessageData instance |

See the [message data writer user guide](/user-guide/writers/message-data-writer.md) for more information on message data writers.
