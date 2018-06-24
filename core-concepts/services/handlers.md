---
- use withdrawal handler
- stream name
---

# Handlers

A handler is the entry point to a service. It receives instructions from other services, apps, and clients in the form of [messages](/glossary.md#message). You might think of them as controllers in MVC terms, but that's a very loose comparison.

When a service [component](/glossary.md#component) receives messages, it sends these messages to the handlers that process them.

A handler receives a message, does its work, and when it's done with that work, it reports the status and outcome of that work by publishing an event.

Messages can come from applications as well as other services, including the service handling its own messages.

## Handler Workflow

1. Retrieve the entity from the store, projecting the entity's data from events in the process
2. Use the entity to determine whether and how to process the message
3. Construct the resulting event that captures the effects of processing the message
4. Assign data to its the resulting event from the input message, the system clock, and possibly other sources depending on the business scenario
4. Write the resulting event

Note that some handlers may not need to do all of these things.

## Example Handler

The example below is a handler does withdrawals from an account.

The handler can handle a message whose class name is `Withdrawn`. The `handle` block receives an instance of the Withdrawn message that carries the information required to withdrawn funds from an account, including the account ID and the amount of the withdrawal, as well as a timestamp.

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

Handlers can handle many different kinds of messages:


