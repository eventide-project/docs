# Log Tags

Each library in the toolkit tags its log messages with its own log tags.

Some modules within a library may use more specific tags in addition to the library-level log tags.

## Handlers

The following tags are applied to log messages written by a handler, as well as all implementation in the `Messaging` namespace:

| Tag | Description |
| --- | --- |
| handle | Applied to all log messages written by a handler |
| messaging | Applied to all log messages written inside the `Messaging` namespace |

The following tags _may_ be applied to log messages logged by a handler:

| Tag | Description |
| --- | --- |
| message | Applied to log messages that address the handling of a typed message |
| message_data | Applied to log messages that address the handling of a MessageData instance |
| data | Applied to log lines that record the data content of a typed message or a MessageData instance |
