# Schema Equality Fixture

The schema equality fixture tests the comparison between to implementations of [Schema::DataStructure](https://github.com/eventide-project/schema), such as [messages](/user-guide/messages-and-message-data/messages.md) and [entities](/user-guide/entities.md).

By default, all attributes from the control schema object are compared to the compare schema object attributes of the same name. An optional list of attribute names can be passed. When the list of attribute names is passed, only those attributes will be compared. The list of attribute names can also contain maps of attribute names for comparing values when the control object attribute name is not the same as the compare object attribute name.

## Example

``` ruby
module Something
  class Example
    include Schema

    attribute :some_attribute
    attribute :some_other_attribute
  end
end

context 'Equal' do
  example_1 = Something::Example.new
  example_1.some_attribute = 'some value'
  example_1.some_other_attribute = 'some other value'

  example_2 = Something::Example.new
  example_2.some_attribute = 'some value'
  example_2.some_other_attribute = 'some other value'

  fixture(Equality, example_1, example_2)
end
```
