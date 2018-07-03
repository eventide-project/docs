---
sidebarDepth: 0
---

# Projections

An [entity's](./entities.md) data comes from the [events](/glossary.md#event) recorded in the entity's [event stream](/glossary.md#event-stream) as a result of [handlers](./handlers.md) handling commands and other events.

A projection is the glue between an event stream and an entity.

The projection receives events as inputs, and modifies the state of an entity based on which event is being processed, and the content of the event.

When an entity is "retrieved", events from its event stream are _applied_ to it by the entity projection.

## Example Projection

``` ruby
class Projection
  include EntityProjection

  entity_name :account

  apply Deposited do |deposited|
    account.id = deposited.account_id

    amount = deposited.amount

    account.deposit(amount)
  end

  apply Withdrawn do |withdrawn|
    account.id = withdrawn.account_id

    amount = withdrawn.amount

    account.withdraw(amount)
  end
end
```
