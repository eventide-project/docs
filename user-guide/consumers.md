---
sidebar: auto
sidebarDepth: 0
---

# Consumers

A consumer continuously reads messages from a single stream and dispatches the messages to the handlers that have been registered to the consumer.

Many consumers can be hosted together in a single service, allowing a component to be fed messages from many streams.

A consumer keeps track of the progress that it has made through the stream that it's reading, allowing a consumer to pick up where it left off after it has been restarted.

It controls polling rates, pre-fetching batches of messages, the dispatching of messages to handlers, and the storage of message positions of messages that have already been read.

When a consumer has read through its stream's messages, it continues reading, waiting for new messages to arrive.

In messaging parlance, a consumer acts as a _subscriber_.

## Example

``` ruby
class Consumer
  include Consumer::Postgres

  identifier 'someConsumer' # Note: This is optional

  handler SomeHandler
  handler SomeOtherHandler
end
```

## Consumer Facts

- A consumer reads from a single stream, usually a [category stream](/glossary.md#category-stream)
- A consumer has one or more handlers
- Messages are dispatched to a consumer's handlers in the order that they are declared
- The consumer periodically records it's reader's position to the message store
- Messages are retrieved in batches whose size can be configured
- When there are no messages retrieved the consumer polls the message store
- The polling interval is configurable

## Consumer::Postgres Module

A class becomes a consumer by including the `Consumer::Postgres` module from the [`Consumer::Postgres` library](./libraries.md#consumer-postgres) and namespace.

The `Consumer::Postgres` module affords the receiver with:

- The `handler` class macro used for adding handlers to a consumer
- The `identifier` class macro used to declare an arbitrary string prefix used to compose the the stream name used by the [position store](#position-store)

## Registering a Handler

A handler is registered with the `handler` macro.

``` ruby
handler SomeHandler
```

The argument is a class name of a handler that the consumer will dispatch messages to.

Each handler is added to the consumer class's `handler_registry`.

If a handler is registered more than once, the `Consumer::HandlerRegistry::Error` will be raised when the consumer class is loaded.

## Starting a Consumer

Start a consumer by invoking a consumer class's `start` method, passing the stream name that the consumer will read messages from.

``` ruby
SomeConsumer.start('someStream')
```

<div class="note custom-block">
  <p>
    Note that for typical uses, the stream that a consumer reads is almost always a category stream.
  </p>
</div>

``` ruby
self.start(stream_name, poll_interval_milliseconds: 100, batch_size: 1000, position_update_interval: 100, identifier: nil, condition: nil, settings: nil)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The name of the stream that the consumer will read | String |
| poll_interval_milliseconds | The frequency, in milliseconds, with which the consumer polls the message store for new messages | Integer |
| batch_size | The number of messages to retrieve in each batch fetched from the message store | Integer |
| position_update_interval | The frequency with which progress that the consumer has made through the input stream is recorded by the [position store](#position-store) | Integer |

| position_update_interval | The frequency with which progress that the consumer has made through the input stream is recorded by the [position store](#position-store) | Integer |

| condition | SQL condition fragment that constrains the messages of the stream that are read |
| settings | Settings that can configure a [session](./session.md) object for the consumer to use, rather than the default settings read from `settings/message_store_postgres.json` | Settings |

## Conditions

Since the consumer reads the given stream using a SQL query, that query can be extended by the `condition` keyword argument. This further constrains the messages read by the consumer beyond selecting only the messages of the stream being consumed. For instance, this allows a consumer to only read messages that correlate to a given category, or only a subset of the streams within a category for parallel processing across multiple consumers.

For example, the consumer can read messages from `someCategory` that correlate to `otherCategory`.

```ruby
SomeConsumer.start('someCategory', condition: "metadata->>'correlationStreamName' like 'otherCategory%'");
```

See the [correlation](/user-guide/messages-and-message-data/metadata.md#message-correlation) section of the [message metadata documentation](/user-guide/messages-and-message-data/metadata.md) for more on correlation.

::: danger
Usage of this feature should be treated with caution. While this feature _can_ be used to create isolated, parallel consumers that process the same input stream (or category), the particular technique chosen to do so can result in messages being processed out of order. Ensure that you fully understand the implications of competing consumers, concurrency, and idempotence before proceeding.
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

The consumer writes the position to a stream derived from the name of the stream that a consumer is started with. For example, if a consumer is started with a stream named `account:command`, then the position is recorded in a stream named `account:command+position`.

The name of the position stream can be specialized by specifying a stream name qualifier with the `identifier` macro, or with the `identifier` parameter of the start method.

``` ruby
class Consumer
  include Consumer::Postgres

  identifier 'someConsumer'

  handler SomeHandler
end

Consumer.start('account:command')
```

In the above example, the consumer's position stream would be `account:command+position-someConsumer`.

Consumers can also be assigned an identifier when they are started. If an identifier macro is also declared on the consumer class, the one given when starting the consumer has precedence over the one declared on the consumer class.

In the following example, the consumer's position stream would be `account:command+position-otherIdentifier`.

``` ruby
Consumer.start('account:command', identifier: 'otherIdentifier')
```

## Constructing Consumers

In general, it's not necessary to construct a consumer. The general use case of a consumer is to invoke its `start` method.

A consumer can be constructed with its `build` method.

``` ruby
self.build(stream_name, poll_interval_milliseconds: 100, batch_size: 1000, position_update_interval: 100, condition: nil, settings: nil)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The name of the stream that the consumer will read | String |
| poll_interval_milliseconds | The frequency, in milliseconds, with which the consumer polls the message store for new messages | Integer |
| batch_size | The number of messages to retrieve in each batch fetched from the message store | Integer |
| position_update_interval | The frequency with which progress that the consumer has made through the input stream is recorded by the [position store](#position-store) | Integer |
| condition | SQL condition fragment that constrains the messages of the stream that are read | String |
| settings | Settings that can configure a [session](./session.md) object for the consumer to use, rather than the default settings read from `settings/message_store_postgres.json` | Settings |
