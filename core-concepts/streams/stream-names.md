# Stream Names

Messages like [events](/glossary.md#event) and [commands](/glossary.md#command) are written to and read from streams. To write and read from streams, the subject stream is identified by its name.

A [stream](/glossary.md#stream) name not only identifies the stream, but also its purpose. A stream name is a string that optionally includes an ID that is prefixed by a dash (-) character, and may also include category _types_ that indicate even further specialized uses of the stream. The part of the stream preceding the dash is the _[category](/glossary.md#category)_, and the part following the dash is the ID.

## Entity Stream Name

An _entity_ stream name contains all of the events for one specific entity. For example, an `Account` entity with an ID of `123` would have the name, `account-123`.

## Category Stream Name

A _category_ stream name does not have an ID. For example, the stream name for the category of all accounts is `account`.

## Example Stream Names

`account`

Account category stream name. The name of the stream that has events for all accounts.

`account-123`

Account entity stream name. The name of the stream that has events only for the particular account with the ID 123.

`account:command`

Account command category stream name, or account _command stream_ name for short. This is a category stream name with a _command_ type. This stream has all commands for all accounts.

`account:command-123`

Account entity command stream name. This stream has all of the commands specifically for the account with the ID 123.

`account:command+position`

Account command position category stream name. A [consumer](/glossary.md#consumer) that is reading commands from the `account:command` stream will periodically write the position number of the last command processed to the position stream so that all commands from all time do not have to be re-processed when the consumer is restarted.

`account:snapshot-123`

Account entity snapshot stream name. Entity snapshots are periodically recorded to disk as a performance optimization that eliminates the need to project an event stream from its first-ever recorded event when entity is not already in the in-memory cache.
