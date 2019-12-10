# Update

The Message DB database comes with an update script that can be used to update a Postgres Message Store database to a Message DB database.

## Installation

Message DB can be installed either as a Ruby Gem, an NPM package, or can simply be cloned from this repository.

### Git Clone

``` bash
git clone git@github.com:message-db/message-db.git
```

### As a Ruby Gem

``` bash
gem install message-db
```

### As an NPM Module

``` bash
npm install @eventide/message-db
```

## Run the Update Script

### Requirements

Make sure that your default Postgres user has administrative privileges.

### From the Git Clone

The `update.sh` script is in the root directory of the cloned repo. Change directory to the `message-db` directory where you cloned the repo, and run the script:

``` bash
update.sh
```

If you originally installed the database with another database name, you can specify the database name as an environment variable:

``` bash
DATABASE_NAME=some_other_name update.sh
```

### From the Ruby Executable

If you installed Message DB via RubyGems, a database update Ruby executable will be installed with the `message-db` gem.

The update executable will be in the gem executable search path and may also be executed through bundler:

``` bash
bundle exec mdb-update
```

If you originally installed the database with another database name, you can specify the database name as an environment variable:

``` bash
DATABASE_NAME=some_other_name bundle exec mdb-update
```

For more information about Ruby executables installed with the `message-db` Ruby Gem, see the Eventide docs on the administration tools that are bundled with the gem:

[http://docs.eventide-project.org/user-guide/message-db/tools.html](http://docs.eventide-project.org/user-guide/message-db/tools.html)

### From the NPM Module

The `message-db` NPM module doesn't ship with any special tooling other than the bundled scripts.

To execute the update script, navigate to the directory where the `message-db` module is installed and run the script:

``` bash
update.sh
```

If you originally installed the database with another database name, you can specify the database name as an environment variable:

``` bash
DATABASE_NAME=some_other_name update.sh
```

## Changes Made to an Existing Database by the Update

For a complete list of changes to the message store database effected by the update, see the the main changes doc in the root Eventide repo:

[https://github.com/eventide-project/eventide/blob/master/CHANGES.md#message-db](https://github.com/eventide-project/eventide/blob/master/CHANGES.md#message-db)

**Note: There are no changes to the `messages` table, and no data migration is necessary.**

Here are the actions taken by the update script:

- Remove views
- Remove indexes
- Remove functions
- Remove the pgcrypto extension
- Create the `message_store` schema
- Install the pgcrypto extension under the `message_store` schema
- Add the existing `messages` table to the `message_store` schema
- Add the default value for the ID column under the authority of the `message_store` schema
- Install functions under the `message_store` schema
- Install indexes under the `message_store` schema
- Install views and types under the `message_store` schema
- Install privileges to the objects now in the `message_store` schema

The update script's source code can be read at:

[https://github.com/message-db/message-db/blob/master/database/update.sh](https://github.com/message-db/message-db/blob/master/database/update.sh)
