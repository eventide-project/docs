---
sidebarDepth: 0
---

# Stores

A store is the data access interface for [entities](./entities.md).

A store combines a [projection](./projections.md), a stream reader, and two levels of caching: an in-memory cache, and an optional on-disk cache.

Entities are retrieved from the store without having to directly actuate a projection. The stream reading and projecting and caching are all transparent to the client code. To the developer, interacting with a store appears like interacting with any entity-centric data retrieval object, hiding the event-stream nature of the storage medium from the client code.

``` ruby
account_id = 123
account = store.fetch(account_id)
```

## Example Store

``` ruby
class Store
  include EntityStore

  category :account
  entity Account
  projection Projection
  reader MessageStore::Postgres::Read
end
```
