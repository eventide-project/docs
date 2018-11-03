# Message Writer

The message writer writes instances of [message objects](/user-guide/messages-and-message-data/messages.md) to the [message store](/user-guide/message-store). It converts them to the more raw, low level [message data](/user-guide/messages-and-message-data/message-data.md) form which can then be converted to JSON and stored in the database.

## Example

``` ruby
deposited = Deposited.build(some_deposit_data)

stream_name = "account-123"

Messaging::Postgres::Write.(deposited, stream_name)
```

## Writer Facts

- The message writer can write one message or a batch of messages
- A write is always made to a single stream
- The writer can operate in a diagnostic mode, which records the messages written to it in-memory for later inspection
- A writer can protect writes against concurrency using its `expected_version` argument
- Coordination of workflows between streams can be effected using the writer's facility for replies and replying
- Actuating a writer can be done either from its class interface or its instance interface
- The writer provides a [diagnostic substitute](./substitute.md) that records data about the write operations actuated

## Messaging::Postgres::Write Class

The `Write` class is a concrete class from the [`Messaging::Postgres` library](../libraries.md#messaging-postgres) and namespace.

The `Messaging::Postgres::Write` class provides:

- Actuator methods for both the class and instance interface that write messages to the specified stream
- The `initial` method that writes a message and assures that the message written is the first message in a stream
- The `reply` method that is a shortcut for writing a reply message to the reply stream name registered in the message's metadata
- A [substitute implementation](./substitute.md) of a write than can be used in diagnostic contexts, such as testing.

## Writing a Message

``` ruby
call(message, stream_name, expected_version: nil, reply_stream_name: nil)
```

**Returns**

Position of the message written.

**Alias**

`write`

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| message | The message to be written | Messaging::Message or Array |
| stream_name | The stream name to write the message to | String |
| expected_version | Expected version of the stream at the time of the write | Integer |
| reply_stream_name | Name of stream that the receiver uses to reply to the message | String |

The writer is a _callable object_. It's actuated using the `.()` convention.

``` ruby
write.(some_message, some_stream)
```

Conversely, the writer can be actuated by directly invoking the `call` method. It can also be actuated via the `write` alias, although this option is rarely exercised in practice.

<div class="note custom-block">
  <p>
    Note: Streams only come into existence when messages are written to them. There's no need to create a stream before using it. A stream is created implicitly by an event having been written to it.
  </p>
</div>

## Assuring an Initial Write

``` ruby
initial(message, stream_name)
```

**Returns**

Position of the message written.

**Alias**

`write_initial`

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| message | The initial message to be written | Messaging::Message |
| stream_name | The stream name to write the initial message to | String |

Writing an event with the `initial` method is a shortcut for writing a message with the value of the `expected_version` argument set to `-1`.

``` ruby
write.initial(some_message, some_stream)
# Is equivalent to
write.(some_message, some_stream, expected_version: -1)
```

The version of a stream that has no events written to it - and thus a stream that doesn't exist yet - it `-1`.

To assure that a message is written in the first position of a stream - position `0` - write the message with an expected version of `-1`.

If there is already any messages in the stream, the stream's version will be a value greater than `-1`. Attempting an initial write of a message into a stream that has messages in it will result in the `MessageStore::ExpectedVersion::Error` being raised.

``` ruby
write = Write.build
write.(some_message, some_stream)
write.initial(some_other_message, some_stream)
# => MessageStore::ExpectedVersion::Error (Wrong expected version: -1 (Stream: some_stream, Stream Version: 0)
```

This pattern is useful for proving uniqueness or for reserving something, for example: a unique username, a seat on a flight, a purchase, or a concert ticket. It's also useful in certain idempotence protection patterns.

## Replying

### The reply_stream_name Parameter

The `reply_stream_name` argument passed to the writer is similar in principle to a _callback_. In this case, it's a _callback address_.

When two (or more) components are coordinating with each other, it's not uncommon for a message to be sent to a component with information about how that component should report back to the first component.

``` ruby
write.(some_message, 'otherServiceStream', reply_stream_name: 'thisServiceStream')
```

In the above example, the "thisServiceStream" is the stream name of the service that the handler is running in. The "otherServiceStream" is the stream name of a service that the message is being "sent" to.

By specifying a `reply_stream_name`, the `some_message` message's [metadata](../messages-and-message-data/metadata.html) will contain the `reply_stream_name` value. That value is used by the other service that receives this message, and may send a reply as part of processing that message.

<div class="note custom-block">
  <p>
    Note: The reply pattern is typically only useful in point-to-point messaging scenarios where <a href="/core-concepts/pub-sub.html">Pub/Sub</a> isn't (or can't) be used, and explicit reply commands are used instead of event subscriptions.
  </p>
