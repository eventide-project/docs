# Database Administration Tools

::: tip
If you installed the tools via Bundler, prefix the following commands with `bundle exec`, for example: `bundle exec evt-pg-create-db`
:::

## Install the Message Store Database

``` bash
evt-pg-create-db
```

## Delete the Message Store Database

``` bash
evt-pg-delete-db
```

## Recreate the Message Store Database

``` bash
evt-pg-recreate-db
```

## Print the Messages Stored the Message Store Database

``` bash
evt-pg-print-messages
```

## Write a Test Message

``` bash
evt-pg-write-test-message
```

The number of messages and the stream name can be specified using environment variables.

### Write a test messages to a stream named `someStream-111`

``` bash
STREAM_NAME=someStream-111 evt-pg-write-test-message
```

### Write 10 test messages:

``` bash
INSTANCES=10 evt-pg-write-test-message
```

### Write 10 test messages to a stream named `someStream-111`

``` bash
STREAM_NAME=someStream-111 INSTANCES=10 evt-pg-write-test-message
```

## Open/View the Directory Containing the Database Definition Script Files

``` bash
evt-pg-open-database-scripts-dir
```

## Changing the Database Name or the Database User

The database administration tools presume a database named `message_store` and a database user named `message_store`.

If you prefer that either a different database name or a different database user be used, you can specify them on the command line using environment variables:

Specify the database name:

``` bash
DATABASE_NAME=some_other_database evt-pg-create-db
```

Specify the database user:

``` bash
DATABASE_USER=some_other_user evt-pg-create-db
```

Or specify both:

``` bash
DATABASE_NAME=some_other_database DATABASE_USER=some_other_user evt-pg-create-db
```
