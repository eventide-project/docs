# Handler Fixture

The handler fixture tests the processing of a [message](/user-guide/messages-and-message-data/messages.html) by a [message handler](/user-guide/handlers.html). It has affordances to verify the attributes of the input message and its metadata, as well as the output message written as a result of handling the message, and the arguments sent to the writer. The handler fixture also allows a handler's entity store to be controlled, including the entity and entity version returned from the store, and it allows for control of the handler's clock and UUID generator.

## Example

``` ruby
class SomeHandler
  include Messaging::Handle

  dependency :clock, Clock::UTC
  dependency :store, SomeStore
  dependency :write, Messaging::Write

  handle SomeMessage do |some_message|
    something_id = some_message.something_id

    something, version = store.fetch(something_id, include: :version)

    if something.limit?(some_message.amount)
      logger.info(tag: :ignored) { "Message ignored: limit reached (Quantity: #{something.quantity}, Amount: #{some_message.amount}, Limit: #{Something.LIMIT})" }
      return
    end

    attributes = [
      :something_id,
      { :amount => :quantity },
      :time,
    ]

    time = clock.iso8601

    some_event = SomeEvent.follow(some_message, copy: attributes)

    some_event.processed_time = time

    some_event.metadata.correlation_stream_name = 'someCorrelationStream'
    some_event.metadata.reply_stream_name = 'someReplyStream'

    stream_name = stream_name(something_id, category: 'something')

    write.(some_event, stream_name, expected_version: version)
  end
end

context "Handle SomeMessage" do
  effective_time = Clock::UTC.now
  processed_time = effective_time + 1

  something_id = SecureRandom.uuid

  message = SomeMessage.new
  message.something_id = something_id
  message.amount = 1
  message.time = Clock.iso8601(effective_time)

  message.metadata.stream_name = "something:command-#{something_id}"
  message.metadata.position = 11
  message.metadata.global_position = 111

  something = Something.new
  something.id = something_id
  something.total = 98

  entity_version = 1111

  event_class = SomeEvent
  output_stream_name = "something-#{something_id}"

  handler = SomeHandler.new

  fixture(
    Handler,
    handler,
    message,
    something,
    entity_version,
    clock_time: processed_time
  ) do |handler|

    handler.assert_input_message do |message|
      message.assert_attributes_assigned

      message.assert_metadata do |metadata|
        metadata.assert_source_attributes_assigned
      end
    end

    event = handler.assert_write(event_class) do |write|
      write.assert_stream_name(output_stream_name)
      write.assert_expected_version(entity_version)
    end

    handler.assert_written_message(event) do |written_message|
      written_message.assert_follows

      written_message.assert_attributes_copied([
        :something_id,
        { :amount => :quantity },
        :time,
      ])

      written_message.assert_attribute_value(:processed_time, Clock.iso8601(processed_time))

      written_message.assert_attributes_assigned

      written_message.assert_metadata do |metadata|
        metadata.assert_correlation_stream_name('someCorrelationStream')
        metadata.assert_reply_stream_name('someReplyStream')
      end
    end

    handler.refute_write(SomeOtherEvent)
  end
end
```

_Note: This example is abridged for brevity. An unabridged version is included with the messaging fixtures: [https://github.com/eventide-project/messaging-fixtures/blob/master/demo.rb](https://github.com/eventide-project/messaging-fixtures/blob/master/demo.rb)_

## Handler Fixture Facts

- The principle concerns of a handler test are whether an input message was processed, and what the resulting message is, along with the content of the resulting message's attributes and its metadata attributes
- The entity returned by a handler's entity store can be set to any arbitrary entity constructed in the test setup
- The entity version that is returned along with the entity from the entity store, and given to the message writer using the [`expected_version`](/user-guide/writing/expected-version.html) argument, can be set to an arbitrary version in the test setup
