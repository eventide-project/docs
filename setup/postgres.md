---
sidebar: auto
sidebarDepth: 0
---

# Eventide for Postgres Setup

## Software Prerequisites

- Ruby (minimum version: 2.4)
- Postgres (minimum version: 9.5)
- GCC (required for installing the PG gem)

## Install the Eventide Postgres Gem

### Using RubyGems Directly
``` bash
gem install eventide-postgres
```

### Via Bundler

``` ruby
# Gemfile
source 'https://rubygems.org'
gem 'eventide-postgres'
```

``` bash
bundle install
```

## Create the Message Store Database

See the [installation](/user-guide/message-db/install.md) section of the [message store documentation](/user-guide/message-db/) for instructions on running the database creation command line tool.

The command to install the database is:

``` bash
evt-pg-create-db
```

Or via Bundler:

``` bash
bundle exec evt-pg-create-db
```

## Installation Directory

::: warning
We recommend against installing _any_ stack or framework into the system-wide gem registry.
:::

Rather than install the Eventide toolkit into the system-wide registry, we _recommend_ that you install the gems into the directory structure of the project that uses Eventide. This is not strictly required, but it's a habit that can help avoid time spent troubleshooting and debugging unintended consequences of having the same library installed in multiples locations in the search path.

The following command installs the gems into a subdirectory named `gems` of the current directory:

### Via RubyGems

``` bash
gem install eventide-postgres --install-dir ./gems
```

### Via Bundler

``` bash
bundle install --path=./gems
```

For example, if the current directory is `my-project`, then command above would install the gems into `my-project/gems`.
