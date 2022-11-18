# Overview

Messages like [events](/glossary.md#event) and [commands](/glossary.md#command) are written to and read from streams. To write and read from streams, the subject stream is identified by its name.

A [stream](/glossary.md#stream) name not only identifies the stream, but also its purpose.

A stream name is made up of a _[category](/glossary.md#category)_ and an _ID_.

A category can include types that indicate even further specialized uses of the stream. An ID can be a single value or a compound ID made of multiple values.

The most minimal form of a stream name consists only of a category.

## Parts

Stream names typically have up to three parts:

- Category Name
- Category Types
- Entity ID

## Examples

### Stream Name with Category and ID

`someStream-123`

### Stream Name with Category and Compound IDs

`someStream-123+abc`

### Category

`someStream`

### Stream Name with a Category Type

`someStream:someType-123`

### Stream Name with Compound Category Types

`someStream:someType+someOtherType-123`

### Stream Name with Compound Category Types and Compound ID

`someStream:someType+someOtherType-123+abc`

## Utilities

The Eventide toolkit provides a handful of utilities that institute useful and consistent standards for the various kinds of streams used in various common scenarios.

- [Messaging::StreamName](./messaging-stream-name.md) Module
- [Messaging::Category](./messaging-category.md) Module
- [MessageStore::StreamName](./message-store-stream-name.md) Module

## Entity Stream Names

An _entity_ stream name contains all of the events for one specific entity. For example, an `Account` entity with an ID of `123` would have the name, `account-123`.

## Category Stream Names

A _category_ stream name does not have an ID. For example, the stream name for the category of all accounts is `account`.

## Category Types

Stream names can also have an optional list of category _types_.

The `command` type is one of the most common types. It's used to indicate a stream that is used to transport _commands_ rather than _events_.

For example, a stream name for the stream that holds commands for the `account-123` entity would be named `account:command-123`.

The stream name is separated from the type list by the `:` character.

Types can be present in both entity stream names as well as category stream names.

For example, the stream name for all commands for the `account` category would be `account:command`.

### Compound Category Types

A stream name's category can have more than one type. The `+` symbol joins types when there are more than one.

For example, a stream name that keeps track of a [consumer's](/glossary.md#consumer) last read position of a command category stream would be `account:command+position`.

## Entity IDs

An entity ID is any value in a stream name following the first `-` character.

For a stream named `someStream-123`, the `123` is the entity ID.

The ID itself can have `-` characters in it. Only the first `-` character in a stream name is significant. For a stream named `someStream-123-456`, the `123-456` is the entity ID.

### Compound Entity IDs

A stream name can have more than one ID. The `+` symbol joins individual IDs when there are more than one.

For example, a stream name of the category `someStream` that has the IDs `123` and `abc` would be `someStream-123+abc`.

### Cardinal ID

The _cardinal ID_ is the first ID that appears in an entity stream's compound ID. If the stream name has only a single ID, then the cardinal ID is that single ID.

## Casing

Stream names are camel-cased.

`someStream` is considered a valid stream name. `some_stream` is not considered a valid stream name.

The casing of a stream name, however, is not enforced. The `some_stream` form can be used, and it will not cause an error. Standard practice is to use camel case, and some utility methods, like the `category` macro, will normalize the category name to camel case.

## Separators

### `-` The ID Separator

The `-` character separates a stream's category and its ID.

For example: `account-123`

### `+` The Compound ID Separator

The `+` character separates individual IDs in a stream name that has a combination of more than one ID.

For example: `account-123+abc`

### `:` The Category Type Separator

The ':' character separates the category from the category type (or types) in a stream name that includes both a category and type.

For example: `account:command`

### `+` The Compound Category Type Separator

The `+` character separates category types in a stream name that has a combination of more than one category type.

For example: `account:command+position`
