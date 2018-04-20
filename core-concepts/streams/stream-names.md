# Stream Names

A [stream](/glossary.md#stream) name not only identifies the stream, but also its purpose. A stream name is a string that optionally includes an ID that is prefixed by a dash (-) character, and may also include category _types_ that indicate even further specialized uses of the stream. The part of the stream preceding the dash is the _[category](/glossary.md#category)_, and the part following the dash is the ID.

See also:

- [Category Stream](/glossary.md#category-stream)
- [Entity Stream](/glossary.md#entity-stream)
- [Entity](/glossary.md#entity)

## Parts

Stream names typically have two parts:

- Category Name
- Entity ID

In the case of a _category stream_, the stream name would consist only of the category name, and would not have an ID.

## Two Kinds of Stream Names: Entity and Category

An _entity_ stream name contains all of the events for one specific entity. For example, an `Account` entity with an ID of `123` would have the name, `account-123`.

A _category_ stream name does not have an ID. For example, the stream name for the category of all accounts is `account`.

## Category Types

Category stream names can be broken down into sub-categories, or _types_.

The `command` type is a very common category type. It's used to indicate a stream that is used to transport _commands_ rather than _events_.

For example, a stream name for the stream that holds commands for the `account-123` entity would be named `account:command-123`.

The category name is separated from the category type by the `:` character.

Category types can be present in both entity stream names as well as category stream names.

For example, the stream name for all commands for the `account` category would be `account:command`.

## Many Category Types

A stream name can have more than one category type.

For example, a stream name that keeps track of a [consumer's](/glossary.md#consumer) last read position of a command category stream would be `account:command+position`.

## Separators

### `-` The Entity ID Separator

The `-` separator is the most common separator. It's the token in a stream name that separates the category name from the entity ID. For a stream named `account-123`, the value to the left of the dash is the category name `account`, and the value to the right of the dash is the ID `123`.

Only the first dash is considered a separator, this allows IDs to contain dashes with them, as is the case with UUIDs.

For example, an account with an ID of `00000001-0000-4000-8000-000000000000` would have a stream name of `account-00000001-0000-4000-8000-000000000000`.

### `:` The Category Type Separator

The ':' character separates the category from the category type (or types) in a stream name that includes both a category and type.

For example, `account:command`.

### `+` The Combined Category Type Separator

The `+` character separates category types in a stream name that has a combination of more than one category type.

For example, `account:command+position`.

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

Account command consumer position stream name. A [consumer](/glossary.md#consumer) that is reading commands from the `account+command` stream will periodically write the position number of the last command processed to the position stream so that all commands from all time do not have to be re-processed when the consumer is restarted.
