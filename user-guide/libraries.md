---
sidebar: auto
pageClass: libraries
---

# Libraries

The Eventide toolkit is made of the following libraries:

## Top Level Libraries

### eventide-postgres
Event-Oriented Autonomous Services Toolkit for Postgres<br/>
[github.com/eventide-project/eventide-postgres](https://github.com/eventide-project/eventide-postgres)

## Core Libraries

### message-db
Microservice native event store and message store for Postgres
[github.com/eventide-project/message-db](https://github.com/eventide-project/message-db)

### messaging
Common primitives for platform-specific messaging implementations<br/>
[github.com/eventide-project/messaging](https://github.com/eventide-project/messaging)

### message_store
Common primitives for platform-specific message store implementations<br/>
[github.com/eventide-project/message-db](https://github.com/eventide-project/message-db)

### entity_projection
Projects event data into an entity<br/>
[github.com/eventide-project/entity-projection](https://github.com/eventide-project/entity-projection)

### entity_store
Store of entities that are projected from streams<br/>
[github.com/eventide-project/entity-store](https://github.com/eventide-project/entity-store)

### entity_cache
Cache of entities retrieved by an entity-store, with in-memory temporary and on-disk permanent storage options<br/>
[github.com/eventide-project/entity-cache](https://github.com/eventide-project/entity-cache)

### consumer
Maintains a long running subscription to an event stream<br/>
[github.com/eventide-project/consumer](https://github.com/eventide-project/consumer)

### component_host
Host components inside a single physical process<br/>
[github.com/eventide-project/component-host](https://github.com/eventide-project/component-host)

## Postgres Libraries

### messaging-postgres
Implementation of messaging primitives for Postgres<br/>
[github.com/eventide-project/messaging-postgres](https://github.com/eventide-project/messaging-postgres)

### message_store-postgres
Message store implementation for Postgres<br/>
[github.com/eventide-project/message-store-postgres](https://github.com/eventide-project/message-store-postgres)

### entity_snapshot-postgres
Projected entity snapshotting for Postgres<br/>
[github.com/eventide-project/entity-snapshot-postgres](https://github.com/eventide-project/entity-snapshot-postgres)

### consumer-postgres
Consumer implementation for Postgres<br/>
[github.com/eventide-project/consumer-postgres](https://github.com/eventide-project/consumer-postgres)

## Code Generators

### command_line-component_generator
Command line project generator for components built using the Postgres implementation<br/>
[github.com/eventide-project/command-line-component-generator](https://github.com/eventide-project/command-line-component-generator)

## Utility Libraries

### attribute
Define an attribute on a class using an imperative API<br/>
[github.com/eventide-project/attribute](https://github.com/eventide-project/attribute)

### schema
Primitives for schema and structure<br/>
[github.com/eventide-project/schema](https://github.com/eventide-project/schema)

### dependency
Declare dependencies that have null object or substitute default values<br/>
[github.com/eventide-project/dependency](https://github.com/eventide-project/dependency)

### diagnostics-sample
Sampling and measurement of execution cycles
[https://github.com/eventide-project/diagnostics-sample](https://github.com/eventide-project/diagnostics-sample)

### identifier-uuid
UUID identifier generator with support for dependency configuration for real and null object implementations<br/>
[github.com/eventide-project/identifier-uuid](https://github.com/eventide-project/identifier-uuid)

### initializer
Generates initializers and attributes<br/>
[github.com/eventide-project/initializer](https://github.com/eventide-project/identifier-uuid)

### settings
Settings data access and assignment<br/>
[github.com/eventide-project/settings](https://github.com/eventide-project/identifier-uuid)

### log
Logging to STD IO with levels, tagging, and coloring<br/>
[github.com/eventide-project/log](https://github.com/eventide-project/log)

### transform
Common interface for object and format transformation, and transformer discovery<br/>
[github.com/eventide-project/transform](https://github.com/eventide-project/transform)

### telemetry
In-process telemetry based on observers<br/>
[github.com/eventide-project/telemetry](https://github.com/eventide-project/telemetry)

### try
Attempt an execution, and determine its success<br/>
[github.com/eventide-project/try](https://github.com/eventide-project/try)

### retry
Retry an execution that terminates with an error, with optional backoff cycles<br/>
[github.com/eventide-project/retry](https://github.com/eventide-project/retry)

### cycle
Generalized retry<br/>
[github.com/eventide-project/cycle](https://github.com/eventide-project/cycle)

### casing
Convert the case of strings, symbols, and hash keys, including camelCase, PascalCase, and underscore_case<br/>
[github.com/eventide-project/casing](http://github.com/eventide-project/casing)

### validate
Interface and protocol for validating and validation discovery<br/>
[github.com/eventide-project/validate](https://github.com/eventide-project/validate)

### set_attributes
Set an object's attributes from a hash or an object that implements to_h<br/>
[github.com/eventide-project/set-attributes](https://github.com/eventide-project/set-attributes)

### clock
Clock interface with support for dependency configuration for real and null object implementations<br/>
[github.com/eventide-project/clock](https://github.com/eventide-project/clock)

### subst_attr
Declare attributes that have default implementations that are substitutes or null objects<br/>
[github.com/eventide-project/subst-attr](https://github.com/eventide-project/subst-attr)

### mimic
Copy a class's instance interface to an anonymous, new object that acts as a substitutable mimic for the class<br/>
[github.com/eventide-project/mimic](https://github.com/eventide-project/mimic)

### invocation
Extract information about a method's invocation including the method name, parameter names, and parameter values<br />
[github.com/eventide-project/invocation](https://github.com/eventide-project/invocation)

### virtual
Virtual method declaration<br/>
[github.com/eventide-project/virtual](https://github.com/eventide-project/virtual)

### reflect
Reflection of inner namespaces used for protocol discovery<br/>
[github.com/eventide-project/reflect](https://github.com/eventide-project/reflect)

### async_invocation
Return value for async method that is accidentally invoked synchronously<br/>
[github.com/eventide-project/async-invocation](https://github.com/eventide-project/async-invocation)

### configure
Generates class level configure methods<br/>
[github.com/eventide-project/configure](https://github.com/eventide-project/configure)

### collection
Type-checked set<br/>
[github.com/eventide-project/collection](https://github.com/eventide-project/collection)

## View Data Libraries

### view_data-commands
Message schemas for data-oriented command streams used to populate view databases<br/>
[github.com/eventide-project/view-data-commands](https://github.com/eventide-project/view-data-commands)

### view_data-pg
Populate Postgres view databases from event streams<br/>
[github.com/eventide-project/view-data-pg](https://github.com/eventide-project/view-data-pg)

## Third Party Libraries

### pg
Ruby interface to the PostgreSQL RDBMS<br/>
[github.com/ged/ruby-pg](https://github.com/ged/ruby-pg)

### ntl-actor
Implementation of actor pattern for Ruby<br/>
[github.com/ntl/actor](https://github.com/ntl/actor)

### terminal_colors
Apply ANSI terminal colors to strings<br/>
[github.com/ntl/terminal-colors](https://github.com/ntl/terminal-colors)

### test_bench
A frugal test framework for Ruby<br/>
[github.com/ntl/test-bench](https://github.com/ntl/test-bench)

## NPM Packages

### message-db

Microservice native event store and message store for Postgres
[https://github.com/message-db/message-db-npm-package](https://github.com/message-db/message-db-npm-package)
