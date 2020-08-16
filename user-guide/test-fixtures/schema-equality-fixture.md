# Schema Equality Fixture

The schema equality fixture tests the comparison between to implementations of [Schema::DataStructure](https://github.com/eventide-project/schema), such as [messages](/user-guide/messages-and-message-data/messages.md) and [entities](/user-guide/entities.md).

By default, all attributes from the control schema object are compared to the compare schema object attributes of the same name. An optional list of attribute names can be passed. When the list of attribute names is passed, only those attributes will be compared. The list of attribute names can also contain maps of attribute names for comparing values when the control object attribute name is not the same as the compare object attribute name.

## Example

``` ruby
class Something
  include Schema

  attribute :some_attribute
  attribute :some_other_attribute
end

context 'Equal' do
  something_1 = Something.new
  something_1.some_attribute = 'some value'
  something_1.some_other_attribute = 'some other value'

  something_2 = Something.new
  something_2.some_attribute = 'some value'
  something_2.some_other_attribute = 'some other value'

  fixture(Equality, something_1, something_2)
end
```

## Schema Equality Fixture Facts

- The principle concern of a schema equality fixture test is the comparison of the attribute values of two different schema objects
- An optional list of attribute names can given to limit the comparison to a a subset of attributes
- The list of attribute names can contain maps of attribute names to allow comparison of attributes of different names
- The attributes of objects of different classes can be compared by disabling the fixture's class comparison

## Schema::Fixtures::Equality

The `Equality` class is a concrete class from the [`Schema::Fixtures` library](/user-guide/libraries.md#schema-fixtures) and namespace.

The `Schema::Fixtures::Equality` class provides:

- The instance actuator `.()` (or `call` method) that begins execution of the fixture and the comparison of the two schema objects


