# Messaging

_Messaging_ is the comprehensive term that refers to architectures and techniques that separate different aspects of a system into independent processes that communicate and collaborate with each other by sending and receiving messages.

![Messaging](../../images/messaging.png)

The term _messaging_ doesn't imply any specific kind of architectural style. It applies to any architecture that relies on message passing.

Both event sourcing and autonomous services architectural styles are examples of a _messaging architecture_.

## Message Transport

It's often presumed in a _messaging_ architecture that some kind of [message transport](/glossary.md#message-queue-and-message-bus) is used. Generally speaking, that transport can be a broad range of options, from something as primitive to a bare network socket to something as elaborate as an Enterprise Service Bus (ESB). In the least, some mechanism is present in the solution that allows messages to be carried from one place to another.

## Endpoints

The generic term for the source process that a message comes from or the destination process where it is sent is _endpoint_.

The term _endpoint_ is often used informally as a substitute for _service_ in Service-Oriented Architectures, like Microservice Architecture.
