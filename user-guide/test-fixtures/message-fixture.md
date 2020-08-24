# Message Fixture

The message fixture tests the attributes of a message and its metadata. It can verify that a message's attributes have had values assigned to them, and it can verify that a message's attributes have been copied from another message. The attributes tested can be limited to a subset of attributes by specifying a list of attribute names. A map can be provided to compare attributes that have a different name on the source message. The message fixture also allows testing whether a message from follows another message in a sequence of messages in a workflow.

## Example

``` ruby
class SomeMessage
  include Messaging::Message

  attribute :example_id, String
  attribute :quantity, Integer
  attribute :time, String
end

class SomeSubsequentMessage
  include Messaging::Message

  attribute :example_id, String
  attribute :amount, Integer
  attribute :time, String
  attribute :processed_time, String
end

context "Message Fixture" do
  effective_time = Clock::UTC.now
  processed_time = effective_time + 1

  something_id = SecureRandom.uuid

  source_message = SomeMessage.new
  source_message.something_id = something_id
  source_message.amount = 1
  source_message.time = Clock.iso8601(effective_time)

  source_message.metadata.correlation_stream_name = 'someCorrelationStream'
  source_message.metadata.reply_stream_name = 'someReplyStream'

  attribute_names = [
    :example_id,
    { :quantity => :amount },
    :time,
  ]

  message = SomeSubsequentMessage.follow(source_message, copy: attribute_names)

  message.processed_time = Clock.iso8601(processed_time)

  fixture(
    Message,
    message,
    source_message
  ) do |message|

    message.assert_attributes_copied(attribute_names)
    message.assert_attributes_assigned
    message.assert_follows

    message.assert_metadata do |metadata|
      metadata.assert_correlation_stream_name('someCorrelationStream')
      metadata.assert_reply_stream_name('someReplyStream')
    end
  end
end
```

## Message Fixture Facts

- The principle concerns of a message test are whether a message's attributes have been mutated (ie: _assigned_), whether a message's attributes where copied from another message, and whether a messages follows from another message in a sequence of messages representing a workflow
- A message fixture also allows the testing of a message's [metadata](./metadata-fixture.md)
- An optional list of attribute names can given to limit the testing of attributes to a subset of attributes
- The list of attribute names can contain maps of attribute names to allow comparison of attributes of different names

## Messaging::Fixtures::Message Class

The `Message` class is a concrete class from the [`Messaging::Fixtures` library](/user-guide/libraries.md#messaging-fixtures) and namespace.

The `Messaging::Fixtures::Message` class provides:

- The instance actuator `.()` (or `call` method) that begins execution of the fixture and the testing of a message object, as well as the optional comparison with a source object
- The `assert_attributes_assigned` method for testing that a message's attributes have been mutated
- The `assert_attributes_copied` method for testing the copying of a message's attributes from another message
- The `assert_follows` method for testing that a message follows from another message in a messaging workflow
- The `assert_metadata` method for testing a message's metadata
