# Logging

Logging is pervasive throughout the entirety of the toolkit. There is nothing of significance that is desirable to be observed that isn't instrumented with logging - often copious amounts of logging.

## Example

``` ruby
Something = Class.new
logger = Log.get(Something)

logger.info 'Some info log message'
# => [2000-01-01T00:00:00.00000Z] Something INFO: Some info log message
```

## Logging Facts

- A logger is built for a specific subject
- Building a logger for the same subject more than once returns the logger that was previously built for the subject
- Loggers support log levels
- Loggers support log tags
- Logger output can be filtered on levels and tags
- The logger only writes output to standard I/O
- By default, the logger writes its output to the STDERR device
- The log level, tags, and output device can be controlled from outside of a process via environment variables

## Log Class

The `Log` class is a concrete class from the [`Log` library](../libraries.md#log) and namespace.

The `Log` class provides:

- Writer methods corresponding to each of the logger's levels
- A registry of reusable logger instances that are registered to a logger subject

## Log Levels

The logger provides six levels of detail/severity for categorizing log messages. Log levels are used to control the verbosity of the logger's output.

| level | Description |
| --- | --- |
| trace | Most detailed level of tracing program flow |
| debug | Recording of the completion of a secondary operation of a class or utility, or for recording other details |
| info | Recording of the completion of the principle operation of a class or utility |
| warn | Unexpected state that is not an error, or is recoverable, and that a developer or operator should examine |
| error | Error message logged just prior to raising an error |
| fatal | Message recorded, when possible, as the process is terminating due to an error |

## Writing a Log Message

A log message is written by invoking one of the log's six log level methods.

``` ruby
Something = Class.new
logger = Log.get(Something)

logger.trace 'Some trace log message'
# => [2000-01-01T00:00:00.00001Z] Something TRACE: Some trace log message

logger.debug 'Some debug log message'
# => [2000-01-01T00:00:00.00002Z] Something DEBUG: Some debug log message

logger.info 'Some info log message'
# => [2000-01-01T00:00:00.00003Z] Something INFO: Some info log message

logger.warn 'Some warn log message'
# => [2000-01-01T00:00:00.00004Z] Something WARN: Some warn log message

logger.error 'Some error log message'
# => [2000-01-01T00:00:00.00005Z] Something ERROR: Some error log message

logger.fatal 'Some fatal log message'
# => [2000-01-01T00:00:00.00006Z] Something FATAL: Some fatal log message
```

### Late Evaluation

Log messages can be written with late evaluation or early evaluation.

Late evaluation allows a message string with interpolation to not be interpolated unless the logger's current level allows for the message to be printed.

``` ruby
Something = Class.new
logger = Log.get(Something)

some_value = 'Hello'

logger.info { "Some info log message: #{some_value}" }
# => [2000-01-01T00:00:00.00000Z] Something INFO: Some info log message: Hello
```

### Write Unformatted Output

Log output can be printed without any of the formatting or headings.

``` ruby
Something = Class.new
logger = Log.get(Something)

some_value = 'Hello'

logger.puts("Some info log message: #{some_value}")
# => Some info log message: Hello
```

The puts method does not support tags or levels.

There is no deferred execution option with the logger's `puts` method. It is a straight pass-through to the logger's device.

``` ruby
logger.puts "Something"
```

Is equivalent to:

``` ruby
logger.device.puts "Something"
```

## Log Tags

A log message can be written with an optional list of one or more tags. Tags can be used to filter the logger's output.

Tags are Ruby symbols.

``` ruby
Something = Class.new
logger = Log.get(Something)

# One tag
logger.info(tag: :some_tag) { 'Some info log message' }

# Many tags
logger.info(tags: [:some_tag, :some_other_tag]) { 'Some info log message' }
```

Log tags can also be applied to messages written with early evaluation.

``` ruby
# One tag
logger.info('Some info log message', tag: :some_tag)

# Many tags
logger.info('Some info log message', tags: [:some_tag, :some_other_tag])
```

For a list of tags throughout the toolkit that can be used to filter log output, see the [log tags user guide](./log-tags.md).

### The Override Log Tag

The special log tag `:*` overrides any log filters in effect.

When the `:*` tag is applied to a log message, it can't be filtered out of the log output.

## Controlling Log Output

Log output can be controlled by both log level and log tags.

Both log level and log tag filters are set using environment variables.

### Control by Log Level

The `LOG_LEVEL` environment variable controls the log output verbosity.

``` bash
LOG_LEVEL=debug start_service.sh
```

Log levels are cumulative. The `trace` level is the most verbose, and the `fatal` level is the least verbose.

If the `LOG_LEVEL` is set to `trace`, all log messages at all levels will be displayed. If the `LOG_LEVEL` is set to `fatal` then only log messages at the `fatal` level will be displayed.

If the log level is set to a value that isn't a legitimate log level, an error is raised:

``` bash
LOG_LEVEL=something start_service.sh

Level "something" must be one of: "fatal", "error", "warn", "info", "debug", "trace" (Log::Error)
```

#### Default Log Level

By default, a logger prints messages at the `info` level, and above, including the `warn`, `error`, and `fatal` levels.

#### Special Log Level Controls

The following log level filters are considered _special_ in that they offer log output control above and beyond using the named levels

| Special Level | Description | Example |
| --- | --- | --- |
| _none | No log messages will be printed | `LOG_LEVEL=_none start_service.sh` |
| _min | Minimum verbosity, equivalent to the `fatal` level | `LOG_LEVEL=_min start_service.sh` |
| _max | Maximum verbosity, equivalent to the `trace` level | `LOG_LEVEL=_max start_service.sh` |

### Control by Log Tag

The `LOG_TAGS` environment variable controls which log messages will be printed based on the log tags applied to the log message.

``` bash
LOG_TAGS=messaging start_service.sh
```

<div class="note custom-block">
  <p>
    Note: If the <code>LOG_TAG</code> environment variable is set to any value (except <code>_untagged</code>), untagged log messages won't be printed.
  </p>
</div>

#### Include Many Log Tags

To display log messages from a number of tags, a comma-separated list of tags can be specified.

When using a list of tags, a log message just has to have one of the specified tags applied.

``` bash
LOG_TAGS=messaging,message_store start_service.sh
```

#### Exclude Tags

Log messages can be excluded by tag by prefixing the tag name with the `-` character.

``` bash
LOG_TAGS=-message_store start_service.sh
```

Exclusion tags can be combined with each other, as well as with inclusion tags in the tags list.

``` bash
LOG_TAGS=-message_store,messaging,-consumer,cache start_service.sh
```

#### Special Log Tag Controls

The following log tag filters are considered _special_ in that they offer log output control above and beyond using the named tags

| Special Level | Description | Example |
| --- | --- | --- |
| _all | Print log messages from all tags, except for untagged messages | `LOG_TAGS=_all start_service.sh` |
| _untagged | Print log messages that aren't tagged | `LOG_TAGS=_untagged start_service.sh` |

## Standards

Logging standards are applied rigorously and regularly at every level of the toolkit.

### Trace Level

The `trace` level is used to log the entry of a method that concludes with either an `info` or `debug` log message.

Log messages at the `trace` level are typically worded to indicate that something is being done or about to be done. The _ing_ present or gerund form of verbs is used in `trace` messages, for example "Writing message".

### Info Level

The `info` level is used to log the completion of the principle operation of a class or utility, like a callable class or object's actuator. For example: A [message writer's](/user-guide/writers/message-writer.md) principle actuator.

