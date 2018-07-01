---
sidebar: auto
---

# Glossary

## Actuator

The operation that can be invoked on a unit/module/class/etc that executes its principle objective and responsibility.

## Applicative

Applicative is similar to "application", as in "application logic". Because _services_ are not _applications_, the term "application logic" is out of place when talking about service implementation. The term "applicative", as in "applicative logic" is more appropriately used in this case.

## Autonomy

Autonomy is arguably the most critical quality of service design. It's the thing that can dictate whether you end up with a service architecture, or a web of web services organized as a _distributed monolith_. Autonomy is the quality that allows services to remain online when services that they communicate with become unavailable. Autonomy has the most profound influence on the design of services, the things that are inside of a service, and the things that are outside of a service. Without autonomy, services arguably aren't services at all.

## Category

A category is a group of streams all related to the same type of [entity](/glossary.md#entity). An analogy would be a class in an object-oriented system.

## Category Stream

A [stream](/glossary.md#stream) that contains the messages for every individual, identified stream in the category. For example, given the streams `account-123`, and `account-456`, the category stream, `account`, contains messages from both individual streams in the account category.

## Command

A command is a [message](/glossary.md#message) that represents an instruction sent to a [component](/glossary.md#component). A command is an input message. Commands are sent directly to components. They are a unidirectional transmission from one [endpoint](/glossary.md#endpoint) directly to another.

## Command Stream

A [stream](/glossary.md#stream) that contains only [command](/glossary.md#command) messages. Command streams are effectively the _input queues_ that services read their commands from.

## Component

A package of code that represents a single business concern and/or business process, such as an account, a sale, and so forth. It's all the code wrapped around that concern to operationalize it. It has one or more [entities](/glossary.md#entity), but very few. A component is often packaged as a RubyGem. A component is hosted either by itself or with other components in a [service](/glossary.md#service).

## Component Host

The component host is the outermost surface of an Eventide service. It runs right next to the operating system. It is the physical "service". It loads components into itself. It coordinates the threads that the consumers run on. It provides graceful shutdown for the components hosted in a service.

## Consumer

The consumer is the infrastructure that runs a subscription [reader](/glossary.md#message-reader) over streams, and plugs-in the [handlers](/glossary.md#handler) to those subscriptions to receive the messages they subscribe to.

## Endpoint

An endpoint is the source process that a message comes from or the destination process where it is sent is _endpoint_. The term _endpoint_ is often used informally as a substitute for _service_.

## Entity

The entity is the core logic of the [component](/glossary.md#component). It's the _domain model_. It's analogous to a Rails model, but that's only an analogy. An entity maps to an [event stream](/glossary.md#event-stream). One entity's data is contained in a single, individual event stream. An entity collects any important information from the events in the entity's stream. It's also a data object. An entity has a corresponding [projection](/glossary.md#entity-projection), which is used to copy data from the events to the entity object, either by setting the entity's attributes or by invoking its methods. The data that an entity has collected is also used in [handler](/glossary.md#handler) code to determine whether a [command](/glossary.md#command) should be processed.

## Entity Cache

When entities are retrieved via the [entity store](/glossary.md#entity-store), they are cached in-memory, and, optionally on disk.

## Entity Projection

An [entity's](/glossary.md#entity) data comes from [events](/glossary.md#event). An event is a thing that has happened in a process, or it's a change that has been made to an entity's state. Often, these two are one and the same. The projection is a mechanism that receives events as inputs, and modifies the state of an entity. When an entity is "retrieved", its events are _applied_ to it by the entity projection.

## Entity Snapshot

An entity snapshot is saved to disk (typically, in the message store) by the [entity store](/glossary.md#entity-store) as a performance optimization for warm-up time of the [entity cache](/glossary.md#entity-cache). The store saves a snapshot based on an assignable interval of events. For example, if the interval is set to 100, the store will save an entity's snapshot every 100 events that the store reads and projects onto the entity.

## Entity Stream

A [stream](/glossary.md#stream) that contains the messages for a single, identified entity. For example, a single account with the ID `123` has all of its events in its own stream, and that stream contains only the events for account 123.

## Entity Store

The entity store is used to do the retrieval of entities. It coordinates a [reader](/glossary.md#message-reader), an entity projection, and an entity cache. In reads only new events for an entity, projects them on to the cached entity, and updates the cache with the result of the projection. It may optionally record cached [snapshots](/glossary.md#snapshot) of entities to disk once every _n_ events read and projected.

## Event

A message that represents the results and effects of some command having been processed. It's a record of something that has happened or that has been processed. An [entity's](/glossary.md#entity) state is gathered from the events that have been written about the entity.

## Event Sourcing

Event sourcing is a style of [entity](/glossary.md#entity) storage that relies on reading entity data from a series of [events](/glossary.md#event) that are recorded in a [stream](/glossary.md#stream) that holds the events for a single entity. An entity's data is stored by writing events to its stream. When the entity is "retrieved" from the [event store](/glossary.md#event-store-pattern), the events are passed through an [entity projection](/glossary.md#entity-projection), which populates the entity's attributes.

## Event Stream

A [stream](/glossary.md#stream) that contains only [event](/glossary.md#event) messages. Each entity instance maps to a single, individual event stream. An entity's data is collected from the events in its stream.

## EventStore (Database)

One of the databases supported by Eventide. Event Store is an open source, special-purpose database designed specifically for high-availability event storage and event processing.

## Event Store (Pattern)

A database specifically structured for the storage and retrieval of [events](/glossary.md#event). See also: [message store](/glossary.md#message-store).

## Handler

Handlers are analogous to _controllers_ in a web MVC app. Handlers process the messages that are sent to services by writing them to [command streams](/glossary.md#command-stream) and [event streams](/glossary.md#event-streams).

## Message

A message is a data structure that represents either an instruction to be passed to a process ([command](/glossary.md#command)), or a record of something that has happened ([event](/glossary.md#event)) - typically in response to the processing of a command. Messages are written to the [message store](/glossary.md#message-store), and then read by [consumers](/glossary.md#consumer) that then dispatch messages to [handlers](/glossary.md#handler).

## Message Queue and Message Bus

A form of message transport that relies on more elaborate mechanisms and protocols for moving messages through a system and keeping track of which messages have already been processed. These technologies are notably failure-prone and can cause subtle errors where messages are not delivered and the delivery failure can go undetected by operators, developers, and testers.

## Message Reader

Retrieves ordered batches of messages from a single [stream](/glossary.md#stream), processing each message, one-by-one, into a block that can be passed to the reader's [actuator](/glossary.md#actuator).

## Message Store

Unlike a message broker, a message store acts not only as a message transport, but also a durable store of messages that have been written. A service receives commands by reading _new_ messages that have been written to the message store. Events are written to the message store in response to handling the inbound commands. Entity state is gathered from the event data that is written to the message store's message streams.

## Message Transport

Any technology that is used to send (_transport_) messages from one process to another. For example: a queue, a broker, or a raw network transport protocol like TCP or HTTP.

## Message Writer

Writes a message, or a batch of messages, to a single stream.

## Service

In its strictest sense, a service is an autonomous unit of system operations that is made up of [components](/glossary.md#component) that the service hosts.

## Stream

A stream is the fundamental unit of storage that a [message](/glossary.md#message) is stored in. When a message is written to the store, the [writer](/glossary.md#writer) must also be given the [stream name](/glossary.md#stream-name) that the event will be stored in. A stream is only stored in a single [message store](/glossary.md#message-store).

## Stream Name

A stream's name not only identifies the stream, but also its purpose. A stream name is a string that optionally includes an ID that is prefixed by a dash (-) character. The part of the stream preceding the dash is the _[category](/glossary.md#category)_, and the part following the dash is the ID. A stream with an ID is typically an [event stream](/glossary.md#event-stream) containing the events for the entity with that ID. For example: `account-123` is a stream for the account entity with an ID of 123. The `account` stream name is the [category stream](/glossary.md#category-stream) name that contains all of the aggregated messages from all individual, identified account streams. See the [overview of stream names](user-guide/stream-names/overview.html) in the user guide for more information.
