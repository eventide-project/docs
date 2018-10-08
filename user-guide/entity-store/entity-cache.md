# Entity Cache

The [entity store](./) uses the entity cache to optimize the retrieval of entities.

When an entity is "retrieved", the events in its event stream are read and projected onto the entity.

Each time an entity is retrieved, the resulting entity is recorded in a cache. Any subsequent retrieval of the entity requires that only the events recorded since the previous retrieval are read and projected onto the entity.

As a further optimization, to avoid the cost of projecting all of an entity's events when the entity is not in the cache (as when a service has just been started), an entity is periodically persisted to disk in a snapshot stream. If an entity is retrieved and there's no cache entry for it, the latest snapshot will be retrieved and cached before the latest events are read and projected.

The entity cache is composed of two parts: the in-memory cache that stores any entity retrieved by a its store, and the on-disk persistent cache of entity snapshots that are used to create an entity's cache record if one is not already present in the cache at the time of the retrieval.

## Entity Cache Facts

- Caches are not shared between stores
- Caches are never cleared automatically
- Snapshots are not deleted automatically


- - -

- never cleared
- just in time cache warming from snapshot

### TODO


<!--
- api
- exclusive, etc. scope. env vars
- cache record
 -->

## Caching Entity

- done for you

### TODO

## Scoping

### TODO

## Cache Record

### TODO

## Clearing In-Memory Cache

- not done
- just restart service
- because idempotent and resilient and graceful shutdown

### TODO

## Snapshotting

- transform
  - by default, will transform flat entities

### TODO
