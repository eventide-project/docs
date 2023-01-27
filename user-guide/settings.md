---
sidebar: auto
sidebarDepth: 1
---

# Settings

The connection initialization data are provided through the capabilities of the `MessageStore::Postgres::Settings` class.

By default, the connection data is stored in a settings file, but settings data can also be provided by a hash, or by directly manipulating an instance's attributes.

## Example

``` ruby
settings = MessageStore::Postgres::Settings.build
# => #<MessageStore::Postgres::Settings:0x...
 @data=
  {"dbname"=>"message_store",
   "host"=>"localhost",
   "hostaddr"=>"127.0.0.1",
   "port"=>5432,
   "user"=>"message_store",
   "password"=>nil,
   "connect_timeout"=>nil,
   "options"=>nil,
   "sslmode"=>nil,
   "krbsrvname"=>nil,
   "gsslib"=>nil,
   "service"=>nil}>
```

## Settings Facts

- Settings data can be provided by a json settings file or by a hash
- A [Session](./session.md) instance gets its connection data from a Settings instance
- The message store's `Settings` class is an instance of Eventide's [Settings](https://github.com/eventide-project/settings/blob/master/README.md) class

## MessageStore::Postgres::Settings Class

The `Settings` class is a concrete class from the [`MessageStore::Postgres` library](../libraries.md#message-store-postgres) and namespace.

The `Settings` class provides:

- An attribute for each setting
- The `names` class method that lists the names of the settings attributes
- The `build` class method that constructs a settings instance from connection data in the default settings file location
- The initializer that receives a hash of raw settings data

## Settings Attributes

The `Settings` class provides the following settings attributes for controlling the database connection:

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

For more information on Postgres connection options, see Postgres' connection documentation: [https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-PARAMKEYWORDS](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-PARAMKEYWORDS)

The settings attributes reflect the attributes of the `PG` library's `Connection` class. For more details, see: [https://deveiate.org/code/pg/PG/Connection.html#method-c-new](https://deveiate.org/code/pg/PG/Connection.html#method-c-new).

## Settings File

::: warning
The settings file has no role in the Message DB [installation tools](/user-guide/message-db/install.md) or [administrative tools](/user-guide/message-db/tools.md). It is for the runtime configuration of an applicative connection to the message store. Message DB installation and administrative tools leverage [standard Postgres tools](https://www.postgresql.org/docs/current/app-psql.html) and their own connection configuration [environment variables](https://www.postgresql.org/docs/current/libpq-envars.html) and [optional password files](https://www.postgresql.org/docs/current/libpq-pgpass.html). These are completely independent of Eventide, and have no bearing on Eventide's own runtime database connection settings.
:::

By default, the connection data is stored in a file located at `{component_root}/settings/message_store_postgres.json`

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

## Overriding the Settings File Location

By default, the settings file is located at `{component_root}/settings/message_store_postgres.json`.

The location of the settings file path can be overridden by setting the `MESSAGE_STORE_SETTINGS_PATH` environment variable.

``` bash
MESSAGE_STORE_SETTINGS_PATH=some-other-directory/settings.json start_service.sh
```

## Constructing a Settings

Settings can be constructed in one of two ways

- Via the initializer
- Via the constructor

### Via the Initializer

``` ruby
Settings.new(data)
```

**Returns**

Instance of the `Settings` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| data | A hash of key/value pairs that correspond to the settings attributes | Hash |

``` ruby
settings = Settings.new({
  :dbname => "message_store",
  :host => "localhost",
  :user => "message_store"
})
```

### Via the Constructor

``` ruby
self.build(source='./settings/message_store_postgres.json')
```

The constructor not only instantiates the `Settings`, but also constructs either a file data source or a hash data source depending on the source argument's type. When no argument is sent, a file data source using the default settings file path is used.

The default settings file path is `./settings/message_store_postgres.json`.

**Returns**

Instance of the `Settings` class.

**Parameters**

| Name | Description | Type |
| --- | --- | --- |
| source | A file system path or a hash of key/value pairs that correspond to the settings attributes | String or Hash |

``` ruby
# Raw settings data
settings = Settings.build({
  :dbname => "message_store",
  :host => "localhost",
  :user => "message_store"
})

# Default settings file
settings = Settings.build() # Uses ./settings/message_store_postgres.json

# Specific settings file
settings = Settings.build('some_settings_file.json')
```

## Constructing Settings and a Session from Memory Variables

In cases where reading settings from a file is impractical, such as a cloud environment where connection data is provided by environment variables, a settings object can be constructed directly using a hash.

``` ruby
database = ENV['database']
host = ENV['host']
username = ENV['username']

data = {
  dbname: database,
  host: host,
  user: username
}

settings = Settings.new(data)
```

## Log Tags

The following tags are applied to log messages recorded by an instance of `Settings`:

| Tag | Description |
| --- | --- |
| settings | Applied to all log messages recorded by a `Settings` |

See the [logging](/user-guide/logging/) user guide for more on log tags.
