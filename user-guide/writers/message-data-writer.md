# MessageData Writer

<!-- The messaging writer writes instances of message objects to the message store. It converts them to the more raw, low level [message data](/user-guide/messages-and-message-data/message-data.md) form which can then be converted to JSON and stored in the database.
 -->

The message data writer is the more primitive writer of the two levels of writer, with the [messaging writer](./messaging-writer.md) being the upper level.

Using the message data writer is uncommon for typical applications. It can be useful when eliminating the message-to-message-data transformation when utmost performance optimization is required, and it can be useful as well in certain testing scenarios.

The message data writer writes [message data](/user-guide/messages-and-message-data/message-data.md) to the message store.

## Example

``` ruby
MessageStore
```
