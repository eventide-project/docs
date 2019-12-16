# Expected Version and Concurrency

<div class="note custom-block">
  <p>
    Note: Applies to both the <a href="./message-writer.html">message writer</a> and the <a href="./message-data-writer.html">message data writer</a>.
  </p>
</div>

- - -

The `expected_version` argument is an [optimistic concurrency](https://en.wikipedia.org/wiki/Optimistic_concurrency_control) protection. It can also be used to assure that a message written to a stream is the first message in the stream.

In the [typical handler workflow](../handlers.html#typical-handler-workflow), a stream's version is retrieved along with the stream's projected entity at the start of a handler. That retrieved version is then included as the value of the `expected_version` argument to the writer.

``` ruby{2,6}
handle Something do |something|
  account, version = store.fetch(something.id, include: :version)

  # ...

  write.(some_message, some_stream, expected_version: version)
end
```

If the expected version and the stream version no longer match at the time of the write, the `MessageStore::ExpectedVersion::Error` is raised.

### Concurrency

::: danger
Except when running multiple instances of a component for hot fail-over, concurrent writing to an _event stream_ is considered an anomaly. It's not expected that two separate writers would be writing to the same event stream concurrently as this would violate the authority of a component over its streams. Only one instance of a [hosted](/user-guide/component-host.md) component should be empowered to write to a stream. If two instances of _the same_ component are writing to the same event stream, then appropriate measures must be taken to retry the writes.
:::
