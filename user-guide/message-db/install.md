# Installation

Running the database installation script creates the database, schema, table, indexes, functions, views, types, a user role, and limit the user's privileges to the message store's public interface.

Message DB can be installed either as a Ruby Gem, an NPM package, or can simply be cloned from the [Message DB Git repository](https://github.com/message-db/message-db).

### As a Ruby Gem

The database creation tool is installed via the `message-db` gem.

This gem can be installed on its own, and it is also included when installing the Eventide Postgres stack gem, `eventide-postgres`.

See the [setup](/setup/postgres.md) instructions for more info on installing the gems.

``` bash
gem install message-db
```

### As an NPM Module

``` bash
npm install @eventide/message-db
```

### Git Clone

``` bash
git clone git@github.com:message-db/message-db.git
```

## Run the Database Installation Script

### Requirements

Make sure that your default Postgres user has administrative privileges.

### From the Ruby Executable

If you installed Message DB via RubyGems, a database update Ruby executable will be installed with the `message-db` gem.

The executable will be in the gem executable search path and may also be executed through bundler:

``` bash
bundle exec mdb-create-db
```

For more information about Ruby executables installed with the `message-db` Ruby Gem, see the Eventide docs on the administration tools that are bundled with the gem:

[http://docs.eventide-project.org/user-guide/message-db/tools.html](http://docs.eventide-project.org/user-guide/message-db/tools.html)

### From the Git Clone

The installation script is in the `database` directory of the cloned repo. Change directory to the `message-db` directory where you cloned the repo, and run the script:

``` bash
database/install.sh
```

### From the NPM Module

The `message-db` NPM module doesn't ship with any special tooling other than the bundled scripts.

To execute the update script, navigate to the directory where the `message-db` module is installed and run the script:

``` bash
install.sh
```

## Database Name

By default, the database creation tool will create a database named `message_store`.

If you prefer either a different database name, you can override the name using the `DATABASE_NAME` environment variable.

``` bash
# Ruby
DATABASE_NAME=some_other_database bundle exec mdb-create-db

# Shell Script
DATABASE_NAME=some_other_database install.sh
```

## Disable Database Creation

By default, the installation script will create the database.

If you prefer to create the database by some other means, you can deactivate the database creation using the `CREATE_DATABASE` environment variable.

``` bash
# Ruby
CREATE_DATABASE=off bundle exec mdb-create-sb

# Shell Script
CREATE_DATABASE=off install.sh
```

## Test the Installation (Optional)

Once the database has been created, a test message can be written to it to prove that the installation is correct.

``` bash
# Ruby
bundle exec mdb-write-test-message

# Shell Script
write-test-message.sh
```

The output will be:

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
