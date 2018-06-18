---
sidebar: auto
sidebarDepth: 0
---

# Eventide for Postgres Setup

## Software Prerequisites

- Ruby (minimum version: 2.4)
- Postgres (minimum version: 9.5)
- GCC (required for installing the PG gem)

## Create the Message Store Postgres Database

The `evt-message_store-postgres-database` gem includes a command line tool for creating the message store database.

This gem will be installed by installing the


Install the gem:

```
gem install evt-message_store-postgres-database
```

Create the database:

```
evt-pg-create-db
```

Form more background on the Postgres message store database, you can explore the SQL scripts at:

[https://github.com/eventide-project/message-store-postgres-database/tree/master/database](https://github.com/eventide-project/message-store-postgres-database/tree/master/database)

## Installing the Full Stack

::: tip
Installing the full stack will also install the command line tool for creating the message store database described above.
:::

### Via Bundler

```ruby
# Gemfile
source 'https://rubygems.org'
gem 'eventide-postgres'
```

### Target Directory

::: warning
We recommend against installing _any_ stack or framework into the system-wide gem registry.
:::

Rather than install the Eventide toolkit into the system-wide registry, we _recommend_ that you install the gems into the directory structure of the project that uses Eventide. This is not strictly required, but it's a habit that can help avoid time spent troubleshooting and debugging unintended consequences of having the same library installed in multiples locations in the search path.

The following command installs the gems into a subdirectory named `gems` of the current directory.

```
bundle install --path=./gems
```

For example, if the current directory is `my-project`, then command above would install the gems into `my-project/gems`.

All examples of components built using Eventide that are produced by the Eventide Project's team install gem dependencies using Bundler's _[standalone](http://bundler.io/man/bundle-install.1.html)_ mode:

```
bundle install --standalone --path=./gems
```

### Without Bundler

```
gem install eventide-postgres --install-dir ./gems
```
