# Overview

Raw [message data](/user-guide/messages-and-message-data/message-data.md) objects are retrieved in from the [message store](/user-guide/message-db) using one of two implementations of `Get`:

- The [`Get`](./batch.md) class retrieves batches of raw message data
- The [`Get::Stream::Last`](./last.md) retrieves only the last message in a stream
