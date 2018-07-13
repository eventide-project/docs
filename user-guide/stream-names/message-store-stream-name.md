# MessageStore::StreamName Module

`MessageStore::StreamName` is a module that acts as a function library offering basic utilities for composing and parsing stream names.

The methods of the `MessageStore::StreamName` module can only be invoked from the `MessageStore::StreamName` constant. Including the module in another class will not mix in any of the module's methods to the receiver class.

The higher order utilities in the [`Messaging::StreamName`](./messaging-stream-name.md) module and built upon and delegate to the `MessageStore::StreamName` module.

[View Source](https://github.com/eventide-project/message-store/blob/master/lib/message_store/stream_name.rb)

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
| id | ID of the entity represented by the stream | String |
| type | The stream's category type, if only one type | String |
| types | The stream's list category types, if many types | String |

``` ruby
MessageStore::StreamName.stream_name('someEntity')
# => "someEntity"

MessageStore::StreamName.stream_name('someEntity', '123')
# => "someEntity-123"

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
```

## Determine Whether a Stream Name is for a Category Stream

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

## Get Types from Stream Name

``` ruby
self.get_types(stream_name)
```

**Returns**

Array of Strings

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name from which to get the types | String |

``` ruby
MessageStore::StreamName.get_type_list('someEntity:someType+someOtherType-123')
# => ["someType", "someOtherType"]
```

## Get Type List from Stream Name

``` ruby
self.get_type_list(stream_name)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_name | The stream name from which to get the type list | String |

``` ruby
MessageStore::StreamName.get_type_list('someEntity:someType+someOtherType-123')
# => "someType+someOtherType"
```
