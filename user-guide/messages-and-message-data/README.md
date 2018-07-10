# Overview

Messages are the atomic units of information exchanged between services and between applications and services.

Messages play the role of either a command or an event. A command is a message that represents an instruction sent to a [component](/glossary.md#component). A command is an input message. Commands are sent directly to components. They are a unidirectional transmission from one endpoint directly to another.

An event is a message that represents the effects of processing a command. When a component processes a command, the result of that process is the writing of one or more events. Those events are the source material that [event sourcing](/core-concepts/event-sourcing.md) and [pub/sub](/core-concepts/pub-sub.md) patterns are built upon.
