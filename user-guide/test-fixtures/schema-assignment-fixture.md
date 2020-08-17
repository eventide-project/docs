# Schema Assignment Fixture

The schema assignment fixture tests that a schema instance's attributes have been assigned a value. The fixture is used to make sure that a schema object's attributes have been mutated in the course of some procedure.

If an attribute is declared with a default value, then the attribute must have been assigned another value for it to be considered mutated.

By default, all of schema object's attributes are asserted to have been mutated. An optional list of attribute names can be passed. When the list of attribute names is passed, only those attributes will be compared.

## Example

``` ruby
class Something
  include Schema

  attribute :some_attribute
  attribute :some_other_attribute
end

context 'Assigned' do
  example = Something.new
  example.some_attribute = 'some value'
  example.some_other_attribute = 'some other value'

  fixture(Assignment, example)
end
```

## Running the Fixture

Running the test is no different than [running any TestBench test](http://test-bench.software/user-guide/running-tests.html).

For example, given a test file named `schema_assignment.rb` that uses the schema assignment fixture, in a directory named `test`, the test is executed by passing the file name to the `ruby` executable.

``` bash
ruby test/schema_assignment.rb
```

The test script and the fixture work together as if they are part of the same test context, preserving output nesting between the test script file and the test fixture.

## Schema Assignment Fixture Output

``` text
Assigned
  Schema Assignment: Example
    Attributes
      some_attribute
      some_other_attribute
```

## Detailed Output

In the event of any error or failed assertion, the test output will include additional detailed output that can be useful in understanding the context of the failure and the state of the fixture itself and the objects that it's testing.

The detailed output can also be printed by setting the `TEST_BENCH_DETAIL` environment variable to `on`.

``` bash
TEST_BENCH_DETAIL=on ruby test/schema_assignment.rb
```

``` text
Assigned
  Schema Assignment: Example
    Class: Something::Example
    Attributes
      some_attribute
        Default Value: nil
        Assigned Value: "some value"
      some_other_attribute
        Default Value: nil
        Assigned Value: "some other value"
```

## Actuating the Assignment Fixture

The fixture is executed using TestBench's `fixture` method.

``` ruby
fixture(Schema::Fixtures::Assignment, schema, attribute_names=[])
```

The first argument sent to the `fixture` method is always the `Schema::Fixtures::Assignment` class. Subsequent arguments are the specific construction parameters of the assignment fixture.

When the list of attribute names is not provided, it defaults to all of the attribute names of the schema object.

**Parameters**

| Name | Description | Type |
| --- | --- | --- | --- |
| schema | The schema object whose attributes will be tested for assignment | Schema |
| attribute_names | Optional list of attribute names to check for assignment | Array of Symbol |

## Limiting the Test to a Subset of Attributes

The Assignment fixture can limit the attribute tests to a subset of attributes by specifying a list of attribute names.

``` ruby
context 'Equal' do
  example = Something::Example.new
  example.some_attribute = 'some value'

  attribute_names = [:some_attribute]

  fixture(Assignment, example, attribute_names)
end
```

``` text
Assigned
  Schema Assignment: Example
    Attributes
      some_attribute
```

## Determination of Assignment and Default Values

An attribute is determined to have been assigned a value if the attribute's value is no longer equal to its default value.

An attribute's default value may be defined as something other than `nil`.

If an attribute has been explicitly assigned a value that is equal to its default value, it's considered to have not been assigned at all, which is considered a failed assignment test.

In order for assignment tests to pass, the value of attributes have to be other than their default values.

``` ruby
module DefaultValue
  class Example
    include ::Schema

    attribute :some_attribute, default: 'some default value'
    attribute :some_other_attribute
  end
end

context 'Assigned' do
  example = DefaultValue::Example.new
  example.some_attribute = 'some default value'
  example.some_other_attribute = nil

  fixture(Assignment, example)
end
```

``` text
Assigned
  Schema Assignment: Example
    Class: DefaultValue::Example
    Attributes
      some_attribute
        Default Value: 'some default value'
        Assigned Value: 'some default value'
        /schema-fixtures/lib/schema/fixtures/assignment.rb:30:in `block (4 levels) in call': Assertion failed (TestBench::Fixture::AssertionFailure)
      some_other_attribute
        Default Value: nil
        Assigned Value: nil
        /schema-fixtures/lib/schema/fixtures/assignment.rb:30:in `block (4 levels) in call': Assertion failed (TestBench::Fixture::AssertionFailure)
```
