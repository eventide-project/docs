# Update

The Message DB database comes with an update script that can be used to update a Postgres Message Store database to a Message DB database.

## Installation

Message DB can be installed either as a Ruby Gem, an NPM package, or can simply be cloned from the [Message DB Git repository](https://github.com/message-db/message-db).

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

- Make sure that your default Postgres user has administrative privileges
- Determine what your current installed version of the database is by running the `print-message-store-version.sh` script from the `database` directory of your Message DB installation. If you installed Message DB using NPM, the script is in the root directory of the Message DB installation, rather than the `database` directory.

### Cumulative Update Scripts

Message DB has a different script for each version that requires an update. Each script should be run in series until your database is up-to-date.

For example, if your database is at v1 and the latest version is v3 (note: _not_ real versions), you need to run the v2 update script and then run the v3 update script.

This is done to keep critical control of the database update process in your hands. There's no magic in updating a database, and it's serious enough business that the updates require human operator engagement with the process.

### Update Script Directory

Update scripts are located in the `database/update` directory of your Message DB installation.

If you installed Message DB using NPM, the script is in the root directory of the Message DB installation, rather than the `database` directory.

### From the Git Clone

The update scripts are in the `database/update` directory of the cloned repo. Change directory to the `message-db` directory where you cloned the repo and run the script that corresponds to the needed update.

For example, to update to v1.0.0, run:

``` bash
database/update/1.0.0.sh
```

If you originally installed the database with another database name, you can specify the database name as an environment variable:

``` bash
DATABASE_NAME=some_other_name database/update/1.0.0.sh
```

### From the Ruby Executable

If you installed Message DB via RubyGems, the database definition code is installed in your gem directory along with the Message DB gem.

A ruby executable is installed with the gem that will print out the directory where the database code resides.

The executable will be in the gem executable search path and may also be executed through bundler:

``` bash
bundle exec mdb-print-database-scripts-dir
```

Change directory to the directory printed by `mdb-print-database-scripts-dir` and run the script that corresponds to the needed update.

For example, to update to v1.0.0, run:

``` bash
database/update/1.0.0.sh
```

If you originally installed the database with another database name, you can specify the database name as an environment variable:

``` bash
DATABASE_NAME=some_other_name database/update/1.0.0.sh
```

For more information about Ruby executables installed with the `message-db` Ruby Gem, see the Eventide docs on the administration tools that are bundled with the gem:

[http://docs.eventide-project.org/user-guide/message-db/tools.html](http://docs.eventide-project.org/user-guide/message-db/tools.html)

### From the NPM Module

The `message-db` NPM module doesn't ship with any special tooling other than the bundled scripts.

To execute the update script, navigate to the directory where the `message-db` module is installed and run the script that corresponds to the needed update.

For example, to update to v1.0.0, run:

``` bash
update/1.0.0.sh
```

If you originally installed the database with another database name, you can specify the database name as an environment variable:

``` bash
DATABASE_NAME=some_other_name update/1.0.0.sh
```

## Changes Made to an Existing Database by the Update to v1.0.0

Users updating their message store from a pre-v1 version of the message store will ahve the following changes made to their database:

**Note: There are no changes to the `messages` table, and no data migration is necessary.**

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

[https://github.com/message-db/message-db/blob/master/database/update/1.0.0.sh](https://github.com/message-db/message-db/blob/master/database/update/1.0.0.sh)

For a complete list of changes to the message store database effected by the update, see:

[https://github.com/message-db/message-db/blob/master/database/update/1.0.0.md](https://github.com/message-db/message-db/blob/master/database/update/1.0.0.md)
