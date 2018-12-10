---
sidebar: auto
sidebarDepth: 0
---

# Session

A session controls the lifecycle of a connection to a message store database, and the execution of data storage and retrieval commands and atomic database transactions.

By default, a session's connection settings are read from a [file](#settings), but settings can be assigned by any means.

## Session Facts

- A database connection is not opened when a session is constructed
- A session's database connection is not opened until a database command is executed
- Once a connection is opened, it remains connected throughout the lifetime of the session, or until the database server resets or closes the connection
- If a database connection is closed, it will be reconnected when the next database command is executed
- Atomic transactions must be started and controlled explicitly (if they are used at all)

## MessageStore::Postgres::Session Class

The `Session` class is a concrete class from the [`MessageStore::Postgres` library](../libraries.md#message-store-postgres) and namespace.

The `Session` class provides:

- The `execute` method for sending commands to the [message store](/user-guide/message-store/)
- The `transaction` method for executing commands in an atomic transaction
- The `open`/`connect` methods for connecting to the message store
- The `close` method for terminating the connection to the message store
- The `connected`/`open?` methods for determining if the connection is open
- The `reset` method for resetting the connection

## Executing a SQL Command

A SQL command is executed by the session object using the session's database connection. If the connection has not been opened, a connection will be opened before the command is executed by the session.

``` ruby
execute(sql_command, params=nil)
```

**Returns**

The result of executing a SQL command via the [PG](https://deveiate.org/code/pg/) gem.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| sql_command | A SQL statement to be executed by the database | String |
| params | An array of values to substitute for the SQL command's parameter placeholders | Array |

See [PG::Connection.exec()](https://deveiate.org/code/pg/PG/Connection.html#method-i-exec) and [PG::Connection.exec_params()](https://deveiate.org/code/pg/PG/Connection.html#method-i-exec_params) for more.

## Transaction

All database operations executed within a transaction will either succeed as a whole or be rolled back as a whole if any individual operation fails. If a connection has not been opened, a connection will be opened before the transaction is started.

``` ruby
transaction(&blk)
```

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| blk | A block that is executed within the bounds of a database transaction | Proc |

``` ruby
session.transaction do
  session.execute(some_command_1)
  session.execute(some_command_2)
end
```

<div class="note custom-block">
  <p>
    Note that the transaction mechanism is used by message writers to write batches of messages as an atomic unit.
  </p>
</div>

## Connecting to the Message Store Database

``` ruby
open()
```

**Alias**

`connect`

**Returns**

Instance of [PG::Connection](https://deveiate.org/code/pg/PG/Connection.html).

The `connect` method sets the session object's `connection` attribute. The connection is used throughout the lifecycle of the session.

If the session object already has a connection object when `connect` is invoked, the existing connection is used.

## Close a Session's Connection

``` ruby
close()
```

## Determine if a Sessions Connection is Open

``` ruby
connected?
```

**Alias**

`open?`

**Returns**

Boolean

The session will return `true` if the connection is open.

``` ruby
session.connect

session.connected?
# => true

session.close
session.connected?
# => false
```

## Reset a Session's Connection

Reset's the session's database connection.

``` ruby
reset()
```

See see: [https://deveiate.org/code/pg/PG/Connection.html#method-i-reset](https://deveiate.org/code/pg/PG/Connection.html#method-i-reset) for more.

## Settings

The connection initialization data are provided through the capabilities of the `MessageStore::Postgres::Settings` class, which is an implementation of Eventide's [Settings](https://github.com/eventide-project/settings/blob/master/README.md) class.

By default, the connection data is stored in a file located at `{component_root}/settings/message_store_postgres.json`

### Example Settings File

``` javascript
{
  "dbname": "message_store",
  "host": "localhost",
  "hostaddr": "127.0.0.1",
  "port": 5432,
  "user": "message_store"
  "password": "********"
}
```

### Settings Attributes

The `Session` class provides the following settings attributes for controlling the database connection:

- `dbname`
- `host`
- `hostaddr`
- `port`
- `user`
- `password`
- `connect_timeout`
- `options`
- `sslmode`
- `krbsrvname`
- `gsslib`
- `service`

The connection initialization data reflects the attributes of the `PG` library's `Connection` class. For more details, see: [https://deveiate.org/code/pg/PG/Connection.html#method-c-new](https://deveiate.org/code/pg/PG/Connection.html#method-c-new).

## Constructing a Session

Sessions can be constructed in one of two ways

- Via the initializer
- Via the constructor

### Via the Initializer

``` ruby
Session.new()
```

**Returns**

Instance of the session.

By constructing a session using the initializer, the session's settings are not set to operational values. A session instance in this state must still be assigned with operational connection initialization data before a database connection can be made.

### Via the Constructor

``` ruby
self.build(settings: MessageStore::Postgres::Settings.instance)
```

The constructor not only instantiates the session, but also sets the session's settings to operational values.

**Returns**

Instance of the session.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| settings | A settings object containing connection initialization data | Settings |

``` ruby
session = Session.build()
```

## Constructing Settings and a Session from Memory Variables

In cases where reading settings from a file is impractical, a settings object can be constructed directly, assigned values, and a session can be constructed from it.

``` ruby{9}
database, host, username = get_some_connection_settings()

data = {
  dbname: database,
  host: host,
  user: username
}

settings = MessageStore::Postgres::Settings.new(data)
```

## Log Tags

The following tags are applied to log messages recorded by a session:

| Tag | Description |
| --- | --- |
| session | Applied to all log messages recorded by a session |
| message_store | Applied to all log messages recorded inside the `MessageStore` namespace |

The following tags _may_ be applied to log messages recorded by a session:

| Tag | Description |
| --- | --- |
| sql | Applied to log messages that record the SQL commands sent to the message store through the session |
| data | Applied to log messages that record the content of data |

See the [logging](/user-guide/logging/) user guide for more on log tags.
