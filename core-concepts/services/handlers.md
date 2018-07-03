---
sidebarDepth: 0
---

# Handlers

[Messages](/glossary.md#message) that are sent to a service are processed by the service's _handlers_. They are the business logic, combined with the service's [entity](./entities.md) logic.

A handler is the entry point to a service. It receives instructions from other services, apps, and clients in the form of [commands](/glossary.md#command) and [events](/glossary.md#event). You might think of them as controllers in MVC terms, but that's a very loose comparison.

A handler receives a message, does its work, and when it's done with that work, it reports the status and outcome of that work by publishing an event.

Messages can come from applications as well as other services, including the service handling its own messages.

## Example Handler

The example below is a handler does withdrawals from an account.

The handler can handle a message whose class name is `Withdrawn`. The `handle` block receives an instance of the Withdrawn message that carries the information required to withdraw funds from an account, including the account ID and the amount of the withdrawal, as well the time of the withdrawal.

Depending on whether there are sufficient funds for the withdrawal, the handler publishes either a `Withdrawn` event or a `WithdrawalRejected` event as a result of processing the withdrawal.

``` ruby
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
```

## More

See the [Handlers](/user-guide/handlers.md) topic in the User Guide for more.
