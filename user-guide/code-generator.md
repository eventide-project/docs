---
sidebar: auto
sidebarDepth: 0
---

# Component Code Generator

The command line component generator provides a starting point for Eventide component development.

It generates a skeleton project of the basic structure of a component, along with some TODO comments that point out the missing pieces of the component implementation that need to be provided.

It generates placeholders for message handlers, messages, an entity, projection, and store. It generates a settings file for the Postgres database connection, a test directory with supporting files to initialize the component during testing, as well as placeholders for test controls.

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
evt component some_component
```

## Generated Output

```
something-component
|-lib
| |-something_component
| | |-messages
| | | |-commands
| | | |-events
| | |-handlers
| | | |-commands.rb
| | | |-events.rb
| | |-projection.rb
| | |-something.rb
| | |-store.rb
| | |-controls
| | | |-something.rb
| | | |-version.rb
| | | |-id.rb
| | | |-time.rb
| | |-controls.rb
| |-something_component.rb
|-settings
| |-message_store_postgres.json.example
|-test
| |-test_init.rb
| |-automated
| | |-database_connection.rb
| | |-automated_init.rb
| |-automated.rb
| |-interactive
| | |-interactive_init.rb
|-.gitignore
|-init.rb
|-install-gems.sh
|-Gemfile
|-load_path.rb
|-README.md
|-something_component.gemspec
|-test.sh
```
