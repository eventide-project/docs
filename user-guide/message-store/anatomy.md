# Anatomy of the Message Store

The message store is a single table named `messages`. Interaction with the message store is effected through Postgres [server functions](./server-functions.md) that ensure the correct semantics for the writing of messages to streams, and the reading of messages from streams and categories.

## Database

By default, the message store database is named `message_store`.

See the [installation guide](./install.md#database-name) for more info on varying the database name.

## Schema

All message store database objects are contained within a schema named `message_store`.

## User/Role

By default, a role named `message_store` is created. The `message_store` role is the owner of the `message_store` schema. The role is granted all necessary privileges to the database objects.

## Messages Table

| Column | Type | Description | Default | Nullable |
| --- | --- | --- | --- | --- |
| id | UUID | Identifier of a message entry and primary key | gen_random_uuid() | No |
| stream_name | varchar | Name of stream to which the message belongs | | No |
| type | varchar | The type of the message | | No |
| position | bigint | The ordinal position of the message in its stream. Position is gapless. | | No |
| global_position | bigint | The ordinal position of the message in the entire message store. Global position may have gaps. | | No |
| data | jsonb | Message payload | NULL | Yes |
| metadata | jsonb | Message metadata | NULL | Yes |
| time | timestamp | Timestamp when the message was written. The timestamp does not include a time zone. | now() AT TIME ZONE 'utc' | No |

## Indexes

| Name | Columns | Unique | Note |
| --- | --- | --- | --- |
| messages_id | id | Yes | Enforce uniqueness as secondary key |
| messages_stream | stream_name, position | Yes | Ensures uniqueness of position number in a stream |
| messages_category | category(stream_name), global_position, category(metadata->>'correlationStreamName') | No | Used when retrieving by category name |

## Source Code

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

Source: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database/table/messages.sql](https://github.com/eventide-project/message-store-postgres-database/blob/master/database/table/messages.sql)

### Index Definitions

``` sql
CREATE UNIQUE INDEX messages_id_uniq_idx ON messages (
  id
);
```

Source: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-id-uniq.sql](https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-id-uniq.sql)

``` sql
CREATE UNIQUE INDEX messages_stream_name_position_correlation_uniq_idx ON messages (
  stream_name,
  position,
  category(metadata->>'correlationStreamName')
);
```

Source: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-stream-name-position-correlation-uniq.sql](https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-stream-name-position-correlation-uniq.sql)

``` sql
CREATE INDEX messages_category_global_position_correlation_idx ON messages (
  category(stream_name),
  global_position,
  category(metadata->>'correlationStreamName')
);
```

Source: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-category-global-position-correlation.sql](https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-category-global-position-correlation.sql)
