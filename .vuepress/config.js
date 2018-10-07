module.exports = {
  title: 'Eventide',
  description: 'Microservices and Event Sourcing in Ruby',
  dest: './_build',
  themeConfig: {
    activeHeaderLinks: true,
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Setup', items: [
          { text: 'Postgres', link: '/setup/postgres.md' },
          { text: 'EventStore', link: '/setup/eventstore.md' }
        ]
      },
      {
        text: 'Core Concepts', items: [
          { text: 'Streams', link: '/core-concepts/streams/' },
          { text: 'Services', link: '/core-concepts/services/' },
          { text: 'Messages and Messaging', link: '/core-concepts/messages-and-messaging/' },
          { text: 'Pub/Sub', link: '/core-concepts/pub-sub.md' },
          { text: 'Event Sourcing', link: '/core-concepts/event-sourcing.md' }
        ]
      },
      {
        text: 'User Guide', items: [
          { text: 'Work in Progress', link: '/user-guide/' },
          { text: 'Message Store', link: '/user-guide/message-store/' },
          { text: 'Handlers', link: '/user-guide/handlers.md' },
          { text: 'Messages and Message Data', link: '/user-guide/messages-and-message-data/' },
          { text: 'Stream Names', link: '/user-guide/stream-names/' },
          { text: 'Writers', link: '/user-guide/writers/' },
          { text: 'Entity Projection', link: '/user-guide/projection.md' },
          { text: 'Entity Store', link: '/user-guide/store.md' },
          { text: 'Consumers', link: '/user-guide/consumers.md' },
          { text: 'Component Host', link: '/user-guide/component-host.md' },
          { text: 'Session', link: '/user-guide/session.md' },
          { text: 'Libraries', link: '/user-guide/libraries.md' },
          { text: 'Doctrine of Useful Objects', link: '/user-guide/useful-objects.md' }
        ]
      },
      {
        text: 'Examples', items: [
          { text: 'Overview', link: '/examples/' },
          { text: 'Service at a Glance', link: '/examples/at-a-glance.md' },
          { text: 'Quickstart', link: '/examples/quickstart.md' },
          { text: 'Example Projects', link: '/examples/example-projects.md' }
        ]
      },
      { text: 'Glossary', link: '/glossary.md' }
    ],
    sidebar: {
      '/examples/': [
        {
          title: 'Examples',
          collapsable: false,
          children: [
            'at-a-glance.md',
            'quickstart.md',
            'example-projects.md'
          ]
        }
      ],
      '/core-concepts/streams/': [
        {
          title: 'Streams',
          collapsable: false,
          children: [
            '',
            'reading-and-writing.md',
            'uses-of-streams.md',
            'stream-names.md',
            'streams-vs-queues.md'
          ]
        }
      ],
      '/core-concepts/services/': [
        {
          title: 'Services',
          collapsable: false,
          children: [
            '',
            'handlers.md',
            'entities.md',
            'projections.md',
            'stores.md',
            'components.md',
            'consumers.md'
          ]
        }
      ],
      '/core-concepts/messages-and-messaging/': [
        {
          title: 'Messages and Messaging',
          collapsable: false,
          children: [
            '',
            'messaging.md',
            'commands-and-events.md'
          ]
        }
      ],
      '/user-guide/message-store/': [
        {
          title: 'Message Store',
          collapsable: false,
          children: [
            '',
            'install.md',
            'anatomy.md',
            'interface.md',
            'tools.md'
          ]
        }
      ],
      '/user-guide/stream-names/': [
        {
          title: 'Stream Names',
          collapsable: false,
          children: [
            '',
            'messaging-stream-name.md',
            'messaging-category.md',
            'message-store-stream-name.md'
          ]
        }
      ],
      '/user-guide/messages-and-message-data/': [
        {
          title: 'Messages and Message Data',
          collapsable: false,
          children: [
            '',
            'messages.md',
            'metadata.md',
            'message-data.md'
          ]
        }
      ],
      '/user-guide/writers/': [
        {
          title: 'Writers',
          collapsable: false,
          children: [
            '',
            'message-writer.md',
            'message-data-writer.md',
            'atomic-batches.md',
            'expected-version.md',
            'no-stream.md',
            'substitute.md'
          ]
        }
      ],
      '/user-guide/entity-store/': [
        {
          title: 'Entity Store',
          collapsable: false,
          children: [
            '',
            'entity-cache.md',
            'substitute.md'
          ]
        }
      ]
    }
  }
}
