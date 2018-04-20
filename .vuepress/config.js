module.exports = {
  title: 'Eventide',
  description: 'Microservices and Event Sourcing for Ruby',
  dest: './_build',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Setup', items: [
          { text: 'Postgres', link: '/setup/postgres.md' },
          { text: 'EventStore', link: '/setup/eventstore.md' },
        ]
      },
      {
        text: 'Examples', items: [
          { text: 'Quickstart', link: '/examples/quickstart.md' },
          { text: 'Example Projects', link: '/examples/example-projects.md' },
        ]
      },
      { text: 'Glossary', link: 'glossary.md' },
    ],
    sidebar: {
      '/examples/': [
        {
          title: 'Examples',
          collapsable: false,
          children: [
            'quickstart.md',
            'example-projects.md'
          ]
        }
      ]
    }
  }
}
