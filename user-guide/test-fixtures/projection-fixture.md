# Projection Fixture

The projection fixture tests the projection of events onto an entity. It tests that the attributes of an event are copied to the entity. The attributes tested can be limited to a subset of attributes by specifying a list of attribute names. A map can be provided to compare attributes that have a different name on the source event than on the entity. The projection fixture also allows the testing of values copied from an event that are transformed before being assigned to an entity's attributes. The copy-and-transform assertion can also accept a map to test the transformation between attributes that have a different name on the source event than on the entity.

## Example

``` ruby
class SomeEntity
  include Schema::DataStructure

  attribute :id, String
  attribute :amount, Numeric, default: 0
  attribute :time, ::Time
  attribute :other_time, ::Time
end

class SomeEvent
  include Messaging::Message

  attribute :example_id, String
  attribute :amount, Numeric, default: 0
  attribute :time, String
  attribute :some_time, String
end

class SomeProjection
  include EntityProjection

  entity_name :some_entity

  apply SomeEvent do |some_event|
    some_entity.id = some_event.example_id
    some_entity.amount = some_event.amount
    some_entity.time = Time.parse(some_event.time)
    some_entity.other_time = Time.parse(some_event.some_time)
  end
end

context "SomeProjection" do
  some_event = SomeEvent.new
  some_event.example_id = SecureRandom.uuid
  some_event.amount = 11
  some_event.time = Time.utc(2000)
  some_event.some_time = Time.utc(2000) + 1

  some_entity = SomeEntity.new
  some_projection = SomeProjection.build(entity)

  fixture(
    EntityProjection::Fixtures::Projection,
    some_projection,
    some_event
  ) do |projection|

    projection.assert_attributes_copied([
      { :example_id => :id },
      :amount
    ])

    projection.assert_transformed_and_copied(:time) { |v| Time.parse(v) }
    projection.assert_transformed_and_copied(:some_time => :other_time) { |v| Time.parse(v) }
  end
end
```

## Projection Fixture Facts

- The principle concern of a handler test is the transfer of data from an event to an entity
- The fixture tests a single event projection onto an entity, and its effects on the entity
- The fixture can accommodate data copied between attributes that have different names on an event versus an entity
- The fixture can accommodate data that is transformed when it is copied from an event to an entity

## EntityProjection::Fixtures::Projection Class

The `Projection` class is a concrete class from the [`EntityProjection::Fixtures` library](../libraries.md#projection-fixtures) and namespace.

The `EntityProjection::Fixtures::Projection` class provides:

- The instance actuator `.()` (or `call` method) that begins execution of the fixture and the actuation of its projection with the specified input event and entity
- The `assert_attributes_copied` method to test that attributes are copied from the source event to the entity, including mapping between attributes that have different names on the event versus the entity
- The `assert_transformed_and_copied` method to test the copying of attributes form the event and the entity where the attribute values are transformed as well as copied

## Running the Fixture

Running the test is no different than [running any TestBench test](http://test-bench.software/user-guide/running-tests.html).

For example, given a test file named `projection.rb` that uses the projection fixture, in a directory named `test`, the test is executed by passing the file name to the `ruby` executable.

``` bash
ruby test/projection.rb
```

The test script and the fixture work together as if they are part of the same test context, preserving output nesting between the test script file and the test fixture.

## Projection Fixture Output

``` text
SomeProjection
  Apply SomeEvent to SomeEntity
    Copied
      example_id => id
      amount
    Transformed and copied
      time
    Transformed and copied
      some_time => other_time
```

The output below the "SomeProjection" line is from the projection fixture. The "SomeProjection" line is from the `test/projection.rb` test script file that is actuating the projection fixture.

## Detailed Output

In the event of any error or failed assertion, the test output will include additional detailed output that can be useful in understanding the context of the failure and the state of the fixture itself and the objects that it's testing.

The detailed output can also be printed by setting the `TEST_BENCH_DETAIL` environment variable to `on`.

``` bash
TEST_BENCH_DETAIL=on ruby test/projection.rb
```

``` text
SomeProjection
  Projection Class: SomeProjection
  Apply SomeEvent to SomeEntity
    Event Class: SomeEvent
    Entity Class: SomeEntity
    Attributes
      example_id => id
        SomeEvent Value: "00000001-0000-4000-8000-000000000000"
        SomeEntity Value: "00000001-0000-4000-8000-000000000000"
      amount
        SomeEvent Value: 11
        SomeEntity Value: 11
    Transformed and copied
      time
        SomeEvent Value (String): "2000-01-01T00:00:00.000Z"
        SomeEntity Value (Time): 2000-01-01 00:00:00 UTC
    Transformed and copied
      some_time => other_time
        SomeEvent Value (String): "2000-01-01T00:00:00.011Z"
        SomeEntity Value (Time): 2000-01-01 00:00:00.011 UTC
```
