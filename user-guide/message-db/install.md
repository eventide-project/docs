# Installation

## Install the Database Tools

The database creation tool is installed via the `message-db` gem.

This gem can be installed on its own, and it is also included when installing the Eventide Postgres stackgem, `eventide-postgres`.

See the [setup](/setup/postgres.md) instructions for more info on installing the gems.

## Create the Database

Once the `message-db` gem is installed, the `mdb-create-db` command line utility will have been installed and will be in the search path.

To create the message store database, run the command:

``` bash
mdb-create-db
```

Or, if you've installed the tools via Bundler:

``` bash
bundle exec mdb-create-db
```

See also: [Database Administration Tools](./tools.md)

## Database Name

By default, the database creation tool will create a database named `message_store`.

If you prefer either a different database name, you can override the name using the `DATABASE_NAME` environment variable.

See the [database administration tools instructions](./tools.md) for more info.

## Write a Test Message to Message Store (Optional)

Once the database has been created, a test message can be written to it to prove that the installation is correct:

``` bash
mdb-write-test-message
```

The output will look something like:
```
Writing 1 Messages to Stream testStream-ae61d996-9f2c-4b25-a2bd-440432007fda
= = =

(DATABASE_USER is not set)
Database user is: message_store
(DATABASE_NAME is not set)
Database name is: message_store

Instance: 1, Message ID: f59c7068-bb19-4182-b84b-9c29ff07ad33

-[ RECORD 1 ]---+------------------------------------------------
id              | f59c7068-bb19-4182-b84b-9c29ff07ad33
stream_name     | testStream-ae61d996-9f2c-4b25-a2bd-440432007fda
type            | SomeType
position        | 0
global_position | 64
data            | {"attribute": "some value"}
metadata        | {"metaAttribute": "some meta value"}
time            | 2018-06-21 20:17:46.323037
```
