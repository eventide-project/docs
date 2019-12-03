# Batch Retrieval

The `MessageStore::Postgres::Get` class is a utility that retrieves a single batch of messages from a stream.

The `Get` class behaves similarly to a [reader](./), except that it doesn't continue to reader a stream. It retrieves a single batch and terminates.

The reader uses the `Get` class to retrieve messages. While it's mostly intended for internal use, it an be useful when building tools or any time that directly retrieving a batch of messages is necessary.

There are two implementations of the `Get` class: `MessageStore::Postgres::Get::Stream` and `MessageStore::Postgres::Get::Category`. Each implementation is deferred to by `MessageStore::Postgres::Get` to effect the retrieval of batches of messages from streams and categories, respectively.

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
- There are two separate implementations of the `Get` class that are specialized for retrieving from either streams or categories: `Get::Stream` and `Get::Category`
- A `Get` can be configured with an existing [session](./session.md), or it can create a new session
- A `Get` instance's batch size is configurable
- A `Get` instance's starting position is configurable
- `Get` can be configured with a `correlation` that filters the messages retrieved based on a the value of a message matadata's correlation stream attribute
- `Get` can be configured with consumer group parameters for partitioning message streams for parallel processing based on a consistent hash of the stream name (category retrieval only)
- `Get` can be configured with a `condition` that filters the messages retrieved based on a SQL condition
- A `Get` instance can be configured with an existing [session](./session.md), or it can create a new session
- Two concrete classes implement the specific retrieval of batches of messages from streams and categories: `MessageStore::Postgres::Get::Stream` and `MessageStore::Postgres::Get::Category`

## MessageStore::Postgres::Get Module

