# EventHub

Application level event and action emitter. Used to connect different 
components to each other by using events and actions.

Events are used for notify listeners when something happens.

Actions are used to trigger things in other components.

## Install

```
npm install event-hub
```

## Usage

```javascript

// get default EventHub instance
var hub = require('event-hub')();

// listen 'click' event from component A
hub.onEvent('A:click', function(button) {
    console.log('Component A was clicked with button ' + button);
});

// emit event
hub.emitEvent('A:click', 'Button 1');

// listen 'process' action
hub.onAction('B:process', function(a, b) {
    console.log('Processing values', a + b);
});

// emit action
hub.emitAction('B:process', 3, 5);

```

## Namespacing

Namespacing actions and events is crusial, expecially when number of connected 
components grows.

In the future namespacing can be used to simplify things, such as removing all
listeners from specific component.
