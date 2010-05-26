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

	var em		= extend({emerald_version:'0.1.0'},opal),
		_		= em;


	// ------------------------------------------------------------------------
	// 															  EventRegistry
	// ------------------------------------------------------------------------

	function EventRegistry (notifications) {
		this.notifications	= notifications || new NotificationQueue();
		this.__delegate		= set().of(EventType).index(Property('name')).delegateFor(this);
		if ( arguments.length > 1 ) {
			this.register.apply(this,arrayFromArguments(arguments).slice(1));
		}
	}
	
	EventRegistry.prototype = {
		
		register: function _register () {
			return set(arguments).reduce(Method('add',this),this);
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
		this.registry		= registry || em.registry;
		this.name			= name;
		this.subscribers	= delegateTo(new SubscriberSet(this.registry.notifications),'filter');
	}
	
	EventType.prototype = {
	
		subscribe: function _subscribe (subscriber) {
			return this.subscribers().add(subscriber).added;
		},
	
		raise: function _raise () {
//			console.log('Raising '+this.name+' ('+this.subscribers().count()+' subscribers)');
			this.subscribers().notify.apply(this.subscribers(),arguments);
		},
		
		where: function (predicate) {
		    var derivedEventType = new EventType(this.registry);
		    this.subscribe(function (event) {
		        if ( predicate(event) ) {
		            derivedEventType.raise.apply(derivedEventType,arguments);
		        }
		    });
		    return derivedEventType;
		},
		
		until: function (predicate,inclusive) {
			var derivedEventType = new EventType(this.registry),
				active = true,
				inclusive = typeof inclusive === 'undefined' ? true : inclusive;
		    this.subscribe(function (event) {
				var last = false;
		        if ( predicate(event) ) {
					active = false;
					last = true;
				}
				if ( active || (last && inclusive) ) {
		            derivedEventType.raise.apply(derivedEventType,arguments);
		        }
		    });
		    return derivedEventType;
		},
		
		drop: function (number) {
		    var derivedEventType = new EventType(this.registry);
		    this.subscribe(function () {
		        if ( number <= 0 ) {
		            derivedEventType.raise.apply(derivedEventType,arguments);
		        }
		        number--;
		    });
		    return derivedEventType;
		},
		
		between: function (startEventType,stopEventType) {
			var derivedEventType = new EventType(this.registry),
				active = false,
				startEvent, stopEvent;
			this.subscribe(function (event) {
				if ( active ) {
				    args = arrayFromArguments(arguments);
				    args.push(startEvent);
				    args.push(stopEvent);
					derivedEventType.raise.apply(derivedEventType,args);
				}
			});
			startEventType.subscribe(function (event) {
			    startEvent = event;
				active = true;
			});
			stopEventType.subscribe(function (event) {
				stopEvent = event;
				active = false;
			});
			return derivedEventType;
		},
		
		effect: function (fn) {
		    var derivedEventType = new EventType(this.registry);
		    this.subscribe(function (event) {
		        fn(event);
		        derivedEventType.raise.apply(derivedEventType,arguments);
		    });
		    return derivedEventType;
		},
		
		accumulate: function (fn,acc) {
			acc = arguments.length > 1 ? acc : fn.unit;
			var derivedEventType = new EventType(this.registry);
		    this.subscribe(function (event) {
		        acc = fn(acc,event);
				derivedEventType.raise(acc);
		    });
		    return derivedEventType;
		}
		
	};
	
	function SwitchCombinator (initialState) {
		return function (controlEvent) {
			var derivedEventType = new EventType(this.registry),
				active = initialState;
			this.subscribe(function () {
				if ( active ) {
					derivedEventType.raise.apply(derivedEventType,arguments);
				}
			});
			controlEvent.subscribe(function (event) {
				active = !initialState;
			});
			return derivedEventType;
		};
	}
	
	EventType.prototype.before 	= SwitchCombinator(true);
	EventType.prototype.after 	= SwitchCombinator(false);
	
	em.EventType = EventType;
	
	//
	// Event generators
	//
	
	em.event = {
	    
	    from: function (element,name) {
    	    var derivedEvent = new EventType();
    	    jQuery(element).bind(name, function (event) {
    	        derivedEvent.raise(event);
    	    });
    	    return derivedEvent;
    	}
	    
	};
	
	
	//
	// Subscriber Set
	//
	// This contains a list of subscription objects, each of which produces
	// notification objects when required and adds them to the notification
	// queue.
	//
	
	function SubscriberSet (notifications) {
		this.__delegate = set().of(Function).delegateFor(this);
		this.notifications	= notifications;
	}
	
	SubscriberSet.prototype = {
		
		add: function () { // To support debug plugin
			return this.__delegate.add.apply(this,arguments);
		},
		
		__construct: function (specification) {
			return Subscriber(specification);
		},
		
		notify: function _notify (event) {		
		    if ( !this.notifications.send ) {
		        console.log(this.notifications);
		    }
			this.notifications.send(this.map(ApplyTo.apply(null,arguments)).filter(Identity));
		}
		
	};
	
	em.SubscriberSet = SubscriberSet;
	
	
	function Subscriber (subscription) {
		subscription = typeof subscription === 'function' ? {message:subscription} : subscription;
		var predicate = subscription.predicate || AllPredicate,
			message = subscription.message;			
		return function (event) {
			return predicate(event) ? extend({subscription:subscription},function () {
				return message(event);
			}) : undefined;
		};
	}
	
	// NOTE: This is obsolescent
	function CollectionSubscriber (subscription) {
		return extend({subscription:subscription},function _collectionsubscriber (event) {
			return ( subscription.filter && !subscription.filter(event) ) ? null
				:  subscription.type(subscription,event);
		});
	}
	
	em.extend({
		Subscriber: Subscriber,
		CollectionSubscriber: CollectionSubscriber
	});
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------

	function NotificationQueue (context) {

		set().of(Function).delegateFor(this);
		this.context		= context;
		this.__suspensions	= 0;

	}
	
	NotificationQueue.prototype = {
		
		send: function _send (messages) {
			messages = (messages instanceof Set) ? messages : new Set([messages]);
			var that = this;
			messages.each(function __send (message) {
				if ( that.__suspensions === 0 || !message.subscription.application ) {
				    if ( typeof message === 'function' ) {
    //					console.log('Sending immediately');
    					/*async(*/message();
				    }
				}
				else {
//					console.log('Adding to queue');
//					log('notifications/send').debug('Adding a notification to the queue');
					that.add(message);
//					console.log(notifications.count()+' messages on queue');
				}
			});
			return this;
		},
		
		suspend: function _suspend () {
//			log('notifications/control').debug('Suspending notifications for '+this.context.name);
			this.__suspensions++;
			return this;
		},

		resume: function _resume () {
//			log('notifications/control').debug('resuming notifications for '+this.context.name);
            this.__suspensions--;
			if ( this.__suspensions === 0 ) {
				this.map(apply);
				return this.flush();
			}
			else {
				return this;
			}
		},
	    
	    flush: function _flush (predicate) {	
			this.remove(predicate);
			return this;
		}
	    
	};
	
	em.NotificationQueue = NotificationQueue;
	
	
	// ------------------------------------------------------------------------
	//														  Subscribable Sets
	// ------------------------------------------------------------------------
	
	function subscribable (proto) {
		
		return extend({
			
			add: aspect({
				target: proto.add,
				post: function (state) {
					if (this.added) {
						this.event('add').raise({
							method: 'add',
							object: this.added,
							description: 'object addition'
						});
					}
					return state.returnValue;
				}
			}),
			
			remove: aspect({
				target: proto.remove,
				post: function (state) {
					var that = this;
					state.returnValue.each(function (item) {
						that.event('remove').raise({
							method: 'remove',
							object: item,
							description: 'object removal'
						});
					});
					return state.returnValue;
				}
			})
			
		},copy(proto,true));
		
	}
	
	function SubscribableSet (notifications) {
		Set.apply(this);
		makeSubscribable.call(this,notifications);
	}
	
	SubscribableSet.prototype = subscribable(Set.prototype);
	
	function SubscribableTypedSet (constructor,notifications) {
		TypedSet.call(this,constructor);
		makeSubscribable.call(this,notifications);
	}
	SubscribableTypedSet.prototype = subscribable(TypedSet.prototype);
	
	function makeSubscribable (notifications) {
		notifications = notifications || new NotificationQueue();
		this.events	= new EventRegistry(notifications,'add','remove','initialise','sort');
		this.event	= delegateTo(this.events,'filter');
		return this;
	}
	
	em.SubscribableSet = SubscribableSet;
	em.SubscribableTypedSet = SubscribableTypedSet;
	
	em.plugin.set.asSubscribable = function (notifications) {
		return this.reduce(Method('add'),new SubscribableSet(notifications));
	};
	
	em.plugin.typedset.asSubscribable = function (notifications) {
		return this.reduce(Method('add'),new SubscribableTypedSet(this.__constructor,notifications));
	};
	
	
	//
	// Create default EventRegistry
	//
	
	em.registry = new EventRegistry();
	
	
	return em;

	
}();