Log messages at the `info` level are typically worded to indicate that something has been done or completed. The _ed_ past tense form of verbs is used in `trace` messages, for example "Wrote message".

### Debug Level

The `debug` level is used to log the completion of a secondary operation of a class or utility, or for recording other details. For example: A [message writer's](/user-guide/writers/message-writer.md) secondary operation, like it's `initial` method or its `reply` method.

Log messages at the `debug` level are typically worded to indicate that something has been done or completed. The _ed_ past tense form of verbs is used in `debug` messages, for example "Wrote initial message".

### Error Level

The `error` level is used to log an error message before a process terminates. The error level should only be used to log fatal, terminal error states.

### Warn Level

The `warn` level is used to log an unexpected condition that isn't an error and that does not need to terminate the process. A `warn` log message indicates something that may not have been intentional and that a developer or operator should examine.

### Fatal Level

The `fatal` level is used only when a service is terminating due to an error. It is intended to be used only by the [component host](/user-guide/component-host.md) infrastructure, and should not be used in applicative code.

### Data Tag

It's common for `trace`, `debug`, and `info` level log messages to be accompanied by additional log messages at the same level that have the `data` tag. These messages usually log a method's input data (in the case of `trace`), or its output data (in the case of `info` and `debug`).

### Standards Example

``` ruby
class Something
  include Logger::Dependency

  def call(input)
    logger.trace { "Doing something" }
    logger.trace(tag: :data) { "Input: #{input}" }

    output = transform(input)

    logger.info { "Done something" }
    logger.info(tag: :data) { "Output: #{output}" }

    output
  end

  def something_else(input)
    logger.trace { "Doing something else" }
    logger.trace(tag: :data) { "Input: #{input}" }

    output = transform(input)

    do_secondary_thing(output)

    logger.debug { "Done something else" }
    logger.debug(tag: :data) { "Output: #{output}" }

    output
  end

  def transform(input)
    logger.trace { "Transforming" }
    logger.trace(tag: :data) { "Input: #{input}" }

    output = input.upcase

    logger.debug { "Transformed" }
    logger.debug(tag: :data) { "Output: #{output}" }

    output
  end
end
```

## Logger Subject

A logger is constructed for a specific subject. That subject is included in a printed log message's prefix.

In the following example, the `Something` class is the logger's subject. The subject is printed between the log message's timestamp and its capitalized representation of the message's log level. In this case, the printed subject is "Something".

``` ruby{5}
Something = Class.new
logger = Log.get(Something)

logger.info 'Some info log message'
# => [2000-01-01T00:00:00.00000Z] Something INFO: Some info log message
```

The subject can be a class, an object, or a string. If an object is used, the logger's subject will be the object's class. If a string is used, the logger's subject will be the value of the string.

## Get a Logger from the Logger Registry

The `Log` namespace has a registry of logger instances that are associated with a subject.

Rather than build a new logger each time for a subject that has previously had a logger built for it, loggers can be registered for subsequent use of the same subject at a later time.

``` ruby
self.get(subject)
```

**Returns**

New instance of the logger class, or an existing instance that was previously registered for the subject.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| subject | The subject that the logger is writing messages for | Class, Object, or String |

When a subject doesn't already exist in the registry for the subject, a new logger will be constructed for it, and added to the registry.

When a subject is already in the registry, it's associated logger is returned rather than building a new logger.

## Constructing a Logger

Loggers can be constructed in one of two ways

- Via the constructor
- Via the initializer

<div class="note custom-block">
  <p>
    Note: Directly constructing a logger does not add the logger to the logger registry. The `get` class method should be used in order to both build and register loggers.
  </p>
</div>

### Via the Constructor

``` ruby
self.build(subject)
```

The constructor not only instantiates the logger, but also invokes the writer's `configure` instance method, which constructs the writer's operational dependencies and sets its defaults, such as the default levels.

**Returns**

Instance of the logger class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| subject | The subject that the logger is writing messages for | Class, Object, or String |

### Via the Initializer

``` ruby
self.initialize(subject)
```

**Returns**

Instance of the logger class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| subject | The subject that the logger is writing messages for | Class, Object, or String |

By constructing a logger using the initializer, the logger's dependencies are not set to operational dependencies. They remain _inert substitutes_.

::: tip
See the [useful objects](/user-guide/useful-objects.md#substitutes) user guide for background on inert substitutes.
:::

## Assigning a Logger as a Dependency

``` ruby
self.configure(receiver, attr_name: :logger)
```

Constructs an instance of the logger and registers it (or retrieves an existing logger from the registry) and assigns it to the receiver's `logger` attribute. By default, the receiving attribute's name is expected to be `logger`, but it can be altered with the use of the `attr_name` parameter.

``` ruby
something = Something.new
Messaging::Postgres::Write.configure(something)

something.logger
# => #<Log:0x...>
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| receiver | The object that will receive the constructed logger | Object |
| attr_name | The receiver's attribute that will be assigned the constructed logger | Symbol |

<div class="note custom-block">
  <p>
    Note: When configuring a logger as a dependency, the `receiver` is used as the logger's subject.
  </p>
</div>

::: tip
See the [useful objects](/user-guide/useful-objects.md#configuring-dependencies) user guide for background on configuring dependencies.
:::

### The Log::Dependency Module

The `Log::Dependency` module is a mixin that both creates a `logger` attribute, an configures an operational logger as its value.

The `Log::Dependency` is the most common way of assigning a logger to a subject.

``` ruby
class Something
  include Logger::Dependency

  # ...
end
```
