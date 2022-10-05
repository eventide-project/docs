# Server Functions

The message store provides an interface of Postgres server functions that can be used with any programming language or through the `psql` command line tool.

View the source code: [https://github.com/message-db/message-db/blob/master/database](https://github.com/message-db/message-db/blob/master/database)

## Interface

- [write_message](#write-a-message)
- [get_stream_messages](#get-messages-from-a-stream)
- [get_category_messages](#get-messages-from-a-category)
- [get_last_stream_message](#get-last-message-from-a-stream)
- [stream_version](#get-stream-version-from-a-stream)
- [id](#get-the-id-from-a-stream-name)
- [cardinal_id](#get-the-cardinal-id-from-a-stream-name)
- [category](#get-the-category-from-a-stream-name)
- [is_category](#determine-whether-a-stream-name-is-a-category)
- [acquire_lock](#acquire-a-lock-for-a-stream-name)
- [hash_64](#calculate-a-64-bit-hash-for-a-stream-name)
- [message_store_version](#get-message-store-database-schema-version)

## Write a Message

Write a JSON-formatted message to a named stream, optionally specifying JSON-formatted metadata and an expected version number.

``` sql
write_message(
  id varchar,
  stream_name varchar,
  type varchar,
  data jsonb,
  metadata jsonb DEFAULT NULL,
  expected_version bigint DEFAULT NULL
)
```

### Returns

Position of the message written.

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| id | UUID of the message being written | varchar | | a5eb2a97-84d9-4ccf-8a56-7160338b11e2 |
| stream_name | Name of stream to which the message is written | varchar | | someStream-123 |
| type | The type of the message | varchar | | Withdrawn |
| data | JSON representation of the message body | jsonb | | {"someAttribute": "some value"} |
| metadata (optional) | JSON representation of the message metadata | jsonb | NULL | {"metadataAttribute": "some meta data value"} |
| expected_version (optional) | Version that the stream is expected to be when the message is written | bigint | NULL | 11 |

### Usage

``` sql
SELECT write_message('a11e9022-e741-4450-bf9c-c4cc5ddb6ea3', 'someStream-123', 'SomeMessageType', '{"someAttribute": "some value"}', '{"metadataAttribute": "some meta data value"}');
```

```
-[ RECORD 1 ]-+--
write_message | 0
```

Example: [https://github.com/message-db/message-db/blob/master/database/write-test-message.sh](https://github.com/message-db/message-db/blob/master/database/write-test-message.sh)

### Specifying the Expected Version of the Stream

The expected_version argument is as an optimistic concurrency protection. It can also be used to assure that a message written to a stream is the first message in the stream.

A more detailed explanation of `expected_version` and optimistic concurrency control can be found in [Eventide's message writer user guide](/user-guide/writing/expected-version.md).

``` sql
SELECT write_message('a11e9022-e741-4450-bf9c-c4cc5ddb6ea3', 'someStream-123', 'SomeMessageType', '{"someAttribute": "some value"}', '{"metadataAttribute": "some meta data value"}', 11);
```

If the expected version does not match the stream version at the time of the write, an error is raised:

```
'Wrong expected version: {specified_stream_version} (Stream: {stream_name}, Stream Version: {current_stream_version})'
```

Example (_no expected version error_): [https://github.com/message-db/message-db/blob/master/test/write-message/expected-version.sh](https://github.com/message-db/message-db/blob/master/test/write-message/expected-version.sh)

Example (_with expected version error_): [https://github.com/message-db/message-db/blob/master/test/write-message/expected-version-error.sh](https://github.com/message-db/message-db/blob/master/test/write-message/expected-version-error.sh)

### Writing Batches of Messages

Writing batches of messages to a stream isn't directly supported by a single call to the `write_message` function. However, because Postgres supports atomic writes using database transactions, batch writes is ultimately supported using Postgres transactions.

To write multiple messages to a stream in a batch, start a Postgres transaction and issue multiple calls to the `write_messages` function.

::: warning
Transactions should only be used for writes to the same stream. While it is technically possible to write to multiple streams using a Postgres transaction, doing so is ultimately a violation of event sourcing patterns and is strongly discouraged.
:::

For more on Postgres transactions, see: [https://www.postgresql.org/docs/current/tutorial-transactions.html](https://www.postgresql.org/docs/current/tutorial-transactions.html)

The Message DB server functions do not set or otherwise change the default transaction isolation level configured for the Postgres server. Fore more on Postgres isolation levels, see: [https://www.postgresql.org/docs/current/transaction-iso.html](https://www.postgresql.org/docs/current/transaction-iso.html)

## Get Messages from a Stream

Retrieve messages from a single stream, optionally specifying the starting position, the number of messages to retrieve, and an additional condition that will be appended to the SQL command's WHERE clause.

``` sql
get_stream_messages(
  stream_name varchar,
  position bigint DEFAULT 0,
  batch_size bigint DEFAULT 1000,
  condition varchar DEFAULT NULL
)
```

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| stream_name | Name of stream to retrieve messages from | varchar | | someStream-123 |
| position (optional) | Starting position of the messages to retrieve | bigint | 0 | 11 |
| batch_size (optional) | Number of messages to retrieve | bigint | 1000 | 111 |
| condition (optional) | SQL condition to filter the batch by | varchar | NULL | 'messages.time::time >= current_time' |

### Usage

``` sql
SELECT * FROM get_stream_messages('someStream-123', 0, 1000, condition => 'messages.time::time >= current_time');
```

```
-[ RECORD 1 ]---+---------------------------------------------------------
id              | 4b96f09e-104a-4b1f-b198-5b3b46cf1d06
stream_name     | someStream-123
type            | SomeType
position        | 0
global_position | 1
data            | {"attribute": "some value"}
metadata        | {"metaAttribute": "some meta value"}
time            | 2019-11-24 17:56:09.71594
-[ RECORD 2 ]---+---------------------------------------------------------
id              | d94e79e3-cdda-49a3-9aad-ce5d70a5edd7
stream_name     | someStream-123
type            | SomeType
position        | 1
global_position | 2
data            | {"attribute": "some value"}
metadata        | {"metaAttribute": "some meta value"}
time            | 2019-11-24 17:56:09.75969
```

Example: [https://github.com/message-db/message-db/blob/master/test/get-stream-messages/get-stream-messages.sh](https://github.com/message-db/message-db/blob/master/test/get-stream-messages/get-stream-messages.sh)

## Get Messages from a Category

Retrieve messages from a category of streams, optionally specifying the starting position, the number of messages to retrieve, the correlation category for Pub/Sub, consumer group parameters, and an additional condition that will be appended to the SQL command's WHERE clause.

``` sql
get_category_messages(
  category_name varchar,
  position bigint DEFAULT 0,
  batch_size bigint DEFAULT 1000,
  correlation varchar DEFAULT NULL,
  consumer_group_member varchar DEFAULT NULL,
  consumer_group_size varchar DEFAULT NULL,
  condition varchar DEFAULT NULL
)
```

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| category_name | Name of the category to retrieve messages from | varchar | | someCategory |
| position (optional) | Global position to start retrieving messages from | bigint | 1 | 11 |
| batch_size (optional) | Number of messages to retrieve | bigint | 1000 | 111 |
| correlation (optional) | Category or stream name recorded in message metadata's `correlationStreamName` attribute to filter the batch by | varchar | NULL | someCorrelationCategory |
| consumer_group_member (optional) | The zero-based member number of an individual consumer that is participating in a consumer group | bigint | NULL | 1 |
| consumer_group_size (optional) | The size of a group of consumers that are cooperatively processing a single category | bigint | NULL | 2 |
| condition (optional) | SQL condition to filter the batch by | varchar | NULL | 'messages.time::time >= current_time' |

### Usage

``` sql
SELECT * FROM get_category_messages('someCategory', 1, 1000, correlation => 'someCorrelationCategory', consumer_group_member => 1, consumer_group_size => 2, condition => 'messages.time >= current_time');
```

```
-[ RECORD 1 ]---+---------------------------------------------------------
id              | 28d8347f-677e-4738-b6b9-954f1b15463b
stream_name     | someCategory-123
type            | SomeType
position        | 0
global_position | 111
data            | {"attribute": "some value"}
metadata        | {"correlationStreamName": "someCorrelationCategory-123"}
time            | 2019-11-24 17:51:49.836341
-[ RECORD 2 ]---+---------------------------------------------------------
id              | 57894da7-680b-4483-825c-732dcf873e93
stream_name     | someCategory-456
type            | SomeType
position        | 1
global_position | 1111
data            | {"attribute": "some value"}
metadata        | {"correlationStreamName": "someCorrelationCategory-123"}
time            | 2019-11-24 17:51:49.879011
```

::: tip
Where `someStream-123` is a _stream name_, `someStream` is a _category_. Reading the `someStream` category retrieves messages from all streams whose names start with `someStream` and are followed by an ID, or where `someStream` is the whole stream name.
:::

Example: [https://github.com/message-db/message-db/blob/master/test/get-category-messages/get-category-messages.sh](https://github.com/message-db/message-db/blob/master/test/get-category-messages/get-category-messages.sh)

## Pub/Sub and Retrieving Correlated Messages

The principle use of the `correlation` parameter is to implement Pub/Sub.

The `correlation` parameter filters the retrieved batch based on the content of message metadata's `correlationStreamName` attribute. The correlation stream name is like a _return address_. It's a way to give the message some information about the component that the message originated from. This information is carried from message to message in a workflow until it ultimately returns to the originating component.

::: warning
Pub/Sub and correlation works only with the retrieval of messages from a category. An error will occur if the `correlation` argument is sent to a retrieval of a stream rather than a category.
:::

The `correlationStreamName` attribute allows a component to tag an outbound message with its origin. And then later, the originating component can subscribe to other components' events that carry the origin metadata.

Before the source component sends the message to the receiving component, the source component assigns it's own stream name to the message metadata's `correlation_stream_name` attribute. That attribute is carried from message to message through messaging workflows.

``` sql
SELECT write_message('a11e9022-e741-4450-bf9c-c4cc5ddb6ea3', 'otherComponent-123', 'SomeMessageType', '{"someAttribute": "some value"}', '{"correlationStreamName": "thisComponent-789"}');

SELECT * FROM get_category_messages('otherComponent', correlation => 'thisComponent');
```

For more details on pub/sub using the correlation stream, see the [pub/sub topic in the consumers user guide](../consumers.html#correlation-and-pub-sub).

## Consumer Groups

Consumers processing a single category can be operated in parallel in a _consumer group_. Consumer groups provide a means of scaling horizontally to distribute the processing load of a single category amongst a number of consumers.

Consumers operating in consumer groups process a single category, with each consumer in the group processing messages that are not processed by any other consumer in the group.

::: warning
Consumer groups work only with the retrieval of messages from a category. An error will occur if consumer group arguments are sent to a retrieval of a stream rather than a category.
:::

Specify both the `consumer_group_member` argument and the `consumer_group_size` argument to retrieve a batch of messages for a specific member of a user group. The `consumer_group_size` argument specifies the total number of consumers participating in the group. The `consumer_group_member` argument specifies the unique ordinal ID of a consumer. A consumer group with three members will have a `group_size` of 3, and will have members with `group_member` numbers `0`, `1`, and `2`.

``` sql
SELECT * FROM get_category_messages('otherComponent', consumer_group_member => 0, consumer_group_size => 3);
```

Consumer groups ensure that any given stream is processed by a single consumer, and that the consumer processing the stream is always the same consumer. This is achieved by the _consistent hashing_ of a message's stream name.

A stream name's [cardinal ID](#get-the-cardinal-id-from-a-stream-name) is hashed to a 64-bit integer, and the modulo of that number by the consumer group size yields a consumer group member number that will consistently process that stream name.

Specifying values for the `consumer_group_size` and `consumer_group_member` consumer causes the query for messages to include a condition that is based on the hash of the stream name, the modulo of the group size, and the consumer member number.

``` sql
WHERE @hash_64(cardinal_id(stream_name)) % {group_size} = {group_member}
```

## Filtering Messages with a SQL Condition

The `condition` parameter receives an arbitrary SQL condition which further filters the messages retrieved.

The `condition` parameter is supported for both stream retrieval and category retrieval.

``` sql
SELECT * FROM get_stream_messages('someStream-123', condition => 'extract(month from messages.time) = extract(month from now())');

SELECT * FROM get_category_messages('someStream', condition => 'extract(month from messages.time) = extract(month from now())');
```

Any valid Postgres SQL condition can be used, even JSON functions and operators.

``` sql
SELECT * FROM get_stream_messages('someStream-123', condition => 'data->>''amount'' > 0');

SELECT * FROM get_category_messages('someStream', condition => 'data->>''amount'' > 0');
```

For more details on using Postgres JSON functions and operators, see:<br />
[https://www.postgresql.org/docs/current/functions-json.html](https://www.postgresql.org/docs/current/functions-json.html)

::: warning
The SQL condition feature is deactivated by default. The feature is activated using the `message_store.sql_condition` Postgres configuration option: `message_store.sql_condition=on`. Using the feature without activating the configuration option will result in an error. See the PostgreSQL documentation for more on configuration options: [https://www.postgresql.org/docs/current/config-setting.html](https://www.postgresql.org/docs/current/config-setting.html)
:::

::: danger
Activating the SQL condition feature may expose the message store to unforeseen security risks. Before activating this condition, be certain that access to the message store is appropriately protected.
:::

## Retrieving All Messages in a Single Batch

Typically, the number of messages to retrieve is specified using the `batch_size` parameter. If omitted, the default value of the batch size is 1000.

There is a special value that deactivates the limit on the number of messages returned, and results in all messages in a stream or category being returned.

To retrieve all messages in a stream or category, use the special value of `-1` as the batch size.

This works for both the `get_stream_messages` function and the `get_category_messages` function.

``` sql
SELECT * FROM get_stream_messages('someStream-123', batch_size => -1);
```

``` sql
SELECT * FROM get_category_messages('someCategory', batch_size => -1);
```

## Get Last Message from a Stream

``` sql
get_last_stream_message(
  stream_name varchar,
  type varchar DEFAULT NULL
)
```

### Returns

Row from the [messages](/user-guide/message-db/anatomy.html#messages-table) table that corresponds to the highest position number in the stream, and (optionally) corresponds to the message type specified by the `type` parameter.

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| stream_name | Name of the stream to retrieve messages from | varchar | |  someStream-123 |
| type (optional) | Message type to filter by | varchar | NULL |  SomeType |

<div class="note custom-block">
  <p>
    Note: The <code>type</code> argument is supported in Message DB from v1.3.0.
  </p>
</div>

### Usage

``` sql
SELECT * FROM get_last_stream_message('someStream-123', type => 'SomeType');
```

```
-[ RECORD 1 ]---+---------------------------------------------------------
id              | 03e38825-b106-44f9-8b40-a2b8037b98d8
stream_name     | someStream-123
type            | SomeType
position        | 11
global_position | 111
data            | {"attribute": "some value"}
metadata        | {"metaAttribute": "some meta value"}
time            | 2019-11-24 17:46:43.608025
```

<div class="note custom-block">
  <p>
    Note: This function works only with entity streams, and does not work with category streams.
  </p>
</div>

Examples: [https://github.com/message-db/message-db/blob/master/test/get-last-stream-message/](https://github.com/message-db/message-db/blob/master/test/get-last-stream-message/)

## Get Stream Version from a Stream

``` sql
stream_version(
  stream_name varchar
)
```

### Returns

Highest position number in the stream.

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| stream_name | Name of the stream to retrieve the stream version from | varchar | |  someStream-123 |

### Usage

``` sql
SELECT * FROM stream_version('someStream-123');
```

```
-[ RECORD 1 ]--+---
stream_version | 11
```

<div class="note custom-block">
  <p>
    Note: This function works only with entity streams, and does not work with category streams.
  </p>
</div>

Example: [https://github.com/message-db/message-db/blob/master/test/stream-version/stream-version.sh](https://github.com/message-db/message-db/blob/master/test/stream-version/stream-version.sh)

## Get the ID from a Stream Name

``` sql
id(
  stream_name varchar
)
```

### Returns

The ID part of the stream name.

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| stream_name | Name of the stream to parse the ID from | varchar | | someStream-123 |

### Usage

``` sql
SELECT * FROM id('someStream-123');
```

```
-[ RECORD 1 ]
id | 123
```

Example: [https://github.com/message-db/message-db/blob/master/test/id/stream-name.sh](https://github.com/message-db/message-db/blob/master/test/id/stream-name.sh)

## Get the Cardinal ID from a Stream Name

``` sql
cardinal_id(
  stream_name varchar
)
```

### Returns

The cardinal ID part of the stream name.

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| stream_name | Name of the stream to parse the cardinal ID from | varchar | | someStream-123 |

### Usage

``` sql
SELECT * FROM cardinal_id('someStream-123+abc');
```

```
-[ RECORD 1 ]----
cardinal_id | 123
```

Example: [https://github.com/message-db/message-db/blob/master/test/cardinal-id/stream-name-with-compound-id.sh](https://github.com/message-db/message-db/blob/master/test/cardinal-id/stream-name-with-compound-id.sh)

## Get the Category from a Stream Name

``` sql
category(
  stream_name varchar
)
```

### Returns

The category part of the stream name.

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| stream_name | Name of the stream to parse the category from | varchar | | someStream-123 |

### Usage

``` sql
SELECT * FROM category('someStream-123');
```

```
-[ RECORD 1 ]--------
category | someStream
```

Example: [https://github.com/message-db/message-db/blob/master/test/category/stream-name.sh](https://github.com/message-db/message-db/blob/master/test/category/stream-name.sh)

## Determine Whether a Stream Name is a Category

``` sql
is_category(
  stream_name varchar
)
```

### Returns

Boolean affirmative if the stream name is a category.

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| stream_name | Name of the stream to determine whether it's a category | varchar | | someStream-123 |

### Usage

``` sql
SELECT * FROM is_category('someCategory');
```

```
-[ RECORD 1 ]--
is_category | t
```

Example: [https://github.com/message-db/message-db/blob/master/test/is_category/stream-name.sh](https://github.com/message-db/message-db/blob/master/test/is_category/stream-name.sh)

## Acquire a Lock for a Stream Name

An [exclusive, transaction-level advisory lock](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS) is acquired when a message is written to the stream. The advisory lock ensures that writes are processed sequentially.

The lock ID is derived from the category name of the stream being written to. The result of which is that all writes to streams in a given category are queued and processed in sequence. This ensures that write of a message to a stream does not complete after a [consumer](/user-guide/consumers.md) has already proceeded past its position.

``` sql
acquire_lock(
  stream_name varchar
)
```

### Returns

Integer representing the lock ID.

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| stream_name | Name of the stream to acquire the lock for | varchar | |  someStream-123 |

### Usage

``` sql
SELECT acquire_lock('someStream-123');
```

```
-[ RECORD 1 ]+--------------------
acquire_lock | 2053039834977696644
```

Example: [https://github.com/message-db/message-db/blob/master/test/acquire-lock.sh](https://github.com/message-db/message-db/blob/master/test/acquire-lock.sh)

## Calculate a 64-Bit Hash for a Stream Name

The lock ID generated to acquire an exclusive advisory lock is a hash calculated based on the stream name.

``` sql
hash_64(
  value varchar
)
```

### Returns

Integer representing the lock ID.

### Arguments

| Name | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| value | Text value to generate integer hash from | varchar | |  someStream-123 |

### Usage

``` sql
SELECT hash_64('someStream');
```

```
-[ RECORD 1 ]----------------
hash_64 | 2053039834977696644
```

Example: [https://github.com/message-db/message-db/blob/master/test/hash-64.sh](https://github.com/message-db/message-db/blob/master/test/hash-64.sh)

## Get Message Store Database Schema Version

``` sql
message_store_version()
```

### Returns

The version number of the message store database.

### Usage

``` sql
SELECT message_store_version();
```

```
 message_store_version
-----------------------
 2.0.0.0
```

The version number will change when the database schema changes. A database schema change could be a change to the `messages` table structure, changes to Postgres server functions, types, indexes, users, or permissions. The version number follows the [SemVer](https://semver.org/) scheme for the last three numbers in the version (the first number is the product generation, and implies a major version change).

Example: [https://github.com/message-db/message-db/blob/master/database/print-message-store-version.sh](https://github.com/message-db/message-db/blob/master/database/print-message-store-version.sh)

## Debugging Output

The message store's server functions will print parameter values, and any generated SQL code, to the standard I/O of the client process.

Debugging output can be enabled for all server functions, or for the get functions and the write function separately.

### `message_store.debug_get`

The `debug_get` setting controls debug output for the retrieval functions, including `get_stream_messages`, `get_category_messages`, and `get_last_message`.

Assign the value `on` to the setting to enable debug output.

`message_store.debug_get=on`

### `message_store.debug_write`

The `debug_write` setting controls debug output for the write function, `write_message`.

Assign the value `on` to the setting to enable debug output.

`message_store.debug_write=on`

### `message_store.debug`

The `debug` setting controls debug output for the get functions and the write function.

Assign the value `on` to the setting to enable debug output.

`message_store.debug=on`

### Enabling Debug Output Using a Postgres Environment Variable

The debugging output configuration settings can be enabled in a terminal session using the `PGOPTIONS` environment variable.

``` bash
PGOPTIONS="-c message_store.debug=on"
```

### Enabling Debug Output Using the Postgres Configuration File

The debugging output configuration settings can be set using PostgresSQL's configuration file.

The file system location of the configuration file can be displayed at the command line using the `psql` tool.

``` bash
psql -c 'show config_file'
```

### More on Postgres Configuration

See the PostgreSQL documentation for more configuration options:<br />
[https://www.postgresql.org/docs/current/config-setting.html](https://www.postgresql.org/docs/current/config-setting.html)
