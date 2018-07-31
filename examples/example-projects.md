# Example Projects

Eventide example code is hosted on GitHub in the Eventide Examples org:

[https://github.com/eventide-examples](https://github.com/eventide-examples)

- - -

## Account Basics

[https://github.com/eventide-examples/account-basics](https://github.com/eventide-examples/account-basics)

The account basics project is the GitHub repository for the single-file, [Service at a Glance](./at-a-glance.md) example.

It's a great example for getting quick familiarity with all of the basic elements of a service and its component.

## Account Component

[https://github.com/eventide-examples/account-component](https://github.com/eventide-examples/account-component)

The account component project demonstrates:

- Command and event handlers
- Command idempotence
- Specialized transaction idempotence using the reservation pattern
- Expected version concurrency protection
- Event Sourcing
- Projections
- Stores
- Entity streams
- Category streams
- Command streams
- Replying to external services
- Client library for interaction with other services
- Consumers
- Component hosting
- Connection configuration
- Dependency substitution
- Testing
- Bundler-less runtime

## Funds Transfer Component

[https://github.com/eventide-examples/funds-transfer-component](https://github.com/eventide-examples/funds-transfer-component)

The funds transfer component demonstrates:

- Everything covered by the account component
- Coordination and workflows between multiple services
- Use of another service's client library
- Responding to replies from an external service

## Data Aggregation

(coming soon)

The data aggregation example demonstrates:

- Account statement data aggregation in SQL from account events
- Producing materialized views
- Specialized idempotence patterns for data aggregation
- Data command streams
