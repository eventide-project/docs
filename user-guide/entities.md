---
sidebar: auto
sidebarDepth: 0
---

# Entities

An entity is the core logic of a service. Entities are the innermost parts of an implementation. In a concentric architecture, entities are at the very center. They are the _kernel_ of a service or component.

Entities are data structures. They have some similarities to the _model objects_ of classic ORM, but that analogy is quite limited and shouldn't be taken too far. An entity can be any kind of data structure, like an object, a struct, or even a hash. An entity doesn't have to implement any special base class or module.

Entities also have behavior. However, any entity method should pertain to the entity's data attributes. Any entity behavior that doesn't either access or modify the entity's attributes should not be part of the entity.

Entities operate entirely in memory. They don't save themselves, they don't retrieve themselves, they don't send messages. They don't have external I/O of any kind under any circumstances. I/O is the domain of elements that are outside of an entity and that interact with an entity, such as [handlers](./handlers.md) or other plain old objects that coordinate interaction between external concerns and core logic.

As in-memory structures without external side effects or prerequisites, they are easy to test.

In practice, an entity receives its data from a [projection](./projection) that is fed the events from an event stream that is read by a [store](./entity-store).

## Example Entity

``` ruby
class Account
  include Schema::DataStructure

  attribute :id, String
  attribute :customer_id, String
  attribute :balance, Numeric, default: 0
  attribute :opened_time, Time
  attribute :closed_time, Time
  attribute :sequence, Integer

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

  def processed?(message_sequence)
    return false if sequence.nil?
    sequence >= position
  end
end
```

## Facts

- Entities are core business logic
- An entity can be any kind of object or data structure
- The are entirely in-memory
- Entities receive their data from projections
- Entities remain in-memory in a store's cache once retrieved
- Entities can be periodically snapshotted to disk
- An entity has no external side effects and no external dependencies

## See Also

- [Projection](./projection.md)
- [Entity Store](./entity-store/)
- [Entity Cache](./entity-store/entity-cache.md)
- [Snapshotting](./entity-store/snapshotting.md)
- [Use in handlers](./handlers.md#typical-handler-workflow)
