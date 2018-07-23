---
sidebar: auto
sidebarDepth: 0
---

<!--
Retry

Got Result
  No delay
  No timeout
Got No Result
  Delayed
  Timed out

Delay time is maximum of cycle time

Maximum - Elapsed = delay-to-next-cycle

Timeout is total amount of time after no results

When no result returned,..

-->




# Consumers

A consumer continuously reads messages from a stream and _dispatches_ them to its handlers. It keeps track of the progress that it has made through the stream that it has reading, allowing a consumer to pick up where it left off after it has been restarted.

When a consumer has read through its stream's messages, it continues reading, waiting for new messages to arrive.

In traditional messaging terminology, a consumer acts as a _subscriber_.

## Example Consumer Class

``` ruby
class Consumer
  include Consumer::Postgres

  handler SomeHandler
  handler SomeOtherHandler
end
```

## Consumer Facts

- A consumer reads from a single stream
- A consumer has one or more handlers
- Messages are dispatched to a consumer's handlers in the order that they are declared
- The consumer periodically records it's reader's position to the message store

### TODO Facts about timeouts, cycles, etc

## Consumer::Postgres Module

A class becomes a consumer by including the `Consumer::Postgres` module from the [`Consumer::Postgres` library](./libraries.md#consumer-postgres) and namespace.

The `Messaging::Handle` affords the receiver with:

- The `handle` class macro used for defining handler blocks
- The `handle` instance message used for [handling raw message data](#handling-raw-message-data)
- Infrastructure for registering messages that are handled, and the dispatching logic used to handle messages and message data


## Starting a Consumer

    def start(stream_name, **arguments, &probe)
      instance = build stream_name, **arguments
      instance.start(&probe)
    end


A consume is started by passing it a stream name that it will read messages from.

``` ruby
SomeConsumer.start('someStream')
```

## Consumer Attributes

### TODO


      attr_accessor :cycle_maximum_milliseconds
      attr_accessor :cycle_timeout_milliseconds


## Listing/Declaring Handlers

### TODO

## Build a Consumer

``` ruby
build(stream_name, batch_size: nil, position_store: nil, position_update_interval: nil, session: nil, cycle_timeout_milliseconds: nil, cycle_maximum_milliseconds: nil, **arguments)
```


### TODO

## Dispatching a Message

A consumer's reader retrieves raw [MessagingStore::MessageData](./messages-and-message-data/message-data.md) and dispatches each message data to each of its handlers by passing the message data to the consumer's actuator.

``` ruby
consumer = SomeConsumer.build('someStream')
message_data = # ... get message data from the consumer's reader
consumer.(message_data)
```

In practice, it's not necessary for the user to interact with the consumer on this level. It's typically only necessary to start a consumer.


- - -


Consumers are the element that feeds messages into a component at runtime.

A consumer continually reads messages from a single stream and dispatches them to one or more handlers.

Many consumers can be hosted together in a single service, allowing a component to be fed messages from many streams.

In addition, consumers keep track of its reader's progress through a stream, and controls polling rates, and pre-fetching batches of messages, and the dispatching of messages to handlers.

 Example Consumer Class

``` ruby
class Consumer
  include Consumer::Postgres

  handler SomeHandler
  handler SomeOtherHandler
end
```



- - -
- whole consumer processes one message at a time


<!--
class SomeConsumer
  def error_raised(error, message_data)
    case error
    when MessageStore::ExpectedVersion::Error
      sleep 1000 * 0.1
      self.(message_data)
    else
      raise error
    end
  end
end
-->
