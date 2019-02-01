# Uses of Streams

Streams serve a number purposes in the Eventide toolkit:

- Applicative entity state
- Command transport/queue
- Entity snapshot storage
- Consumer position storage

## Applicative Entity State

In an [event-sourced](/glossary.md#event-sourcing) system, an entity's state is stored as a series of [events](/glossary.md#event) in an [event stream](/glossary.md#event-stream). The entity's attributes are populated by _applying_ the event's attributes to the entity. Because messaging systems make use of the [publish-subscribe](/glossary.md#pub-sub) pattern, events will be recorded that represent the effects of processing [commands](/glossary.md#command). These events also represent changes in the entities' state. Because of this property of event-sourced systems, storing [applicative](/glossary.md#applicative) state in relational database rows is largely necessary.

Example entity state stream name: `account-123`

## Command Transport

[Service](/glossary.md#service) [components](/glossary.md#component) communicate by sending command messages to each other. While this can be done with specialized _message queue_ and _message bus_ software, streams are often a better choice for message _transport_. This is especially true in cases where messages cannot be lost in-transit, and must be processed. For messages that don't strictly have to be processed, more ephemeral kinds of transports, like message buses, queues, or sockets can be used.

Example command transport stream name: `account:command-123`

## Entity Snapshot Storage

As a performance optimization option, the current state of an entity at a point in time can be saved. This can be a useful performance enhancement when starting a service and a component's [entity cache](/glossary.md#entity-cache) is empty. If an entity is [projected](/glossary.md#projection) from its stream from the very start of the stream, and that stream has thousands or millions of events, it could take an inordinate amount of time to retrieve the entity. The solution to this problem is the periodic persistence of the entity's state. When an entity is retrieved that has not previously been cached, the entity's cache record is initialized from the last stored snapshot of the entity, and only the most recent events are retrieved from the entity's stream and projected onto the entity.

Example entity snapshot stream name: `account:snapshot-123`

## Consumer Position Storage

Another performance optimization that addresses a component startup time, a message consumer that feeds command or event messages into a component will periodically save the position of the message currently being processed. When a component is restarted, rather than re-process all persisted messages from the start of time, the consumer reads the last recorded message number, called _position_, and starts the consumer from that point in the input stream.

Example position storage stream name: `account:command+position-123` or `account:position-123`
