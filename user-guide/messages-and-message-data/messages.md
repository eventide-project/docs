# Messages

Messages are packages of data that are the principle means of transmission of instructions and status between services.

See [Message Facts](/core-concepts/messages-and-messaging/) for more details about messages.

## Messaging::Message Module

A class becomes a message by including the `Messaging::Message` module.

[View on GitHub](https://github.com/eventide-project/messaging/blob/master/lib/messaging/message.rb)

## Example Messages

``` ruby
# A command
class Withdraw
  include Messaging::Message

  attribute :withdrawal_id, String
  attribute :account_id, String
  attribute :amount, Numeric
  attribute :time, String
end

# An event
class Withdrawn
  include Messaging::Message

  attribute :withdrawal_id, String
  attribute :account_id, String
  attribute :amount, Numeric
  attribute :time, String
  attribute :processed_time, String
end
```

## Message Features

A message class has the following features and capabilities:

- Data attributes with optional data type checking
- Message metadata
- Copying data from one message to another
- Procession of messages in a workflow
- Determination of equality
- Transformation to and from raw [MessageStore::MessageData](./message-data.md) representation

## Constructing a Message

### Via the Initializer

A message's initializer does not receive any data passed to it.

``` ruby
withdraw = Withdraw.new
```

### Via the Constructor

A message has a constructor named `build` that allows for optionally providing a hash of data and a hash of metadata at the time of construction.

``` ruby
self.build(data={}, metadata={})
```

**Returns**

An instance of the message class

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| data | Hash of data whose key names match the message's attribute names | Hash |
| metadata | Hash of data whose key names match message metadata attribute names | Hash |

``` ruby
data = {
  withdrawal_id: 'ABC',
  account_id: '123',
  amount: 11,
  time: '2000-01-01T00:00:00.000Z'
}

withdraw = Withdraw.build(data)
# => #<Withdraw:0x... @withdrawal_id="ABC", @account_id="123", @amount=11, @time="2000-01-01T00:00:00.000Z">
```

## Construct a Hash Representation of the Message's Data

``` ruby
attributes()
```

**Alias**

`to_h`

**Returns**

Hash of attribute names and values.

``` ruby
withdraw = Withdraw.build(data)

data = withdraw.attributes # or withdraw.to_h
# => {:withdrawal_id=>"ABC", :account_id=>"123", :amount=>11, :time=>"2000-01-01T00:00:00.000Z"}
```

## Attribute Names

A list of the message's attribute names can be retrieved from its class interface.

``` ruby
self.attribute_names
```

**Returns**

Array of attribute names.

``` ruby
Withdraw.attribute_names
# => [:withdrawal_id, :account_id, :amount, :time]
```

## Metadata

A message's metadata object contains information about the stream where the message resides, the previous message in a series of messages that make up a messaging workflow, the originating process to which the message belongs, as well as other data that are pertinent to understanding the provenance and disposition of the message.

See [Metadata](./metadata.md) for more.

## Copying Message Attribute Data to Another Message

The `copy` class method constructs a message from another message's data.

``` ruby
self.copy(source, copy: [], include: [], exclude: [], strict: false, metadata: false)
```

**Returns**

Instance of the receiver message class initialized with the source message's data.

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| source | Message to build the subsequent message from | Message |
| copy | Whitelist of attribute names to copy | Array of Symbols |
| include | Alias for the `copy` parameter. Obsolete. Used for backward compatibility | Array of Symbols |
| exclude | Blacklist of attribute names to exclude from copying | Array of Symbols |
| strict | Raise an error if receiver doesn't define a setter for a whitelisted attribute when the value is `true` | Boolean |
| metadata | Copies the message metadata as well when the value is `true` | Boolean |

::: warning
Setting the value of `metadata` to `true` should be used with extreme caution, and has no practical use in everyday applicative logic. Except for certain testing and infrastructural scenarios, copying the identifying metadata from one message to another can result in significant malfunctions if the copied message is then written to a stream and processed.
:::

``` ruby
class SourceMessage
  include Messaging::Message

  attribute :some_attribute
  attribute :some_other_attribute
  attribute :yet_another_attribute
end

class ReceiverMessage
  include Messaging::Message

  attribute :some_attribute
  attribute :some_other_attribute
  attribute :yet_another_attribute
end

source_message = SourceMessage.new()
source_message.some_attribute = 'some value'
source_message.some_other_attribute = 'some other value'
source_message.yet_another_attribute = 'yet another value'

receiver_message = ReceiverMessage.copy(source_message)
# => #<ReceiverMessage:0x... @some_attribute="some value", @some_other_attribute="some other value", @yet_another_attribute="yet another value">

receiver_message = ReceiverMessage.copy(source_message, copy: [:some_attribute, :some_other_attribute])
# => #<ReceiverMessage:0x... @some_attribute="some value", @some_other_attribute="some other value">

receiver_message = ReceiverMessage.copy(source_message, exclude: [:some_attribute, :some_other_attribute])
# => #<ReceiverMessage:0x... @yet_another_attribute="yet another value">
```

### Strictness

An error is raised when the receiver doesn't define a setter for a whitelisted attribute and the value of the `strict` parameter is `true`

Strictness for the `copy` method defaults to `false`.

``` ruby
class SourceMessage
  attribute :additional_attribute
end

source_message.additional_attribute = 'additional value'

receiver_message = ReceiverMessage.copy(source_message, strict: true)
# => Messaging::Message::Copy::Error (#<ReceiverMessage:0x...> has no setter for additional_attribute)

receiver_message = ReceiverMessage.copy(source_message)
# => #<ReceiverMessage:0x... @some_attribute="some value", @some_other_attribute="some other value", @yet_another_attribute="yet another value">
```

### Attribute Map

The whitelist of attributes specified with the `copy` parameter can include maps of attributes, allowing the data to be copied between attributes with different names.

``` ruby
receiver_message = ReceiverMessage.copy(source_message, copy: [
  { :some_attribute => :some_other_attribute },
  :yet_another_attribute
])
# => #<ReceiverMessage:0x... @some_other_attribute="some value", @yet_another_attribute="yet another value">
```

### Messaging::Message::Copy Module

The `copy` class method of a message class can be also be actuated from the `Messaging::Message::Copy` module.

[View on GitHub](https://github.com/eventide-project/messaging/blob/master/lib/messaging/message/copy.rb)

The underlying implementation of a message class's `copy` method is the `Messaging::Message::Copy` module. It can be actuated either by including it, or via invoking its methods directly as module methods.

``` ruby
self.call(source, receiver=nil, copy: [], include: [], exclude: [], strict: false, metadata: false)
```

**Returns**

Instance of the receiver message class initialized with the source message's data, or the receiver message object after having the source's data copied to it.

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| source | Message to build the subsequent message from | Message |
| receiver| The message that will receive the source message's data | Message class or message instance |
| copy | Whitelist of attribute names to copy | Array of Symbols |
| include | Alias for the `copy` parameter. Obsolete. Used for backward compatibility | Array of Symbols |
| exclude | Blacklist of attribute names to exclude from copying | Array of Symbols |
| strict | Raise an error if receiver doesn't define a setter for a whitelisted attribute when the value is `true` | Boolean |
| metadata | Copies the message metadata as well when the value is `true` | Boolean |

**Receiver is an Instance of a Message Class**

When the receiver is a message instance, the class will be constructed, and then the source message's data will be copied to it.

``` ruby
receiver_message = ReceiverMessage.new
Messaging::Message::Copy.(source_message, receiver_message)
# => #<ReceiverMessage:0x... @some_attribute="some value", @some_other_attribute="some other value", @yet_another_attribute="yet another value">
```

**Receiver is a Message Class**

When the receiver is a message class, the class will be constructed, and then the source message's data will be copied to it.

``` ruby
receiver_message = Messaging::Message::Copy.(source_message, ReceiverMessage)
# => #<ReceiverMessage:0x... @some_attribute="some value", @some_other_attribute="some other value", @yet_another_attribute="yet another value">
```

Note that when the `Messaging::Message::Copy` is extended onto a message class, the default value of the `receiver` parameter is `self`. The value of `self` in such a case is the message class.

## Message Workflows

Messages frequently represent subsequent steps or stages in a process. Subsequent messages follow after preceding messages. Data from the preceding message is copied to the subsequent messages, and parts of the subsequent message's metadata are constructed with the data from the preceding message.

Constructing a message from a preceding message in a message flow is a common pattern in [handler](/#a-brief-example) implementation.

``` ruby
self.follow(preceding_message, copy: [], include: [], exclude: [], strict: true)
```

**Returns**

Instance of the subsequent message class initialized with the preceding message's data.

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| preceding_message | Message to build the subsequent message from | Message |
| copy | Whitelist of attribute names to copy | Array of Symbols |
| include | Alias for the `copy` parameter. Obsolete. Used for backward compatibility | Array of Symbols |
| exclude | Blacklist of attribute names to exclude from copying | Array of Symbols |
| strict | Raise an error if receiver doesn't define a whitelisted attribute | Boolean |

Following a message has almost identical behavior to a message class's [copy](#copying-message-attribute-data-to-another-message) method. The `follow` message leverages the implementation of `copy` to fulfill its purpose.

``` ruby
class PrecedingMessage
  include Messaging::Message

  attribute :some_attribute
  attribute :some_other_attribute
  attribute :yet_another_attribute
end

class SubsequentMessage
  include Messaging::Message

  attribute :some_attribute
  attribute :some_other_attribute
  attribute :yet_another_attribute
end

preceding_message = PrecedingMessage.new()
preceding_message.some_attribute = 'some value'
preceding_message.some_other_attribute = 'some other value'
preceding_message.yet_another_attribute = 'yet another value'

subsequent_message = SubsequentMessage.follow(preceding_message)
# => #<SubsequentMessage:0x... @some_attribute="some value", @some_other_attribute="some other value", @yet_another_attribute="yet another value">

subsequent_message = SubsequentMessage.follow(preceding_message, copy: [:some_attribute, :some_other_attribute])
# => #<SubsequentMessage:0x... @some_attribute="some value", @some_other_attribute="some other value">

subsequent_message = SubsequentMessage.follow(preceding_message, exclude: [:some_attribute, :some_other_attribute])
# => #<SubsequentMessage:0x... @yet_another_attribute="yet another value">
```

### Strictness

An error is raised when the receiver doesn't define a setter for a whitelisted attribute and the value of the `strict` parameter is `true`

Strictness for the `follow` method defaults to `true`.

This helps avoid unintended errors that can happen when permissive copying happens between two message schemas. The strictness of the `follow` method requires that the use of the whitelist and blacklist of attribute names to be copied or omitted explicitly expresses the expectations of the copying of message attributes in a messaging workflow.

``` ruby
class PrecedingMessage
  attribute :additional_attribute
end

preceding_message.additional_attribute = 'additional value'

subsequent_message = SubsequentMessage.follow(preceding_message)
# => Messaging::Message::Copy::Error (#<SubsequentMessage:0x...> has no setter for additional_attribute)

subsequent_message = SubsequentMessage.follow(preceding_message, strict: false)
# => #<SubsequentMessage:0x... @some_attribute="some value", @some_other_attribute="some other value", @yet_another_attribute="yet another value">
```

### Attribute Map

The whitelist of attributes specified with the `copy` parameter can include maps of attributes, allowing the data to be copied between attributes with different names.

``` ruby
subsequent_message = SubsequentMessage.follow(preceding_message, copy: [
  { :some_attribute => :some_other_attribute },
  :yet_another_attribute
])
# => #<SubsequentMessage:0x... @some_attribute="some value", @yet_another_attribute="yet another value">
```

### Metadata and Message Workflows

While copying message data from a preceding message to a subsequent message is a convenient feature, copying message flow properties between the metadata of two messages is the feature that implements message workflow.

Refer to [Metadata](./metadata.md#message-workflows) for a more complete description of metadata and message flows.

### Messaging::Message::Follow Module

The `follow` class method of a message class can be also be actuated from the `Messaging::Message::Follow` module.

[View on GitHub](https://github.com/eventide-project/messaging/blob/master/lib/messaging/message/follow.rb)

The underlying implementation of a message class's `follow` method is the `Messaging::Message::Follow` module. It can be actuated either by including it, or via invoking its methods directly as module methods.

``` ruby
self.call(preceding_message, subsequent_message=nil, copy: nil, include: nil, exclude: nil, strict: nil)
```

**Returns**

Instance of the subsequent message class initialized with the preceding message's data, or the subsequent message object after having the preceding message's data copied to it.

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| preceding_message | Message to build the subsequent message from | Message |
| subsequent_message | The message that will receive the preceding message's data | Message class or message instance |
| copy | Whitelist of attribute names to copy | Array of Symbols |
| include | Alias for the `copy` parameter. Obsolete. Used for backward compatibility | Array of Symbols |
| exclude | Blacklist of attribute names to exclude from copying | Array of Symbols |
| strict | Raise an error if receiver doesn't define a whitelisted attribute | Boolean |

**Subsequent Message is an Instance of a Message Class**

When the receiver is a message instance, the class will be constructed, and then the source message's data and message flow metadata will be copied to it.

``` ruby
subsequent_message = SubsequentMessage.new()
Messaging::Message::Follow.(preceding_message, subsequent_message)
# => #<SubsequentMessage:0x... @some_attribute="some value", @some_other_attribute="some other value", @yet_another_attribute="yet another value">
```

**Subsequent Message is a Message Class**

When the receiver is a message class, the class will be constructed, and then the source message's data and message flow metadata will be copied to it.

``` ruby
subsequent_message = Messaging::Message::Follow.(preceding_message, SubsequentMessage)
# => #<SubsequentMessage:0x... @some_attribute="some value", @some_other_attribute="some other value", @yet_another_attribute="yet another value">
```

Note that when the `Messaging::Message::Follow` is extended onto a message class, the default value of the `subsequent_message` parameter is `self`. The value of `self` in such a case is the message class.

## Equality

Two messages are considered to be equal when their classes are the same and their attribute values are the same.

``` ruby
class SomeMessage
  include Messaging::Message

  attribute :some_attribute
end

some_message_1 = SomeMessage.new
some_message_1.some_attribute = 'some value'

some_message_2 = SomeMessage.new
some_message_2.some_attribute = 'some value'

some_message_1 == some_message_2
# => true

some_message_2.some_attribute = 'some other value'

some_message_1 == some_message_2
# => false

class SomeOtherMessage
  include Messaging::Message

  attribute :some_attribute
end

some_other_message = SomeOtherMessage.new
some_other_message.some_attribute = 'some value'

some_message_1 == some_other_message
# => false
```

## Transformation To and From MessageData

[MessageStore::MessageData](./message-data.md) is the raw, low-level storage representation of a message.

Before a message can be written to the message store, it's transformed into a `MessageData`. When a message is retrieved from the message store, it's retrieved as a `MessageData` object and then transformed to a message.

There are two implementations of `MessageData`: `MessageStore::MessageData::Write` that is the form that can be written to the message store, and `MessageStore::MessageData::Read` that is the form that is retrieved from the message store.

### Export a Message to MessageData::Write

``` ruby
Messaging::Message::Export.call(message)
```

**Returns**

An instance of `MessageStore::MessageData::Write`.

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| message | The message to export to `MessageData` | Message |

``` ruby
class SomeMessage
  include Messaging::Message

  attribute :some_attribute
end

some_message = SomeMessage.new
some_message.some_attribute = 'some value'

Messaging::Message::Export.(some_message)
# => <MessageStore::MessageData::Write:0x... @type="SomeMessage", @data={:some_attribute=>"some value"}>
```

### Import a Message from MessageData::Read

``` ruby
Messaging::Message::Import.call(message_data, message_class)
```

**Returns**

An instance of the message class.

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| message_data | The raw MessageData representation of a message | MessageData |
| message_class | The message class to transform the `MessageData` into | Class |

``` ruby
message_data = MessageStore::MessageData::Read.new
message_data.data = { some_attribute: 'some value' }
message_data.type = 'SomeMessage'

some_message = Messaging::Message::Import.(message_data, SomeMessage)
# => #<SomeMessage:0x... @some_attribute="some value">
```

## Message Type

The _message type_ is the name of the message class without any of the namespace information.

``` ruby
self.message_type()
```

**Returns**

String

``` ruby
SomeNamespace::SomeMessage.message_type
# => "SomeMessage"
```

## Message Type Predicate

The message type predicate method determines whether a string matches the [message type](#message-type) of a message class.

``` ruby
self.message_type?(message_type)
```

**Returns**

String

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| message_type | Message type to compare with the message's message type | String |

``` ruby
SomeNamespace::SomeMessage.message_type?("SomeMessage")
# => true

SomeNamespace::SomeMessage.message_type?("SomeOtherMessage")
# => false
```

## Message Name

A message's name is the underscore cased formatted name of the message class without any of the namespace information.

``` ruby
self.message_name()
```

**Returns**

String.

``` ruby
SomeNamespace::SomeMessage.message_name
# => "some_message"
```
