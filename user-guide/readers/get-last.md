# Get::Last

The `MessageStore::Postgres::Get::Last` class is a specialized reader that retrieves only the last message in a stream.

It's a utility that is useful in circumstances where sequence number-based idempotence is employed without the use of an [entity store](/user-guide/entity-store/) or an [entity projection](/user-guide/projection.md).

## Get::Last Example

``` ruby
deposit_1 = Deposited.new()
deposit_1.deposit_id = '456'

deposit_2 = Deposited.new()
deposit_2.deposit_id = '789'

stream_name = 'account'

Messaging::Postgres::Write.(deposit_1, stream_name)
Messaging::Postgres::Write.(deposit_2, stream_name)

last_message = MessageStore::Postgres::Get::Last.(stream_name)

last_message.deposit_id
# => "789"
```

## Get::Last Facts

- The `Get::Last` class returns a single [message data](/user-guide/messages-and-message-data/message-data.md) instance representing the last message in the specified stream
- A `Get::Last` can be configured with an existing [session](./session.md), or it can create a new session

## MessageStore::Postgres::Get::Last Class

The `Get::Last` class is a concrete class from the [`MessageStore::Postgres` library](../libraries.md#message-store-postgres) and namespace.

The `Get::Last` class provides:

- The principle instance actuator `.()` (or the `call` instance method) for starting a reader
- The class actuator `.()` (or the class `call` method) that provides a convenient invocation shortcut that does not require instantiating the reader class first

## Getting the Last Message in a Stream

A `Get::Last` can be actuated either via its class interface, as a matter of convenience, or via its instance interface, which allows for greater control of the configuration of the instance.

`Get::Last` is implemented as a _callable object_. Actuating it is simply a matter of invoking its `call` method.

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

## Constructing a Get::Last

The `Get::Last` class can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

The constructor not only instantiates the `Get::Last`, but also invokes the its `configure` instance method, which constructs its operational dependencies.

``` ruby
self.build(session: nil)
```

**Returns**

Instance of the MessageStore::Postgres::Get::Last class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

### Via the Initializer

``` ruby
self.initialize()
```

**Returns**

Instance of the MessageStore::Postgres::Get::Last class.

## Assigning Get::Last as a Dependency

``` ruby
self.configure(receiver, session: nil, attr_name: :get_last)
```

Constructs an instance of the `Get::Last` and assigns it to the receiver's `get_last` attribute. By default, the receiving attribute's name is expected to be `get_last`, but it can be altered with the use of the `attr_name` parameter.

``` ruby
something = Something.new
Messaging::Postgres::Get::Last.configure(something)

something.get_last
# => #<Messaging::Postgres::Get::Last:0x...>
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| receiver | The object that will receive the constructed `Get::Last` | Object |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |
| attr_name | The receiver's attribute that will be assigned the constructed `Get::Last` | Symbol |

::: tip
See the [useful objects](/user-guide/useful-objects.md#configuring-dependencies) user guide for background on configuring dependencies.
:::
