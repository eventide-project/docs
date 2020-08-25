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

  processed_time_iso8601 = Clock.iso8601(processed_time)
  sequence = 11

  message.processed_time = processed_time_iso8601
  message.sequence = sequence

  fixture(
    Message,
    message,
    source_message
  ) do |message|

    message.assert_attributes_copied(attribute_names)

    message.assert_attribute_value(:processed_time, processed_time)
    message.assert_attribute_value(:sequence, sequence)

    message.assert_follows

    message.assert_attributes_assigned

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

## Running the Fixture

Running the test is no different than [running any TestBench test](http://test-bench.software/user-guide/running-tests.html).

For example, given a test file named `message.rb` that uses the message fixture, in a directory named `test`, the test is executed by passing the file name to the `ruby` executable.

``` bash
ruby test/message.rb
```

The test script and the fixture work together as if they are part of the same test context, preserving output nesting between the test script file and the test fixture.

## Message Fixture Output

``` text
Message Fixture
  Message: SomeSubsequentMessage
    Attributes Copied: SomeMessage => SomeSubsequentMessage
      example_id
      quantity => amount
      time
    Attribute Value
      processed_time
    Attribute Value
      sequence
    Follows
    Attributes Assigned
      example_id
      amount
      time
      processed_time
      sequence
    Metadata
      correlation_stream_name
      reply_stream_name
```

The output below the "Message: SomeSubsequentMessage" line is from the equality fixture. The "Message Fixture" line is from the `test/message.rb` test script file that is actuating the message fixture.

## Detailed Output

In the event of any error or failed assertion, the test output will include additional detailed output that can be useful in understanding the context of the failure and the state of the fixture itself and the objects that it's testing.

The detailed output can also be printed by setting the `TEST_BENCH_DETAIL` environment variable to `on`.

``` bash
TEST_BENCH_DETAIL=on ruby test/message.rb
```

``` text
Message Fixture
  Message: SomeSubsequentMessage
    Message Class: SomeSubsequentMessage
    Source Message SomeMessage
    Attributes Copied: SomeMessage => SomeSubsequentMessage
      example_id
        Input Value: "00000001-0000-4000-8000-000000000000"
        Output Value: "00000001-0000-4000-8000-000000000000"
      quantity => amount
        Input Value: 1
        Output Value: 1
      time
        Input Value: "2000-01-01T00:00:00.001Z"
        Output Value: "2000-01-01T00:00:00.001Z"
    Attribute Value
      processed_time
        Attribute Value: "2000-01-01T00:00:00.011Z"
        Compare Value: "2000-01-01T00:00:00.011Z"
    Attribute Value
      sequence
        Attribute Value: 112
        Compare Value: 112
    Follows
      Stream Name: "example:command-00000001-0000-4000-8000-000000000000"
      Causation Stream Name: "example:command-00000001-0000-4000-8000-000000000000"
      Position: 1
      Causation Position: 1
      Global Position: 111
      Causation Global Position: 111
      Source Correlation Stream Name: "someCorrelationStream"
      Correlation Stream Name: "someCorrelationStream"
      Source Reply Stream Name: "someReplyStream"
      Reply Stream Name: "someReplyStream"
    Attributes Assigned
      example_id
        Default Value: nil
        Assigned Value: "00000001-0000-4000-8000-000000000000"
      amount
        Default Value: nil
        Assigned Value: 1
      time
        Default Value: nil
        Assigned Value: "2000-01-01T00:00:00.001Z"
      processed_time
        Default Value: nil
        Assigned Value: "2000-01-01T00:00:00.011Z"
      sequence
        Default Value: nil
        Assigned Value: 112
    Metadata
      correlation_stream_name
        Metadata Value: someCorrelationStream
        Compare Value: someCorrelationStream
      reply_stream_name
        Metadata Value: someReplyStream
        Compare Value: someReplyStream
```
