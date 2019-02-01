# Streams vs Queues

<div class="note custom-block">
  <p>
    What is a queue but a degenerate form of a stream?
  </p>
</div>

Unlike [message queues and buses](/glossary.md#message-queue-and-message-bus), [messages](/glossary.md#message) don't move from the [streams](/glossary.md#stream) they're written to. They can be read later by any number of services that they were not originally sent to so that those services can catch up on what has already happened, and either choose to process those messages or ignore them.

Once messages are written to a stream, they stay there. Conversely, with message queues or message buses, a message is removed from a queue and then passed to a service's [consumer](/glossary.md#consumer).

Under certain conditions, this removal of messages from queues to send them to service endpoints results in a message being lost before it is processed. More commonly, the loss of the acknowledgment that the message was indeed processed leads to the re-processing of the message, which is why idempotent logic is a necessity no matter the "guarantees" offered by the service bus software. These conditions eventually lead to ever more elaborate message bus features that complicate their use and operation.

No matter how much of the complexity of message buses is hidden by ever more elaborate features, they cannot be made to guarantee "only-once" message delivery, and they cannot be made to be as simple as message streams.

Streams eliminate the inherent complexity of message buses. Messages don't move from the streams services. Rather, the service maintains a pointer or _cursor_ to the message in the stream that it is processing. The cursor moves across the messages in the stream, advancing each time a message is processed. Once a message is processed, the service's cursor moves to the next message. But the messages are not removed from a stream in order to process them.

The most important difference between traditional Service-Oriented Architecture (SOA) and Microservices architecture is the replacement of service buses with the simplicity of streams.

SOA services are described as _Smart Pipes, Dumb Endpoints_. In the age of Microservice architecture, the axiom is reversed: _Dumb Pipes, Smart Endpoints_.

In the age of Microservices, the pipe is _dumb_ and the endpoint is _smart_. Meaning, the service consumer, rather than the bus, keeps track of which message to read next. Because of this, the risk of losing messages is eliminated, and the application code does not have to account for the potential loss of transactions. And neither does the team writing the application code.

Streams are not just message transports. They are also the sole data storage medium for the kind of entity data that is often stored in individual rows in database tables. This style of entity data storage is often referred to as [Event Sourcing](/glossary.md#event-sourcing).

With event sourcing, entity data is read from a series of events that are recorded in an event stream that holds the events for a single entity. An entity's data is stored by writing events to its stream, rather than writing to a database row. When the entity is "retrieved" from the store, the events are passed through an [entity projection](/glossary.md#entity-projection), which populates the entity's attributes.
