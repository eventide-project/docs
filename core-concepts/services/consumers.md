---
sidebarDepth: 0
---

# Consumers

Consumers are the element that feeds messages into a component at runtime.

A consumer continually reads messages from a single stream and dispatches them to one or more handlers.

Many consumers can be hosted together in a single service, allowing a component to be fed messages from many streams.

In addition, a consumer keeps track of its reader's progress through a stream, and controls polling rates, and pre-fetching batches of messages, and the dispatching of messages to handlers.

## Example Consumer

``` ruby
class Consumer
  include Consumer::Postgres

  handler SomeHandler
  handler SomeOtherHandler
end
```
