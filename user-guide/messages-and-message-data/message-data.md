# MessageData

MessageData is the raw, low-level storage representation of a message.

Before a message can be written to the message store, it's transformed into a `MessageData`. When a message is retrieved from the message store, it's retrieved as a `MessageData` object and then transformed to a message.

It's important to note that in typical use of message objects the applicative code may never be directly exposed to `MessageData` instances.

The attributes of `MessageData` objects directly reflect the structure of the [underlying storage schema](../message-store/anatomy.md#messages-table)

## MessageStore::MessageData Module

There are two implementations of `MessageData`: `MessageStore::MessageData::Write` that is the form that can be written to the message store, and `MessageStore::MessageData::Read` that is the form that is retrieved from the message store.

The `MessageStore::MessageData` module is the generalized implementation that is common to both specific implementations. Both the `MessageStore::MessageData::Write` class and the `MessageStore::MessageData::Read` class include the `MessageStore::MessageData` module.

[View Source](https://github.com/eventide-project/message-store/blob/master/lib/message_store/message_data.rb)

## MessageData::Read Class

The `MessageStore::MessageData::Read` class is the implementation of the `MessageStore::MessageData` module that is the result of reading a message from the message store.

[View Source](https://github.com/eventide-project/message-store/blob/master/lib/message_store/message_data/read.rb)

### Attributes

| Name | Description | Type |
| --- | --- | --- |
| id | The message ID. Message IDs are UUIDs. | String |
| type | The message type. Corresponds to a message's class name. | String |
| data | The message's business data | Hash |
| metadata | The message's mechanical and infrastructural data, separate from the business data | Hash |
| stream_name | Name of the stream where the message was written | String |
| position | The ordinal position of the message in its stream | Integer |
| global_position | The ordinal position of the message in the entire message store | Integer |
| time | Timestamp when the message was written | Time |

## MessageData::Write Class

The `MessageStore::MessageData::Write` class is the implementation of the `MessageStore::MessageData` module that is used to write a message to the message store.

The `Write` implementation of `MessageData` inevitably has fewer attributes than the `Read` implementation because some of a persisted message's attributes are not known until the message data is written to the store.

[View Source](https://github.com/eventide-project/message-store/blob/master/lib/message_store/message_data/write.rb)

### Attributes

| Name | Description | Type |
| --- | --- | --- |
| id | The message ID. Message IDs are UUIDs. | String |
| type | The message type. Corresponds to a message's class name. | String |
| data | The message's business data | Hash |
| metadata | The message's mechanical and infrastructural data, separate from the business data | Hash |
