---
home: true
heroImage: /eventide-icon-132.png
description: "Message-Based Autonomous Components"
actionText: Get Started →
actionLink: /examples/quickstart.md
features:
- title: Event Sourcing
  details: Business entities projected from persistent streams of events recording the complete history of business activity, with support for caching and snapshotting
- title: Autonomous Components
  details: Message-based components hosted in any number of operating system processes or servers, with actor-based pub-sub consumers, consumer groups, message dispatching, and message handlers
- title: Pub/Sub
  details: Pub/Sub services built on persistent event streams, delivering to consumers in parallel under a hosting runtime
footer: MIT Licensed | Copyright © 2015-present The Eventide Project
---

- - -

### A Brief Example...

``` ruby
# Account command handler with withdrawal implementation
# Business logic for processing a withdrawal
class Handler
  include Messaging::Handle

  handle Withdraw do |withdraw|
    account_id = withdraw.account_id

    account = store.fetch(account_id)

    unless account.sufficient_funds?(withdraw.amount)
      logger.info('Withdrawal rejected')
      return
    end

    withdrawn = Withdrawn.follow(withdraw)

    time = clock.iso8601
    withdrawn.processed_time = time

    stream_name = stream_name(account_id)

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

# Account entity
# The account component's model object
class Account
  include Schema::DataStructure

  attribute :id, String
  attribute :balance, Numeric, default: -> { 0 }

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

  entity Account
  projection Projection
end
```

This code is not a complete implementation and not production-ready. It's intended only to provide a very high-level introductory overview.

<div class="hero">
  <p class="action">
    <a href="/examples/" class="nav-link action-button">Go To Examples →</a>
  </p>
</div>
