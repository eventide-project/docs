# Get

The `MessageStore::Postgres::Get` class is a primitive reader that retrieves a single batch of messages from a stream.

The `Get` class behaves similarly to a [reader](./), except that it doesn't continue to reader a stream. It retrieves a single batch and terminates.

The reader uses the `Get` class to retrieve messages. While it's mostly intended for internal use, it an be useful when building tools or any time that directly retrieving a batch of messages is necessary.

## Get Example

``` ruby
deposit_1 = Deposited.new()
deposit_1.deposit_id = '456'

deposit_2 = Deposited.new()
deposit_2.deposit_id = '789'

stream_name = 'account-123'

Messaging::Postgres::Write.(deposit_1, stream_name)
Messaging::Postgres::Write.(deposit_2, stream_name)

messages = MessageStore::Postgres::Get.(stream_name)

messages.length
# => 2

messages[0].deposit_id
# => 456

messages[0].deposit_id
# => 786
```

## Get::Stream::Last Facts

- The `Get` class returns a single batch of [message data](/user-guide/messages-and-message-data/message-data.md)
- The `Get` class can retrieve either from streams or messages
- A `Get` can be configured with an existing [session](./session.md), or it can create a new session
