---
sidebarDepth: 0
---

# Reading and Writing

Message streams are at once a form of storage and a message transport.

The terminology of message transports refers to _publishing_ messages, and _consuming_ messages. In the context of message streams, terminology that reflects persistence is more appropriate.

Messages are _written_ to streams, and _read_ from streams.

![Messaging](../../images/reading-and-writing.png)

Messages are effectively left for readers and consumers to pick up and process at a time that is convenient, whether that's right now or some time later.

A stream may be read while it's being written to. Streams can have many readers, but should avoid having many writers (except when using a stream exclusively as a command transport). An event stream should be written to only by a single writer, otherwise, concurrency conflicts are likely to occur.

## Writing

When a message is written, it is _appended_ to the end of a stream.

When a message is written it is assigned a numeric sequence number. With every write to a stream, the sequence number is incremented by 1. Once a message is written, its sequence number is never changed. Messages are never modified once they are written.

## Reading

Messages are read in the order of their sequence number. The reader keeps track of the last sequence number read, and increments that number in order to read the next message.

