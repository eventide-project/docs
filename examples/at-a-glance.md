# Service at a Glance

The example provides a one-page implementation of the various parts of an autonomous, evented service in one place, including a handler, a command message, an event message, an entity, a projection, a consumer, and the code that starts the consumer.

``` ruby
# Account command handler with withdrawal implementation
# Business logic for processing a withdrawal
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

# Withdraw command message
# Send to the account component to effect a withdrawal
class Withdraw
  include Messaging::Message

  attribute :account_id, String
  attribute :amount, Numeric
  attribute :time, String
end

# Withdrawn event message
# Event is written by the handler when a withdrawal is successfully processed
class Withdrawn
  include Messaging::Message

  attribute :account_id, String
  attribute :amount, Numeric
  attribute :time, String
  attribute :processed_time, String
end

# WithdrawalRejected event message
# Event is written by the handler when a withdrawal cannot be successfully
# processed, as when there are insufficient funds
class WithdrawalRejected
  include Messaging::Message

  attribute :account_id, String
  attribute :amount, Numeric
  attribute :time, String
end

# Account entity
# The account component's model object
class Account
  include Schema::DataStructure

  attribute :id, String
  attribute :balance, Numeric, default: 0

  def withdraw(amount)
    self.balance -= amount
  end

  def sufficient_funds?(amount)
    balance >= amount
  end
end

# Account entity projection
# Applies account events to an account entity
class Projection
  include EntityProjection

  entity_name :account

  apply Withdrawn do |withdrawn|
    account.id = withdrawn.account_id

    amount = withdrawn.amount

    account.withdraw(amount)
  end
end

# Account entity store
# Projects an account entity and keeps a cache of the result
class Store
  include EntityStore

  category :account
  entity Account
  projection Projection
  reader MessageStore::Postgres::Read
end

# The consumer dispatches in-bound messages to handlers
# Consumers have an internal reader that reads messages from a single stream
# Consumers can have many handlers
class Consumer
  include Consumer::Postgres

  handler Handler
end

# The "component initiator" maps consumers to their streams and starts the consumers
# Until this point, handlers have no knowledge of which streams they process
# Starting the consumers starts the stream readers and gets messages flowing
# into the consumer's handlers
module Component
  def self.call
    account_command_stream_name = 'account:command'
    Consumer.start(account_command_stream_name)
  end
end

# ComponentHost is the runnable part of the service
# Register the component initiator with the component host, then start the host
# and messages sent to its streams are dispatched to the handlers
component_name = 'account-component'
ComponentHost.start(component_name) do |host|
  host.register(Component)
end
```

::: tip
A "component" isn't a "service" until it's running in the component host. The component host can host and run many different components. A component's "Start" module is the interface between the component and the service that hosts and runs it.
:::
