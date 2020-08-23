# Writer Fixture

The writer fixture tests the message written by the writer, as well as the arguments that are sent to the writer, including the stream name that the message is being written to, and the value of the optional concurrency control argument, if used.

## Example

``` ruby
context "Write SomeEvent" do
  writer = Messaging::Write::Substitute.build
  message = SomeEvent.new
  stream_name = "something-#{message.something_id}"
  expected_version = 1

  writer.(message, stream_name, expected_version: expected_version, reply_stream_name: reply_stream_name)

  message_class = message.class

  fixture(
    Writer,
    writer,
    message.class
  ) do |written_message|

    written_message.assert_stream_name(stream_name)
    written_message.assert_expected_version(expected_version)
    written_message.assert_reply_stream_name(reply_stream_name)

  end
end
```

## Writer Fixture Facts

- The principle concern of a writer test is the verification of a message that was sent to the writer to be written to the message store
- The writer fixture tests the writing of a single message message
- The writer fixture operates on a [writer substitute](/user-guide/writing/substitute.md), or an operational writer whose telemetry sink has been activated
- The message writer's telemetry is the primary means of accessing and determining the data used in the writer fixture's tests
- It can verify the value of the `expected_version` argument if it's sent to the writer
- It can verify the value of the `reply_stream_name` argument if it's sent to the writer

## Messaging::Fixtures::Writer Class

The `Writer` class is a concrete class from the [`Messaging::Fixtures` library](/user-guide/libraries.md#messaging-fixtures) and namespace.

The `Messaging::Fixtures::Writer` class provides:

- The instance actuator `.()` (or `call` method) that begins execution of the fixture
- The `assert_stream_name` method for testing the stream name that a message was written to
- The `assert_expected_version` method for testing the value of the optional [expected_version concurrency control](/user-guide/writing/expected-version.md) argument, if used when writing the message
- The `assert_reply_stream_name` for testing the value of the optional [reply_stream_name](/user-guide/writing/message-writer.md#the-reply-stream-name-parameter) argument, if used when writing the message

## Running the Fixture

Running the test is no different than [running any TestBench test](http://test-bench.software/user-guide/running-tests.html).

For example, given a test file named `writer.rb` that uses the writer fixture, in a directory named `test`, the test is executed by passing the file name to the `ruby` executable.

``` bash
ruby test/writer.rb
```

The test script and the fixture work together as if they are part of the same test context, preserving output nesting between the test script file and the test fixture.

## Writer Fixture Output

``` text
Write SomeEvent
  Write: SomeEvent
    Written
    Stream name
    Expected version
    Reply stream name
```

The output below the "Write SomeEvent" line is from the writer fixture. The "Write SomeEvent" line is from the `test/writer.rb` test script file that is actuating the writer fixture.

## Detailed Output

In the event of any error or failed assertion, the test output will include additional detailed output that can be useful in understanding the context of the failure and the state of the fixture itself and the objects that it's testing.

The detailed output can also be printed by setting the `TEST_BENCH_DETAIL` environment variable to `on`.

``` bash
TEST_BENCH_DETAIL=on ruby test/writer.rb
```

``` text
Write SomeEvent
  Write: SomeEvent
    Message Class: SomeEvent
    Written
    Stream name
      Stream Name: example-00000001-0000-4000-8000-000000000000
      Written Stream Name: example-00000001-0000-4000-8000-000000000000
    Expected version
      Expected Version: 1
      Written Expected Version: 1
    Reply stream name
      Reply stream Name: someReplyStream
      Written reply stream Name: someReplyStream
```

## Actuating the Fixture

The fixture is executed using TestBench's `fixture` method.

``` ruby
fixture(Messaging::Fixtures::Writer, writer, message_class, &test_block)
```

The first argument sent to the `fixture` method is always the `Messaging::Fixtures::Writer` class. Subsequent arguments are the specific construction parameters of the handler fixture.

If no message written by the writer matches the value of the `message_class` argument, the fixture fails and does not execute any further tests.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| writer | Writer instance that will write the message of the class indicated by the `message_class` parameter | Messaging::Write |
| message_class | Class of the message that the writer has written | Class that implements Messaging::Message |
| test_block | Block used for invoking other assertions that are part of the writer fixture's API | Proc |

**Block Parameter**

The `writer_fixture` argument is passed to the `test_block` if the block is given.

| Name | Description | Type |
| --- | --- | --- |
| writer_fixture | Instance of the writer fixture that is being actuated | Messaging::Fixtures::Writer |

**Block Parameter Methods**

The following methods are available from the `writer_fixture` block parameter, and on an instance of `Messaging::Fixtures::Writer`:

- `assert_stream_name`
- `assert_expected_version`
- `assert_reply_stream_name`

## Test the Stream Name To Which the Message is Written

``` ruby
assert_stream_name(stream_name)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of the stream to which the message was written | String |

## Test the Expected Version Specified When the Message was Written

``` ruby
assert_expected_version(expected_version)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| expected_version | Expected version of the stream specified using the writer's `expected_version` parameter | Integer |

## Test the Reply Stream Name Specified When the Message was Written

``` ruby
assert_reply_stream_name(reply_stream_name)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| reply_stream_name | Reply stream name specified using the writer's `reply_stream_name` parameter | Integer |
