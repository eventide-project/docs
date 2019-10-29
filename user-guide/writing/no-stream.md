# The :no_stream Expected Version

<div class="note custom-block">
  <p>
    Note: Applies to both the <a href="./message-writer.html">message writer</a> and the <a href="./message-data-writer.html">message data writer</a>.
  </p>
</div>

- - -

The :no_stream symbol can be substituted for `-1` when writing with an expected version of `-1`.

``` ruby
Write.(some_message, some_stream, expected_version: :no_stream)
```
