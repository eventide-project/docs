# Service Facts

##### Services don't respond to queries

Services don't return data. They don't have `GET` APIs, or respond to queries. Services process transactions. They _do_ things. They aren't data access points. They receive instructions as messages and perform work. Services that can return data cause the services that request the data to loose their [autonomy](/glossary.md#autonomy).

##### Services don't fail when other services are unavailable

If a service that communicates with another service fails because the other service is unavailable, then the service is not _autonomous_. Services are autonomous. If a service isn't autonomous, then it's really not a service at all. A system of services that are not autonomous is not a service architecture. It's a _distributed monolith_.

##### Services communicate by asynchronous messaging

Services receive _[commands](/glossary.md#command)_, process those commands, and communicate the status of that processing by issuing _[events](/glassary.md#event)_. A service that sends a command message to another service does not know the outcome of processing that command until the other service issues the resulting event and the originating service receives the event.

##### Services are made of one or more autonomous components

Strictly-speaking, services are the infrastructural machinery that sits between the operating system and the service's business logic. The business logic itself is housed in a [component](/glossary.md#component). The service infrastructure provides consumers of inbound messages and dispatches the messages to a component's [handlers](/glossary.md#handler). The handlers then interact with the component's [entity](/glossary.md#entity) (or entities) and outputs other messages in response. The combination of entities and handlers are where the business logic resides. Services may host one or more components. The term _service_ is often used interchangeably with _component_. While this isn't strictly and technically accurate, it's a common informal way of speaking about services and components. The informal ambiguity is especially conspicuous when the service hosts only a single business component.

##### The word "service" can refer to something logical or physical

The word "service" can refer to something logical or physical. Getting them confused can lead to misunderstandings that weaken the necessary separation between services and between components. When used to refer to something physical, the word "service" refers to the infrastructural machinery that sits between the operating system and the business component logic. When used logically, service can represent a number of physical services that are related to a single business function.  Which meaning is being employed depends on context.

##### Services represent business processes

A service is an implementation of a business process. Services cooperate together in more elaborate business processes. Services track the multiple steps in a process, receiving commands and events from other services or applications, and advancing to the next step based on the outcome of that processing.

##### Services are state machines

The core logic of a service is structured as a state machine. The state machine entity gathers the data from various commands and events that the service processes, and informs the surrounding business logic about what steps in the process that the service implements to take next.

##### Services are not APIs around entities

A common misconception is that services are APIs wrapped around traditional data [entities](/glossary.md#entity). This perspective is the result of seeing services as typical web APIs without realizing that services are more appropriately modeled as processes and state machines. An _entity service_ is an antipattern that is the chief cause of ending up with a _distributed monolith_ rather than a service architecture. In a service architecture it's unlikely that the data of a traditional aggregate entity, like an Product with a name, a price, and a quantity-in-stock would be housed in the same service.
