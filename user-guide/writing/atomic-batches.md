# Writing Atomic Batches

<div class="note custom-block">
  <p>
    Note: Applies to both the <a href="./message-writer.html">message writer</a> and the <a href="./message-data-writer.html">message data writer</a>.
  </p>
</div>

- - -

Either a single message or an array of messages can be passed to the writer's actuator.

``` ruby
batch = [some_message, some_other_message]
write.(batch, some_stream)
```

When an array is passed to the writer, it is written as an atomic batch. If the write fails for any reason while the batch is being written, none of the messages will be written.

<div class="note custom-block">
  <p>
    Note: As with individual messages, a batch is written to a single stream. Atomic writes are only possible to one stream.
  </p>
</div>
