# Anatomy of the Message Store

The message store is a single table named `messages`. Interaction with the message store is effected through Postgres [server functions](./interface.md) that ensure the correct semantics for the writing of messages to streams, and the reading of messages from streams and categories.

## Messages Table

| Column | Type | Description | Default | Nullable |
| --- | --- | --- | --- | --- |
| id | UUID | Identifier of a message entry and primary key | gen_random_uuid() | No |
| stream_name | varchar(255) | Name of stream to which the message belongs | | No |
| type | varchar(255) | The type of the message | | No |
| position | bigint | The ordinal position of the message in a stream. Position is gapless. | | No |
| global_position | bigint | The ordinal position of the message in the entire message store. Global position may have gaps. | | No |
| data | jsonb | Message payload | NULL | Yes |
| metadata | jsonb | Message metadata | NULL | Yes |
| time | timestamp | Timestamp of message when written to the store without timezone | now() AT TIME ZONE 'utc' | No |

## Indexes

| Name | Columns | Unique | Note |
| --- | --- | --- | --- |
| messages_id_idx | id | No | Uniqueness is enforced as primary key |
| messages_stream_name_position_uniq_idx| stream_name, position | Yes | Ensures uniqueness of position number in a stream |
| messages_category_global_position_idx | category(stream_name), global_position | No | Used when retrieving by category name |

## Source Code

### Table Definition

``` sql
-- ----------------------------
--  Table structure for messages
-- ----------------------------
CREATE TABLE "public"."messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "stream_name" varchar(255) NOT NULL COLLATE "default",
  "type" varchar(255) NOT NULL COLLATE "default",
  "position" bigint NOT NULL,
  "global_position" bigserial NOT NULL ,
  "data" jsonb,
  "metadata" jsonb,
  "time" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL
)
WITH (OIDS=FALSE);

-- ----------------------------
--  Primary key structure for table messages
-- ----------------------------
ALTER TABLE "public"."messages" ADD PRIMARY KEY ("global_position") NOT DEFERRABLE INITIALLY IMMEDIATE;
```

Source: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database/table/messages-table.sql](https://github.com/eventide-project/message-store-postgres-database/blob/master/database/table/messages-table.sql)

### Index Definitions

``` sql
CREATE INDEX CONCURRENTLY  "messages_id_idx" ON "public"."messages" USING btree(id ASC NULLS LAST);
```

Source: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-id.sql](https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-id.sql)

``` sql
CREATE UNIQUE INDEX CONCURRENTLY "messages_stream_name_position_uniq_idx" ON "public"."messages" USING btree(stream_name COLLATE "default" "pg_catalog"."text_ops" ASC NULLS LAST, "position" "pg_catalog"."int8_ops" ASC NULLS LAST);
```

Source: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-stream-name-position-uniq.sql](https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-stream-name-position-uniq.sql)

``` sql
CREATE INDEX CONCURRENTLY "messages_category_global_position_idx" ON "public"."messages" USING btree(category(stream_name) COLLATE "default" "pg_catalog"."text_ops" ASC NULLS LAST, "global_position" "pg_catalog"."int8_ops" ASC NULLS LAST);
```

Source: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-category-global-position.sql](https://github.com/eventide-project/message-store-postgres-database/blob/master/database/indexes/messages-category-global-position.sql)
