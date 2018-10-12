# Messaging::Category Module

`Messaging::Category` is a module that's often mixed in to handler classes. The module is also included into a receiver class that includes the [`Messaging::StreamName`](./messaging-stream-name.md) module.

The `Messaging::Category` provides the `category` class macro to the class that includes it

## Declaring the Category

Declares the category that a class will use predominantly when composing stream names.

``` ruby
category :some_entity
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| category | The category name | String or Symbol|

The `category` class macro has the effect of defining getter and setter instance method named `category` that returns the camel cased string of the argument passed to the macro.

``` ruby
# In the class context
category :some_entity

# In the instance context
category
# => "someEntity"

self.category = :something_else
category
# => "somethingElse"
```

## Normalizing the Category Name

Convert or coerce a category name to a camel case string.

``` ruby
self.normalize(category)
```

**Returns**

String

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| category | The category name | String or Symbol|

The `normalize` method is callable from the `Messaging::Category` constant as a module method, and cannot be mixed in to a receiver.

``` ruby
Messaging::Category.normalize(:some_entity)
# => "someEntity"
```
