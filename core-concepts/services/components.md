# Components

A component is a unit of design that represents a single business concern. These concerns are usually business processes, such as an account, a sale, and so forth.

All of the code needed to address the business concern, such as entities, handlers, projections, stores, are packaged into a component.

Components are the primary unit of composition of services. At a technical level, services are merely the infrastructure required to host one or more components in an operating system process.



A package of code that represents a single business concern and/or business process, such as an account, a sale, and so forth. It's all the code wrapped around that concern to operationalize it. It has one or more [entities](/glossary.md#entity), but very few. A component is often packaged as a RubyGem. A component is hosted either by itself or with other components in a [service](/glossary.md#service).

