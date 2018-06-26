# Handlers

## Handler Workflow

1. Retrieve the entity from the store, projecting the entity's data from events in the process
2. Use the entity to determine whether and how to process the message
3. Construct the resulting event that captures the effects of processing the message
4. Assign data to its the resulting event from the input message, the system clock, and possibly other sources depending on the business scenario
4. Write the resulting event

Note that some handlers may not need to do all of these things.
