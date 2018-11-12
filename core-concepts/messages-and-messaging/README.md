# Message Facts

Messages are packages of data that are the principle means of transmission of instructions and status between services.

## Messages are just data objects

Messages are just plain data structures. They have attributes and that's it. They don't (and should not) have methods that do anything but declare attributes, and set and get attribute values. Messages do not validate themselves, transform or serialize themselves, send themselves, or save themselves. All of these capabilities are external capabilities to a message, and therefore are not behaviors of a message.

## Events and commands are kinds of messages

The only real difference between a command message and an event message is the way that they are named. Command messages are named in the imperative tense (eg: _DoSomething_) and event messages are named in the past tense (eg: _SomethingDone_). Other kinds of messages in the Eventide toolkit include entity snapshot messages and consumer position messages.

## Messages are formatted as JSON when stored

Messages in Eventide are just Ruby objects that are transformed to JSON when they are written to the message store, and transformed from JSON to Ruby when they are read from the message store.

## Messages are typically flat key/value structures

Messages are not typically hierarchical tree structures with a root object and references to other objects or list of objects. They are not rich entity/relational models. They're key/value objects with attributes that hold primitive values. Messages themselves are primitive, and every effort should be made to keep them primitive.

## JSON-transformation of messages is not recursive

A message object should be easily convertible into a simple, flat key/value hash object. If a message attribute's value is a complex object (ie: it has attributes of its own), custom transformation logic to convert the tree of objects into hashes is required. The default, built-in message transformation logic does not recurse through the depths of a message object graph.

## Message names do not include namespaces

Only a message's class name is considered a message's name, even if the class is nested in an outer namespace. When a message is written to the message store, any outer namespace is not included in the message name. While it's possible to have two message classes with the same name but in different namespaces, once those messages are written to the store, the distinctness provided by namespaces will be eliminated. If you need to differentiate between classes that have the same name, the name of the message class should include a prefix or suffix.
