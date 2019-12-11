# Overview

![Message DB](../../images/message-db-logo-90x105.png)

**Microservice Native Event Store and Message Store for Postgres**

A fully-featured event store and message store implemented in PostgreSQL for Pub/Sub, Event Sourcing, Messaging, and Evented Microservices applications.

Message DB supports:

- Pub/Sub
- JSON message data
- Event streams
- Stream categories
- Metadata
- Message queues
- Message storage
- Consumer groups
- Service host
- Administration tools
- Reports

The message store provides [functions](./server-functions.md) for writing messages to streams, and reading messages from entity streams and category streams. Messages are stored in a single [table](./anatomy.md).

The Eventide toolkit's [message store library](https://github.com/eventide-project/message-store-postgres) provides a Ruby interface to the Message DB message store database, and the [messaging library](https://github.com/eventide-project/messaging-postgres) provides a message-oriented interface with support for message transformation to and from JSON, message handling, and affordances for metadata and more advanced messaging patterns.
