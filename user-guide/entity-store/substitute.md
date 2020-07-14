# Entity Store Substitute

A _substitute_ is an alternate implementation of an interface. In this case, the [entity store](./) interface.

For more information about substitutes in general, see the [useful objects](/user-guide/useful-objects.md) user guide.

The `EntityStore` module includes a substitute that allows for an entity to be arbitrarily added to the store, and that can be retrieved using the standard entity store interface.

The entity store substitute doesn't interact with the message store. It can only return entities that have been added to it. It doesn't project entities and neither reads nor writes snapshots.

The substitute has no durable I/O side effects. As such, it's an _inert_ substitute.

<div class="note custom-block">
  <p>
    Note: The meaning of "substitute" in this context refers to <a href="https://en.wikipedia.org/wiki/Liskov_substitution_principle">Liskov Substitution Principle</a>, which describes the quality of polymorphism in object-oriented systems as objects that can legitimately replace, or <em>substitute</em>, each other without changing the correctness or intention of the program that uses the substitute. From the standpoint of their shared interface, substitutes are not considered either more "real" or less real than other substitutes of the same interface. In this, all substitutes are <em>real</em>, and no substitute is considered <em>secondary</em>.
  </p>
</div>

## Example

``` ruby{27}
class SomeHandler
  dependency :store, Store

  # ...

  handle SomeMessage do |some_message|
    some_entity_id = some_message.some_entity_id

    some_entity, version = some_entity.fetch(some_entity_id, include: :version)

    puts some_entity.some_attribute
    puts version
  end
end

handler = SomeHandler.new()

handler.store.class
# =>  EntityStore::Substitute

id = '123'

some_entity = SomeEntity.new()
some_entity.id = id
some_entity.some_attribute = 'Some Value'

handler.store.add(id, some_entity, 11)

handler.(some_message)
# => "Some Value"
# => 11
```

## Entity Store Substitute Facts

- The entity store substitute doesn't interact with the message store
- The substitute respects the public entity store API, and augments it with the capability to add entities to the store directly
- The substitute adds entities to the store's internal, in-memory cache
- Entities retrieved from the substitute store have to have been explicitly added to the store
- An entity's version can be optionally added to and retrieved from the substitute's internal, in memory cache

## EntityStore::Substitute Class

The `EntityStore::Substitute` class is a concrete class from the [`EntityStore` library](../libraries.md#entity-store) in the `EntityStore` namespace.

The `EntityStore::Substitute` class provides:

- The `add` method for initializing a cache record with an arbitrary entity that is not the result of projecting an event stream
- Inert implementations of the entity store's `fetch`, `get`, and `get_version` methods that don't interact with the message store

## Add an Entity to the Store

``` ruby
add(id, entity, version=nil)
```

**Returns**

The [cache record](./entity-cache.md#cache-record) that was created or updated.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the entity being added | String |
| entity | The ID of the entity being added | Object |
| version | The stream version of the entity added | Integer |

## Retrieving an Entity

Retrieving an entity for the substitute entity store doesn't project an entity's event stream, nor read or write snapshots.

Entities can be retrieved in one of two ways:

- Via the `fetch` method
- Via the `get` method

The significant difference between the `fetch` and `get` methods is the return value when a non-existent entity is attempted to be retrieved. The `fetch` method will return a newly-constructed instance of the store's declared entity class. The `get` method will return a `nil`.

It's more common in handler business logic to use the `fetch` method so that the returned entity does not have to be checked for a `nil` value before being used.

### Fetch

``` ruby
fetch(id, include: nil)
```

**Returns**

The entity that was added to the store.

If the optional `include` argument is specified, data from the entity's cache record can be returned as well.

<div class="note custom-block">
  <p>
    Note: The <code>fetch</code> method never returns a <code>nil</code> when the entity retrieved does not exist (ie: There's no entity stream with the entity's ID). When the entity does not exist, rather than returning a <code>nil</code>, the <code>fetch</code> method will return a newly-constructed instance of the store's declared entity class.
  </p>
</div>

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the entity to retrieve | String |
| include | List of cache record attributes to retrieve | Symbol or Array |

#### Including Cache Record Data in the Returned Values

The `include` named parameter returns selected data from the entity's cache record along with the entity.

The most common use of the `include` parameter is to retrieve the entity's version along with the entity.

``` ruby
entity, version = store.fetch(some_id, include: :version)
```

#### Cache Record Attributes That Can Be Included

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the cached entity | String |
| entity | The cached entity itself | Object |
| version | The stream version of the cached entity at the time it was cached | Integer |

<div class="note custom-block">
  <p>
    Note: All cache record attributes can be requested, but other than the <code>id</code>, the <code>entity</code> itself, and the <code>version</code>, the <a href="./#cache-record-attributes-that-can-be-included">  other attributes</a> will be <code>nil</code>.
  </p>
</div>

#### The no_stream Stream Version

When an attempt is made to retrieve an entity that has not been added to the store, the symbol `:no_stream` is returned as the value of `version`.

``` ruby
entity, version = store.fetch(some_non_existant_id, include: :version)

version
# => :no_stream
```

The `:no_stream` symbol is equivalent to a stream version of `-1`.

### Get

``` ruby
get(id, include: nil)
```

The `get` method is almost identical to the `fetch` method.

The significant difference between the `get` and `fetch` methods is the return value when a non-existent entity is attempted to be retrieved. The `get` method will return a `nil`. Whereas the `fetch` method will return a newly-constructed instance of the store's declared entity class.

The `get` method isn't typically a good choice in handler business logic, as it will require a `nil` check for each entity returned from the store due to the possibility that an entity returned from `get` may be `nil`

## Retrieving an Entity's Version

In order for the version to be a value other that `nil`, the version will have had to have been [added](#add-an-entity-to-the-store) along with the entity.

``` ruby
get_version(id)
```

**Returns**

Version of the entity identified by the `id` argument, or the `:no_stream` symbol if not found.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | The ID of the entity whose version to retrieve | String |


## Constructing an Entity Store Substitute

The entity store substitute can be constructed in one of two ways:

- Via the constructor
- Via the `dependency` macro

### Via the Constructor

``` ruby
EntityStore::Substitute.build()
```

**Returns**

Instance of the `EntityStore::Substitute` class.

### Via the `dependency` Macro

``` ruby
dependency :store, SomeStore
```

A store declared with the `dependency` macro will be initialized to the store's substitute.

``` ruby
class SomeHandler
  dependency :store, SomeStore

  # ...
end

handler = SomeHandler.new

handler.store.class
# =>  EntityStore::Substitute
```

::: tip
See the [useful objects](./useful-objects.md) user guide for background on using dependencies and their substitutes.
:::
