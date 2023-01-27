---
sidebar: auto
sidebarDepth: 1
---

# Component Code Generator

The command line component generator provides a starting point for Eventide component development.

It generates a skeleton project of the basic structure of a component, along with some TODO comments that point out the missing pieces of the component implementation that need to be provided.

It generates placeholders for message handlers, messages, an entity, projection, and store. It generates consumers, a component initiator, and a component start script. It also generates a settings file for the Postgres database connection, a test directory with supporting files to initialize the component during testing, as well as placeholders for test controls.

## Installation

``` bash
gem install evt-command_line-component_generator
```

<div class="note custom-block">
  <p>
    Note: The code generator is not included with the <code>eventide-postgres</code> gem. It's recommended that the code generator be installed in the system-wide gem registry.
  </p>
</div>

## Usage

``` bash
evt component something_component
```

## Generated Output

```
|-lib
| |-something_component
| | |-handlers
| | | |-commands.rb
| | | |-events.rb
| | |-messages
| | | |-commands
| | | |-events
| | |-consumers
| | | |-commands.rb
| | | |-events.rb
| | |-something.rb
| | |-projection.rb
| | |-store.rb
| | |-start.rb
| | |-controls
| | | |-something.rb
| | | |-version.rb
| | | |-id.rb
| | | |-time.rb
| | |-controls.rb
| |-something_component.rb
|-settings
| |-message_store_postgres.json.example
|-script
| |-start
| |-test-database-connection
|-test
| |-test_init.rb
| |-automated
| | |-database_connection.rb
| | |-automated_init.rb
| |-automated.rb
| |-interactive
| | |-interactive_init.rb
|-.gitignore
|-something_component.gemspec
|-init.rb
|-load_path.rb
|-Gemfile
|-install-gems.sh
|-test.sh
|-README.md
```
