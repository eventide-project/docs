# Message Writer Substitute

A _substitute_ is an alternate implementation of an interface. In this case, the [message writer](./messaging-writer.html) interface.

For more information about substitutes in general, see the [useful objects](/user-guide/useful-objects.md) user guide.

The `Messaging::Write` class includes a substitute that allows for the inspection of messages written after the writer has been invoked. In this case the message writer substitute is a _diagnostic substitute_.

The writer substitute records the writes that have been actuated, and does not write messages to the message store database. Said otherwise, the substitute has no durable I/O side effects. As such, it's an _inert_ substitute.

<div class="note custom-block">
  <p>
    Note: The meaning of "substitute" in this context refers to <a href="https://en.wikipedia.org/wiki/Liskov_substitution_principle">Liskov Substitution Principle</a>, which describes the quality of polymorphism in object-oriented systems as objects that can legitimately replace, or <em>substitute</em>, each other without changing the correctness or intention of the program that uses the substitute. From the standpoint of their shared interface, substitutes are not considered either more "real" or less real than other substitutes of the same interface. In this, all substitutes are <em>real</em>, and no substitute is considered <em>secondary</em>.
  </p>
</div>

## Example

``` ruby
class SomeHandler
  dependency :write, Messaging::Postgres::Write

  # ...

  handle SomeMessage do |some_message|
    other_message = OtherMessage.follow(some_message)

    write.(other_message, stream_name)
  end
end

handler = SomeHandler.new

handler.write.class
# =>  Messaging::Write::Substitute

# The result of handling some_message is that
# another message will be written
handler.(some_message)

# Since the handler writes a message, the writer
# substitute will respond in the affirmative
# to a query of whether the message was written
handler.write.written? { |message| message.instance_of? SomeMessage }
# => true
```

## Writer Substitute Facts

- The writer substitute does not write messages to the message store database
- Each write is recored as _telemetry_ that is kept in memory for the lifetime of the writer object
- The substitute offers convenience methods for inspecting the telemetry recorded for each write
- Telemetry is recorded for all invocations of the writer, including the `initial` and `reply` methods
- By default, a writer declared with the `dependency` macro will be initialized to the writer's substitute.

## Messaging::Write::Substitute::Write Class

