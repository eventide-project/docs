module.exports = {
  title: 'Eventide',
  description: 'Microservices and Event Sourcing for Ruby',
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
          { text: 'Pub/Sub (Publish and Subscribe)', link: '/core-concepts/pub-sub.md' },
          { text: 'Event Sourcing', link: '/core-concepts/event-sourcing.md' }
        ]
      },
      {
        text: 'User Guide', items: [
          { text: 'Overview', link: '/user-guide/' },
          { text: 'Message Store', link: '/user-guide/message-store/' },
          { text: 'Handlers', link: '/user-guide/handlers.md' },
          { text: 'Libraries', link: '/user-guide/libraries.md' },
          { text: 'Doctrine of Useful Objects', link: '/user-guide/useful-objects.md' }
        ]
      },
      { text: 'API', link: '/api/' },
      {
        text: 'Examples', items: [
          { text: 'Overview', link: '/examples/overview.md' },
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
            'stores.md',
            'components.md',
            'consumers.md'
          ]
        }
      ],
      '/core-concepts/messages-and-messaging/': [
        {
          title: 'Messages',
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
            'tools.md',
            'anatomy.md',
            'interface.md'
          ]
        }
      ]
    }
  }
}
