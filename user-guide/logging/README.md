# Logging

Logging is pervasive throughout the entirety of the toolkit. There is nothing of significance that is desirable to be observed that isn't instrumented with logging - often copious amounts of logging.

### TODO

- tags
- filtering output
  - tags
    - special tags
  - levels
    - special levels
- external control
- late-bound vs early-bound
- standards: trace on entry, info or debug on exit
- Loggers in each library

## Logging Example

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
| warn | Unexpected state that is not an error, or is recoverable |
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

## Tags

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

## Controlling Log Output

Log output can be controlled by both log level and log tags.

Both log level and log tag filters are set using environment variables.

### Control By Log Level

The `LOG_LEVEL` environment variable controls the log output verbosity.

``` bash
LOG_LEVEL=debug start_service.sh
```

Log levels are cumulative. The `trace` level is the most verbose, and the `fatal` level is the least verbose.

If the `LOG_LEVEL` is set to `trace`, all log messages at all levels will be displayed. If the `LOG_LEVEL` is set to `fatal` then only log messages at the `fatal` level will be displayed.

If the log level is set to a value that isn't a legitimate log level, an error is raised:

``` bash
LOG_LEVEL=something start_service.sh

Level :something must be one of: fatal, error, warn, info, debug, trace (Log::Error)
```

#### Special Log Level Controls

The following log level filters are considered _special_ in that they offer log output control above and beyond using the named levels

| Special Level | Description | Example |
| --- | --- | --- |
| _none | No log messages will be printed | `LOG_LEVEL=_none start_service.sh` |
| _min | Minimum verbosity, equivalent to the `fatal` level | `LOG_LEVEL=_min start_service.sh` |
| _max | Maximum verbosity, equivalent to the `trace` level | `LOG_LEVEL=_max start_service.sh` |

### Control By Log Tag

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
| _untagged | Print log messages aren't tagged | `LOG_TAGS=_all start_service.sh` |

## Standards

- standard tags, like data, etc
- standard levels (trace on entry, etc)

### TODO

## Registering Loggers for a Subject

### TODO

## Constructing Loggers
