"use strict";

var util = require('util');

function inspect(obj, depth) {
	console.log(util.inspect(obj, { colors: true, depth: depth }));
}

function createListener(name) {
	return function() {
		console.log(name + ':', util.inspect(arguments, { colors: true, depth: 0 }));
	};
}

var EventActions = require('./index');

var root = new EventActions();
var child = root.createNamespace('child');
var gchild = child.createNamespace('gchild');

// add listener for all actions
root.on('action', function(target, action, args) {
	console.log(util.format("ROOT ACTION: '%s' '%s'", target, action));
});

// add listener for all events
root.on('event', function(target, action, args) {
	console.log(util.format("ROOT EVENT: '%s' '%s'", target, action));
});

// add listener for all actions
child.on('action', function(target, action, args) {
	console.log(util.format("CHILD ACTION: '%s' '%s'", target, action));
});

// add listener for all events
child.on('event', function(target, action, args) {
	console.log(util.format("CHILD EVENT: '%s' '%s'", target, action));
});

root.onAction(':action', createListener('rootAction'));
child.onAction(':action', createListener('childAction'));
gchild.onAction(':action', createListener('gchildAction'));

root.onEvent(':event', createListener('rootEvent'));
child.onEvent(':event', createListener('childEvent'));
gchild.onEvent(':event', createListener('gchildEvent'));

console.log("###\n### Actions\n###\n");

// emit absolute actions
console.log('## absolute actions ##');
root.emitAction('action', 'root -> action');
root.emitAction('child:action', 'root -> child:action');
root.emitAction('child:gchild:action', 'root -> child:gchild:action');
console.log();

// emit absolute actions from child
console.log('## absolute actions from child ##');
gchild.emitAction('action', 'gchild -> action');
gchild.emitAction('child:action', 'gchild -> child:action');
gchild.emitAction('child:gchild:action', 'gchild -> child:gchild:action');
console.log();

// emit relative actions
console.log('## relative actions ##');
root.emitAction(':action', 'root -> :action');
child.emitAction(':action', 'child -> :action');
gchild.emitAction(':action', 'gchild -> :action');
console.log();

console.log("###\n### Events\n###\n");

// emit absolute events
console.log('## absolute events ##');
root.emitEvent('event', 'root -> event');
root.emitEvent('child:event', 'root -> child:event');
root.emitEvent('child:gchild:event', 'root -> child:gchild:event');
console.log();

// emit absolute events from child
console.log('## absolute events from child ##');
gchild.emitEvent('event', 'gchild -> event');
gchild.emitEvent('child:event', 'gchild -> child:event');
gchild.emitEvent('child:gchild:event', 'gchild -> child:gchild:event');
console.log();

// emit relative events
console.log('## relative events ##');
root.emitEvent(':event', 'root -> :event');
child.emitEvent(':event', 'child -> :event');
gchild.emitEvent(':event', 'gchild -> :event');
console.log();
