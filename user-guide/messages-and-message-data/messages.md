# Messages

Messages are packages of data that are the principle means of transmission of instructions and status between services. They carry data between services and processes. Messages typically represent commands or events, and are recorded or _sent_ via the [message store](/user-guide/message-db/) (or other message transport).

## Example

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

## Message Facts

- A message class is a data object that has data attributes with optional data type checking
- Events and commands are kinds of messages
- A message contains optional metadata that is separate from the message data
- Messages are transformed to and from raw [MessageStore::MessageData](./message-data.md) when storing and retrieving from the message store
- Message data is formatted as JSON when stored
- Messages are typically flat key/value structures, and by default, transformation of messages does not traverse a graph of attributes

## Messaging::Message Module

A class becomes a message by including the `Message` module from the [`Messaging` library](../libraries.md#messaging) and namespace.

The `Messaging::Message` affords the receiver with:

- The `attribute` macro for declaring message attributes
- The `build` constructor that optionally receives a hash or attribute data and a hash of metadata attribute data
- The `attributes` method (aliased as `to_h`) that returns a hash of attribute name and attribute value pairs
- The 'attribute_names' method that returns an array of attribute names
- The `copy` method that copies a message's data to another message
- The `follow` constructor that takes a message and constructs another message based on the former message's data and metadata
- The `follows?` predicate that determines whether a message was constructed from a former message
- A `==` operator implementation that determines message equality based on attribute values and message class
- The `message_type` class method that returns a string representation of the message class name
- The `message_type?` class predicate that determines when a message's message type matches the argument
- The `message_name` class method that returns the message's type in underscore case

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

**Parameters**

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

## Reserved Attributes

A message object has two reserved attributes.

| Name | Description | Type |
| --- | --- | --- |
| id | Unique identifier of the message | UUID String |
| metadata | Mechanical data describing the message and its provenance | Messaging::Message::Metadata |

::: danger
Reserved attributes are for system use only and cannot be overwritten without causing a message to become incompatible with the rest of the toolkit, and without causing malfunctions or failures.
:::

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

**Parameters**

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

The underlying implementation of a message class's `copy` method is the `Messaging::Message::Copy` module. It can be actuated either by including it, or via invoking its methods directly as module methods.

``` ruby
self.call(source, receiver=nil, copy: [], include: [], exclude: [], strict: false, metadata: false)
```

**Returns**

Instance of the receiver message class initialized with the source message's data, or the receiver message object after having the source's data copied to it.

**Parameters**

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

**Parameters**

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

The underlying implementation of a message class's `follow` method is the `Messaging::Message::Follow` module. It can be actuated either by including it, or via invoking its methods directly as module methods.

``` ruby
self.call(preceding_message, subsequent_message=nil, copy: nil, include: nil, exclude: nil, strict: nil)
```

**Returns**

Instance of the subsequent message class initialized with the preceding message's data, or the subsequent message object after having the preceding message's data copied to it.

**Parameters**

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

## Determining Message Precedence

Messages can be determined to follow each other using the message's `follows?` predicate method.

``` ruby
follows?(message)
```

**Returns**

Boolean.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| message | A message instance that may precede the message being inspected | Message |

The `follows?` predicate method returns `true` when the message metadata's causation and provenance attributes match the message argument's metadata source attributes.

``` ruby
preceding_message = SomeMessage.new()
preceding_message.metadata.stream_name = 'someStream'
preceding_message.metadata.position = 11
preceding_message.metadata.global_position = 111
preceding_message.metadata.reply_stream_name = 'someReplyStream'

message = SomeMessage.follow(preceding_message)

message.follows?(preceding_message)
# => true

preceding_message.metadata.stream_name = `someOtherStream`

message.follows?(preceding_message)
# => false
```

Message precedence is determined as:

``` ruby
message.metadata.causation_message_stream_name == preceding_message.metadata.stream_name &&
message.metadata.causation_message_position == preceding_message.metadata.position &&
message.metadata.causation_message_global_position == preceding_message.metadata.global_position &&
message.metadata.reply_stream_name == preceding_message.metadata.reply_stream_name
```

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

**Parameters**

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

**Parameters**

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

## Transforming Messages with Nested Objects

A message with a flat structure of attributes with strings, numbers, and time values can be converted to-and-from the underlying `MessageData` format without any additional coding.

When a message has an attribute that contains an object rather than a primitive value, the message must implement two methods that transform the nested object to and from hash data: `transform_read` and `transform_write`. Hash data is the de facto intermediate representation of message data when transforming between messages and message data.

``` ruby
class SomeNestedObject
  include Schema::DataStructure

  attribute :something, String
  attribute :something_else, String
end

class SomeMessage
  include Schema::DataStructure

  attribute :name, String
  attribute :nested_objects, Collection::Set[SomeNestedObject],
            default: -> { Collection::Set[SomeNestedObject].new }

  def transform_read(data)
    nested_objects = data[:nested_objects] &.map do |nested_object_data|
      SomeNestedObject.build(nested_object_data)
    end

    nested_objects_set = Collection::Set[SomeNestedObject].new.add(nested_objects)

    data[:nested_objects] = nested_objects_set
  end

  def transform_write(data)
    nested_objects = data[:nested_objects]
    if nested_objects.empty?
      data.delete(:nested_objects)
    else
      data[:nested_objects] = nested_objects.map(&:to_h)
    end
  end
end
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

**Parameters**

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
