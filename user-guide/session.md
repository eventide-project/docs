---
sidebar: auto
sidebarDepth: 0
---

# Session

A session controls the lifecycle of a connection to a message store database, and the execution of data storage and retrieval commands and atomic database transactions.

## Session Facts

- A database connection is not opened when a session is constructed
- A session's database connection is not opened until a database command is executed
- Once a connection is opened, it remains connected throughout the lifetime of the session, or until the database server resets or closes the connection
- If a database connection is closed, it will be reconnected when the next database command is executed
- Atomic transactions must be started and controlled explicitly (if they are used at all)

## MessageStore::Postgres::Session Class

The `MessageStore::Postgres::Session` class is the implementation of the session.

[View on GitHub](https://github.com/eventide-project/message-store-postgres/blob/master/lib/message_store/postgres/session.rb)

## Constructing a Session

Handlers can be constructed in one of two ways

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
build(settings: MessageStore::Postgres::Settings.instance)
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
