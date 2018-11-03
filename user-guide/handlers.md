---
sidebar: auto
sidebarDepth: 0
---

# Handlers

A handler is the entry point to a service. It receives instructions from other services, apps, and clients in the form of [commands](/glossary.md#command) and [events](/glossary.md#event).

## Example Handler

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

  handle Deposit do |deposit|
    account_id = deposit.account_id

    time = clock.iso8601

    deposited = Deposited.follow(deposit)
    deposited.processed_time = time

    stream_name = stream_name(account_id)

    write.(deposited, stream_name, expected_version: version)
  end
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

The `Messaging::Handle` affords the receiver with:

- The `handle` class macro used for defining handler blocks
- The principle instance actuator `.()` (or the `call` instance method) for handling a single message
- The class actuator `.()` (or the class `call` method) that provides a convenient invocation shortcut that does not require instantiating the handler class first
- The `handle` instance method used for [handling raw message data](#handling-raw-message-data)
- Infrastructure for registering messages that are handled, and the dispatching logic used to handle messages and message data

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

A handler can be actuated either via its class interface, as a matter of convenience, or via its instance interface, which allows for greater control of the configuration of the handler.

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

## Matching Messages to Handlers

When a message is sent to a handler, the handler determines whether there is a handler method that can receive the message.

A handler method is determined to match an inbound message based on the message's class name and the method's name.

A message class named `SomeMessage` is sent to a handler method named `handle_some_message`.

Only the message's class name is taken into considering when matching a message to a handler method. The class's namespace is not significant to matching. For a message class named `Something::Messages::SomeMessage`, only the `SomeMessage` part of the message's class name is significant.

## Handling Raw Message Data

In addition to handling typed messages, handlers can handle `MessageData` instances in their raw form.

See the [Message and MessageData](./message-and-message-data.md#message-data) user guide for more on messages and message data.

The raw form of a message is an instance of `MessageStore::MessageData`.

The object that is sent to a handler from a consumer is an instance of `MessageData`. The handler converts the `MessageData` into its corresponding message instance.

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

## Handler Blocks Return the Input Message

Handler blocks and the `handle` method return the message that is the input to the handler.

When the input is an instance of `Messaging::MessageData`, and there's a typed handler block that handles the `MessageData`'s type, the instance of typed message that the `MessageData` is converted to will be returned.

When handling the raw `MessageData` using the `handle` method, the `MessageData` instance is returned.

## Exiting a Handler Block Using Return

A handler can be exited simply by using a `return` statement.

This is true because the `handle` macro generates a plain old method. Issuing a `return` from within the block is effectively the same as returning from a method.

<div class="note custom-block">
  <p>
    Note: Handler blocks and handler methods are not expected to return any values. Any value that is returned from a handler block or method is disregarded.
  </p>
</div>

## Constructing Handlers

Handlers can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

``` ruby
self.build(strict: false, session: nil)
```

The constructor not only instantiates the handler, but also invokes the handler's `configure` instance method, which constructs the handler's operational dependencies.

``` ruby
some_handler = SomeHandler.build
```

**Returns**

Instance of the class that includes the `Handle` module.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| strict | Strict mode, causes an error when no handler block for the message is implemented | Boolean |
| session | An existing [session](./session.md) object to use, rather than allowing the handler's dependencies to create a new session | Session |

### Via the Initializer

``` ruby
self.initialize()
```

**Returns**

Instance of the class that includes the `Handle` module.

By constructing a handler using the initializer, the handler's dependencies are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](./useful-objects.md#substitutes) user guide for background on inert substitutes.
:::

## Configuring Dependencies

``` ruby
configure(session: nil)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| session | If a session is provided to the handler's constructor, it will be passed to the instance's `configure` method | MessageStore::Postgres::Session |

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

## Messaging::StreamName Module

The `StreamName` module from the [`Messaging` library](./libraries.md#messaging) and namespace provides a couple useful utilities to handler classes. Using this module in a handler is optional.

The feature of the `StreamName` module that is most commonly used in handlers is the `stream_name` method.

The `stream_name` method is used to combine a category name and an [entity](/glossary.md#entity) ID to form a valid and consistent stream name to write a handler block's resulting events to.

The `stream_name` method uses the category name declared using the `category` macro to compose the stream name.

``` ruby
account_id = '123'
stream_name = stream_name(account_id)
# => "account-123"
```

Optionally, a category other than the one declared using the `category` macro can be passed as a second argument.

``` ruby
some_id = '456'
stream_name = stream_name(some_id, :something)
# => "something-123"
```

See the [Messaging::StreamName](./stream-names/messaging-stream-name.md) topic for more.

## Messaging::Category Module

The `Category` module from the [`Messaging` library](./libraries.md#messaging) and namespace provides the `category` class macro to classes that include the module.

The `Category` module is included into any class that includes the Messaging::StreamName module

The `category` macro allows the declaration of the [category](/glossary.md#category) that a handler (or other receiver of the mixin) is principally concerned with.

In the following code taken from the handler example above, `:account` is declared as the category.

``` ruby
category :account
```

The category macro creates an instance accessor that returns the value passed to the macro. This value is used when composing the stream name that messages are typically written to by the handler logic.

See the [Messaging::Category](./stream-names/messaging-category.md) topic for more.

## Log Tags

The following tags are applied to log messages written by a handler:

| Tag | Description |
| --- | --- |
| handle | Applied to all log messages written by a handler |
| messaging | Applied to all log messages written inside the `Messaging` namespace |

The following tags _may_ be applied to log messages logged by a handler:

| Tag | Description |
| --- | --- |
| message_data | Applied to log messages that address the handling of a MessageData instance |
| message | Applied to log messages that address the handling of a typed message |
| data | Applied to log messages that record the data content of a typed message or a MessageData instance |

See the [logging](./logging/) user guide for more on log tags.
