# Commands and Events

[Commands](/glossary.md#command) and [events](/glossary.md#event) are the fundamental building blocks of a [messaging](./messaging.md) system.

Commands and events are both kinds of [messages](./). There is nothing material that differentiates commands and events from any kind of message. There isn't a special base class or mixin that causes a message to act either as a command or an event. Messages play the role of either a command or an event, but their implementation is largely identical except for the presence of attributes that may record the different timestamps of the processes that they participate in.

A command is a message that represents an instruction sent to a [component](/glossary.md#component). A command is an input message. Commands are sent directly to components. They are a unidirectional transmission from one endpoint directly to another.

An event is a message that represents the effects of processing a command.

![Commands and Events](../../images/commands-and-events.png)

When a component processes a command, the result of that process is the writing of one or more events. Those events are the source material that [event sourcing](../event-sourcing.md) and [pub/sub](../pub-sub.md) patterns are built upon.
