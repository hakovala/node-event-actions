# EventActions

Application level event and action emitter. Used to connect different 
components to each other by using common emitter for events and actions.
EventActions support namespacing which makes it easy to separate components,
and use same listeners and emitter in different namespaces.

Events are used for notify listeners when something happens.

Actions are used to trigger things in other components.

## Install

```
npm install event-actions
```

## Example usage

```javascript

var EventActions = require('event-actions');

// create EventActions instance
var root = new EventActions();
// create namespaced instance from 'root'
var child = root.createNamespace('child');

// add action listener for root namespaces 'action'
root.onAction(':action', function() {
    console.log('Root action');
});
// add action listener for 'child:action'
child.onAction(':action', function() {
    console.log('Child action');
});
// same as: child.onAction('child:action', ...

// namespaced EventEmitters can listen for any other namespace
// add action listener in child for roots 'action'
child.onAction('action', function() {
    console.log('Root action in child');
});

// add listener for all actions that are emitted
root.on('action', function(target, action, args) {
    // target: namespace action was target to
    // action: name of the action
    // args: arguments passed to action
});

// emit 'action' in the root namespace
root.emitAction('action');
// or
child.emitAction('action');

// emit 'action' in the child namespace
child.emitAction(':action');
// or
root.emitAction('child:action');
// or
child.emitAction('child:action');


// same rules apply also for events, just replace word 'action' with 'event'..

```

See 'example.js' for more complete usage example.

## Namespacing

Namespacing actions and events is crusial, expecially when number of connected components grows.

Either absolute or relative namespaces can be used when adding listeners or emitting events. Relative namespace starts with ':' and will be prepend with EventActions instances namespace.

In example if EventActions namespace is 'root:child', then emitting ':action' will actually trigger listeners registered for 'root:child:action'. Same goes for registering listeners. Adding listener for ':action' on EventActions that has namespace 'root:child', it will listen for events 'root:child:action'.

## Events

### `action`

 * target Target namespace of the action
 * action Name of the action
 * args Arguments passed with action

Emitted when action is emitted from any emitter that share same root emitter.

### `event`

 * target Target namespace of the event
 * event Name of the event
 * args Arguments passed with event

## EventEmitters

EventActions instance has two EventEmitter, `actions` and `events`.
They can be used as normal EventEmitter.

## Methods

### `createNamespace`

 * ns Namespace

Create namespaced version of EventActions instance.
Namespaced instances use root emitters.
Namespace is appended to relative action/event names.

### `parent`

Returns parent EventActions instance or `null` if root.

### `root`

Returns root EventActions instance.

### `onAction` / `onEvent`

 * name Action/event name, absolute or relative
 * listener Action/event listener

Add listener for action/event.

### `emitAction` / `emitEvent`

 * name Action/event name, absolute or relative
 * arguments

Triggers action/event listener with given name.

### `removeAction` / `removeEvent`

 * name Action/event name, absolute or relative
 * listener Action/event listener to remove (optional)

Remove all or specific listener with given name.

### `onceAction` / `onceEvent`

 * name Action/event name, absolute or relative
 * listener Action/event listener

Listen for action/event. Listener is removed after triggering.

### `bindAction` / `bindEvent`

 * sender Emitter to listen, any EventEmitter
 * event Event to listen for
 * toName Bind to name

Binds any EventEmitter event to specified action or event.
Enables action/event piping:

```
var A = new EventActions();
var B = new EventActions();

// when 'click' action is emitted from A, it is piped to B action 'child:action'
B.bindAction(A.actions, 'click', 'child:action');

// when 'player:paused' event is emitted from B, it is piped to A action 'controls:update'
A.bindAction(B.events, 'player:paused', 'controls:update');

```