The `Get` module is an abstract module from the [`MessageStore::Postgres` library](../libraries.md#message-store-postgres) and namespace.

The `Get` module provides:

- The class actuator `.()` (or the class `call` method) that provides a convenient invocation shortcut that does not require instantiating a concrete implementation of the `Get` module.
- An outer namespace and factory for the implementation classes, `MessageStore::Postgres::Get::Stream` and `MessageStore::Postgres::Get::Category`

## Retrieving a Batch

The `Get` module is implemented as a _callable object_. Actuating it is simply a matter of invoking it's `call` method.

The actual retrieval work is done by the implementation classes, `MessageStore::Postgres::Get::Stream` and `MessageStore::Postgres::Get::Category`.

### Class Actuator

``` ruby
self.call(stream_name, position: 0, batch_size: 1000, correlation: nil, consumer_group_member: nil, consumer_group_size: nil, condition: nil, session: nil)
```

**Returns**

Array of [`MessageStore::MessageData::Read`](/user-guide/messages-and-message-data/message-data.html#messagedata-read-class) instances.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream to retrieve message data from | String |
| position | Position of the message to start retrieving from | Integer |
| batch_size | Number of messages to retrieve from the message store | Integer |
| correlation | Category recorded in message metadata's `correlation_stream_name` attribute to filter the batch by | String |
| consumer_group_member | The zero-based member number of an individual consumer that is participating in a consumer group | Integer |
| consumer_group_size | The size of a group of consumers that are cooperatively processing a single category | Integer |
| condition | SQL condition to filter the batch by | String |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

The class actuator both constructs and actuates the implementation of `Get` appropriate to the stream being queried.

### Instance Actuator

The instance actuator of both the `MessageStore::Postgres::Get::Stream` and `MessageStore::Postgres::Get::Category` implementations accept the position to start fetching messages from. The default value of the position varies based on whether the stream name is a stream or a category.

``` ruby
# MessageStore::Postgres::Get::Stream
call(position=0)

# MessageStore::Postgres::Get::Category
call(position=1)
```

**Returns**

Array of [`MessageStore::MessageData::Read`](/user-guide/messages-and-message-data/message-data.html#messagedata-read-class) instances.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| position | Position of the message to start retrieving from | Integer |

## Pub/Sub and Retrieving Correlated Messages

The principle use of the `correlation` parameter is to implement Pub/Sub.

::: warning
Correlation works only with the retrieval of messages from a category. An error will be raised if consumer group parameters are sent with a retrieval of a stream rather than a category.
:::

The `correlation` parameter filters the retrieved batch based on the content of message metadata's `correlation_stream_name` attribute. The correlation stream name is like a _return address_. It's a way to give the message some information about the component where the message originated from. This information is carried from message to message in a workflow until it ultimately returns to the originating component.

The `correlation_stream_name` attribute allows a component to tag an outbound message with its origin. And then later, the originating component can subscribe to other components' events that carry the origin metadata.

Before the source component sends the message to the receiving component, the source component assigns it's own stream name to the message metadata's `correlation_stream_name` attribute. That attribute is carried from message to message through messaging workflows.

``` ruby
destination_stream_name = 'otherComponent-123'

correlation_stream_name = 'thisComponent-789'

command = SomeCommand.new

command.metadata.correlation_stream_name = correlation_stream_name

write.(command, destination_stream_name)
```

To retrieve messages that are correlated to the `thisComponent` category, the `correlation` parameter is used.

``` ruby
Get.('otherComponent-123', correlation: 'thisComponent')
```

::: warning
Note that value of the `correlation` argument must be a category and not a full stream name. An error will be raised if the value is set to a stream name.
:::

For more details on pub/sub using the correlation stream, see the [pub/sub topic in the consumers user guide](../consumers.html#correlation-and-pub-sub).

## Consumer Groups

Consumers processing a single category can be operated in parallel in a [consumer group](/user-guide/consumers.html#consumer-groups). Consumer groups provide a means of scaling horizontally to distribute the processing load of a single category amongst a number of consumers.

::: warning
Consumer groups work only with the retrieval of messages from a category. An error will be raised if consumer group parameters are sent with a retrieval of a stream rather than a category.
:::

Consumers operating in consumer groups process a single category, with each consumer in the group processing messages that are not processed by any other consumer in the group.

Specify both the `consumer_group_member` argument and the `consumer_group_size` argument to retrieve a batch of messages for a specific member of a user group. The `consumer_group_size` argument specifies the total number of consumers participating in the group. The `consumer_group_member` argument specifies the unique ordinal ID of a consumer. A consumer group with three members will have a `group_size` of 3, and will have members with `group_member` numbers `0`, `1`, and `2`.

``` ruby
Get.('someCategory', consumer_group_member => 0, consumer_group_size => 3);
```

Consumer groups ensure that any given stream is processed by a single consumer, and that the consumer processing the stream is always the same consumer. This is achieved by the _consistent hashing_ of a message's stream name.

A stream name's [cardinal ID](./stream-names/#cardinal-id) is hashed to a 64-bit integer, and the modulo of that number by the consumer group size yields a consumer group member number that will consistently process that stream name.

Specifying values for the `consumer_group_size` and `consumer_group_member` consumer causes the query for messages to include a condition that is based on the hash of the stream name, the modulo of the group size, and the consumer member number.

``` sql
WHERE @hash_64(cardinal_id(stream_name)) % {group_size} = {group_member}
```

## Filtering Messages with a SQL Condition

The `condition` parameter receives an arbitrary SQL condition which further filters the messages retrieved.

```ruby
Get.('someStream-123', condition: 'extract(month from messages.time) = extract(month from now())')
```

::: warning
The SQL condition feature is deactivated by default. The feature is activated using the `message_store.sql_condition` Postgres configuration option: `message_store.sql_condition=on`. An error will be raise if the feature is used without activating the configuration option. See the PostgreSQL documentation for more on configuration options: [https://www.postgresql.org/docs/current/config-setting.html](https://www.postgresql.org/docs/current/config-setting.html)
:::

::: danger
Activating the SQL condition feature may expose the message store to unforeseen security risks. Before activating this condition, be certain that access to the message store is appropriately protected.
:::

## Constructing a Get Implementation Using the Abstract Constructor

The two implementations of the `Get` module, `MessageStore::Postgres::Get::Stream` and `MessageStore::Postgres::Get::Category`, can be constructed using the `build` constructor. Depending on whether the value of the `stream_name` argument is a stream or a category, the appropriate implementation will be constructed.

``` ruby
self.build(stream_name, batch_size: 1000, correlation: nil, consumer_group_member: nil, consumer_group_size: nil, condition: nil, session: nil)
```

**Returns**

Instance of the `MessageStore::Postgres::Get::Stream` class if the value of the `stream_name` argument is a stream, or an instance of the `MessageStore::Postgres::Get::Category` class if the value of the `stream_name` argument is a category.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream to retrieve message data from | String |
| batch_size | Number of messages to retrieve from the message store | Integer |
| correlation | Category recorded in message metadata's `correlation_stream_name` attribute to filter the batch by | String |
| consumer_group_member | The zero-based member number of an individual consumer that is participating in a consumer group | Integer |
| consumer_group_size | The size of a group of consumers that are cooperatively processing a single category | Integer |
| condition | SQL condition to filter the batch by | String |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

## Constructing a MessageStore::Postgres::Get::Stream

A `MessageStore::Postgres::Get::Stream` class can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

The constructor not only instantiates the `MessageStore::Postgres::Get::Stream`, but also invokes its `configure` instance method, which constructs the instance's operational dependencies.

``` ruby
self.build(stream_name, batch_size: 1000, condition: nil, session: nil)
```

**Returns**

Instance of the `MessageStore::Postgres::Get::Stream` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream to retrieve message data from | String |
| batch_size | Number of messages to retrieve from the message store | Integer |
| condition | SQL condition to filter the batch by | String |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

### Via the Initializer

``` ruby
self.initialize(stream_name, batch_size, condition)
```

**Returns**

Instance of the `MessageStore::Postgres::Get::Stream` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream to retrieve message data from | String |
| batch_size | Number of messages to retrieve from the message store | Integer |
| condition | SQL condition to filter the batch by | String |

By constructing the `MessageStore::Postgres::Get::Stream` instance using the initializer, the instance's dependencies are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](./useful-objects.md#substitutes) user guide for background on inert substitutes.
:::

## Constructing a MessageStore::Postgres::Get::Category

A `MessageStore::Postgres::Get::Category` class can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

The constructor not only instantiates the `MessageStore::Postgres::Get::Category`, but also invokes its `configure` instance method, which constructs the instance's operational dependencies.

``` ruby
self.build(stream_name, batch_size: 1000, correlation: nil, consumer_group_member: nil, consumer_group_size: nil, condition: nil, session: nil)
```

**Returns**

Instance of the `MessageStore::Postgres::Get::Category` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream to retrieve message data from | String |
| batch_size | Number of messages to retrieve from the message store | Integer |
| correlation | Category recorded in message metadata's `correlation_stream_name` attribute to filter the batch by | String |
| consumer_group_member | The zero-based member number of an individual consumer that is participating in a consumer group | Integer |
| consumer_group_size | The size of a group of consumers that are cooperatively processing a single category | Integer |
| condition | SQL condition to filter the batch by | String |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

### Via the Initializer

``` ruby
self.initialize(category, batch_size, correlation, consumer_group_member, consumer_group_size, condition)
```

**Returns**

Instance of the `MessageStore::Postgres::Get::Category` class.

**Parameters**

| stream_name | Name of stream to retrieve message data from | String |
| batch_size | Number of messages to retrieve from the message store | Integer |
| correlation | Category recorded in message metadata's `correlation_stream_name` attribute to filter the batch by | String |
| consumer_group_member | The zero-based member number of an individual consumer that is participating in a consumer group | Integer |
| consumer_group_size | The size of a group of consumers that are cooperatively processing a single category | Integer |
| condition | SQL condition to filter the batch by | String |

By constructing the `MessageStore::Postgres::Get::Category` instance using the initializer, the instance's dependencies are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](./useful-objects.md#substitutes) user guide for background on inert substitutes.
:::

## Assigning a `Get` Implementation as a Dependency

The two implementations of the `Get` module, `MessageStore::Postgres::Get::Stream` and `MessageStore::Postgres::Get::Category`, can be assigned as a dependency using the `configure` class method. Depending on whether the value of the `stream_name` argument is a stream name or a category, the appropriate implementation will be constructed and assigned to the receiver's `get` attribute. By default, the receiving attribute's name is expected to be `get`, but it can be altered with the use of the `attr_name` parameter.

``` ruby
self.configure(receiver, stream_name, attr_name: :get, batch_size: 1000, correlation: nil, consumer_group_member: nil, consumer_group_size: nil, condition: nil, session: nil)
```

``` ruby
# Stream
stream_name = 'someStream-123'
something = Something.new
Messaging::Postgres::Get.configure(something, stream_name)

something.get
# => #<Messaging::Postgres::Get::Stream:0x...>

# Category
stream_name = 'someStream'
something = Something.new
Messaging::Postgres::Get.configure(something, stream_name)

something.get
# => #<Messaging::Postgres::Get::Category:0x...>
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| receiver | The object that will receive the constructed `Get` | Object |
| stream_name | Name of stream to retrieve message data from | String |
| attr_name | The receiver's attribute that will be assigned the constructed `Get` | Symbol |
| batch_size | Number of messages to retrieve from the message store | Integer |
| correlation | Category recorded in message metadata's `correlation_stream_name` attribute to filter the batch by | String |
| consumer_group_member | The zero-based member number of an individual consumer that is participating in a consumer group | Integer |
| consumer_group_size | The size of a group of consumers that are cooperatively processing a single category | Integer |
| condition | SQL condition to filter the batch by | String |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

::: tip
See the [useful objects](/user-guide/useful-objects.md#configuring-dependencies) user guide for background on configuring dependencies.
:::

## Assigning a `MessageStore::Postgres::Get::Stream` as a Dependency

``` ruby
self.configure(receiver, stream_name, attr_name: :get, batch_size: 1000, condition: nil, session: nil)
```

## Assigning a `MessageStore::Postgres::Get::Category` as a Dependency

``` ruby
self.configure(receiver, stream_name, attr_name: :get, batch_size: 1000, correlation: nil, consumer_group_member: nil, consumer_group_size: nil, condition: nil, session: nil)
```

## Log Tags

The following tags are applied to log messages recorded by a `Get` instance:

| Tag | Description |
| --- | --- |
| get | Applied to all log messages recorded by an instance of a `Get` implementation |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

The following tags _may_ be applied to log messages recorded by a `Get` instance:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that record the data content of retrieved message data |
| data | Applied to log messages that record the data content of retrieved message data |

See the [logging](/user-guide/logging/) user guide for more on log tags.