The `Substitute` class is a concrete class from the [`Messaging` library](../libraries.md#messaging-postgres) in the `Messaging::Write` namespace.

The `Messaging::Write::Substitute` class provides the following:

- Inert implementations of the writer's instance actuator method, as well as the `initial` and the `reply` methods.
- A telemetry recorder with an active telemetry sink that records telemetry recorded by invocations of the writer's methods
- A telemetry data structure for recording each individual invocation of the writer

## Determine If a Message Was Written

``` ruby
written?(message=nil, blk)
```

**Returns**

`true` if the arguments match any messages written and recorded as telemetry.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| message | A message that may have been written | Messaging::Message |
| blk | A block into which each telemetry record is passed, and returns true for the first record for which block is not false | Proc |

**Block Parameters**

The following parameters are passed to the `blk` if `blk` is passed and thus evaluated:

| Name | Description | Type |
| --- | --- | --- |
| message | A message that may have been written | Messaging::Message |
| stream_name | The stream name passed to the invocation of the writer | String |
| expected_version | Expected version passed to the invocation of the writer | Integer |
| reply_stream_name | Name of the reply stream passed to the invocation of the writer | String |

**Permutations**

If both the `message` and `blk` arguments are omitted, then `true` is returned if there is any record of a write.

If the `message` argument is passed and the `blk` argument is omitted, then `true` is returned if any recorded message equals the value of the `message` argument. Equality is tested using the `==` equality operator.

If the `message` argument is omitted, the block is evaluated for each telemetry data recorded, and `true` is returned if the block evaluates to `true` for any recorded telemetry data.

If both the `message` argument _and_ the `blk` argument are passed, then both have to evaluate to `true` for `true` to be returned. H

In this final case, the message is not passed to the block. Only the `stream_name`, `expected_version`, and `reply_stream_name` are passed to the block, and the message equality is tested using the `==` equality operator.

**Examples**

``` ruby
message = SomeMessage.new
stream_name = 'someStream-123'

write.(message, stream_name, expected_version: -1, reply_stream_name: 'someReplyStream')

write.written?(message)
# => true

write.written? { |message| message == some_message }
# => true

write.written? do |message, stream_name|
  message.class == SomeMessage &&
    stream_name == 'someStream-123'
end
# => true

write.written? do |message, stream_name, expected_version, reply_stream_name|
  message.class == SomeMessage &&
    stream_name == 'someStream-123' &&
    expected_version == -1 &&
    reply_stream_name == 'someReplyStream'
end
# => true

write.written?(message) { |stream_name| stream_name == 'someStream-123' }
# => true
```

## Query the Messages Written

``` ruby
message_writes(blk)
```

**Returns**

Array containing the messages written or messages for which the given block returns `true`.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| blk | A block into which each telemetry record is passed and evaluated for inclusion in the result | Proc |

**Block Parameters**

The following parameters are passed to the `blk` if `blk` is passed and thus evaluated:

| Name | Description | Type |
| --- | --- | --- |
| message | A message that may have been written | Messaging::Message |
| stream_name | The stream name passed to the invocation of the writer | String |
| expected_version | Expected version passed to the invocation of the writer | Integer |
| reply_stream_name | Name of the reply stream passed to the invocation of the writer | String |

**Permutations**

If the `blk` argument is omitted, all of the messages recorded are returned.

If `blk` argument is passed, the block is evaluated for each telemetry data recorded, and the messages that match are returned.

**Examples**

``` ruby
message = SomeMessage.new
stream_name = 'someStream-123'

write.(message, stream_name, expected_version: -1, reply_stream_name: 'someReplyStream')

write.writes
# => [ <Telemetry::Sink::Record> ]

write.writes { |message| message == some_message }
# => [ <Telemetry::Sink::Record> ]
```

## Query One Message Written

``` ruby
one_message_write(blk)
```

**Returns**

The message written or the message for which the given block returns `true`.

::: danger
`Messaging::Write::Substitute::Write::Error` is raised if more than one message is found.
:::

**Alias**

`one_message`

<div class="note custom-block">
  <p>
    Note: Works exactly as does the <code>message_writes</code> method with the exception of raising an error if more than one record is found.
  </p>
</div>

**Example**

``` ruby
message = SomeMessage.new
other_message = SomeMessage.new

stream_name = 'someStream-123'

write.([message, other_message], stream_name, expected_version: -1, reply_stream_name: 'someReplyStream')

write.one_message
# => Messaging::Write::Substitute::Write::Error

write.one_message { |message| message.class == SomeMessage }
# => Messaging::Write::Substitute::Write::Error
```

## Query the Telemetry Records of Writes

``` ruby
writes(blk)
```

**Returns**

Array containing the telemetry records for which the given block returns `true`.

<div class="note custom-block">
  <p>
    Note: Same functionality and interface as the <code>message_writes</code> method, except returns telemetry records instead of messages.
  </p>
</div>

## Telemetry

The writer records telemetry for each invocation of the writer.

<div class="note custom-block">
  <p>
    Note: Telemetry is implemented using the Telemetry library. For background on how the Telemetry library works and how to use it, see: <a href="https://github.com/eventide-project/telemetry">https://github.com/eventide-project/telemetry</a>.
  </p>
</div>

Two different kinds of telemetry signals are recorded, depending on which invocation of the writer was used:

- `:written`
- `:replied`

The raw telemetry records can be accessed directly through the substitute writer's interface:

``` ruby
# Records of the invocation of the writer's actuator
writer.sink.written_records

# Records of the invocation of the writer's `reply` method
writer.sink.replied_records
```

For each write recorded, an instance of the `Messaging::Write::Telemetry::Data` struct is created and assigned to the telemetry record's `data` attribute.

The `Messaging::Write::Telemetry::Data` struct has the following attributes:

- `message`
- `stream_name`
- `expected_version`
- `reply_stream name`

The recorded data can be accessed directly:

``` ruby
writer.sink.written_records[i].message
writer.sink.written_records[i].stream_name
writer.sink.written_records[i].expected_version
writer.sink.written_records[i].reply_stream name
```

## Causing the Expected Version Error to be Raised

``` ruby
raise_expected_version_error()
```

Causes `MessageStore::ExpectedVersion::Error` to be raised upon the next invocation of the writer.

## Determine If a Message Was Replied To

``` ruby
replied?(message=nil, blk)
```

<div class="note custom-block">
  <p>
    Note: Same functionality and interface as the <code>written?</code>method, except for replies.
  </p>
</div>

## Query the Messages Replies

``` ruby
message_replies(blk)
```

<div class="note custom-block">
  <p>
    Note: Same functionality and interface as the <code>message_writes</code> method, except for replies.
  </p>
</div>

## Query One Reply Message

``` ruby
one_message_reply(blk)
```

**Alias**

`one_reply`

<div class="note custom-block">
  <p>
    Note: Same functionality and interface as the <code>one_message_write</code> method, except for replies.
  </p>
</div>

## Query the Telemetry Records of Replies

``` ruby
replies(blk)
```

<div class="note custom-block">
  <p>
    Note: Same functionality and interface as the <code>writes</code> method, except for replies.
  </p>
</div>

## Constructing a Writer Substitute

The writer substitute can be constructed in one of two ways:

- Via the constructor
- Via the `dependency` macro

### Via the Constructor

``` ruby
Messaging::Write::Substitute.build()
```

**Returns**

Instance of Messaging::Write::Substitute::Write class.

### Via the `dependency` Macro

``` ruby
dependency :write, Messaging::Postgres::Write
```

A writer declared with the `dependency` macro will be initialized to the writer's substitute.

``` ruby
class SomeHandler
  dependency :write, Messaging::Postgres::Write

  # ...
end

handler = SomeHandler.new

handler.write.class
# =>  Messaging::Write::Substitute
```

::: tip
See the [useful objects](./useful-objects.md) user guide for background on using dependencies and their substitutes.
:::
