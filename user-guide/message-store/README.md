# Overview

The message store is a Postgres database that stores the streams, events, and commands that are the fundamental building blocks of evented and autonomous services.

The message store provides [functions](./server-functions.md) for writing messages to streams, and reading messages from entity streams and category streams. Messages are stored in a single [table](./anatomy.md).

The Eventide toolkit's [message store library](https://github.com/eventide-project/message-store-postgres) provides a Ruby interface to the message store database, and the [messaging library](https://github.com/eventide-project/messaging-postgres) provides a message-oriented interface with support for message transformation to and from JSON, message handling, and affordances for metadata and more advanced messaging patterns.
