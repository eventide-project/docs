---
sidebar: auto
---

# Pub/Sub (Publish and Subscribe)

In a publish and subscribe system, events are written to a stream by one [endpoint](/glossary.md#endpoint) and can be reacted to by any number of other endpoints, or even by the endpoint that wrote the event.

![Commands and Events](../images/pub-sub.png)

Pub/Sub pattern is a [messaging](./messages-and-messaging/messaging.md) pattern that enables a loose coupling of different parts of a system, allowing individual parts to be changed independently without concerns for other parts being affected by the change.

As is the case with all messaging patterns, as long as the structure and content of the messages flowing between parts of a system do not change, individual parts are free to change without regard for other parts of the system. This is why is critical to pay significant attention to getting the message _schemas_ right so that they do not need to change later due to a need to correct oversights.

::: warning
Pub/sub only applies to events and event streams/categories. It's not a pattern that should be used for commands and command streams/categories.
:::
