# Installation

## Install the Database Tools

The database creation tool is installed via the `evt-message_store-postgres-database` gem.

This gem can be installed on its own, and it is also included when installing the Eventide Postgres stackgem, `eventide-postgres`.

See the [setup](/setup/postgres.md) instructions for more info on installing the gems.

## Create the Database

Once the `evt-message_store-postgres-database` gem installed, the `evt-pg-create-db` command line utility will have been installed, and will be in the search path.

To create the message store database, run the command:

```
evt-pg-create-db
```

Or, if you've installed the tools via Bundler:

```
bundle exec evt-pg-create-db
```

See also: [Database Administration Tools](./tools.md)

## Database Name and Database User

The database creation tool will create a database named `message_store` and a database user named `message_store`

If you prefer either a different database name or a different database user, you can specify them on the command line using environment variables:

Specify the database name:
```
DATABASE_NAME=some_other_database evt-pg-create-db
```

Specify the database user:
```
DATABASE_USER=some_other_user evt-pg-create-db
```

Or specify both:
```
DATABASE_NAME=some_other_database DATABASE_USER=some_other_user evt-pg-create-db
```

## Write a Test Message to Message Store (Optional)

Once the database has been created, a test message can be written to it to prove that the installation is correct:

```
evt-pg-write-test-message
```

The output will look something like:
```
Writing 1 Messages to Stream testStream-314c2b1c-0ec5-4f96-8793-c998194da014
= = =

(DATABASE_USER is not set)
Database user is: message_store
(DATABASE_NAME is not set)
Database name is: message_store

Instance: 1, Message ID: 8a0dc58e-7c1a-494f-962b-51255f131f1b

                  id                  |                   stream_name                   |   type   | position | global_position |            data             |               metadata               |            time
--------------------------------------+-------------------------------------------------+----------+----------+-----------------+-----------------------------+--------------------------------------+----------------------------
 8a0dc58e-7c1a-494f-962b-51255f131f1b | testStream-314c2b1c-0ec5-4f96-8793-c998194da014 | SomeType |        0 |               4 | {"attribute": "some value"} | {"metaAttribute": "some meta value"} | 2018-06-20 19:49:08.313786
(1 row)
```
