# MessageData Writer

The message data writer is the more primitive writer of the two levels of writer, with the [messaging writer](./messaging-writer.md) being the upper level.

Using the message data writer is uncommon for typical applications. It can be useful when eliminating the message-to-message-data transformation when utmost performance optimization is required, and it can be useful as well in certain testing scenarios.

The message data writer writes [message data](/user-guide/messages-and-message-data/message-data.md) to the [message store](/user-guide/message-store). In the most common scenario, the message data are converted from rich [message](/user-guide/messages-and-message-data/messages.md) objects.

## Example

``` ruby
message_data = MessageStore::MessageData::Write.new

message_data.data = {
  some_attribute: 'some value'
  some_other_attribute: 'some other value'
}

stream_name = "account-123"

MessageStore::Write.(message_data, stream_name)
```

## Writer Facts

- The message data writer can write one message or a batch of messages
- A write is always made to a single stream
- A writer can protect writes against concurrency using its `expected_version` argument
- Actuating a writer can be done either from its class interface or its instance interface

## MessageStore::Postgres::Write Class

The `Write` class is a concrete class from the [`MessageStore::Postgres` library](../libraries.md#message-store-postgres) and namespace.

The `MessageStore::Postgres::Write` class provides:

- Actuator methods for both the class and instance interface that write message data to the specified stream

## Writing a MessageData

``` ruby
call(message_data, stream_name, expected_version: nil)
```
**Returns**

Position of the message_data written.

**Alias**

`write`

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| message | The message to be written | Messaging::Message or Array |
| stream_name | The stream name to write the message to | String |
| expected_version | Expected version of the stream at the time of the write | Integer |

The writer is a _callable object_. It's actuated using the `.()` convention.

``` ruby
write.(some_message, some_stream)
```

Conversely, the writer can be actuated by directly invoking the `call` method. It can also be actuated via the `write` alias, although this option is rarely exercised in practice.

<div class="note custom-block">
  <p>
    Note: Streams only come into existence when messages are written to them. There's no need to create a stream before using it. A stream is created implicitly by an event having been written to it.
  </p>
</div>

## Log Tags

The following tags are applied to log messages recorded by a message data writer:

| Tag | Description |
| --- | --- |
| write | Applied to all log messages recorded by a message data writer |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

The following tags _may_ be applied to log messages recorded by a message data writer:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that record the writing of a MessageData instance |
| data | Applied to log messages that record the data content of a MessageData instance |

See the [logging](./logging/) user guide for more on log tags.

- - -
**Related**

- [Writing Atomic Batches](./atomic-batches.md)
- [Expected Version and Concurrency](./expected-version.md)
