# Schema Equality Fixture

The schema equality fixture tests the comparison between two implementations of [Schema::DataStructure](https://github.com/eventide-project/schema), such as [messages](/user-guide/messages-and-message-data/messages.md) and [entities](/user-guide/entities.md).

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
- An optional list of attribute names can given to limit the testing to a subset of attributes
- The list of attribute names can contain maps of attribute names to allow comparison of attributes of different names
- The attributes of objects of different classes can be compared by disabling the fixture's class comparison

## Schema::Fixtures::Equality Class

The `Equality` class is a concrete class from the [`Schema::Fixtures` library](/user-guide/libraries.md#schema-fixtures) and namespace.

The `Schema::Fixtures::Equality` class provides:

- The instance actuator `.()` (or `call` method) that begins execution of the fixture and the comparison of the two schema objects

## Running the Fixture

Running the test is no different than [running any TestBench test](http://test-bench.software/user-guide/running-tests.html).

For example, given a test file named `schema_equality.rb` that uses the schema equality fixture, in a directory named `test`, the test is executed by passing the file name to the `ruby` executable.

``` bash
ruby test/schema_equality.rb
```

The test script and the fixture work together as if they are part of the same test context, preserving output nesting between the test script file and the test fixture.

## Schema Equality Fixture Output

``` text
Equal
  Schema Equality: Something, Something
    Classes are the same
    Attributes
      some_attribute
      some_other_attribute
```

The output below the "Equal" line is from the equality fixture. The "Schema Equality" line is from the `test/schema_equality.rb` test script file that is actuating the equality fixture.

## Detailed Output

In the event of any error or failed assertion, the test output will include additional detailed output that can be useful in understanding the context of the failure and the state of the fixture itself and the objects that it's testing.

The detailed output can also be printed by setting the `TEST_BENCH_DETAIL` environment variable to `on`.

``` bash
TEST_BENCH_DETAIL=on ruby test/schema_equality.rb
```

``` text
Equal
  Schema Equality: Something, Something
    Control Class: Something
    Compare Class: Something
    Classes are the same
    Attributes
      some_attribute
        Control Value: "some value"
        Compare Value: "some value"
      some_other_attribute
        Control Value: "some other value"
        Compare Value: "some other value"
```

## Actuating the Schema Equality Fixture

The fixture is executed using TestBench's `fixture` method.

``` ruby
fixture(Schema::Fixtures::Equality, control, compare, attribute_names=nil, ignore_class: false)
```

The first argument sent to the `fixture` method is always the `Schema::Fixtures::Equality` class. Subsequent arguments are the specific construction parameters of the schema equality fixture.

An optional list of attribute names can be passed. When the list of attribute names is passed, only those attributes will be compared. The list of attribute names can also contain maps of attribute names for comparing values when the control attribute name is not the same as the compare attribute name.

When the list of attribute names is not provided, it defaults to the list of all of the names of the control schema object's attributes.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| control | Control schema object that is the baseline for the comparison | Schema |
| compare | Schema object that is compared to the control object | Schema |
| attribute_names | Optional list of attribute names to compare, or maps of compare attribute name to control attribute name | Array of Symbol or Hash |

## Limiting the Test to a Subset of Attributes

The Equality fixture can limit the attribute tests to a subset of attributes by specifying a list of attributes names.

``` ruby
context 'Equal' do
  example_1 = Something::Example.new
  example_1.some_attribute = 'some value'
  example_1.some_other_attribute = 'some other value'

  example_2 = Something::Example.new
  example_2.some_attribute = 'some value'
  example_2.some_other_attribute = SecureRandom.hex

  attribute_names = [:some_attribute]

  fixture(Equality, example_1, example_2, attribute_names)
end
```

``` text
Equal
  Schema Equality: Example, Example
    Classes are the same
    Attributes
      some_attribute
```

## Comparing Different Attribute Names Using a Map

The equality of the attribute values of two different schema classes that have different attribute names that represent the same values can be tested using a map of the attribute names.

The typical use case for this is the comparison of schema objects of different classes with different attribute names. In this case, the `ignore_class: true` argument usually accompanies a map of attribute names.

``` ruby
module Something
  class YetAnotherExample
    include Schema

    attribute :some_attribute
    attribute :yet_another_attribute
  end
end

context 'Equal' do
  example = Something::Example.new
  example.some_attribute = 'some value'
  example.some_other_attribute = 'some other value'

  other_example = Something::YetAnotherExample.new
  other_example.some_attribute = 'some value'
  other_example.yet_another_attribute = 'some other value'

  map = [
    :some_attribute,
    { :some_other_attribute => :yet_another_attribute }
  ]

  fixture(Equality, example, other_example, map, ignore_class: true)
end
```

``` text
Equal
  Schema Equality: Example, YetAnotherExample
    Class comparison is ignored
    Attributes
      some_attribute
      some_other_attribute => yet_another_attribute
```

Note that when an attribute map is used, the attribute name printed by the fixture is the pair of mapped attributes.

## Ignoring the Class Comparison

By default, when two schema objects are compared, if the objects have different classes, they're not considered equal unless the class comparison is disabled.

The class comparison can be disabled by passing `true` as the value of the `ignore_class` keyword argument.

``` ruby
module Something
  class OtherExample
    include Schema

    attribute :some_attribute
    attribute :some_other_attribute
  end
end

context 'Equal' do
  example = Something::Example.new
  example.some_attribute = 'some value'
  example.some_other_attribute = 'some other value'

  other_example = Something::OtherExample.new
  other_example.some_attribute = 'some value'
  other_example.some_other_attribute = 'some other value'

  attribute_names = [:some_attribute]

  fixture(Equality, example, other_example, ignore_class: true)
end
```

``` text
Equal
  Schema Equality: Example, OtherExample
    Attributes
      some_attribute
      some_other_attribute
```
