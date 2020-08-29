# Message Metadata Fixture

The message metadata fixture tests the attributes of a message's metadata. It can verify that all of a message's attributes have had values assigned to them, and can verify that certain subsets of attributes have had values assigned to them. The metadata fixture also allows testing whether a message's metadata follows another message in a sequence of messages in a workflow.

## Example

``` ruby
context "Metadata Fixture" do
  source_metadata = Messaging::Message::Metadata.new
  source_metadata.stream_name='example:command-00000001-0000-4000-8000-000000000000'
  source_metadata.position=1
  source_metadata.global_position=111
  source_metadata.correlation_stream_name='someCorrelationStream'
  source_metadata.reply_stream_name='someReplyStream'

  metadata = Controls::Metadata.example
  metadata.stream_name='example-00000001-0000-4000-8000-000000000000'
  metadata.position=11
  metadata.global_position=1111
  metadata.causation_message_stream_name='example:command-00000001-0000-4000-8000-000000000000'
  metadata.causation_message_position=1
  metadata.causation_message_global_position=111
  metadata.correlation_stream_name='someCorrelationStream'
  metadata.reply_stream_name='someReplyStream'

  metadata.follow(source_metadata)

  fixture(
    Metadata,
    metadata,
    source_metadata
  ) do |metadata|

    metadata.assert_source_attributes_assigned
    metadata.assert_causation_attributes_assigned
    metadata.assert_workflow_attributes_assigned

    metadata.assert_attributes_assigned

    metadata.assert_correlation_stream_name('someCorrelationStream')
    metadata.assert_reply_stream_name('someReplyStream')

    metadata.assert_follows

  end
end
```

## Message Metadata Fixture Facts

- The principle concerns of a message metadata test are whether metadata attributes have been mutated (ie: _assigned_), and whether a message's metadata follows from another message's metadata in a sequence of messages representing a workflow
- An optional list of attribute names can be given to limit the testing of assignment of attributes to a subset of attributes

## Messaging::Fixtures::Metadata Class

