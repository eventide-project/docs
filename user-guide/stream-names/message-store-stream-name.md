# MessageStore::StreamName

`MessageStore::StreamName` is a function library of basic utilities for composing and parsing stream names.

## MessageStore::StreamName Facts

- `MessageStore::StreamName` module's methods cannot be mixed into a class
- Its methods can only be invoked from the `MessageStore::StreamName` constant
- Methods in the [`Messaging::StreamName`](./messaging-stream-name.md) module are built upon and delegate to the `MessageStore::StreamName` module.

## MessageStore::StreamName Module

The `StreamName` module is a function library from the [`MessageStore` library](../libraries.md#message-store) and namespace.

The `StreamName` module provides:

- The `stream_name` method for composing a stream name from its constituent parts
- The `get_id` method for parsing a stream's ID from a stream name
- The `get_ids` method for parsing a list of IDs from a stream name with a compound ID
- The `get_category` method for parsing a stream's category from a stream name
- The `category?` predicate for determining whether a stream name is a category stream name
- The `get_type` method for parsing a stream's category type from a stream name
- The `get_types` method for parsing a list of category types from a stream name with a compound category types
- The `get_entity_name` method for parsing a stream's entity name from a stream name

## Stream Name

Compose a stream name from its constituent parts.

``` ruby
self.stream_name(category_name, id=nil, type: nil, types: nil)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| category | The stream's category name | String |
| id | ID or list of IDs of the entity represented by the stream | String or Array of Strings |
| type | The stream's category type, if only one type | String |
| types | The stream's list category types, if many types | Array of Strings |

``` ruby
MessageStore::StreamName.stream_name('someEntity')
# => "someEntity"

MessageStore::StreamName.stream_name('someEntity', '123')
# => "someEntity-123"

MessageStore::StreamName.stream_name('someEntity', ['123', 'abc'])
# => "someEntity-123+abc"

MessageStore::StreamName.stream_name('someEntity', '123', type: 'someType')
# => "someEntity:someType-123"

MessageStore::StreamName.stream_name('someEntity', '123', types: ['someType', 'someOtherType'])
# => "someEntity:someType+someOtherType-123"
```

## Get ID from Stream Name

``` ruby
self.get_id(stream_name)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name from which to get the ID | String |

``` ruby
MessageStore::StreamName.get_id('someEntity-123')
# => '123'
```

## Get IDs from Stream Name with Compound IDs

``` ruby
self.get_ids(stream_name)
```

**Returns**

Array of Strings

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name from which to get the IDs | String |

``` ruby
MessageStore::StreamName.get_id('someEntity-123+abc')
# => ['123', 'abc']
```

## Get Category from Stream Name

``` ruby
self.get_category(stream_name)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name from which to get the category | String |

``` ruby
MessageStore::StreamName.get_category('someEntity-123')
# => 'someEntity'

MessageStore::StreamName.get_category('someEntity:someType-123')
# => 'someEntity:someType'
```

## Determine Whether a Stream Name is a Category Name

``` ruby
def self.category?(stream_name)
```

**Returns**

Boolean

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name to determine whether it's a category stream name | String |

``` ruby
MessageStore::StreamName.category?('someEntity')
# => true

MessageStore::StreamName.category?('someEntity-123')
# => false
```

## Get Category Type from Stream Name

``` ruby
self.get_category_type(stream_name)
```

**Returns**

String

**Alias**

`get_type`

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name from which to get the category type | String |

``` ruby
MessageStore::StreamName.get_type('someEntity:someType-123')
# => "someType"
```

## Get Category Types from Stream Name with Compound Category Types

``` ruby
self.get_category_types(stream_name)
```

**Returns**

Array of Strings

**Alias**

`get_types`

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name from which to get the category types | String |

``` ruby
MessageStore::StreamName.get_types('someEntity:someType+someOtherType-123')
# => ["someType", "someOtherType"]
```

## Get Entity Name from Stream Name

``` ruby
self.get_entity_name(stream_name)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name from which to get the entity name | String |

``` ruby
MessageStore::StreamName.get_entity_name('someEntity-123')
# => "someEntity"

MessageStore::StreamName.get_entity_name('someEntity:someType-123')
# => "someEntity"
```
