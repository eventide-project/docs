---
sidebar: auto
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
```

## `Messaging::Handle` Module

A class becomes a handler by including the `Handle` module from the `Messaging` library and namespace.

### What It Does to the Class

asdsad

## Defining a Handler Block

A handler block is defined with the `handle`
