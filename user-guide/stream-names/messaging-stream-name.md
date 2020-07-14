# Messaging::StreamName

`MessageStore::StreamName` is a module that offers utilities for composing and parsing stream names.

It builds on the utilities in the lower-level `MessageStore::StreamName` module, and adds conveniences and affordances that are useful in messaging contexts, like message handlers.

## Messaging::StreamName Facts

- The `Messaging::StreamName` module can be mixed into a class or can be used as a function library, with its methods invoked directly from the `Messaging::StreamName`
- Methods in the [`Messaging::StreamName`](./messaging-stream-name.md) module leverage the utilities in the `MessageStore::StreamName` module.

## Messaging::StreamName Module

The `StreamName` module is a mixin and function library from the [`Messaging` library](../libraries.md#messaging) and namespace.

The `StreamName` module provides:

- The `category` macro for declaring the default category name to be used for uses of stream name composition utilities within the class where the category is declared
- The `stream_name` method for composing entity stream names from the (optionally) declared category macro and an ID
- The `category_stream_name` method for composing category stream names
- The `command_stream_name` method for composing command stream names
- The `command_category_stream_name` for composing command category stream names
- The `get_id` class method for parsing a stream's ID from a stream name
- The `get_ids` class method for parsing a stream's ID from a stream name
- The `get_category` class method for parsing a stream's category from a stream name
- The `get_cardinal_id` class method for parsing a stream's cardinal ID from a stream name
- The `category?` class predicate for determining whether a stream name is a category
- The `get_type` class method for parsing a stream's category type from a stream name
- The `get_types` class method for parsing a list of category types from a stream name with a compound category types
- The `get_entity_name` class method for parsing a stream's entity name from a stream name

## Category Declaration

The most common usage scenario for the stream name utility method use is in conjunction with the [`category`](#messaging-category) macro.

The `category` macro declares the category name that will be used when the optional `category` parameter is not passed to the stream name utility.

``` ruby
# In the class context
category :some_entity

# In the instance context (eg: a handler block or instance method)
stream_name('123')
# => "someEntity-123"
```

Note that when the category is declared via the `category` macro, the category name is converted to camel case.

If the category is not declared via the `category` macro, the category can be passed explicitly to the stream name utility.

When a stream name utility method is used to explicitly control the category name, care must be taken to use the correct, natural casing. The utility methods don't convert the category name value to camel case, or normalize it in any way.

<div class="note custom-block">
  <p>
    Note that the category macro is provided by the Messaging::Category module, which is included into the receiver class when the Messaging::StreamName module is included.
  </p>
</div>

## Stream Name

Compose a stream name from its constituent parts.

``` ruby
stream_name(stream_id=nil, stream_category=nil, category: nil, cardinal_id: nil, id: nil, ids: nil, type: nil, types: nil)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| stream_id | ID or list of IDs of the entity represented by the stream | String or Array of Strings |
| stream_category | The stream's category name | String |
| category | The stream's category name (Alias for the `stream_category` parameter | String |
| cardinal_id | ID that is to be considered the first or primary ID of a stream with a compound ID | String |
| id | ID of the entity represented by the stream (Alias for the `stream_id` parameter) | String |
| ids | List of IDs of the entity represented by the stream (Alias for the `stream_id` parameter) | String or Array of Strings |
| type | The stream's category type | String |
| types | The stream's list category types | Array of Strings |

**In Conjunction with the Category Class Macro**

``` ruby
# In the class context
category :some_entity

# In the instance context (eg: a handler block or instance method)
stream_name('123')
# => "someEntity-123"
```

**Using the Category Parameter**

``` ruby
stream_name('123', 'someEntity')
# => "someEntity-123"

stream_name(id: '123', category: 'someEntity')
# => "someEntity-123"
```

**With a Compound ID**

``` ruby
stream_name(['123', 'abc'], 'someEntity')
# => "someEntity-123+abc"

stream_name(ids: ['123', 'abc'], category: 'someEntity')
# => "someEntity-123+abc"
```

**With a Compound ID with an Explicit Cardinal ID**

``` ruby
stream_name(cardinal_id: '123', id: 'abc', category: 'someEntity')
# => "someEntity-123+abc"

stream_name(cardinal_id: '123', ids: ['abc', '789'], category: 'someEntity')
# => "someEntity-123+abc+789"
```

**With a Category Type**

``` ruby
stream_name('123', 'someEntity', type: 'someType')
# => "someEntity:someType-123"
```

**With a Compound Category Type**

``` ruby
stream_name('123', 'someEntity', types: ['someType', 'someOtherType'])
# => "someEntity:someType+someOtherType-123"
```

## Category Stream Name

Compose a stream name for a [category](/glossary.md#category) of streams.

A stream that contains the messages for every individual, identified stream in the category. For example, given the streams `account-123`, and `account-456`, the category stream, `account`, contains messages from both individual streams in the account category.

``` ruby
category_stream_name(category=nil, type: nil, types: nil)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| category | The stream's category name | String |
| type | The stream's category type, if only one type | String |
| types | The stream's category types, if many types | Array of Strings |

**In Conjunction with the Category Class Macro**

``` ruby
# In the class context
category :some_entity

# In the instance context (eg: a handler block or instance method)
category_stream_name()
# => "someEntity"
```

**Using the Category Parameter**

``` ruby
category_stream_name('someEntity')
# => "someEntity"
```

**With a Category Type**

``` ruby
category_stream_name('someEntity', type: 'someType')
# => "someEntity:someType"
```

**With a Compound Category Type**

``` ruby
category_stream_name('someEntity', types: ['someType', 'someOtherType'])
# => "someEntity:someType+someOtherType"
```

## Command Stream Name

Compose a stream name for a stream that is suitable for transporting [commands](/glossary.md#command) for an entity.

``` ruby
command_stream_name(id, category=nil, type: nil, types: nil)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| id | ID or list of IDs of the entity represented by the stream | String or Array of Strings |
| category | The stream's category name | String |
| type | The stream's category type, if only one type | String |
| types | The stream's list category types, if many types | Array of Strings |

**In Conjunction with the Category Class Macro**

``` ruby
# In the class context
category :some_entity

# In the instance context (eg: a handler block or instance method)
command_stream_name('123')
# => "someEntity:command-123"
```

**Using the Category Parameter**

``` ruby
command_stream_name('123', 'someEntity')
# => "someEntity:command-123"
```

**With a Compound ID**

``` ruby
command_stream_name(['123', 'abc'], 'someEntity')
# => "someEntity:command-123+abc"
```

**With a Category Type**

``` ruby
command_stream_name('123', 'someEntity', type: 'someType')
# => "someEntity:command+someType-123"
```

**With a Compound Category Type**

``` ruby
command_stream_name('123', 'someEntity', types: ['someType', 'someOtherType'])
# => "someEntity:command+someType+someOtherType-123"
```

## Command Category Stream Name

Compose a stream name for a [category](./glossary.md#category) of command streams.

A stream that contains the messages for every individual, identified command stream in the category.

``` ruby
command_category_stream_name(category=nil, type: nil, types: nil)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| category | The stream's category name | String |
| type | The stream's category type, if only one type | String |
| types | The stream's list category types, if many types | Array of Strings |

**In Conjunction with the Category Class Macro**

``` ruby
# In the class context
category :some_entity

# In the instance context (eg: a handler block or instance method)
command_category_stream_name()
# => "someEntity:command"
```

**Using the Category Parameter**

``` ruby
command_category_stream_name('someEntity')
# => "someEntity:command"
```

**With a Category Type**

``` ruby
command_category_stream_name('someEntity', type: 'someType')
# => "someEntity:command+someType"
```

**With a Compound Category Type**

``` ruby
command_category_stream_name('someEntity', types: ['someType', 'someOtherType'])
# => "someEntity:command+someType+someOtherType"
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

<div class="note custom-block">
  <p>
    Note that the get_id method is not mixed in when the Messaging::StreamName module is mixed into a class. It can only be invoked from the Messaging::StreamName constant.
  </p>
</div>

``` ruby
Messaging::StreamName.get_id('someEntity-123')
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

<div class="note custom-block">
  <p>
    Note that the get_category method is not mixed in when the Messaging::StreamName module is mixed into a class. It can only be invoked from the Messaging::StreamName constant.
  </p>
</div>

``` ruby
Messaging::StreamName.get_category('someEntity-123')
# => 'someEntity'
```

## Category Types are Purely Mechanical

::: warning
Category types are not intended for any use except internal infrastructure or mechanical uses. They should not be used to build hierarchical category names for applicative code.
:::

See the [Stream Names](/core-concepts/streams/stream-names.md#example-stream-names) topic in the Core Concepts section for examples of mechanical and infrastructural category types.

## Using as a Mixin

### Subordinate Mixin

Including `Messaging::StreamName` into a class includes the [`Messaging::Category`](#messaging-category) module into the class.

### Methods Mixed into the Receiver

- `stream_name`
- `category_stream_name`
- `command_stream_name`
- `command_category_stream_name`

## Using as a Function Library

In addition to using the `Messaging::StreamName` module as a mixin, its methods can be invoked from the `Messaging::StreamName` constant.

``` ruby
Messaging::StreamName.stream_name('123')
```

- `stream_name`
- `category_stream_name`
- `command_stream_name`
- `command_category_stream_name`
- `get_id`
- `get_ids`
- `get_category`