The `Metadata` class is a concrete class from the [`Messaging::Fixtures` library](/user-guide/libraries.md#messaging-fixtures) and namespace.

The `Messaging::Fixtures::Metadata` class provides:

- The instance actuator `.()` (or `call` method) that begins execution of the fixture and the testing of a message metadata object, as well as the optional comparison with a source object
- The `assert_source_attributes_assigned` method for testing that the set of source attributes have been assigned
- The `assert_causation_attributes_assigned` method for testing that the set of causation attributes have been assigned
- The `assert_workflow_attributes_assigned` method for testing that the set of workflow attributes have been assigned
- The `assert_correlation_stream_name` method for testing the value of the `correlation_stream_name` attribute
- The `assert_reply_stream_name` method for testing the value of the `reply_stream_name` attribute
- The `assert_follows` method for testing that a message's metadata follows from another message's metadata in a messaging workflow

## Running the Fixture

Running the test is no different than [running any TestBench test](http://test-bench.software/user-guide/running-tests.html).

For example, given a test file named `metadata.rb` that uses the message metadata fixture, in a directory named `test`, the test is executed by passing the file name to the `ruby` executable.

``` bash
ruby test/metadata.rb
```

The test script and the fixture work together as if they are part of the same test context, preserving output nesting between the test script file and the test fixture.

## Message Metadata Fixture Output

``` text
Metadata Fixture
  Metadata
    Source Attributes Assigned
      stream_name
      position
      global_position
    Causation Attributes Assigned
      causation_message_stream_name
      causation_message_position
      causation_message_global_position
    Workflow Attributes Assigned
      causation_message_stream_name
      causation_message_position
      causation_message_global_position
      correlation_stream_name
      reply_stream_name
    Attributes Assigned
      stream_name
      position
      global_position
      causation_message_stream_name
      causation_message_position
      causation_message_global_position
      correlation_stream_name
      reply_stream_name
      time
      schema_version
    correlation_stream_name
    reply_stream_name
    Follows
```

The output below the "Metadata" line is from the metadata fixture. The "Metadata Fixture" line is from the `test/metadata.rb` test script file that is actuating the metadata fixture.

## Detailed Output

In the event of any error or failed assertion, the test output will include additional detailed output that can be useful in understanding the context of the failure and the state of the fixture itself and the objects that it's testing.

The detailed output can also be printed by setting the `TEST_BENCH_DETAIL` environment variable to `on`.

``` bash
TEST_BENCH_DETAIL=on ruby test/metadata.rb
```

``` text
Metadata Fixture
  Metadata
    Source Attributes Assigned
      stream_name
        Default Value: nil
        Assigned Value: "example-00000001-0000-4000-8000-000000000000"
      position
        Default Value: nil
        Assigned Value: 11
      global_position
        Default Value: nil
        Assigned Value: 1111
    Causation Attributes Assigned
      causation_message_stream_name
        Default Value: nil
        Assigned Value: "example:command-00000001-0000-4000-8000-000000000000"
      causation_message_position
        Default Value: nil
        Assigned Value: 1
      causation_message_global_position
        Default Value: nil
        Assigned Value: 111
    Workflow Attributes Assigned
      causation_message_stream_name
        Default Value: nil
        Assigned Value: "example:command-00000001-0000-4000-8000-000000000000"
      causation_message_position
        Default Value: nil
        Assigned Value: 1
      causation_message_global_position
        Default Value: nil
        Assigned Value: 111
      correlation_stream_name
        Default Value: nil
        Assigned Value: "someCorrelationStream"
      reply_stream_name
        Default Value: nil
        Assigned Value: "someReplyStream"
    correlation_stream_name
      Metadata Value: someCorrelationStream
      Compare Value: someCorrelationStream
    reply_stream_name
      Metadata Value: someReplyStream
      Compare Value: someReplyStream
    Attributes Assigned
      stream_name
        Default Value: nil
        Assigned Value: "example-00000001-0000-4000-8000-000000000000"
      position
        Default Value: nil
        Assigned Value: 11
      global_position
        Default Value: nil
        Assigned Value: 1111
      causation_message_stream_name
        Default Value: nil
        Assigned Value: "example:command-00000001-0000-4000-8000-000000000000"
      causation_message_position
        Default Value: nil
        Assigned Value: 1
      causation_message_global_position
        Default Value: nil
        Assigned Value: 111
      correlation_stream_name
        Default Value: nil
        Assigned Value: "someCorrelationStream"
      reply_stream_name
        Default Value: nil
        Assigned Value: "someReplyStream"
      time
        Default Value: nil
        Assigned Value: 2000-01-01 00:00:00.000011 UTC
      schema_version
        Default Value: nil
        Assigned Value: "1"
    Follows
      Source Message Stream Name: "example:command-00000001-0000-4000-8000-000000000000"
      Causation Stream Name: "example:command-00000001-0000-4000-8000-000000000000"
      Source Message Position: 1
      Causation Position: 1
      Source Message Global Position: 111
      Causation Global Position: 111
      Source Message Correlation Stream Name: "someCorrelationStream"
      Correlation Stream Name: "someCorrelationStream"
      Source Message Reply Stream Name: "someReplyStream"
      Reply Stream Name: "someReplyStream"
```

## Actuating the Fixture

The fixture is executed using TestBench's `fixture` method.

``` ruby
fixture(Messaging::Fixtures::Metadata, metadata, source_metadata=nil, &test_block)
```

The first argument sent to the `fixture` method is always the `Messaging::Fixtures::Metadata` class. Subsequent arguments are the specific construction parameters of the metadata fixture.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| metadata | Message metadata that is the principal subject of the fixture's tests | Messaging::Message::Metadata |
| source_metadata | Optional message metadata that the principal message follows | Messaging::Message::Metadata |
| test_block | Block used for invoking other assertions that are part of the metadata fixture's API | Proc |

**Block Parameter**

The `metadata_fixture` argument is passed to the `test_block` if the block is given.

| Name | Description | Type |
| --- | --- | --- |
| metadata_fixture | Instance of the metadata fixture that is being actuated | Messaging::Fixtures::Metadata |

**Block Parameter Methods**

The following methods are available from the `metadata_fixture` block parameter, and on an instance of `Messaging::Fixtures::Metadata`:

- assert_source_attributes_assigned
- assert_causation_attributes_assigned
- assert_workflow_attributes_assigned
- assert_attributes_assigned
- assert_correlation_stream_name
- assert_reply_stream_name
- assert_follows

## Testing That Source Attributes Have Been Assigned

``` ruby
assert_source_attributes_assigned()
```

The assertion fails if any of the metadata source attributes are not assigned. This assertion is useful when testing that a metadata object meets the setup prerequisites for simulating a message that has been retrieved from a stream.

The source attributes are the metadata about the message's own source stream and position.

- `stream_name`
- `position`
- `global_position`

For more information on message metadata attributes, see the [metadata user guide](/user-guide/messages-and-message-data/metadata.md#metadata-attributes).

## Testing That Causation Attributes Have Been Assigned

``` ruby
assert_workflow_attributes_assigned()
```

The assertion fails if any of the metadata causation attributes are not assigned. This assertion is useful when testing that a metadata object meets the setup prerequisites for simulating a message that was constructed from a preceding message in a workflow using the message class's [follow constructor](/user-guide/messages-and-message-data/messages.md#message-workflows).

The workflow attributes are the metadata that records information about any workflow that the message is a part of:

- `causation_message_stream_name`
- `causation_message_position`
- `causation_message_global_position`

For more information on message metadata attributes, see the [metadata user guide](/user-guide/messages-and-message-data/metadata.md#metadata-attributes).

## Testing That Workflow Attributes Have Been Assigned

``` ruby
assert_workflow_attributes_assigned()
```

The assertion fails if any of the metadata workflow attributes are not assigned.

This assertion is useful when testing that a metadata object meets the setup prerequisites for simulating a message that was constructed from a preceding message in a workflow using the message class's [follow constructor](/user-guide/messages-and-message-data/messages.md#message-workflows), and when correlation and reply metadata have both been added to the metadata.

The workflow attributes are the metadata that records information about any workflow that the message is a part of:

- `causation_message_stream_name`
- `causation_message_position`
- `causation_message_global_position`
- `correlation_stream_name`
- `reply_stream_name`

Workflow metadata is the causation metadata plus the optional correlation metadata that is carried from message to message in a message workflow, as well as any reply metadata that is copied from message to message.

For more information on message metadata attributes, see the [metadata user guide](/user-guide/messages-and-message-data/metadata.md#metadata-attributes).

## Test That the Metadata's Attributes Have Been Mutated

``` ruby
assert_attributes_assigned(attribute_names=nil)
```

An optional list of attribute names can be passed. When the list of attribute names is passed, only those attributes will be tested. When the list of attribute names is not provided, it defaults to the list of all of the metadata attributes names.

The `assert_attributes_assigned` method uses an instance of the [Schema::Fixtures::Assignment](/user-guide/test-fixtures/schema-assignment-fixture.md) fixture to perform the assignment test.

``` ruby
attribute_names = [
  :stream_name,
  :position,
  :global_position,
  :causation_message_stream_name,
  :causation_message_position,
  :causation_message_global_position
]

message_fixture.assert_attributes_assigned(attribute_names)
```

**Parameters**

| attribute_names | Optional list of attribute names to check for assignment | Array of Symbol |


The list of attribute names can include any of the metadata attribute names, including:

- `stream_name`
- `position`
- `global_position`
- `causation_message_stream_name`
- `causation_message_position`
- `causation_message_global_position`
- `correlation_stream_name`
- `reply_stream_name`
- `time`
- `schema_version`

For more information on message metadata attributes, see the [metadata user guide](/user-guide/messages-and-message-data/metadata.md#metadata-attributes).

## Test the Correlation Stream Name Value

``` ruby
assert_correlation_stream_name(correlation_stream_name)
```

**Example**

``` ruby
assert_correlation_stream_name('someCorrelationStream')
```

**Parameters**

| correlation_stream_name | Expected value to compare against the metadata's correlation stream name value | String |

## Test the Reply Stream Name Value

``` ruby
assert_reply_stream_name(reply_stream_name)
```

**Example**

``` ruby
assert_reply_stream_name('someReplyStream')
```

**Parameters**

| reply_stream_name | Expected value to compare against the metadata's reply stream name value | String |

## Test That the Metadata Follows the Metadata of a Source Message

``` ruby
assert_follows()
```

This assertion requires that the optional `source_metadata` argument was passed to the metadata fixture's actuator.

The `assert_follows` method uses the `Message` class's [follows?](/user-guide/messages-and-message-data/messages.md#determining-message-precedence) predicate to determine if the message follows the source message.

This same assertion is also available on the [message fixture](/user-guide/test-fixtures/message-fixture.md#test-that-a-message-follows-a-source-message). The message fixture will likely serve the vast majority of use cases for testing message precedence, but the assertion is provided here by the metadata fixture for sake of completeness, consistency, and symmetry. It will likely not be useful except in applications that deal explicitly in message metadata rather than messages.
