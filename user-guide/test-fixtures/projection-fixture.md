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

