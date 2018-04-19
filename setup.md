---
sidebar: auto
sidebarDepth: 0
---

# Setup

## Software Prerequisites

- Ruby (minimum version: 2.4)
- Postgres (minimum version: 9.5)
- Git (minimum version: 2)
- GCC (required for installing the PG gem)

## Create the Message Store Postgres Database

The `evt-message_store-postgres` gem includes a command line tool for creating the message store database.

Install the gem:

```
gem install evt-message_store-postgres
```

Create the database:

```
evt-pg-create-db
```

Form more background on the Postgres message store database, you can explore the SQL scripts at:

https://github.com/eventide-project/message-store-postgres/tree/master/database

## Installing the Full Stack

### Postgres Implementation (Bundler)

```ruby
# Gemfile
source 'https://rubygems.org'
gem 'eventide-postgres'
```

### EventStore Implementation (Bundler)

```ruby
# Gemfile
source 'https://rubygems.org'
gem 'eventide-event_store'
```

- - -
Installing the full stack will also install the command line tool for creating the message store database (see above).
- - -

### Target Directory

We recommend against installing **any** stack or framework into the system-wide gem registry.

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

## Without Bundler

### Postgres Implementation

```
gem install eventide-postgres --install-dir ./gems
```

### EventStore Implementation

```
gem install eventide-event_store --install-dir ./gems

```
- - -
**Next: [Quickstart](quickstart.md)**
