# Logging

Logging is pervasive throughout the entirety of the toolkit. There is nothing of significance that is desirable to be observed that isn't instrumented with logging - often copious amounts of logging.

### TODO

- levels
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

log = Log.get(Something)

log.info 'Some info log message'
# => [2000-01-01T00:00:00.00000Z] Object INFO: Some info log message
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

The `Log` class is a concrete class from the [`MessageStore::Postgres` library](../libraries.md#message-store-postgres) and namespace.

The `Read` class provides:

- The principle instance actuator `.()` (or the `call` instance method) for starting a reader
- The class actuator `.()` (or the class `call` method) that provides a convenient invocation shortcut that does not require instantiating the reader class first
