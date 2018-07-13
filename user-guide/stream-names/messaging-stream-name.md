# Messaging::StreamName Module

`Messaging::StreamName` is a module that's often mixed in to handler classes, but can also be used as a function library of methods that can be invoked from the `Messaging::StreamName` module constant.

[View Source](https://github.com/eventide-project/messaging/blob/master/lib/messaging/stream_name.rb)

## Optional Category Declaration

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

## Entity Event Stream Name

Compose a stream name for a stream that is suitable for entity event storage.

``` ruby
stream_name(id, category=nil, type: nil, types: nil)
```

**Returns**

String

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| id | ID of the entity represented by the stream | String |
| category | The stream's category name | String |
| type | The stream's category type, if only one type | String |
| types | The stream's list category types, if many types | String |

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
```

**With a Type**

``` ruby
stream_name('123', 'someEntity', type: 'someType')
# => "someEntity:someType-123"
```

**With More than One Type**

``` ruby
stream_name('123', 'someEntity', types: ['someType', 'someOtherType'])
# => "someEntity:someType+someOtherType-123"
```

## Category Stream Name

Compose a stream name for a [category](./glossary.md#category) of streams.

A stream that contains the messages for every individual, identified stream in the category. For example, given the streams `account-123`, and `account-456`, the category stream, `account`, contains messages from both individual streams in the account category.

``` ruby
category_stream_name(category=nil, type: nil, types: nil)
```

**Returns**

String

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| category | The stream's category name | String |
| type | The stream's category type, if only one type | String |
| types | The stream's list category types, if many types | String |

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

**With a Type**

``` ruby
category_stream_name('someEntity', type: 'someType')
# => "someEntity:someType"
```

**With More than One Type**

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

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| id | ID of the entity for which commands are transported by the command stream | String |
| category | The stream's category name | String |
| type | The stream's category type, if only one type | String |
| types | The stream's list category types, if many types | String |

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

**With a Type**

``` ruby
command_stream_name('123', 'someEntity', type: 'someType')
# => "someEntity:command+someType-123"
```

**With More than One Type**

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

**Arguments**

| Name | Description | Type |
| --- | --- | --- |
| category | The stream's category name | String |
| type | The stream's category type, if only one type | String |
| types | The stream's list category types, if many types | String |

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

**With a Type**

``` ruby
command_category_stream_name('someEntity', type: 'someType')
# => "someEntity:command+someType"
```

**With More than One Type**

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

**Arguments**

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

**Arguments**

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
- `get_category`
