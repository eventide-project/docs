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
- There are two separate implementations of the `Get` class that are specialized for retrieving from either streams or categories: `Get::Stream` and `Get::Category`
- A `Get` can be configured with an existing [session](./session.md), or it can create a new session
- A `Get` instance's batch size is configurable
- A `Get` instance's starting position is configurable
- `Get` can be configured with a `correlation` that filters the messages retrieved based on a the value of a message matadata's correlation stream attribute
- `Get` can be configured with consumer group parameters for partitioning message streams for parallel processing based on a consistent hash of the stream name (category retrieval only)
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
self.call(stream_name, position: 0, batch_size: 1000, correlation: nil, consumer_group_member: nil, consumer_group_size: nil, condition: nil, session: nil)
```

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

### Instance Actuator

``` ruby
call(position)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| position | Position of the message to start retrieving from | Integer |

## Pub/Sub and Retrieving Correlated Messages

The principle use of the `correlation` parameter is to implement Pub/Sub.

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

<div class="note custom-block">
  <p>
    Note that value of the <code>correlation</code> argument must be a category and not a full stream name. If a the value is set to a stream name, an error will be raised and the consumer will terminate.
  </p>
</div>

For more details on pub/sub using the correlation stream, see the [pub/sub topic in the consumers user guide](../consumers.html#correlation-and-pub-sub).

## Consumer Groups

Consumers processing a single category can be operated in parallel in a _consumer group_. Consumer groups provide a means of scaling horizontally to distribute the processing load of a single stream amongst a number of consumers.

Consumers operating in consumer groups process a single category, with each consumer in the group processing messages that are not processed by any other consumer in the group.

::: warning
Consumer groups work only with the retrieval of messages from a category. An error will occur if consumer group parameters are sent with a retrieval of a stream rather than a category.
:::

Specify both the `consumer_group_member` argument and the `consumer_group_size` argument to retrieve a batch of messages for a specific member of a user group. The `consumer_group_size` argument specifies the total number of consumers participating in the group. The `consumer_group_member` argument specifies the unique ordinal ID of a consumer. A consumer group with three members will have a `group_size` of 3, and will have members with `group_member` numbers `0`, `1`, and `2`.

``` sql
SELECT * FROM get_category_messages('otherComponent', consumer_group_member => 0, consumer_group_size => 3);
```

Consumer groups ensure that any given stream is processed by a single consumer. The consumer that processes a stream is always the same consumer. This is achieved by the _consistent hashing_ of a message's stream name.

A stream name is hashed to a 64-bit integer, and the modulo of that number by the consumer group size yields a consumer group member number that will consistently process that stream name.

Specifying values for the `consumer_group_size` and `consumer_group_member` consumer causes the query for messages to include a condition that is based on the hash of the stream name, the modulo of the group size, and the consumer member number.

``` sql
WHERE @hash_64(stream_name) % {group_size} = {group_member}
```

## Filtering Messages with a SQL Condition

The `condition` parameter receives an arbitrary SQL condition which further filters the messages retrieved.

```ruby
Get.('someStream-123', condition: 'extract(month from messages.time) = extract(month from now())')
```

<div class="note custom-block">
  <p>
    Note: The SQL condition feature is deactivated by default. The feature is activated using the <code>message_store.sql_condition</code> Postgres configuration option: <code>message_store.sql_condition=on</code>. Using the feature without activating the configuration option will result in an error.
  </p>
</div>

::: danger
Activating the SQL condition feature may expose the message store to unforeseen security risks. Before activating this condition, be certain that access to the message store is appropriately protected.
:::

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
