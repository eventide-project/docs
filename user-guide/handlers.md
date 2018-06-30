---
sidebar: auto
sidebarDepth: 0
---

# Handlers

A handler is the entry point to a service. It receives instructions from other services, apps, and clients in the form of [commands](/glossary.md#command) and [events](/glossary.md#event).

## Example Handler Class

``` ruby
class Handler
  include Messaging::Handle
  include Messaging::StreamName

  dependency :write, Messaging::Postgres::Write
  dependency :clock, Clock::UTC
  dependency :store, Store

  def configure
    Messaging::Postgres::Write.configure(self)
    Clock::UTC.configure(self)
    Store.configure(self)
  end

  category :account

  handle Withdraw do |withdraw|
    account_id = withdraw.account_id

    account = store.fetch(account_id)

    time = clock.iso8601

    stream_name = stream_name(account_id)

    unless account.sufficient_funds?(withdraw.amount)
      withdrawal_rejected = WithdrawalRejected.follow(withdraw)
      withdrawal_rejected.time = time

      write.(withdrawal_rejected, stream_name)

      return
    end

    withdrawn = Withdrawn.follow(withdraw)
    withdrawn.processed_time = time

    write.(withdrawn, stream_name)
  end
end

handle Deposit do |deposit|
  account_id = deposit.account_id

  time = clock.iso8601

  deposited = Deposited.follow(deposit)
  deposited.processed_time = time

  stream_name = stream_name(account_id)

  write.(deposited, stream_name, expected_version: version)
end
```

## Handler Facts

- Handler classes can define more than one handler block
- There should only be one handler block per message class (duplicate handler blocks will overwrite each other)
- Handlers may receive message from any number of streams
- The typical result of processing a message is writing another message, usually an [event](/glossary.md#event)

## Typical Handler Workflow

1. Retrieve the entity from the store (which projects the entity's data from its events)
2. Use the entity to determine whether and how to process the message
3. Construct the resulting event that captures the effects of processing the message
4. Assign data to its the resulting event from the input message, the system clock, and possibly other sources depending on the business scenario
4. Write the resulting event

<div class="note custom-block">
  <p>
    Note that some handlers may not need to do all of these things, and some may do more, like interacting with external APIs and gateways.
  </p>
</div>

## Messaging::Handle Module

A class becomes a handler by including the `Handle` module from the [`Messaging` library](./libraries.md#messaging) and namespace.

See [`Messaging::Handle` in the API guide](/api/messaging/handle.md).

## Defining a Handler

### Using the handler Macro

A handler block is defined with the `handle` macro.

``` ruby
handle Withdraw do |withdraw|
  # ...
end
```

The argument is a class name of the message that the handler block will process. The block argument is the instance of the message being processed.

The macro is merely a code generator that generates an instance method. The example above generates an instance method named `handle_withdraw`. The macro is simply an affordance intended to emphasize the code in a handler class that is directly responsible for message processing. The handler block code is used as the implementation of the generated method.

### Using a Plain Old Method

The `handle` macro generates methods with names of the form `handle_{message_class_name_underscore_case}`.

Handlers can be created by directly defining a method following the naming convention.

``` ruby
def handle_withdraw(withdraw)
  # ...
end
```

## Sending a Message to a Handler

There are two ways to send a message to a handler:

- Via a [consumer](./consumers.md)
- Via direct actuation

### Via a Consumer

Registering handlers with consumers is how handlers process messages in live services. The combination of the consumer and the component host infrastructure will route messages from the streams that the consumer reads to the consumer's handlers.

``` ruby
class Consumer
  include Consumer::Postgres

  handler SomeHandler
  handler SomeOtherHandler
end
```

### Direct Actuation

A handler can be actuated directly as an object, passing a message as a parameter. Direct actuation is critical for testing and exercising handlers, as it allows handlers to be exercised as plain old objects.

Handlers can be actuated either via its class interface, as a matter of convenience, or via its instance interface, which allows for greater control of the configuration of the handler.

Handlers are implemented as _callable objects_. Actuating them is simply a matter of invoking their `call` method.

``` ruby
some_message = SomeMessage.new

# Via the class interface
SomeHandler.(some_message)

# Via the object interface
some_handler = SomeHandler.build
some_handler.(some_message)
```

### When a Handler Doesn't Handle a Message

When there isn't a matching handler method for a message, the handler simply ignores the message sent to it.

### Optional Strict Handling

The handler's actuator provides an optional keyword argument named `strict`.

Handling a message when `strict` is set to `true` will require that the handler class implements a handler block for the message class.

With strict set to true, and a message sent to a handler that the handler doesn't handle, an error will be raised.

``` ruby
SomeHandler.(some_unhandled_message, strict: true)
# => SomeHandler does not implement a handler for SomeUnhandledMessage. Cannot handle the message. (Messaging::Handle::Error)
```

This argument is available for both the class actuator and the instance actuator.

## Exiting a Handler Block Using Return

A handler can be exited simply by using a `return` statement.

This is true because the `handle` macro generates a plain old method. Issuing a `return` from within the block is effectively the same as returning from a method.

<div class="note custom-block">
  <p>
    Note: Handler blocks and handler methods are not expected to return any values. Any value that is returned from a handler block or method is disregarded.
  </p>
</div>

## Constructing Handlers

Handlers can be constructed in one of two ways

- Via the initializer
- Via the constructor

### Via the Initializer

``` ruby
some_handler = SomeHandler.new
```

By constructing a handler using the initializer, the handler's [dependencies](./dependencies.md) are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](./useful-objects.md#substitutes) topic for background on inert substitutes.
:::

### Via the Constructor

``` ruby
some_handler = SomeHandler.build
```

The constructor not only instantiates the handler, but also invokes the handler's `configure` instance method, which constructs the handler's operational dependencies.

**Arguments**

``` ruby
build(strict: false, session: nil)
```

| Name | Type | Description | Default |
| --- | --- | --- | --- |
| strict | Named, Optional | Strict mode, causes an error when no handler block for the message is implemented | false |
| session | Named, Optional | An existing [session](./session.md) object to use, rather than allowing the handler to create a new session | nil |

## Configuring Dependencies

If the handler implements an instance method named `configure`, the `build` constructor will invoke it.

The `configure` method provides a specialization mechanism for setting up any handler dependencies, or doing any setup necessary.

``` ruby
dependency :write, Messaging::Postgres::Write
dependency :clock, Clock::UTC
dependency :store, Store

def configure(session: nil)
  Messaging::Postgres::Write.configure(self)
  Clock::UTC.configure(self)
  Store.configure(self, session: session)
end
```

**Arguments**

``` ruby
configure(session: nil)
```

| Name | Type | Description | Default |
| --- | --- | --- | --- |
| session | Named, Optional | If a session is provided to the handler's constructor, it will be passed to the instance's `configure` method | nil |

## Matching Messages to Handlers

When a message is sent to a handler, the handler determines whether there is handler method that can receive the message.

A handler method is determined to match an inbound message based on the message's class name and the method's name.

A message class named `SomeMessage` is sent to a handler method named `handle_some_message`.

Only the message's class name is taken into considering when matching a message to a handler method. The class's namespace is not significant to matching. For a message class named `Something::Messages::SomeMessage`, only the `SomeMessage` part of the message's class name is significant.

## Handling Raw Message Data

The raw form of a message is an instance of `MessageStore::MessageData`.

See the [Message and MessageData](./message-and-message-data.md#message-data) topic for more on messages and message data.

The object that is sent to a handler from a consumer is an instance of `MessageData`. The handler converts the `MessageData` into its corresponding message instance.

In addition to handling typed messages, handlers can handle `MessageData` instances in their raw form.

If a handler implements a method named `handle` _and_ if there's no explicit handler block that specifically matches the `MessageData` object's `type` attribute, then the `MessageData` instance will be passed to the `handle` method.

``` ruby
def handle(message_data)
  case message_data.type
  when 'Withdraw'
    # Handle Withdraw
  when 'Deposit'
    # Handle Deposit
  end
end
```

The `handle` method will not be invoked if there's a handler block that matches the `MessageData`'s `type` attribute.

``` ruby
class Handler
  include Messaging::Handle

  handle Withdraw do |withdraw|
    # ...
  end

  def handle(message_data)
    case message_data.type
    when 'Withdraw'
      # This will never be invoked because the handler block
      # for Withdraw takes precedence
    when 'Deposit'
      # This will be called when the type attribute is 'Deposit'
      # because there's no handler block for Deposit
    end
  end
end
```

### When to Handle Raw Message Data

Because the raw `MessageData` is not transformed into typed messages, handling `MessageData` in its raw form offers a slight performance improvement due to skipping the transformation step.

That said, the performance improvement is negligible. Don't elect to use this option unless squeezing every last drop of performance out of your solution is critical to its success.

## Log Tags

The following tags are applied to log messages logged by a handler:

- `handle`
- `messaging`
- `library`
- `verbose`

The following tags _may_ be applied to log messages logged by a handler:

- `message` (Applied to log messages that address the handling of a typed message)

- `message_data` (Applied to log messages that address the handling of a MessageData instance)

- `data` (Applied to log lines that record the data content of a typed message or a MessageData instance)

See the [logging](./logging.md#tags) topic for more on log tags.
