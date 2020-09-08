# Overview

Fixtures are pre-defined, reusable test abstractions. The fixtures provided by the Eventide toolkit bring a high level of ease, consistency, and guidance to testing the full extent of the parts of a solution, including handlers, projections, writers, entities, and messages.

## Fixtures

The Eventide toolkit provides a comprehensive set of fixtures to facilitate and expedite the implementation of automated tests.

- [Handler Fixture](./handler-fixture.md)
- [Message Fixture](./message-fixture.md)
- [Message Metadata Fixture](./message-metadata-fixture.md)
- [Writer Fixture](./writer-fixture.md)
- [Projection Fixture](./projection-fixture.md)
- [Schema Equality Fixture](./schema-equality-fixture.md)
- [Schema Assignment Fixture](./schema-assignment-fixture.md)

## Libraries

The fixtures are grouped into three namespaces and libraries.

### Messaging::Fixtures

**Gem Name**

``` text
evt-messaging-fixtures
```

**Loading the Library**

``` ruby
require 'messaging/fixtures'
```

GitHub: [https://github.com/eventide-project/messaging-fixtures](https://github.com/eventide-project/messaging-fixtures)

## EntityProjection::Fixtures

**Gem Name**

``` text
evt-entity_projection-fixtures
```

**Loading the Library**

``` ruby
require 'entity_projection/fixtures'
```

GitHub: [https://github.com/eventide-project/entity-projection-fixtures](https://github.com/eventide-project/entity-projection-fixtures)

## Schema::Fixtures

**Gem Name**

``` text
evt-schema-fixtures
```

**Loading the Library**

``` ruby
require 'schema/fixtures'
```

GitHub: [https://github.com/eventide-project/schema-fixtures](https://github.com/eventide-project/schema-fixtures)

## TestBench

Fixtures in Eventide are implemented using the TestBench test framework.

A fixture is just a plain old Ruby object that includes the TestBench API. By including the `TestBench::Fixture` module into a Ruby object, the object becomes an automated test, no different from a test script that a developer would write in a Ruby file. A fixture acquires all of the methods available to any TestBench test, including `context`, `test`, `assert`, `refute`, `assert_raises`, and `refute_raises`.

Visit the TechBench website for more: [http://test-bench.software/](http://test-bench.software/)
