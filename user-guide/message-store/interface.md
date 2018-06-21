# Message Store Database Interface

The message store provides an interface of Postgres server functions that you can access with any programming language, or the `psql` command line tool.

There are working examples of uses of the server functions included with the source code:

Example: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database](https://github.com/eventide-project/message-store-postgres-database/blob/master/database)

## Write a Message

Write a JSON-formatted message to a named stream, optionally specifying JSON-formatted metadata and an expected version number.

``` sql
write_message(
  _id varchar,
  _stream_name varchar,
  _type varchar,
  _data jsonb,
  _metadata jsonb DEFAULT NULL,
  _expected_version bigint DEFAULT NULL
)
```

### Arguments

| Name | Type | Description | Default | Example |
| --- | --- | --- | --- | --- |
| _id | varchar | UUID of the message being written | | a5eb2a97-84d9-4ccf-8a56-7160338b11e2 |
| _stream_name | varchar | Name of stream to which the message is written | | someStream-123 |
| _type | varchar | Name of stream to which the message is written | | Withdrawn |
| _data | jsonb | JSON representation of the message body | | {"messageAttribute": "some value"} |
| _metadata (optional) | jsonb | JSON representation of the message metadata | NULL | {"metaDataAttribute": "some meta data value"} |
| _expected_version (optional) | bigint | Version that the stream is expected to be when the message is written | NULL | 11 |

### Usage

``` sql
SELECT write_message('uuid'::varchar, 'stream_name'::varchar, 'message_type'::varchar, '{"messageAttribute": "some value"}'::jsonb, '{"metaDataAttribute": "some meta data value"}'::jsonb);"
```

Example: [https://github.com/eventide-project/message-store-postgres-database/blob/master/database/write-test-message.sh](https://github.com/eventide-project/message-store-postgres-database/blob/master/database/write-test-message.sh)

### Specifying the Expected Version of the Stream

``` sql
SELECT write_message('uuid'::varchar, 'stream_name'::varchar, 'message_type'::varchar, '{"messageAttribute": "some value"}'::jsonb, '{"metaDataAttribute": "some meta data value"}'::jsonb, expected_version::bigint);"
```

NOTE: If the expected version does not match the stream version at the time of the write, an error is raised of the form:

```
'Wrong expected version: % (Stream: %, Stream Version: %)'
```

Example: [https://github.com/eventide-project/message-store-postgres-database/blob/master/test/write_message_expected_version.sh](https://github.com/eventide-project/message-store-postgres-database/blob/master/test/write_message_expected_version.sh)

## Get Messages from a Stream

Retrieve messages from a single stream, optionally specifying the starting position, the number of messages to retrieve, and an additional condition that will be appended to the SQL command's WHERE clause.

``` sql
get_stream_messages(
  _stream_name varchar,
  _position bigint DEFAULT 0,
  _batch_size bigint DEFAULT 1000,
  _condition varchar DEFAULT NULL
)
```

### Arguments

| Name | Type | Description | Default | Example |
| --- | --- | --- | --- | --- |
| _stream_name | varchar | Name of stream to retrieve messages from | | someStream-123 |
| _position (optional) | bigint | Starting position of the messages to retrieve | 0 | 11 |
| _batch_size (optional) | bigint | Number of messages to retrieve | 1000 | 111 |
| _condition (optional) | varchar | WHERE clause fragment | NULL | messages.time >= current_timestamp |

### Usage

``` sql
SELECT * FROM get_stream_messages('stream_name'::varchar, starting_position::bigint, batch_size::bigint, _condition => 'messages.time >= current_timestamp'::varchar);"
```

Example: [https://github.com/eventide-project/message-store-postgres-database/blob/master/test/get_stream_messages.sh](https://github.com/eventide-project/message-store-postgres-database/blob/master/test/get_stream_messages.sh)

## Get Messages from a Stream Category

Retrieve messages from a category or streams, optionally specifying the starting position, the number of messages to retrieve, and an additional condition that will be appended to the SQL command's WHERE clause.

``` sql
CREATE OR REPLACE FUNCTION get_category_messages(
  _category_name varchar,
  _position bigint DEFAULT 0,
  _batch_size bigint DEFAULT 1000,
  _condition varchar DEFAULT NULL
)
```

### Arguments

| Name | Type | Description | Default | Example |
| --- | --- | --- | --- | --- |
| _category_name | varchar | Name of the category to retrieve messages from | | someStream |
| _position (optional) | bigint | Starting position of the messages to retrieve | 0 | 11 |
| _batch_size (optional) | bigint | Number of messages to retrieve | 1000 | 111 |
| _condition (optional) | varchar | WHERE clause fragment | NULL | messages.time >= current_timestamp |

### Usage

``` sql
SELECT * FROM get_category_messages('cateogry_name'::varchar, starting_position::bigint, batch_size::bigint, _condition => 'messages.time >= current_timestamp'::varchar);"
```

::: tip
Where `someThing-123` is a _stream name_, `someThing` is a _category_. Reading the `someThing` category retrieves messages from all streams whose names start with `someThing-`.
:::

Example: [https://github.com/eventide-project/message-store-postgres-database/blob/master/test/get_cateogry_messages.sh](https://github.com/eventide-project/message-store-postgres-database/blob/master/test/get_cateogry_messages.sh)

## Get Last Message from a Stream

Retrieve the last message in a stream.

``` sql
get_last_message(
  _stream_name varchar
)
```

### Arguments

| Name | Type | Description | Default | Example |
| --- | --- | --- | --- | --- |
| _stream_name | varchar | Name of the stream to retrieve messages from | |  someStream-123 |

### Usage

``` sql
SELECT * FROM get_last_message('stream_name'::varchar)
```

Note: This is only for streams, and does not work for categories.

Example: [https://github.com/eventide-project/message-store-postgres-database/blob/master/test/get_last_message.sh](https://github.com/eventide-project/message-store-postgres-database/blob/master/test/get_last_message.sh)
