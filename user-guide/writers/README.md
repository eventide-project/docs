# Overview

[Messages](/user-guide/messages-and-message-data/messages.md) and raw [message data](/user-guide/messages-and-message-data/message-data.md) objects are committed to the [message store](/user-guide/message-store) with writers.

There are two layers of writers:

- The [messaging writer](./messaging-writer.md) converts messages to raw message data, and then delegates to the message store writer to coordinate the writing to the database
- The [message store writer](./message-store-writer.md) writes message data to the message store
