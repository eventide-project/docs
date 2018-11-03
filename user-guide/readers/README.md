# Readers

The reader is the low-level, fundamental data retrieval mechanism. It reads messages in order from a single message stream or category.

A reader reads raw [message data](./messages-and-message-data/message-data.md). It doesn't convert message data into typed [messages](./messages-and-message-data/messages.md).

<div class="note custom-block">
  <p>
    Note: The reader is rarely directly used in-practice except for certain circumstances where it might be leveraged in a utility script. In most cases, a reader is used indirectly by retrieving an entity from a <a href="./entity-store/">store</a>, or when a <a href="./consumers.html">consumer</a> retrieves and dispatches messages.
  </p>
</div>

## Reader Example

``` ruby{13-15}
account_id = '123'

deposit = Deposit.new()
deposit.deposit_id = '456'
deposit.account_id = account_id
deposit.amount = 11
deposit.time = '2000-01-01T11:11:11.000Z'

command_stream_name = "account:command-#{account_id}"

Messaging::Postgres::Write.(deposit, command_stream_name)

MessageStore::Postgres::Read.(command_stream_name) do |message_data|
  pp message_data.data
end

# => {:account_id=>"123", :deposit_id=>"456", :amount=>11, :time=>"2000-01-01T11:11:11.000Z"}
```

## Reader Facts

- Each message data is passed to the reader's block
- Readers don't return anything
- Readers retrieve messages in batches
- A reader's batch size is configurable
- A reader's starting position is configurable
- A reader reads events in order, and continues to read until the end of the stream
- Readers can be configured with a _condition_ that filters the messages retrieved
- A reader can be configured with an existing [session](./session.md), or it can create a new session

## MessageStore::Postgres::Read Class

The `Read` class is a concrete class from the [`MessageStore::Postgres` library](../libraries.md#message-store-postgres) and namespace.

The `Read` class provides:

- The principle instance actuator `.()` (or the `call` instance method) for starting a reader
- The class actuator `.()` (or the class `call` method) that provides a convenient invocation shortcut that does not require instantiating the reader class first

## Reading a Stream

A reader can be actuated either via its class interface, as a matter of convenience, or via its instance interface, which allows for greater control of the configuration of the reader.

Readers are implemented as _callable objects_. Actuating them is simply a matter of invoking their `call` method.

### Class Actuator

``` ruby
self.call(stream_name, position: 0, batch_size: 1000, session: nil, &action)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream that the reader will read | String |
| position | Position of the message to start reading from | Integer |
| batch_size | Number of messages to retrieve with each query to the message store | Integer |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |
| action | Block to be evaluated for each message read | Callable |

### Instance Actuator

``` ruby
call(stream_name, &action)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream that the reader will read | String |
| action | Block to be evaluated for each message read | Callable |

## Read Loop

### One Message per Loop

The `action` passed to the reader's actuator is processed once per message read, irrespective of batch size.

``` ruby
MessageStore::Postgres::Read.(stream_name) do |message_data|
  # Block is evaluated once per message data read
end
```

### Reading in Batches

The reader retrieves messages in batches. The number of messages retrieved in each batch are specified using the reader actuator's `batch_size` parameter.

The `action` passed to the reader's actuator is evaluated once per message read. However, the reader doesn't query messages from the message store every time the black is evaluated.

A reader will retrieve a _batch_ of messages, and then process each of those messages in-sequence by passing each message to the `action` block.

When the reader has completed the processing of a batch of messages, the reader retrieves another batch of messages. When there are no more messages to be processed, ie: when a retrieval of a batch yields no new results, the reader terminates.

### Terminating a Reader

A reader will terminate under two conditions:

1. There are no more messages to be retrieved from the message store
1. A `break` statement is issued from within the `action` block passed to the reader

``` ruby
MessageStore::Postgres::Read.(stream_name) do |message_data|
  break # The reading will stop here
end
```

## Constructing a Reader

Readers can be constructed in one of two ways:

- Via the constructor
- Via the initializer

### Via the Constructor

The constructor not only instantiates the reader, but also invokes the reader's `configure` instance method, which constructs the reader's operational dependencies.

``` ruby
self.build(stream_name, position: 0, batch_size: 1000, session: nil)
```

**Returns**

Instance of the MessageStore::Postgres::Read class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream that the reader will read | String |
| position | Position of the message to start reading from | Integer |
| batch_size | Number of messages to retrieve with each query to the message store | Integer |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

### Via the Initializer

``` ruby
self.initialize(stream_name, position, batch_size)
```

**Returns**

Instance of the MessageStore::Postgres::Read class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | Name of stream that the reader will read | String |
| position | Position of the message to start reading from | Integer |
| batch_size | Number of messages to retrieve with each query to the message store | Integer |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

By constructing a reader using the initializer, the reader's dependencies are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](./useful-objects.md#substitutes) user guide for background on inert substitutes.
:::

## Assigning a Reader as a Dependency

``` ruby
self.configure(receiver, stream_name, attr_name: :read, position: 0, batch_size: 1000, session: nil)
```

Constructs an instance of the reader and assigns it to the receiver's `read` attribute. By default, the receiving attribute's name is expected to be `read`, but it can be altered with the use of the `attr_name` parameter.

``` ruby
something = Something.new
Messaging::Postgres::Read.configure(something)

something.write
# => #<Messaging::Postgres::Read:0x...>
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| receiver | The object that will receive the constructed reader | Object |
| attr_name | The receiver's attribute that will be assigned the constructed reader | Symbol |
| stream_name | Name of stream that the reader will read | String |
| position | Position of the message to start reading from | Integer |
| batch_size | Number of messages to retrieve with each query to the message store | Integer |
| session | An existing [session](./session.md) object to use, rather than allowing the reader to create a new session | MessageStore::Postgres::Session |

::: tip
See the [useful objects](/user-guide/useful-objects.md#configuring-dependencies) user guide for background on configuring dependencies.
:::
