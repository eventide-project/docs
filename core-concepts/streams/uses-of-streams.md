# Uses of Streams

Streams serve a number purposes in the Eventide toolkit:

- Application state
- Message queue
- Entity snapshot storage
- Consumer position storage

## Application State

In an [event-sourced](/glossary.md#event-sourcing) system, an entity's state is stored as a series of [events](/glossary.md#event) in an [event stream](/glossary.md#event-stream). The entity's attributes are populated by _applying_ the event's attributes to the entity. Because messaging systems make use of the [Publish/Subscribe](/glossary.md#pub-sub) pattern, and Pub/Sub is based on events, events will be recorded as a matter of components interacting with each other. These events also represent changes in the state of application entities. Because of this property of event-sourced systems, storing [applicative](/glossary.md#applicative) state in relational database rows is largely unnecessary except as matter of caching and performance optimization.

## Message Queue

[Service](/glossary.md#service) [components](/glossary.md#component) communicate by sending messages to each other. While this can be done with specialized _message queue_ and _message bus_ software, streams are often a better choice for message _transport_. This is especially true in cases where messages cannot afford to be lost in-transit, and therefore must be persisted. For messages that don't strictly have to be processed, more ephemeral kinds of transports, like message buses, queues, or sockets can be used.

## Entity Snapshot Storage

As a performance optimization option, the current state of an entity at a point in time can be saved. This is a useful feature for optimizing performance immediately after a component is restarted and its [entity cache](/glossary.md#entity-cache) is empty. If an entity is [projected](/glossary.md#entity-projection) from the very start of its stream, and that stream has thousands or millions of events, it could take an inordinate amount of time to retrieve the entity. The solution to this problem is the periodic persistence of the entity's state. When an entity is retrieved, the entity's cache record is initialized from the last stored snapshot of the entity, and only the most recent events are retrieved from the entity's stream and projected onto the entity.

## Consumer Position Storage

A message consumer that feeds command or event messages into a [component's](/glossary.md#component) [handlers](/glossary.md#handler) will periodically save the position of the message currently being processed. When a component is restarted, rather than re-process all persisted messages since the start of time, the consumer reads the last recorded message number, called _position_, and starts the consumer from that point in the input stream.
