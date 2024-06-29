---
sidebarDepth: 0
---

# Entities

An entity is the core logic of a [component](/glossary.md#component).

One entity's data is contained in a single, individual event stream. An entity collects any important information from the events in the entity's stream.

An entity has a corresponding [projection](./projections.md), which is used to copy data from the events to the entity object, either by setting the entity's attributes or by invoking its methods.

The data that an entity has collected is also used in [handler](./handlers.md) code to determine whether a [command](/glossary.md#command) should be processed.

## Entities Have No Dependencies

An entity is a data object. It's methods pertain to its data attributes.

Entities have no connascence of infrastructural concerns, like storage, messaging and messages. Infrastructural concerns are the domain of design elements that surround the entities, such as [handlers](./handlers.md), which span messaging and entities, and [projections](./projections.md), which span the event stream application data storage model and entities.

It's the interplay of entities with the elements that are immediately adjacent to entities that is the nexus of a component's business logic implementation.

## Entities are State Machines

The principle purpose of an entity is to act as the state machine implementation that is the core of an autonomous service. A service itself is an implementation of a state machine, and the entity is the most central module of the design.

The various state transitions that an entity tracks are recorded as events. The _projection_ of an entity's event stream is how the state machine is substantiated with its data.

## Example Entity

``` ruby
class Account
  include Schema::DataStructure

  attribute :id, String
  attribute :customer_id, String
  attribute :balance, Numeric, default: -> { 0 }
  attribute :opened_time, Time
  attribute :closed_time, Time

  def open?
    !opened_time.nil?
  end

  def closed?
    !closed_time.nil?
  end

  def deposit(amount)
    self.balance += amount
  end

  def withdraw(amount)
    self.balance -= amount
  end

  def sufficient_funds?(amount)
    balance >= amount
  end
end
```