</div>

### The `reply` Method

``` ruby
reply(message)
```

**Returns**

Position of the message written.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| message | The message written to the reply stream | Messaging::Message |

A message whose metadata contains a reply stream name can be replied to using the writer's `reply` method.

The message will be written to the stream name contained in the metadata's `reply_stream_name` attribute.

If the reply message metadata's `reply_stream_name` attribute is nil when it is passed to the `reply` method, the `Messaging::Write::Error` is raised.

The reply message metadata's `reply_stream_name` attribute is cleared (set to `nil`) once the reply has been executed.

The `reply` method depends on having maintained the contents of the `reply_stream_name` attribute through all of the steps of a [messaging workflow](/user-guide/messages-and-message-data/messages.html#message-workflows). A messaging workflow is commonly exemplified by the use of `Message.follow(previous_message)` in a handler.

``` ruby
handle Something do |something|
  account, version = store.fetch(something.id, include: :version)

  # Without using follow, the reply_stream_name contained
  # in the something message's metadata will not be carried
  # forward into the some_message message, and the next
  # handler in the workflow will not be able to reply
  some_message = SomeMessage.follow(something)

  # ...

  write.(some_message, some_stream, expected_version: version)
end
```

## Constructing a Writer

Writers can be constructed in one of two ways

- Via the constructor
- Via the initializer

### Via the Constructor

``` ruby
self.build(session: nil)
```

The constructor not only instantiates the writer, but also invokes the writer's `configure` instance method, which constructs the writer's operational dependencies.

``` ruby
writer = Write.build
```

**Returns**

Instance of the `Messaging::Postgres::Write` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| session | An existing [session](./session.md) object to use, rather than allowing the writer to create a new session | MessageStore::Postgres::Session |

<div class="note custom-block">
  <p>
    Note: If the <code>session</code> argument is nil, a new session will be constructed and assigned to the writer.
  </p>
</div>

### Via the Initializer

``` ruby
self.initialize()
```

**Returns**

Instance of the `Messaging::Postgres::Write` class.

By constructing a writer using the initializer, the writer's dependencies are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](/user-guide/useful-objects.md#substitutes) user guide for background on inert substitutes.
:::

## Assigning a Writer as a Dependency

``` ruby
self.configure(receiver, attr_name: :write, session: nil)
```

Constructs an instance of the writer and assigns it to the receiver's `write` attribute. By default, the receiving attribute's name is expected to be `write`, but it can be altered with the use of the `attr_name` parameter.

``` ruby
something = Something.new
Messaging::Postgres::Write.configure(something)

something.write
# => #<Messaging::Postgres::Write:0x...>
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| receiver | The object that will receive the constructed writer | Object |
| attr_name | The receiver's attribute that will be assigned the constructed writer | Symbol |
| session | An existing [session](./session.md) object to use, rather than allowing the writer to create a new session | MessageStore::Postgres::Session |

::: tip
See the [useful objects](/user-guide/useful-objects.md#configuring-dependencies) user guide for background on configuring dependencies.
:::

## Log Tags

The following tags are applied to log messages written by a message writer:

| Tag | Description |
| --- | --- |
| write | Applied to all log messages written by a message writer |
| messaging | Applied to all log messages written inside the `Messaging` namespace |

The following tags _may_ be applied to log messages logged by a message writer:

| Tag | Description |
| --- | --- |
| message | Applied to log messages that address the handling of a typed message |
| data | Applied to log messages that record the data content of a typed message or a MessageData instance |
| reply | Applied to log messages written by the message writer when replying to a message |

See the [logging](./logging/) user guide for more on log tags.

- - -
**Related**

- [Writing Atomic Batches](./atomic-batches.md)
- [Expected Version and Concurrency](./expected-version.md)
