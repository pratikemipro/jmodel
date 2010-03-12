/*
 *	Emerald Javascript Library v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires opal.js
 */


// ============================================================================
//														Emerald Event Framework
// ============================================================================

var emerald = function () {

	//
	// Import OPAL
	//

	var opal = OPAL();
	for ( var i in opal ) {
		eval('var '+i+' = opal.'+i);
	}

	var em		= {emerald_version:'0.1.0'},
		_		= em;


	// ------------------------------------------------------------------------
	// 															  EventRegistry
	// ------------------------------------------------------------------------

	function EventRegistry (notifications) {;
		this.notifications	= notifications;
		this.__delegate		= set().index(Property('name')).delegateFor(this);
		if ( arguments.length > 1 ) {
			this.register.apply(this,arrayFromArguments(arguments).slice(1));
		}
	}
	
	EventRegistry.prototype = {
		
		register: function _register () {
			var args = set(arguments),
				that = this;
			args.each(function (name) {
				that.add(new EventType(that,name));
			});
			return this;
		},
		
		filter: function _filter () {
		    events = this.__delegate.filter.apply(this,arguments);
		    if ( !events ) {
		        throw 'Emerald exception: unknown event "'+arguments[0]+'"';
		    }
		    return events;
		},
		
		predicate: function _predicate (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('name',parameter));
			}
			else {
				return this.__delegate.predicate(parameter);
			}
		}
		
	};
	
	em.EventRegistry = EventRegistry;
	
	// ------------------------------------------------------------------------
	// 																  EventType
	// ------------------------------------------------------------------------
	
	function EventType (registry,name) {
		this.registry		= registry;
		this.name			= name;
		this.subscribers	= delegateTo(new SubscriberSet(this.registry.notifications),'filter');
	}
	
	EventType.prototype = {
	
		subscribe: function _subscribe (subscriber) {
			return this.subscribers().add(subscriber).added;
		},
	
		raise: function _raise (event) {
			this.subscribers().notify(event);
		}
		
	};
	
	em.EventType = EventType;
	
	
	//
	// Subscriber Set
	//
	// This contains a list of subscription objects, each of which produces
	// notification objects when required and adds them to the notification
	// queue.
	//
	
	function SubscriberSet (notifications) {
		this.__delegate		= set().delegateFor(this);
		this.notifications	= notifications;
	};
	
	SubscriberSet.prototype = {
		
		add: function _add (subscriber) {
			var that = this;
			this.__delegate.add(subscriber, function __add () {
//				log('subscriptions/subscribe').debug('added subscriber: '+subscriber.description);
				that.added = subscriber;
			});
			return this;
		},
		
		notify: function _notify (event) {
			var messages = this.__delegate.map(ApplyTo(event))
								.filter(function (msg) { return msg != null; } );
			if ( messages.count() > 0 ) {
//				log('subscriptions/notify').startGroup('Notifying subscribers of '+event.description);
				this.notifications.send(messages);
//				log('subscriptions/notify').endGroup();
			}
		},
		
		debug: function _debug () {
			if ( _.nonempty(this.__delegate) ) {
//				log().debug('Subscribers:  '+this.__delegate.count());
			}
		}
		
	};
	
	em.SubscriberSet = SubscriberSet;
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------

	function NotificationQueue (context) {

		this.context = context;

		var	notifications 	= set().delegateFor(this),
			suspensions		= 0,
			filter			= AllPredicate;

		this.send = function _send (messages) {
			messages = (messages instanceof Set) ? messages : new Set([messages]);
			messages.each(function __send (message) {
				if ( !filter(message) ) {
				}
				else if ( ( suspensions === 0 || !message.subscription.application ) && typeof message == 'function' ) {
					message();
				}
				else if ( typeof message == 'function' ) {
//					log('notifications/send').debug('Adding a notification to the queue');
					notifications.add(message);
				}
			});
			return this;
		};

		this.suspend = function _suspend () {
//			log('notifications/control').debug('Suspending notifications for '+this.context.name);
			suspensions++;
			return this;
		};

		this.resume = function _resume () {
//			log('notifications/control').debug('resuming notifications for '+this.context.name);
			if ( --suspensions == 0 ) {
				notifications.map(apply);
				return this.flush();
			}
			else {
				return this;
			}
		};

		this.flush = function _flush (predicate) {
//			log('notifications/control').debug('Flushing notifications for '+this.context.name);
			notifications.remove(predicate);
			return this;
		};

		this.setFilter = function _setFilter (predicate) {
			filter = predicate;
			return this;
		};

		this.debug = function _debug () {
//			log().debug('Pending notifications: '+this.count());
		};

	};
	
	em.NotificationQueue = NotificationQueue;
	
	return em;
	
}();