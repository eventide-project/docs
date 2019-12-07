# Database Administration Tools

## Command Line Tools

The Eventide message store Postgres database package installs command line tools for administering the database.

- [evt-pg-create-db](#install-the-message-store-database)
- [evt-pg-delete-db](#delete-the-message-store-database)
- [evt-pg-recreate-db](#recreate-the-message-store-database)
- [evt-pg-clear-messages](#clear-the-messages-from-the-message-store-database)
- [evt-pg-update-db](#update-the-database)
- [evt-pg-install-functions](#install-functions)
- [evt-pg-install-indexes](#install-indexes)
- [evt-pg-install-views](#install-views)
- [evt-pg-install-privileges](#install-privileges)
- [evt-pg-print-messages](#print-the-messages-stored-the-message-store-database)
- [evt-pg-print-stream-summary](#print-summary-statistics-by-stream-name)
- [evt-pg-print-type-summary](#print-summary-statistics-by-message-type)
- [evt-pg-print-stream-type-summary](#print-summary-statistics-by-stream-name-cross-referenced-by-message-type)
- [evt-pg-print-category-type-summary](#print-summary-statistics-by-category-cross-referenced-by-message-type)
- [evt-pg-print-type-stream-summary](#print-summary-statistics-by-message-type-cross-referenced-by-stream-name)
- [evt-pg-print-type-category-summary](#print-summary-statistics-by-message-type-cross-referenced-by-category)
- [evt-pg-write-test-message](#write-a-test-message)
- [evt-pg-open-database-scripts-dir](#open-view-the-directory-containing-the-database-definition-script-files)
- [evt-pg-print-message-store-version](#print-the-message-store-database-schema-version)

::: tip
If you installed the tools via Bundler, prefix the following commands with `bundle exec`, for example: `bundle exec evt-pg-create-db`
:::

<div class="note custom-block">
  <p>
    Note: The <code>message_store_postgres.json</code> settings file does not configure the connection used for any database administrative tasks, including creating the message store schema or printing reports. The administrative connection is controlled by the facilities provided by Postgres itself. For more details, see: <a href="https://www.postgresql.org/docs/current/libpq-envars.html">https://www.postgresql.org/docs/current/libpq-envars.html</a>.
  </p>
</div>

## Database Schema Tools

### Install the Message Store Database

``` bash
evt-pg-create-db
```

### Delete the Message Store Database

``` bash
evt-pg-delete-db
```

### Recreate the Message Store Database

``` bash
evt-pg-recreate-db
```

### Clear the Messages from the Message Store Database

``` bash
evt-pg-clear-messages
```

## Database Schema Update Tools

The schema update tools are useful when upgrading to a new release of the message store database.

### Update the Database

``` bash
evt-pg-update-db
```

This tool installs the functions, indexes, views, and privileges.

If any function, index, view, or privilege already exists, it will be replaced with the most recent definition. If any of these does not exist, they will be created.

### Install Functions

``` bash
evt-pg-install-functions
```

### Install Indexes

``` bash
evt-pg-install-indexes
```

### Install Views

``` bash
evt-pg-install-views
```

### Install Privileges

``` bash
evt-pg-install-privileges
```

## Reporting

### Print the Messages Stored the Message Store Database

``` bash
evt-pg-print-messages
```

**Print Messages from a Specific Stream**

``` bash
STREAM_NAME=someStream evt-pg-print-messages
```

### Print Summary Statistics by Stream Name

``` bash
evt-pg-print-stream-summary
```

**Print Stream Summary Statistics for a Stream Name**

``` bash
STREAM_NAME=someStream evt-pg-print-stream-summary
```

NOTE: The stream name is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Message Type

``` bash
evt-pg-print-type-summary
```

**Print Type Summary Statistics for a Type Name**

``` bash
TYPE=SomeType evt-pg-print-type-summary
```

NOTE: The type name is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Stream Name, Cross-Referenced by Message Type

``` bash
evt-pg-print-stream-type-summary
```

**Print Stream and Type Summary Statistics for a Stream Name**

``` bash
STREAM_NAME=someStream evt-pg-print-stream-type-summary
```

NOTE: The stream name is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Category, Cross-Referenced by Message Type

``` bash
evt-pg-print-category-type-summary
```

**Print Category and Type Summary Statistics for a Category**

``` bash
CATEGORY=someCategory evt-pg-print-category-type-summary
```

NOTE: The category name is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Message Type, Cross-Referenced by Stream Name

``` bash
evt-pg-print-type-stream-summary
```

**Print Type and Stream Summary Statistics for a Type Name**

``` bash
TYPE=SomeType evt-pg-print-type-stream-summary
```

NOTE: The type is matched by substring using a SQL `LIKE` clause

### Print Summary Statistics by Message Type, Cross-Referenced by Category

``` bash
evt-pg-print-type-category-summary
```

**Print Type and Category Summary Statistics for a Type Name**

``` bash
TYPE=SomeType evt-pg-print-type-category-summary
```

NOTE: The type is matched by substring using a SQL `LIKE` clause

## Other Tools

### Write a Test Message

``` bash
evt-pg-write-test-message
```

The number of messages and the stream name can be specified using environment variables.

**Write a test messages to a stream named `someStream-111`**

``` bash
STREAM_NAME=someStream-111 evt-pg-write-test-message
```

**Write 10 test messages**

``` bash
INSTANCES=10 evt-pg-write-test-message
```

**Write 10 test messages to a stream named `someStream-111`**

``` bash
STREAM_NAME=someStream-111 INSTANCES=10 evt-pg-write-test-message
```

### Open/View the Directory Containing the Database Definition Script Files

``` bash
evt-pg-open-database-scripts-dir
```

### Print the Message Store Database Schema Version

``` bash
evt-pg-print-message-store-version
```

NOTE: The message store includes a server function named [`message_store_version`](./server-functions.html#get-message-store-database-schema-version) that reports the version of the database schema.

## Use an Alternate Database Name

The database administration tools presume a database named `message_store`.

If you prefer a different database name, you can specify it on the command line using environment variables:

``` bash
DATABASE_NAME=some_other_database evt-pg-create-db
```
