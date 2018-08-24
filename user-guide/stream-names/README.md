# Overview

Messages like [events](/glossary.md#event) and [commands](/glossary.md#command) are written to and read from streams. To write and read from streams, the subject stream is identified by its name.

A [stream](/glossary.md#stream) name not only identifies the stream, but also its purpose. A stream name is a string that optionally includes an ID that is prefixed by a dash (-) character, and may also include category _types_ that indicate even further specialized uses of the stream. The part of the stream preceding the dash is the _[category](/glossary.md#category)_, and the part following the dash is the ID.

## Utilities

The Eventide toolkit provides a handful of utilities that institute useful and consistent standards for the various kinds of streams used in various common scenarios.

- [Messaging::StreamName](./messaging-stream-name.md) Module
- [Messaging::Category](./messaging-category.md) Module
- [MessageStore::StreamName](./messaging-store-stream-name.md) Module

## Parts

Stream names typically have up to three parts:

- Category Name
- Entity ID
- Category Types

In the case of a _category stream_, the stream name would consist only of the category name, and would not have an ID.

## Entity Stream Name

An _entity_ stream name contains all of the events for one specific entity. For example, an `Account` entity with an ID of `123` would have the name, `account-123`.

## Category Stream Name

A _category_ stream name does not have an ID. For example, the stream name for the category of all accounts is `account`.

## Category Types

Stream names can also have an optional list of _types_.

The `command` type is one of the most common types. It's used to indicate a stream that is used to transport _commands_ rather than _events_.

For example, a stream name for the stream that holds commands for the `account-123` entity would be named `account:command-123`.

The stream name is separated from the type list by the `:` character.

Types can be present in both entity stream names as well as category stream names.

For example, the stream name for all commands for the `account` category would be `account:command`.

A stream name can have more than one type.  The `+` symbol joins types when there are more than one.

For example, a stream name that keeps track of a [consumer's](/glossary.md#consumer) last read position of a command category stream would be `account:command+position`.

## Casing

Stream names are camel-cased.

`someStream` is considered a valid stream name. `some_stream` is not considered a valid stream name.

The casing of a stream name, however, is not enforced. The `some_stream` form can be used, and it will not cause an error. Standard practice is to use camel case, and some utility methods, like the `category` macro, will normalize the category name to camel case.

## Separators

### `-` The Entity ID Separator

The `-` separator is the most common separator. It's the token in a stream name that separates the category name from the entity ID. For a stream named `account-123`, the value to the left of the dash is the category name `account`, and the value to the right of the dash is the ID `123`.

Only the first dash is considered a separator, this allows IDs to contain dashes within them, as is the case with UUIDs.

For example, an account with an ID of `00000001-0000-4000-8000-000000000000` would have a stream name of `account-00000001-0000-4000-8000-000000000000`.

### `:` The Category Type Separator

The ':' character separates the category from the category type (or types) in a stream name that includes both a category and type.

For example, `account:command`.

### `+` The Combined Category Type Separator

The `+` character separates category types in a stream name that has a combination of more than one category type.

For example, `account:command+position`.
