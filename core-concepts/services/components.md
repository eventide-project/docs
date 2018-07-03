---
sidebarDepth: 0
---

# Components

A component is a unit of design that represents a single business concern. These concerns are usually business processes, such as an account, a sale, and so forth.

All of the code needed to address the business concern, such as entities, handlers, projections, stores, are packaged into a component.

## Components and Services

The terms "service" and "component" are often used interchangeably, as there's frequently a one-to-one mapping between components and services. For example, a service hosting a component named `AccountComponent` will often be referred to a the "account service".

Components are the primary unit of composition of services. At a technical level, services are merely the infrastructure required to host one or more components in an operating system process. A component is hosted either by itself or with other components in a service.

## Packaging and Distribution

Components are typically packaged as RubyGems and distributed using a gem server. However, components could just as easily be packaged as a zip or tar file, or even as a git repository.
