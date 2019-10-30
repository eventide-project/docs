# Last Message Retrieval

The `MessageStore::Postgres::Get::Stream::Last` class is a utility that retrieves only the last message in a stream.

It's often used to retrieve the last message in a stream in order to get its position number without the use of an [entity store](/user-guide/entity-store/) or an [entity projection](/user-guide/projection.md).

## Example

``` ruby
deposit_1 = Deposited.new()
deposit_1.deposit_id = '456'

deposit_2 = Deposited.new()
deposit_2.deposit_id = '789'

stream_name = 'account-123'

Messaging::Postgres::Write.(deposit_1, stream_name)
Messaging::Postgres::Write.(deposit_2, stream_name)

last_message = MessageStore::Postgres::Get::Stream::Last.(stream_name)

last_message.deposit_id
# => "789"

last_message.metadata.position
# => 1
```

## Get::Stream::Last Facts

- The `Get::Stream::Last` class returns a single [message data](/user-guide/messages-and-message-data/message-data.md) instance representing the last message in the specified stream
- The `Get::Stream::Last` retrieves only from streams, and does not work on categories
- A `Get::Stream::Last` can be configured with an existing [session](./session.md), or it can create a new session

## MessageStore::Postgres::Get::Stream::Last Class

The `Get::Stream::Last` class is a concrete class from the [`MessageStore::Postgres` library](../libraries.md#message-store-postgres) and namespace.

The `Get::Stream::Last` class provides:

- The principle instance actuator `.()` (or the `call` instance method) for starting a reader
- The class actuator `.()` (or the class `call` method) that provides a convenient invocation shortcut that does not require instantiating the reader class first

## Getting the Last Message in a Stream

A `Get::Stream::Last` can be actuated either via its class interface, as a matter of convenience, or via its instance interface, which allows for greater control of the configuration of the instance.

`Get::Stream::Last` is implemented as a _callable object_. Actuating it is simply a matter of invoking its `call` method.

### Class Actuator

``` ruby
self.call(stream_name, session: nil)
```

**Returns**

Instance of `MessageStore::MessageData::Read` representing the last message in the stream, or `nil` if the stream doesn't exist.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream to retrieve the last message from | String |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

### Instance Actuator

``` ruby
call(stream_name)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream that the reader will read | String |

## Constructing a Get::Stream::Last

The `Get::Stream::Last` class can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

The constructor not only instantiates the `Get::Stream::Last`, but also invokes the its `configure` instance method, which constructs its operational dependencies.

``` ruby
self.build(session: nil)
```

**Returns**

Instance of the MessageStore::Postgres::Get::Stream::Last class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

### Via the Initializer

``` ruby
self.initialize()
```

**Returns**

Instance of the MessageStore::Postgres::Get::Stream::Last class.

## Assigning Get::Stream::Last as a Dependency

``` ruby
self.configure(receiver, session: nil, attr_name: :get_last)
```

Constructs an instance of the `Get::Stream::Last` and assigns it to the receiver's `get_last` attribute. By default, the receiving attribute's name is expected to be `get_last`, but it can be altered with the use of the `attr_name` parameter.

``` ruby
something = Something.new
Messaging::Postgres::Get::Stream::Last.configure(something)

something.get_last
# => #<Messaging::Postgres::Get::Stream::Last:0x...>
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| receiver | The object that will receive the constructed `Get::Stream::Last` | Object |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |
| attr_name | The receiver's attribute that will be assigned the constructed `Get::Stream::Last` | Symbol |

::: tip
See the [useful objects](/user-guide/useful-objects.md#configuring-dependencies) user guide for background on configuring dependencies.
:::

## Log Tags

The following tags are applied to log messages recorded by a `Get::Stream::Last`:

| Tag | Description |
| --- | --- |
| get | Applied to all log messages recorded by a `Get::Stream::Last` |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

The following tags _may_ be applied to log messages recorded by a `Get::Stream::Last`:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that record the data content of a MessageData instance |
| data | Applied to log messages that record the data content of a MessageData instance |

See the [logging](/user-guide/logging/) user guide for more on log tags.
