"use strict";

var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * EventActions.
 * @param {string}       ns     Namespace, or undefined if root
 * @param {EventActions} parent Parent EventActions or undefined if root
 */
function EventActions(ns, parent) {
	if (!(this instanceof EventActions))
		return new EventActions(ns, parent)

	this.ns = ns;
	this._parent = parent;

	// verify namespace and parent
	if (this.ns || this._parent) {
		if (typeof this.ns !== 'string')
			throw new Error('Namespace must be a string');
		if (!(this._parent instanceof EventActions))
			throw new Error('Parent must be instanceof EventActions');
	}

	EventEmitter.call(this);

	var root = this.root();
	this.actions = parent ? root.actions : new EventEmitter();
	this.events = parent ? root.events : new EventEmitter();

	// override default emitters if this is a root instance
	if (!this._parent) {
		this.actions._emit = this.actions.emit;
		this.actions.emit = function(action) {
			var args = Array.prototype.slice.call(arguments, 1);

			var parts = action.split(':');
			var target = parts.slice(0, -1).join(':');
			// emit action event, callback(target, action, arguments)
			this.emit('action', target, parts.slice(-1)[0], args);

			// pass through
			this.actions._emit.apply(this.actions, arguments);
		}.bind(this);

		this.events._emit = this.events.emit;
		this.events.emit = function(event) {
			var args = Array.prototype.slice.call(arguments, 1);

			var parts = event.split(':');
			var target = parts.slice(0, -1).join(':');
			// emit event event, callback(target, event, arguments)
			this.emit('event', target, parts.slice(-1)[0], args);

			// pass through
			this.events._emit.apply(this.events, arguments);
		}.bind(this);
	} else {
		// bind parents 'action' and 'event' events to this instance
		this._parent.on('action', this.emit.bind(this, 'action'));
		this._parent.on('event', this.emit.bind(this, 'event'));
	}
}
util.inherits(EventActions, EventEmitter);
module.exports = EventActions;

/**
 * Create namespaced EventActions instance.
 * Namespaced EventAction instances share action and event EventEmitters.
 */
EventActions.prototype.createNamespace = function(ns) {
	ns = this.ns ? [this.ns, ns].join(':') : ns;
	return new EventActions(ns, this);
};

/**
 * Get parent EventActions instance
 * @return {[type]} [description]
 */
EventActions.prototype.parent = function() {
	return this._parent;
};

/**
 * Get root EventActions instance
 * @return {[type]} [description]
 */
EventActions.prototype.root = function() {
	var current = this;
	var parent = current.parent();
	while (parent) {
		current = parent;
		parent = current.parent();
	}
	return current;
};

/**
 * Get namespaced event name if name starts with ':'
 * otherwise use name as is.
 * @param  {string} name Event name
 * @return {string}      Namespaced event name
 */
EventActions.prototype._getEventName = function(name) {
	if (name[0] == ':') {
		if (!this.ns) return name.slice(1);
		else return this.ns + name;
	}
	return name;
};

//
// Actions
//

/**
 * Add action listener
 */
EventActions.prototype.onAction = function(action, callback) {
	this.actions.on(this._getEventName(action), callback);
	return this;
};

/**
 * Emit action event
 */
EventActions.prototype.emitAction = function(action) {
	var args = Array.prototype.slice.call(arguments, 1);
	this.actions.emit.apply(this.actions, [this._getEventName(action)].concat(args));
	return this;
};

/**
 * Remove action listener
 */
EventActions.prototype.removeAction = function(action, listener) {
	if (typeof listener === 'undefined') {
		this.actions.removeAllListeners(this._getEventName(action));
	} else {
		this.actions.removeListener(this._getEventName(action), listener);
	}
	return this;
};

/**
 * Pipe events from sender to this action
 */
EventActions.prototype.bindAction = function(sender, event, toAction) {
	sender.on(event, this.actions.emit.bind(this.actions, this._getEventName(toAction)));
	return this;
};

/**
 * Add action listener which is triggered only once
 */
EventActions.prototype.onceAction = function(action, listener) {
	this.actions.once(this._getEventName(action), listener);
	return this;
};


//
// Events
//

/**
 * Add event listener
 */
EventActions.prototype.onEvent = function(event, callback) {
	this.events.on(this._getEventName(event), callback);
	return this;
};

/**
 * Emit event event
 */
EventActions.prototype.emitEvent = function(event) {
	var args = Array.prototype.slice.call(arguments, 1);
	this.events.emit.apply(this.events, [this._getEventName(event)].concat(args));
	return this;
};

/**
 * Remove event listener
 */
EventActions.prototype.removeEvent = function(event, listener) {
	if (typeof listener === 'undefined') {
		this.events.removeAllListeners(this._getEventName(event));
	} else {
		this.events.removeListener(this._getEventName(event), listener);
	}
	return this;
};

/**
 * Pipe events from sender to this event
 */
EventActions.prototype.bindEvent = function(sender, event, toEvent) {
	sender.on(event, this.events.emit.bind(this.events, this._getEventName(toEvent)));
	return this;
};

/**
 * Add event listener which is triggered only once
 */
EventActions.prototype.onceEvent = function(event, listener) {
	this.events.once(this._getEventName(event), listener);
	return this;
};

