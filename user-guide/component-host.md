---
sidebar: auto
sidebarDepth: 0
---

# Component Host

The component host is the _machinery_ of a service. It's the part that is closest to the operating system. From a technical perspective, the component host _is_ the service.

The word "service" has both a logical architectural meaning and a physical architectural meaning. Physically, a _service_ is just a process running on a computer. [Components](/core-concepts/services/components.md) are what is run inside a service.

Components are _hosted_ inside a service. The [ComponentHost](https://github.com/eventide-project/component-host) is the machinery that does the hosting, and coordinates the interaction with the operating system, including loading and starting of components, [signal trapping](https://en.wikipedia.org/wiki/Signal_(IPC)) from the operating system, and the safe and graceful shutdown of a service's components.

The component host [starts a component's consumers](./consumers.md#starting-a-consumer), and runs them indefinitely until the operating system process is directed to shut down.

## Example

``` ruby
# The "Component" module maps consumers to their streams
# Until this point, handlers have no knowledge of which streams they process
# Starting the consumers starts the stream readers and gets messages flowing
# into the consumer's handlers
module Component
  def self.call
    account_command_stream_name = 'account:command'
    Consumer.start(account_command_stream_name)
  end
end

# ComponentHost is the runnable part of the service
# Register the Start module with the component host, then start the component and messages sent to its streams are dispatched to the handlers
component_name = 'account-component'
ComponentHost.start(component_name) do |host|
  host.register(Component)
end
```


## Facts

- start script
- many components
- starts consumers
- shut down
- actors
- supervising consumer actors

## Signals

- TODO


## Components

## Component Start Script
