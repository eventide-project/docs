Ultimately, the "no stream" value is a special case value (constant) that indicates that there's actually no stream for the object in-question.

Throughout the upper levels of the toolkit that are most frequently interacted with by a user, the symbol :no_stream is used to represent -1, which is the conventional value of a stream version for a stream that doesn't exist.

Because the literal value -1 has no symbolic meaning, we use :no_stream interchangeably.

The definition of the concept of "No Stream" can be found in the MessageStore namespace (which is in the evt-message-store library. That definition includes the version number as well as the "name" of the no stream concept:
eventide-project/message-store:lib/message_store/no_stream.rb@master#L4

The symbol :no_stream is canonized to -1 before it's used in the raw storage layer:
eventide-project/message-store:lib/message_store/expected_version.rb@6aa5aaf#L5-L9

While in-general, it's undesirable to misrepresent the truth of something (-1 is the truth). This is not a general case, and thus the special variation from the rule is permissible (and desirable).

So, this is as-designed. Did it cause a malfunction?
