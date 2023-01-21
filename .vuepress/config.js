import { defaultTheme } from '@vuepress/theme-default';
import { searchPlugin } from '@vuepress/plugin-search';

export default {
  title: 'Eventide',
  description: 'Pub/Sub, Event Sourcing, Evented Microservices',
  dest: './_build',
  plugins: [searchPlugin()],
  theme: defaultTheme({
    activeHeaderLinks: true,
    navbar: [
      { text: 'Home', link: '/' },
      {
        text: 'Setup', children: [
          { text: 'Postgres', link: '/setup/postgres.md' },
          { text: 'EventStore', link: '/setup/eventstore.md' }
        ]
      },
      {
        text: 'Core Concepts', children: [
          { text: 'Streams', link: '/core-concepts/streams/' },
          { text: 'Services', link: '/core-concepts/services/' },
          { text: 'Messages and Messaging', link: '/core-concepts/messages-and-messaging/' },
          { text: 'Pub/Sub', link: '/core-concepts/pub-sub.md' },
          { text: 'Event Sourcing', link: '/core-concepts/event-sourcing.md' }
        ]
      },
      {
        text: 'User Guide', children: [
          { text: 'Message DB', link: '/user-guide/message-db/' },
          { text: 'Handlers', link: '/user-guide/handlers.md' },
          { text: 'Messages and Message Data', link: '/user-guide/messages-and-message-data/' },
          { text: 'Stream Names', link: '/user-guide/stream-names/' },
          { text: 'Entity Projection', link: '/user-guide/projection.md' },
          { text: 'Entity Store, Caching, Snapshotting', link: '/user-guide/entity-store/' },
          { text: 'Entities', link: '/user-guide/entities.md' },
          { text: 'Writing Messages', link: '/user-guide/writing/' },
          { text: 'Retrieving Messages', link: '/user-guide/retrieving/' },
          { text: 'Reading Messages', link: '/user-guide/reading.md' },
          { text: 'Consumers', link: '/user-guide/consumers.md' },
          { text: 'Component Host', link: '/user-guide/component-host.md' },
          { text: 'Session', link: '/user-guide/session.md' },
          { text: 'Settings', link: '/user-guide/settings.md' },
          { text: 'Logging', link: '/user-guide/logging/' },
          { text: 'Test Fixtures', link: '/user-guide/test-fixtures/' },
          { text: 'Code Generator', link: '/user-guide/code-generator.md' },
          { text: 'Libraries', link: '/user-guide/libraries.md' },
          { text: 'Doctrine of Useful Objects', link: '/user-guide/useful-objects.md' }
        ]
      },
      {
        text: 'Examples', children: [
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
      '/user-guide/message-db/': [
        {
          title: 'Message DB',
          collapsable: false,
          children: [
            '',
            'server-functions.md',
            'anatomy.md',
            'tools.md',
            'install.md',
            'update.md'
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
      '/user-guide/writing/': [
        {
          title: 'Writing Messages',
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
      '/user-guide/retrieving/': [
        {
          title: 'Retrieving Messages',
          collapsable: false,
          children: [
            '',
            'batch.md',
            'last.md'
          ]
        }
      ],
      '/user-guide/entity-store/': [
        {
          title: 'Entity Store, Caching, Snapshotting',
          collapsable: false,
          children: [
            '',
            'entity-cache.md',
            'snapshotting.md',
            'substitute.md'
          ]
        }
      ],
      '/user-guide/logging/': [
        {
          title: 'Logging',
          collapsable: false,
          children: [
            '',
            'log-tags.md'
          ]
        }
      ],
      '/user-guide/test-fixtures/': [
        {
          title: 'Test Fixtures',
          collapsable: false,
          children: [
            '',
            'handler-fixture.md',
            'message-fixture.md',
            'message-metadata-fixture.md',
            'writer-fixture.md',
            'projection-fixture.md',
            'schema-equality-fixture.md',
            'schema-assignment-fixture.md'
          ]
        }
      ]
    }
  })
}
