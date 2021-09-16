# Stream Facts

Streams are the fundamental unit of organization of evented, service-oriented systems. They are both the storage and the transport of messages in message-based systems. And they are the principle storage medium of applicative entity data.

## Streams are created when the message is written to them

Streams are created by writing a message to the stream. Messages are appended to the end of streams. If the stream doesn't exist when an event is appended to it, the event will be appended at position 0. If the stream already exists, the event will be appended at the next position number.

## Category streams are updated when a message is written to a stream

It depends on which data storage implementation is being used. For the Postgres implementation, categories are just database queries and an index on the category section of the stream name. In the EventStore implementation, a category is a separate stream where a link to a message is written when the message is written to the stream. In both cases, category streams are basically cross-reference indexes that are written when messages are written to a stream.

## Stream names must be unique

Stream names must be unique within the scope of a single message store database.

## Stream names do not have a separate namespacing mechanism

Stream names are not namespaced within a message store. If the same stream name must be used for different purposes, those streams should either be stored in separate message store databases, or the names of the streams should include some prefix or suffix.

## Messages can be written concurrently to a stream, but do it safely

Messages can be written concurrently to a stream. However, doing so requires some extra protections in the code. When a message is written, the process doing the writing can provide a stream's current _version_ to the write operation. If the stream has been appended to by another process in the mean time, the stream's on-disk version will no longer match the version number provided to the write, and the write will fail. This protects a stream from being corrupted by concurrent writes. When a write fails with an expected version match error, the write is typically retried, and on the second attempt, the handler logic detects that the write is no longer necessary and discards it.

## Streams can be deleted

Streams can be deleted. However, the deletion of streams is not normal [applicative](/glossary.md#applicative) logic. The deletion of streams is more typically an operations task. It would be so rare that applicative logic would be deleting streams that the impulse to do so should be scrutinized with diligence. Reasons for removing streams include the regulatory requirement to delete customer data.

## Messages can be deleted

As with the deletion of streams, the deletion of messages should not appear in normal applicative logic. The deletion of messages is more typically an operations task. Reasons for removing messages include the removal of older command messages that have already been processed, or the removal of former entity snapshot messages.
