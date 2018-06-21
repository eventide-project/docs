---
sidebar: auto
sidebarDepth: 0
pageClass: setup-for-eventstore
---

# Eventide for EventStore Setup

The EventStore implementation for Eventide is available as a commercial offering. While the packages and code are freely-available as MIT-licensed open source, they are only supported via commercial support.

<div class="home">
  <div class="hero">
    <p class="action">
      <a href="mailto:commercial-support@eventide-project.org?subject=Eventide for EventStore" class="nav-link action-button" target="_blank">Contact Us About Commercial Support for EventStore</a>
    </p>
  </div>
</div>

## Software Prerequisites

- Ruby (minimum version: 2.4)
- Git (minimum version: 2)
- GCC (required for installing the PG gem)
- EventStore ([eventstore.org](https://eventstore.org/))

## Installation

### Install Via Bundler

``` ruby
# Gemfile
source 'https://rubygems.org'
gem 'eventide-event_store'
```

### Target Directory

::: warning
We recommend against installing _any_ stack or framework into the system-wide gem registry.
:::

Rather than install the Eventide toolkit into the system-wide registry, we _recommend_ that you install the gems into the directory structure of the project that uses Eventide. This is not strictly required, but it's a habit that can help avoid time spent troubleshooting and debugging unintended consequences of having the same library installed in multiples locations in the search path.

The following command installs the gems into a subdirectory named `gems` of the current directory.

``` bash
bundle install --path=./gems
```

For example, if the current directory is `my-project`, then command above would install the gems into `my-project/gems`.

All examples of components built using Eventide that are produced by the Eventide Project's team install gem dependencies using Bundler's _[standalone](http://bundler.io/man/bundle-install.1.html)_ mode:

``` bash
bundle install --standalone --path=./gems
```

### Install Via RubyGems

``` bash
gem install eventide-event_store --install-dir ./gems
```
