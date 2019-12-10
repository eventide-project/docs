# Database Administration Tools

## Command Line Tools

The Eventide message store Postgres database package installs command line tools for administering the database.

- [mdb-create-db](#install-the-message-store-database)
- [mdb-delete-db](#delete-the-message-store-database)
- [mdb-recreate-db](#recreate-the-message-store-database)
- [mdb-clear-messages](#clear-the-messages-from-the-message-store-database)
- [mdb-update-db](#update-the-database)
- [mdb-install-functions](#install-functions)
- [mdb-install-indexes](#install-indexes)
- [mdb-install-views](#install-views)
- [mdb-install-privileges](#install-privileges)
- [mdb-print-messages](#print-the-messages-stored-the-message-store-database)
- [mdb-print-stream-summary](#print-summary-statistics-by-stream-name)
- [mdb-print-type-summary](#print-summary-statistics-by-message-type)
- [mdb-print-stream-type-summary](#print-summary-statistics-by-stream-name-cross-referenced-by-message-type)
- [mdb-print-category-type-summary](#print-summary-statistics-by-category-cross-referenced-by-message-type)
- [mdb-print-type-stream-summary](#print-summary-statistics-by-message-type-cross-referenced-by-stream-name)
- [mdb-print-type-category-summary](#print-summary-statistics-by-message-type-cross-referenced-by-category)
- [mdb-write-test-message](#write-a-test-message)
- [mdb-open-database-scripts-dir](#open-view-the-directory-containing-the-database-definition-script-files)
- [mdb-print-message-store-version](#print-the-message-store-database-schema-version)

::: tip
If you installed the tools via Bundler, prefix the following commands with `bundle exec`, for example: `bundle exec mdb-create-db`
:::

<div class="note custom-block">
  <p>
    Note: The <code>message_store_postgres.json</code> settings file does not configure the connection used for any database administrative tasks, including creating the message store schema or printing reports. The administrative connection is controlled by the facilities provided by Postgres itself. For more details, see: <a href="https://www.postgresql.org/docs/current/libpq-envars.html">https://www.postgresql.org/docs/current/libpq-envars.html</a>.
  </p>
</div>

## Database Schema Tools

### Install the Message Store Database

``` bash
mdb-create-db
```

### Delete the Message Store Database

``` bash
mdb-delete-db
```

### Recreate the Message Store Database

``` bash
mdb-recreate-db
```

### Clear the Messages from the Message Store Database

``` bash
mdb-clear-messages
```

## Database Schema Update Tools

The schema update tools are useful when upgrading to a new release of the message store database.

### Update the Database

``` bash
mdb-update-db
```

This tool installs the functions, indexes, views, and privileges.

If any function, index, view, or privilege already exists, it will be replaced with the most recent definition. If any of these does not exist, they will be created.

### Install Functions

``` bash
mdb-install-functions
```

### Install Indexes

``` bash
mdb-install-indexes
```

### Install Views

``` bash
mdb-install-views
```

### Install Privileges

``` bash
mdb-install-privileges
```

## Reporting

### Print the Messages Stored the Message Store Database

``` bash
mdb-print-messages
```

**Print Messages from a Specific Stream**

``` bash
STREAM_NAME=someStream mdb-print-messages
```

### Print Summary Statistics by Stream Name

``` bash
mdb-print-stream-summary
```

**Print Stream Summary Statistics for a Stream Name**

``` bash
STREAM_NAME=someStream mdb-print-stream-summary
```

NOTE: The stream name is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Message Type

``` bash
mdb-print-type-summary
```

**Print Type Summary Statistics for a Type Name**

``` bash
TYPE=SomeType mdb-print-type-summary
```

NOTE: The type name is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Stream Name, Cross-Referenced by Message Type

``` bash
mdb-print-stream-type-summary
```

**Print Stream and Type Summary Statistics for a Stream Name**

``` bash
STREAM_NAME=someStream mdb-print-stream-type-summary
```

NOTE: The stream name is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Category, Cross-Referenced by Message Type

``` bash
mdb-print-category-type-summary
```

**Print Category and Type Summary Statistics for a Category**

``` bash
CATEGORY=someCategory mdb-print-category-type-summary
```

NOTE: The category name is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Message Type, Cross-Referenced by Stream Name

``` bash
mdb-print-type-stream-summary
```

**Print Type and Stream Summary Statistics for a Type Name**

``` bash
TYPE=SomeType mdb-print-type-stream-summary
```

NOTE: The type is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Message Type, Cross-Referenced by Category

``` bash
mdb-print-type-category-summary
```

**Print Type and Category Summary Statistics for a Type Name**

``` bash
TYPE=SomeType mdb-print-type-category-summary
```

NOTE: The type is matched by substring using a SQL `LIKE` clause

## Other Tools

### Write a Test Message

``` bash
mdb-write-test-message
```

The number of messages and the stream name can be specified using environment variables.

**Write a test messages to a stream named `someStream-111`**

``` bash
STREAM_NAME=someStream-111 mdb-write-test-message
```

**Write 10 test messages**

``` bash
INSTANCES=10 mdb-write-test-message
```

**Write 10 test messages to a stream named `someStream-111`**

``` bash
STREAM_NAME=someStream-111 INSTANCES=10 mdb-write-test-message
```

### Open/View the Directory Containing the Database Definition Script Files

``` bash
mdb-open-database-scripts-dir
```

### Print the Message Store Database Schema Version

``` bash
mdb-print-message-store-version
```

NOTE: The message store includes a server function named [`message_store_version`](./server-functions.html#get-message-store-database-schema-version) that reports the version of the database schema.

## Use an Alternate Database Name

The database administration tools presume a database named `message_store`.

If you prefer a different database name, you can specify it on the command line using environment variables:

``` bash
DATABASE_NAME=some_other_database mdb-create-db
```
