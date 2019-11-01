# Batch Retrieval

The `MessageStore::Postgres::Get` class is a utility that retrieves a single batch of messages from a stream.

The `Get` class behaves similarly to a [reader](./), except that it doesn't continue to reader a stream. It retrieves a single batch and terminates.

The reader uses the `Get` class to retrieve messages. While it's mostly intended for internal use, it an be useful when building tools or any time that directly retrieving a batch of messages is necessary.

## Example

``` ruby
deposit_1 = Deposited.new()
deposit_1.deposit_id = '456'

deposit_2 = Deposited.new()
deposit_2.deposit_id = '789'

stream_name = 'account-123'

Messaging::Postgres::Write.(deposit_1, stream_name)
Messaging::Postgres::Write.(deposit_2, stream_name)

messages = MessageStore::Postgres::Get.(stream_name)

messages.length
# => 2

messages[0].deposit_id
# => 456

messages[0].deposit_id
# => 786
```

## MessageStore::Postgres::Get Facts

- The `Get` class returns a single batch of [message data](/user-guide/messages-and-message-data/message-data.md)
- The `Get` class can retrieve either from streams or categories
- A `Get` can be configured with an existing [session](./session.md), or it can create a new session
- A `Get` instance's batch size is configurable
- A `Get` instance's starting position is configurable
- `Get` can be configured with a `correlation` that filters the messages retrieved based on a the value of a message matadata's correlation stream attribute
- `Get` can be configured with a `condition` that filters the messages retrieved based on a SQL condition
- A `Get` instance can be configured with an existing [session](./session.md), or it can create a new session

## MessageStore::Postgres::Get Class

The `Get` class is a concrete class from the [`MessageStore::Postgres` library](../libraries.md#message-store-postgres) and namespace.

The `Get` class provides:

- The principle instance actuator `.()` (or the `call` instance method) for retrieving message data from the message store
- The class actuator `.()` (or the class `call` method) that provides a convenient invocation shortcut that does not require instantiating the `Get` class first

## Retrieving a Batch

The `Get` class can be actuated either via its class interface, as a matter of convenience, or via its instance interface, which allows for greater control of the configuration of the instance.

The `Get` class is implemented as a _callable object_. Actuating them is simply a matter of invoking their `call` method.

### Class Actuator

``` ruby
self.call(stream_name, position: 0, batch_size: 1000, correlation: nil, condition: nil, session: nil)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream to retrieve message data from | String |
| position | Position of the message to start retrieving from | Integer |
| batch_size | Number of messages to retrieve from the message store | Integer |
| correlation | Category or stream name recorded in message metadata's `correlation_stream_name` attribute to filter the batch by | String |
| condition | SQL condition to filter the batch by | String |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

### Instance Actuator

``` ruby
call(position)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| position | Position of the message to start retrieving from | Integer |

## Retrieving Correlated Messages

The `correlation` parameter filters the retrieved batch based on the content of message metadata's `correlation_stream_name` attribute.

The ultimate purpose of the `correlation_stream_name` attribute is to allow a component to tag a message with its origin. And then later, the originating component can subscribe to other components' events that are tagged with the origin. It's provides a _callback_ mechanism for messaging.

Before the source component sends the message to the receiving component, the source component assigns it's own stream name to the message metadata's `correlation_stream_name` attribute. That attribute is carried from message to message through the process.

``` ruby
destination_stream_name = 'otherComponent-123'

correlation_stream_name = 'thisComponent-789'

command = SomeCommand.new

command.metadata.correlation_stream_name = correlation_stream_name

write.(command, destination_stream_name)
```

To retrieve messages that are correlated to the `otherComponent-123` stream name, the `correlation` parameter is used.

``` ruby
Get.('otherComponent-123', correlation: 'thisComponent-789')
```

In practice, this is almost alway done using categories rather than stream names, as is the case in consumers.

``` ruby
Get.('otherComponent', correlation: 'thisComponent')
```

For more details on pub/sub using the correlation stream, see the [pub/sub topic in the consumers user guide](../consumers.html#correlation-and-pub-sub).

## Filtering Messages with a SQL Condition

The `Get` can be given a SQL condition which further filters the messages retrieved beyond selecting only the messages of the stream being read.

For example, the `Get` can retrieve messages from `someStream-123` whose position is 0.

```ruby
Get.('someStream-123', condition: 'position = 0')
```

The above example isn't a realistic use of this feature. It's a contrived example merely intended to demonstrate the mechanics of use the SQL condition.

## Constructing a Get

The `Get` class can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

The constructor not only instantiates the `Get`, but also invokes the `Get` class's `configure` instance method, which constructs the instance's operational dependencies.

``` ruby
self.build(stream_name, batch_size: 1000, correlation: nil, condition: nil, session: nil)
```

**Returns**

Instance of the `MessageStore::Postgres::Get` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream to retrieve message data from | String |
| batch_size | Number of messages to retrieve from the message store | Integer |
| correlation | Category or stream name recorded in message metadata's `correlation_stream_name` attribute to filter the batch by | String |
| condition | SQL condition to filter the batch by | String |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

### Via the Initializer

``` ruby
self.initialize(stream_name, batch_size, correlation, condition)
```

**Returns**

Instance of the `MessageStore::Postgres::Get` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream to retrieve message data from | String |
| batch_size | Number of messages to retrieve from the message store | Integer |
| correlation | Category or stream name recorded in message metadata's `correlation_stream_name` attribute to filter the batch by | String |
| condition | SQL condition to filter the batch by | String |

By constructing the `Get` instance using the initializer, the instance's dependencies are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](./useful-objects.md#substitutes) user guide for background on inert substitutes.
:::

## Assigning a `Get` as a Dependency

``` ruby
self.configure(receiver, stream_name, attr_name: :get, batch_size: 1000, correlation: nil, condition: nil, session: nil)
```

Constructs an instance of the `Get` class and assigns it to the receiver's `get` attribute. By default, the receiving attribute's name is expected to be `get`, but it can be altered with the use of the `attr_name` parameter.

``` ruby
something = Something.new
Messaging::Postgres::Get.configure(something)

something.get
# => #<Messaging::Postgres::Get:0x...>
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| receiver | The object that will receive the constructed `Get` | Object |
| stream_name | Name of stream to retrieve message data from | String |
| attr_name | The receiver's attribute that will be assigned the constructed `Get` | Symbol |
| batch_size | Number of messages to retrieve from the message store | Integer |
| correlation | Category or stream name recorded in message metadata's `correlation_stream_name` attribute to filter the batch by | String |
| condition | SQL condition to filter the batch by | String |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

::: tip
See the [useful objects](/user-guide/useful-objects.md#configuring-dependencies) user guide for background on configuring dependencies.
:::

## Log Tags

The following tags are applied to log messages recorded by a `Get` instance:

| Tag | Description |
| --- | --- |
| get | Applied to all log messages recorded by a `Get` instance |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

The following tags _may_ be applied to log messages recorded by a `Get` instance:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that record the data content of retrieved message data |
| data | Applied to log messages that record the data content of retrieved message data |

See the [logging](/user-guide/logging/) user guide for more on log tags.
