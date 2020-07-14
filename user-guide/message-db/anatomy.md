# Anatomy of the Message Store

The message store is a single table named `messages`. Interaction with the message store is effected through Postgres [server functions](./server-functions.md) that ensure the correct semantics for the writing of messages to streams, and the reading of messages from streams and categories.

## Messages Table

| Column | Description | Type | Default | Nullable |
| --- | --- | --- | --- | --- |
| id | Identifier of a message record | UUID | gen_random_uuid() | No |
| stream_name | Name of stream to which the message belongs | varchar | | No |
| type | The type of the message | varchar | | No |
| position | The ordinal position of the message in its stream. Position is gapless. | bigint | | No |
| global_position | Primary key. The ordinal position of the message in the entire message store. Global position may have gaps. | bigint | nextval('messages_global_position_seq') | No |
| data | Message payload | jsonb | NULL | Yes |
| metadata | Message metadata | jsonb | NULL | Yes |
| time | Timestamp when the message was written. The timestamp does not include a time zone. | timestamp | now() AT TIME ZONE 'utc' | No |

## Indexes

| Name | Columns | Unique | Note |
| --- | --- | --- | --- |
| messages_id | id | Yes | Enforce uniqueness as secondary key |
| messages_stream | stream_name, position | Yes | Ensures uniqueness of position number in a stream |
| messages_category | category(stream_name), global_position, category(metadata->>'correlationStreamName') | No | Used when retrieving by category name |

## Database

By default, the message store database is named `message_store`.

See the [installation guide](./install.md#database-name) for more info on varying the database name.

## Schema

All message store database objects are contained within a schema named `message_store`.

## User/Role

A role named `message_store` is created. The `message_store` role is given the `LOGIN` attribute, but no password is assigned. A password [can be assigned to the role](https://www.postgresql.org/docs/current/sql-alterrole.html), or the `message_store` role can be [granted to another Postgres user](https://www.postgresql.org/docs/current/role-membership.html).

## Source Code

View complete source code at: <br />
[https://github.com/message-db/message-db/tree/master/database](https://github.com/message-db/message-db/tree/master/database)

### Table Definition

``` sql
CREATE TABLE IF NOT EXISTS message_store.messages (
  id UUID NOT NULL DEFAULT message_store.gen_random_uuid(),
  stream_name text NOT NULL,
  type text NOT NULL,
  position bigint NOT NULL,
  global_position bigserial NOT NULL,
  data jsonb,
  metadata jsonb,
  time TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL
);

ALTER TABLE message_store.messages ADD PRIMARY KEY (global_position) NOT DEFERRABLE INITIALLY IMMEDIATE;
```

Source: [https://github.com/message-db/message-db/blob/master/database/tables/messages.sql](https://github.com/message-db/message-db/blob/master/database/tables/messages.sql)

### Index Definitions

``` sql
CREATE UNIQUE INDEX messages_id ON message_store.messages (
  id
);
```

Source: [https://github.com/message-db/message-db/blob/master/database/indexes/messages-id.sql](https://github.com/message-db/message-db/blob/master/database/indexes/messages-id.sql)

``` sql
CREATE UNIQUE INDEX messages_stream ON message_store.messages (
  stream_name,
  position
);
```

Source: [https://github.com/message-db/message-db/blob/master/database/indexes/messages-stream.sql](https://github.com/message-db/message-db/blob/master/database/indexes/messages-stream.sql)

``` sql
CREATE INDEX messages_category ON message_store.messages (
  message_store.category(stream_name),
  global_position,
  message_store.category(metadata->>'correlationStreamName')
);
```

Source: [https://github.com/message-db/message-db/blob/master/database/indexes/messages-category.sql](https://github.com/message-db/message-db/blob/master/database/indexes/messages-category.sql)
