# Metadata

A message's metadata object contains information about the stream where the message resides, the previous message in a series of messages that make up a messaging workflow, the originating process to which the message belongs, as well as other data that are pertinent to understanding the provenance and disposition of the message.

Where as a message's data represents information pertinent to the business process that the message is involved with, a message's metadata contains information that is mechanical and infrastructural. Message metadata is data about messaging machinery, like message schema version, source stream, positions, provenance, reply address, and the like.

## Messaging::Message::Metadata

The message metadata implementation is provided by the Messaging::Message::Metadata class.

[View Source](https://github.com/eventide-project/messaging/blob/master/lib/messaging/message/metadata.rb)

## Metadata Attributes

| Name | Description | Type | Alias |
| --- | --- | --- | --- |
| stream_name | The name of the stream where the message resides | String | source_message_stream_name |
| position | The sequential position of the message in its stream | Integer | source_message_position |
| global_position | The sequential position of the message in the entire message store | Integer | source_message_global_position |
| causation_message_stream_name | The stream name of the message the precedes a message in a sequential [message flow](./messages.md#message-workflows) | |
| causation_message_position | The sequential position of the causation message in its stream | Integer | |
| causation_message_global_position | The sequential position of the message in the entire message store | Integer | sequence |
| correlation_stream_name | Name of the stream that represents an encompassing business process that coordinates the sub-process that the message is a part of | String | |
| reply_stream_name | Name of a stream where a reply should be sent as a result of processing the message | String | |
| time | Timestamp that the message was written to the message store | Time | |
| schema_version | Version identifier of the message schema itself | String | |

## Message Workflows

When messages represent subsequent steps in a workflow, a subsequent message's metadata records elements of the preceding message's metadata. Each message in a workflow carries [provenance](/glossary.md#provenance) data of the message that precedes it.

The message's implementation of `follow` specifically manages the transfer of message data from the preceding message to the subsequent method, and then delegates to the metadata object to manage the transfer of message flow and provenance data between the two metadata objects.

``` ruby
follow(preceding_metadata)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| preceding_metadata | Metadata instance from which to copy the message flow and provenance data from | Metadata |

There are three metadata attributes that comprise the identifying information of a message's preceding message. They are collectively referred to as _causation_ data.

- `causation_message_stream_name`
- `causation_message_position`
- `causation_message_global_position`

Each message's metadata in a workflow may also carry identifying information about the overall or coordinating workflow that the messages participate in. That identifying information is referred to as _correlation_ data.

- `correlation_stream_name`

Additionally, a message's metadata may carry a _reply address_:

- `reply_stream_name`

See the [Messaging::Writer](../writers/messaging-writer.md) user guide for more on replying to messages.

### Metadata Data Transfer

Provenance metadata transfer logic from preceding message to subsequent message as caused by the `follow` method is:

``` ruby
subsequent_metadata.causation_stream_name = preceding_metadata.stream_name
subsequent_metadata.causation_position = preceding_metadata.position
subsequent_metadata.causation_global_position = preceding_metadata.global_position

subsequent_metadata.correlation_stream_name = preceding_metadata.correlation_stream_name

subsequent_metadata.reply_stream_name = preceding_metadata.reply_stream_name
```

## Determining Message Precedence

Metadata objects can be determined to follow each other using the metadata's `follows?` predicate method.

``` ruby
follows?(metadata)
```

**Returns**

Boolean.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| metadata | A metadata instance that may precede the metadata being inspected | Metadata |

The `follows?` predicate method returns `true` when the metadata's causation and provenance attributes match the metadata argument's message source attributes.

``` ruby
preceding_metadata = Metadata.new()
preceding_metadata.stream_name = 'someStream'
preceding_metadata.position = 11
preceding_metadata.global_position = 111
preceding_metadata.reply_stream_name = 'someReplyStream'

metadata = Metadata.new()

metadata.follow(preceding_metadata)

metadata.follows?(preceding_metadata)
# => true

preceding_metadata.stream_name = `someOtherStream`

metadata.follows?(preceding_metadata)
# => false
```

Metadata precedence is determined as:

``` ruby
causation_message_stream_name == metadata.stream_name &&
causation_message_position == metadata.position &&
self.causation_message_global_position == metadata.global_position &&
self.reply_stream_name == metadata.reply_stream_name
```

## Determining Whether a Reply is Required

It can be useful in handler logic to determine whether a message requires a reply message to be sent to its reply address.

``` ruby
reply?()
```

**Returns**

Boolean.

The `reply?` predicate method returns true if the `reply_stream_name` attribute has been assigned a stream name.

``` ruby
metadata = Metadata.new()

metadata.reply_stream_name = 'someReplyStream'

metadata.reply?
# => true

metadata.reply_stream_name = nil

metadata.reply?
# => false
```

For convenience, the metadata provides the `clear_reply_stream_name` method to remove the `reply_stream_name` from a metadata instance.

``` ruby
metadata = Metadata.new()

metadata.reply_stream_name = 'someReplyStream'

metadata.clear_reply_stream_name()

metadata.reply?
# => false
```

## Message Correlation

When coordinating workflows between services using [Pub/Sub](/core-concepts/pub-sub.md), it may be necessary to determine if an event published by another service pertains to an on going process in the originating service.

For example, a component that is responsible for accounting might be used by numerous other _coordinating_ components. A funds transfer component will interact with the account component, but many other components will, as well, including payroll, bill payment, etc. Each of these coordinating services needs to know when an accounting transaction that was started by the coordinating service has completed.

A coordinating service will subscribe to the accounting service's events in order to detect transactions that pertain to it. But the coordinating service will receive events that pertain to transactions from all other coordinating services as well.

The metadata's `correlation_stream_name` is the mechanism by which a subscriber can determine if the event being processed has originated from the subscriber's service.

When a message is sent to the _afferent_ service from the coordinating service, the metadata's `correlation_stream_name` is set to a value that indicates its origin.

``` ruby
some_message = SomeMessage.new()

some_message.metadata.correlation_stream_name = 'someStream-123'
```

Because the `follow` method keeps the `correlation_stream_name` with the metadata of all subsequent messages - even those from other services - the `correlation_stream_name` will be present in the event metadata that the originating, coordinating service subscribes to.

### Determining Message Correlation

When a coordinating, originating service receives an event from an afferent service the coordinating service must determine whether the event should be processed or disregarded.

``` ruby
correlated?(stream_name)
```

**Returns**

Boolean.

**Alias**

`correlates?`

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name to compare to the message metadata's `correlation_stream_name` | String |

``` ruby
some_message = SomeMessage.new()

some_message.metadata.correlation_stream_name = 'someStream-123'

message.metadata.correlated?('someStream-123')
# => true

message.metadata.correlated?('someStream-456')
# => false
```

If the value of the `stream_name` argument is a category stream name and the correlation stream name is an entity stream name, only the categories will be compared.

``` ruby
message.metadata.correlated?('someStream')
# => true
```

## Message Identifier

The de facto unique identifier for a message is a combination of the message's stream name and the message's position number within that stream.

``` ruby
identifier()
```

**Alias**

`source_message_identifier`

**Returns**

String

The identifier is formatted as a URI fragment of the form `stream_name/position`.

``` ruby
metadata = Messaging::Message::Metadata.new()
metadata.stream_name = 'someStream'
metadata.position = 11

metadata.identifier
# => "someStream/11"
```

## Causation Message Identifier

The unique identifier for a message's causation message is a combination of the causation message's stream name and the causation message's position number within that stream.

``` ruby
causation_message_identifier()
```

**Returns**

String

The identifier is formatted as a URI fragment of the form `causation_message_stream_name/causation_message_position`.

``` ruby
metadata = Messaging::Message::Metadata.new()
metadata.causation_message_stream_name = 'someCausationStream'
metadata.causation_message_position = 111

metadata.causation_message_identifier
# => "someCausationStream/111"
```
