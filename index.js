"use strict";

var util = require('util');
var EventEmitter = require('events').EventEmitter;

// cached EventHub instances
var hubs = {};

/**
 * EventHub object
 *
 */
function EventHub() {
	if (!(this instanceof EventHub))
		return new EventHub();

	EventEmitter.call(this);

	this.actions = new EventEmitter();
	this.events = new EventEmitter();

	// bind newListener and removeListener events
	var self = this;
	this.actions.on('newListener', function(event, listener) {
		self.emit('newActionListener', event, listener);
	});
	this.actions.on('removeListener', function(event, listener) {
		self.emit('removeActionListener', event, listener);
	});
	this.events.on('newListener', function(event, listener) {
		self.emit('newEventListener', event, listener);
	});
	this.events.on('removeListener', function(event, listener) {
		self.emit('removeEventListener', event, listener);
	});
}
util.inherits(EventHub, EventEmitter);

/**
 * Get or create named EventHub instance
 * @param  {string} name Instance name, defaults to 'default'
 * @return {EventHub}    EventHub instance
 */
module.exports = function(name) {
	name = name || 'default';
	if (!hubs[name]) {
		hubs[name] = new EventHub();
	}
	return hubs[name];
};

//
// Actions
//

/**
 * Adds a listener to specified action
 * @param  {string}   action   Action
 * @param  {Function} callback Listener
 * @return {EventHub}          Self
 */
EventHub.prototype.onAction = function(action, callback) {
	this.actions.on(action, callback);
	return this;
};

/**
 * Bind EventEmitter event to
 * @param  {EventEmitter} sender     Sender EventEmitter
 * @param  {string}       event      Source event
 * @param  {string}       toAction   Destination action
 * @return {EventHub}                Self
 */
EventHub.prototype.bindAction = function(sender, event, toAction) {
	sender.on(event, this.actions.emit.bind(sender, toAction));
	return this;
};

/**
 * Add a one time listener for the action.
 * @param  {string}   action   Action
 * @param  {Function} callback Listener
 * @return {EventHub}          Self
 */
EventHub.prototype.onceAction = function(action, callback) {
	this.actions.once(action, callback);
	return this;
};

/**
 * Remove listener from action emitter
 * @param  {string}   action   Action
 * @param  {Function} listener Listener (optional)
 * @return {EventHub}          Self
 */
EventHub.prototype.removeAction = function(action, listener) {
	if (typeof listener === 'undefined') {
		this.actions.removeAllListeners(action);
	} else {
		this.actions.removeListener(action, listener);
	}
	return this;
};

/**
 * Emit action
 * @param  {string} action Action
 * @return {EventHub}      Self
 */
EventHub.prototype.emitAction = function(action) {
	this.actions.emit.apply(null, arguments);
	return this;
};

//
// Events
//

// For documentation see above and replace 'action' with 'event'.. :P

EventHub.prototype.onEvent = function(event, callback) {
	this.events.on(event, callback);
	return this;
};

EventHub.prototype.bindEvent = function(sender, fromEvent, toEvent) {
	sender.on(fromEvent, this.events.emit.bind(sender, toEvent));
	return this;
};

EventHub.prototype.onceEvent = function(event, callback) {
	this.events.once(event, callback);
	return this;
};

EventHub.prototype.removeEvent = function(event, listener) {
	if (typeof listener === 'undefined') {
		this.events.removeAllListeners(event);
	} else {
		this.events.removeListener(event, listener);
	}
	return this;
};

EventHub.prototype.emitEvent = function(event) {
	this.events.emit.apply(null, arguments);
	return this;
};
