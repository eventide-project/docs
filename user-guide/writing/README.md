# Overview

[Messages](/user-guide/messages-and-message-data/messages.md) and raw [message data](/user-guide/messages-and-message-data/message-data.md) objects are committed to the [message store](/user-guide/message-db) with writers.

There are two layers of writers:

- The [message writer](./message-writer.md) converts messages to raw message data, and then delegates to the message data writer to write to the database
- The [message data writer](./message-data-writer.md) writes raw message data to the message store
