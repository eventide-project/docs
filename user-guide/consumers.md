---
sidebar: auto
sidebarDepth: 0
---

# Consumers

A consumer continuously reads messages from a single category and dispatches the messages to the handlers that have been added to the consumer.

Many consumers can be hosted together in a single service, allowing a component to be fed messages from many categories.

A consumer keeps track of the progress that it has made through the category stream that it's reading, allowing a consumer to pick up where it left off after it has been restarted.

It controls polling rates, pre-fetching batches of messages, the dispatching of messages to handlers, and the storage of message positions of messages that have already been read.

When a consumer has read through its category's messages, it continues reading, waiting for new messages to arrive.

In messaging parlance, a consumer acts as a _subscriber_.

## Example

``` ruby
class Consumer
  include Consumer::Postgres

  identifier 'someUniqueIdentifier' # Note: This is optional

  handler SomeHandler
  handler SomeOtherHandler
end
```

## Consumer Facts

- A consumer reads from a single [category stream](/glossary.md#category-stream)
- A consumer has one or more handlers
- Messages are dispatched to a consumer's handlers in the order that they are declared
- The consumer periodically records its reader's position to the message store
- Messages are retrieved in batches whose size can be configured
- When there are no messages retrieved the consumer polls the message store
- The polling interval is configurable
- A consumer can be configured with a `correlation` value filters based on messages' correlation stream name
- A consumer can be configured with consumer group parameters for partitioning category streams for parallel processing by multiple consumers based on a consistent hash of the category name
- A consumer can be configured with a `condition` that filters the messages retrieved

## Consumer::Postgres Module

A class becomes a consumer by including the `Consumer::Postgres` module from the [`Consumer::Postgres` library](./libraries.md#consumer-postgres) and namespace.

The `Consumer::Postgres` module affords the receiver with:

- The `start` method for starting a consumer and supplying it with arguments that control its behavior
- The `handler` class macro used for adding handlers to a consumer
- The `identifier` class macro used to declare an arbitrary string suffix used to compose a distinct position stream name used by the [position store](#position-store) to store consumer position records

## Registering a Handler

A handler is registered with the `handler` macro.

``` ruby
handler SomeHandler
```

The argument is a class name of a handler that the consumer will dispatch messages to.

Each handler is added to the consumer class's `handler_registry`.

If a handler is registered more than once, the `Consumer::HandlerRegistry::Error` will be raised when the consumer class is loaded.

## Starting a Consumer

Start a consumer by invoking a consumer class's `start` method, passing the category name that the consumer will read messages from.

``` ruby
SomeConsumer.start('someCateogry')
```

::: warning
An error will be raised and the consumer will terminate if the consumer is started with a stream name rather than a category.
:::

``` ruby
self.start(category, poll_interval_milliseconds: 100, batch_size: 1000, position_update_interval: 100, identifier: nil, correlation: nil, group_member: nil, group_size: nil, condition: nil, settings: nil)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| category | The name of the category that the consumer will read | String |
| poll_interval_milliseconds | The frequency, in milliseconds, with which the consumer polls the message store for new messages | Integer |
| batch_size | The number of messages to retrieve in each batch fetched from the message store | Integer |
| position_update_interval | The frequency with which progress that the consumer has made through the input category is recorded by the [position store](#position-store) | Integer |
| identifier | Qualifier appended to the consumer's position stream name | String |
| correlation | A category name used to restrict the messages consumed to those whose correlation stream is in the specified correlation category (this feature is used to effect pub/sub) | String |
| group_member | The member number of an individual consumer that is participating in a consumer group | Integer |
| group_size | The size of a group of consumers that are cooperatively processing a single category | Integer |
| condition | SQL condition that filters the messages of the category that are read | String |
| settings | Settings that can configure a [session](./session.md) object for the consumer to use, rather than the default settings read from `settings/message_store_postgres.json` | Settings |

### Consumers Must Be Started Within an Active Actor Supervisor

The threading model of actors requires that a consumer be started within an active actor supervisor. If a consumer is started without being under supervision, its reader will not start, and the consumer will not dispatch messages to its handler.

In the vast majority of operational cases, a consumer is started by the [component host](./component-host.md). The component host starts an actor supervisor and manages the individual actors used by the consumers operating in the host.

It can be useful under the right conditions to exercise a consumer directly.

``` ruby
Actor::Supervisor.start do
  Controls::Consumer::Example.start(
    category,
    condition: condition,
    correlation: correlation_cateogry,
    position_update_interval: position_update_interval
  )
end
```

Eventide uses the [ntl-actor](https://github.com/ntl/actor) implementation of the actor model.

<div class="note custom-block">
  <p>
    Note: As an alternative to starting a consumer within an actor supervisor in order to exercise it directly, a `sleep` can be issued immediately after starting a consumer.
  </p>
</div>

## Pub/Sub and Correlation

When using Pub/Sub, a service will use a consumer to subscribe to events from an external service. However, the consumer may not want to process _all_ events published by that external service. It will likely only want to process messages that are returning to the originating service from the external service.

For example, an account component processes all withdrawal and deposit transactions for an entire company. A funds transfer component will send withdrawal and deposit transactions to the account component, and then will want to be notified when these operations have been processed. The funds transfer component will want to process only those accounting transactions that originated from operations sent to the account component from the funds transfer component.

Before the funds transfer component sends messages to the account component, it sets the messages' `correlation_stream_name` metadata attribute to the funds transfer's stream name.

The correlation stream name is like a _return address_. It's a way to give the message some information about the component that the message originated from. This information is carried from message to message in a workflow until it ultimately returns to the originating component.

``` ruby{6}
category = 'account'
correlation_cateogry = 'fundsTransfer'

SomeConsumer.start(
  category,
  correlation: correlation_cateogry
)
```

::: warning
The value of the `correlation` argument must be a category and not a full stream name. An error will be raised and the consumer will terminate if the value is set to a stream name.
:::

In order for an event written to an external service's stream to carry the correlation information from the originating service, the outbound message being written to the external service must have its `correlation_stream_name` attribute set to the current service's stream name.

``` ruby{5}
stream_name = 'account-123'
correlation_stream_name = 'fundsTransfer-456'

command = Withdraw.new
command.metadata.correlation_stream_name = correlation_stream_name

write.(command, stream_name)
```

In the external service's [command handler](/user-guide/handlers.md), the resulting event written must preserve the correlation data from message to message.

The [`follow` constructor](/user-guide/messages-and-message-data/messages.md#message-workflows) of messages is the mechanism that preserves message metadata, including the `correlation_stream_name` attribute.

``` ruby{6}
handle Withdraw do |withdraw|
  some_id = withdraw.some_id

  # The follow constructor copies the correlation metadata from
  # the input command to the output event
  withdrawn = Withdrawn.follow(withdraw)

  stream_name = stream_name(some_id)

  write.(withdrawn , stream_name)
end
```

The originating service can now select the events written to this external service's stream based on the correlation data preserved in the events.

Postgres' ability to select events based on the content of specific attributes of the [message metadata](/user-guide/messages-and-message-data/metadata.md) is the underlying mechanism by which this is implemented.

Specifying a value for the `correlation` parameter when starting a consumer causes the consumer's stream reader to filter the consumed stream using Postgres' support for JSON document querying.

```
category(metadata->>'correlationStreamName') = 'fundsTransfer'
```

## Consumer Groups

Consumers processing a single category can be operated in parallel in a _consumer group_. Consumer groups provide a means of scaling horizontally to distribute the processing load of a single category amongst a number of consumers.

Consumers operating in consumer groups process a single category, with each consumer in the group processing messages that are not processed by any other consumer in the group.

::: danger
Consumers operated in consumer groups must be used in conjunction with the `identifier` attribute, or else the individual consumers in a consumer group will overwrite each other's [position records](#position-store).
:::

Specify both the `group_size` argument and the `group_member` argument to enlist a consumer in a consumer group. The `group_size` argument specifies the total number of consumers participating in the group. The `group_member` argument specifies the unique ordinal ID of a consumer. A consumer group with three members will have a `group_size` of 3, and will have members with `group_member` numbers `0`, `1`, and `2`.

``` ruby{6-7}
group_size = 3
group_member = 0

SomeConsumer.start(
  category,
  group_size: group_size,
  group_member: group_member
)
```

::: warning
A consumer that is a member of a group must also have a unique identifier so that each consumer in a group will write the consumer's position to and read from distinct position streams. See the [Position Store](#position-store) topic for more details.
:::

Consumer groups ensure that any given stream is processed by a single consumer, and that the consumer processing the stream is always the same consumer. This is achieved by the _consistent hashing_ of a message's stream name.

A stream name's [cardinal ID](./stream-names/#cardinal-id) is hashed to a 64-bit integer, and the modulo of that number by the consumer group size yields a consumer group member number that will consistently process that stream name.

Specifying values for the `consumer_group_size` and `consumer_group_member` consumer causes the query for messages to include a condition that is based on the hash of the stream's cardinal ID modulo of the group size, and the consumer member number.

``` sql
WHERE @hash_64(cardinal_id(stream_name)) % {group_size} = {group_member}
```

::: warning
Consumer groups should always be used in conjunction with the concurrency protection offered by the message writer. Handler logic should always write messages using the writer's `expected_version` feature, irrespective of the use of consumer groups. However, the use of concurrency protection is even more imperative when using consumer groups. For more on concurrent writes, see the [writers user guide](/user-guide/writers/expected-version.md).
:::

## Filtering Messages with a SQL Condition

Since the consumer reads the given stream using a SQL query, that query can be extended by the `condition` keyword argument. This further filters the messages read by the consumer.

```ruby
SomeConsumer.start('someCategory', condition: 'extract(month from messages.time) = extract(month from now())')
```

::: warning
The SQL condition feature is deactivated by default. The feature is activated using the `message_store.sql_condition` Postgres configuration option: `message_store.sql_condition=on`. Using the feature without activating the configuration option will result in an error. See the PostgreSQL documentation for more on configuration options: [https://www.postgresql.org/docs/current/config-setting.html](https://www.postgresql.org/docs/current/config-setting.html)
:::

::: danger
Activating the SQL condition feature may expose the message store to unforeseen security risks. Before activating this condition, be certain that access to the message store is appropriately protected.
:::

::: danger
Usage of this feature should be treated with caution. While this feature _can_ be used to great effect, under certain circumstances, it can also result in messages not being processed, or even processed out of order. Ensure that you fully understand the implications before proceeding.
:::

## Polling

A consumer starts polling the message store for new messages if a fetch of a batch returns no messages.

A consumer's `poll_interval_milliseconds` controls the delay between each fetch issued by the consumer. The default value of the interval is 100 milliseconds.

The fetch is executed once per polling interval rather than executing immediately at the conclusion of the previous cycle.

If the polling interval is `nil`, there is no delay between fetches. The lower the value of the polling interval, the greater the number of attempts to fetch batches from the message store. This value should be carefully tuned to balance the need for low-latency and the need to not flood the message store server with requests.

The polling interval can be used to relieve pressure on the message store server when a stream is not continually saturated with messages waiting to be processed, and the consumer begins polling.

If the fetch execution time is greater than the polling interval time, the fetch is re-executed immediately at the conclusion of the previous fetch.

For more details on polling, see the [`Poll` library](https://github.com/eventide-project/poll)

## Error Handling

Under normal circumstances, errors that are raised in the course of a consumer doing its work should not be caught. The purpose of an error is to signal a fatal, unrecoverable condition.

Such a condition isn't something that can be remediated at runtime, and indicates that something has happened that is so extraordinary and exceptional that it should cause the consumer to crash to the surrounding service, and to stop processing messages until operators and developers have a chance to investigate the condition.

However, there are certain special circumstances where a an error should be intercepted before allowing the error to crash the consumer. For example, when errors are published to an error reporting service, or under certain consumer-wide retry configurations.

To intercept an error, override the `error_raised` method.

``` ruby
class Consumer
  include Consumer::Postgres

  handler SomeHandler
  handler SomeOtherHandler

  def error_raised(error, message_data)
    # Do something with the error
    raise error
  end
end
```

::: danger
The error must be explicitly re-raised in order for the error to be able to crash the service that the consumer is hosted by. Only in the case of a retry should an error not be re-raised. In all other cases, the error must be re-raised or else the consumer will continue to process messages even though an exceptional and unrecoverable condition is in-effect.
:::

The default implementation of the `error_raised` method simply re-raises the error.

Error handling can be specialized by overriding the `error_raised` method.

``` ruby
error_raised(error, message_data)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| error | The instance of the error that has been raised | RuntimeError |
| message_data | The `message_data` that was being processed when the error occurred | MessageStore::MessageData |

## Dispatching Messages

A consumer's reader retrieves raw [MessagingStore::MessageData](./messages-and-message-data/message-data.md) and dispatches each message data to each of its handlers by passing the message data to the consumer's actuator, which then passes the message data object to each handler's actuator.

A consumer's handlers are actuated in the same order in which they're declared.

<div class="note custom-block">
  <p>
    Note: A new instance of a handler class is created for each message dispatched to it.
  </p>
</div>

A consumer can be exercised directly by building it and then passing an instance of `MessagingStore::MessageData` to its actuator.

``` ruby
consumer = SomeConsumer.build('someStream')
consumer.(message_data)
```

In practice, it's not necessary for the user to interact with the consumer on this level.

## Position Store

At an interval specified by the `position_update_interval`, the global position of the message being read by the consumer's read is written to the message store. This allows a consumer to not have to process all of a stream's message each time the consumer is started.

By default, the position is written every 100 messages. The value in controlled using the consumer's `position_update_interval`.

### Position Stream and the Consumer Identifier

::: danger
If two consumers read the same stream, they **must** use distinct consumer identifiers. If not, these consumers will write their position records to the same stream, which will cause these consumers to skip messages that have not been processed.
:::

The consumer writes the position to a stream derived from the name of the stream that a consumer is started with. For example, if a consumer is started with a stream named `account:command`, then the position is recorded in a stream named `account:command+position`.

The name of the position stream can be specialized by specifying a stream name qualifier with the `identifier` macro, or with the `identifier` parameter of the start method.

``` ruby
class Consumer
  include Consumer::Postgres

  identifier 'someUniqueIdentifier'

  handler SomeHandler
end

Consumer.start('account:command')
```

In the above example, the consumer's position stream would be `account:command+position-someUniqueIdentifier`.

Consumers can also be assigned an identifier when they are started. If an identifier macro is also declared on the consumer class, the one given when starting the consumer has precedence over the one declared on the consumer class.

In the following example, the consumer's position stream would be `account:command+position-someOtherIdentifier`.

``` ruby
Consumer.start('account:command', identifier: 'someOtherIdentifier')
```

## Constructing Consumers

In general, it's not necessary to construct a consumer. The general use case of a consumer is to invoke its `start` method.

A consumer can be constructed with its `build` method.

``` ruby
self.build(stream_name, poll_interval_milliseconds: 100, batch_size: 1000, position_update_interval: 100, identifier: nil, condition: nil, settings: nil)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The name of the stream that the consumer will read | String |
| poll_interval_milliseconds | The frequency, in milliseconds, with which the consumer polls the message store for new messages | Integer |
| batch_size | The number of messages to retrieve in each batch fetched from the message store | Integer |
| position_update_interval | The frequency with which progress that the consumer has made through the input stream is recorded by the [position store](#position-store) | Integer |
| identifier | Qualifier appended to the consumer's position stream name | String |
| condition | SQL condition fragment that constrains the messages of the stream that are read | String |
| settings | Settings that can configure a [session](./session.md) object for the consumer to use, rather than the default settings read from `settings/message_store_postgres.json` | Settings |

## Log Tags

The following tags are applied to log messages recorded by a consumer:

| Tag | Description |
| --- | --- |
| consumer | Applied to all log messages recorded by a consumer |

The following tags _may_ be applied to log messages recorded by a consumer:

| Tag | Description |
| --- | --- |
| position_store | Applied to log messages recorded by the consumer's position store |
| get | Applied to log messages recorded while getting an position record from the position store |
| put | Applied to log messages recorded while putting a position record to the position store |

See the [logging](/user-guide/logging/) user guide for more on log tags.
