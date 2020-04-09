---
sidebar: auto
sidebarDepth: 0
---

# Component Host

The component host is the _machinery_ of a service. It's the part that is closest to the operating system. From a technical and physical perspective, the component host _is_ the service.

The word "service" has both a logical architectural meaning and a physical architectural meaning. Physically, a _service_ is just a process running on a computer. [Components](/core-concepts/services/components.md) are what is run inside a service.

Components are _hosted_ inside a service. The [ComponentHost](https://github.com/eventide-project/component-host) is the machinery that does the hosting, and coordinates the interaction with the operating system, including loading and starting of components, [signal trapping](https://en.wikipedia.org/wiki/Signal_(IPC)) from the operating system, and the safe and graceful shutdown of a service's components.

The component host [starts a component's consumers](./consumers.md#starting-a-consumer), and runs them indefinitely until the operating system process is directed to shut down.

## Example

``` ruby
# The "component initiator" binds consumers to their streams and starts
# the consumers
# Until this point, handlers have no knowledge of which streams they process
# Starting the consumers starts the stream readers and gets messages flowing
# into the consumer's handlers
module SomeComponent
  def self.call
    command_stream_name = 'something:command'
    SomeConsumer.start(command_stream_name)
  end
end

# ComponentHost is the runnable part of the service
# Register a component module with the component host, then start the host
# and messages sent to its streams are dispatched to the handlers
component_name = 'some-component'
ComponentHost.start(component_name) do |host|
  host.register(SomeComponent)
end
```

## Facts

- Component host can run any number of components
- Each component runs in its own isolated [actor](https://github.com/ntl/actor)
- Each component uses its own message store [session](./session.md)
- When the host shuts down, each subordinate consumer is allowed to finish its current work before the process terminates

## Starting the Component Host

``` ruby
self.start(name, &block)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| name | Name of the process (used for logging) | String |
| block | Block used for registering components that will be run by the host | Proc |

## Registering Components

``` ruby
component_name = 'some-component'
ComponentHost.start(component_name) do |host|
  host.register(SomeComponent, "A Component")
end
```

The `host` parameter passed to the registration block defines the `register` method that receives a _component initiator_ as an argument.

``` ruby
host.register(component_initiator, name=nil)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| component_initiator | A callable that starts consumers | Callable |
| Name | Optional name of the component initiator (used for logging) | String |

## Component Initiator

A _component initiator_ is any callable that starts consumers. As long as the object responds to the `call` method (and consequently can be invoked with the `()` operator), it can be used as a component initiator.

The following examples are all equivalent.

### Using a class or module

``` ruby
module SomeClassInitator
  def self.call
    SomeConsumer.start('someStream')
  end
end
```

### Using an object

``` ruby
class SomeInstanceInitiator
  def call
    SomeConsumer.start('someStream')
  end
end

initiator = SomeInstanceInitiator.new
```

### Using a Proc

``` ruby
initiator = proc { SomeConsumer.start('someStream') }
```

## Error Handling

### Unhandled Errors

If an error is not handled before it is raised to the level of the component host, it cannot be prevented from causing the process to terminate.

To prevent an error from being raised to the level of the component host, errors must be handled at the consumer level.

See the error handling section of the consumer user guide for details: [http://docs.eventide-project.org/user-guide/consumers.html#error-handling](http://docs.eventide-project.org/user-guide/consumers.html#error-handling).

### Recording or Reporting Errors

While errors cannot be _handled_ by the component host, they can optionally be reported or recorded.

``` ruby
record_error(&blk)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| blk | A block that is executed when an unhandled error is raised to the level of the component host | Proc |

``` ruby
ComponentHost.start(component_name) do |host|
  host.record_error do |error|
    SomeErrorReporter.(error)
  end
end
```

## Stopping the Component Host

### Graceful Shutdown

The process host affords graceful and safe shutdown for all of its subordinate consumers. When the host is shut down, its subordinate consumers will finish any work-in-progress.

::: danger
If the process is terminated using the operating system's KILL signal, consumers and handlers will not shutdown gracefully. It's not safe to kill the process. Use the KILL signal only when it's absolutely unavoidable.
:::

### Using the Keyboard

With the host process is running in a foreground terminal window:

- `CTRL+C`: Shut down the process
- `CTRL+Z`: Pause the process

### Signals

The component host can be stopped safely by sending either the INT or TERM signal to the process.

``` bash
kill -s SIGINT {process_id}
```

``` bash
kill -s SIGTERM {process_id}
```

## Signals

<div class="note custom-block">
  <p>
    For more background on operating systems signals, see: <a href="https://en.wikipedia.org/wiki/Signal_(IPC)">https://en.wikipedia.org/wiki/Signal_(IPC)</a>
  </p>
</div>

The process host responds to the following operating system signals.

### SIGINT and SIGTERM

Safely shuts down the process.

### SIGTSTP

Pauses the process.

### SIGCONT

Resumes a process paused with the TSTP signal.

## Log Tags

The following tags are applied to log messages recorded by the component host:

| Tag | Description |
| --- | --- |
| component_host | Applied to all log messages recorded inside the `ComponentHost` namespace |

The following tags _may_ be applied to log messages recorded by the component host:

| Tag | Description |
| --- | --- |
| component_host | Applied to messages that pertain to the component host|
| actor | Applied to messages recorded by [actors](https://github.com/ntl/actor) |
| lifecycle | Applied to messages that pertain to the lifecycle of a actors |
| crash | Applied to messages recorded while the host is terminating due to an error |
| signal | Applied to messages recorded when handling operating system signals |
| start | Applied to messages recorded when starting the component host or an actor |
| stop | Applied to messages recorded when stopping an actor |

See the [logging](./logging/log-tags.md) user guide for more on log tags.
