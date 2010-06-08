/*
 *	Emerald Javascript Library v0.5.5
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires opal.js
 *
 */


// ============================================================================
//														Emerald Event Framework
// ============================================================================

var emerald = function () {

	//
	// Import OPAL
	//

	var opal = window.opal;
	for ( var i in opal ) {
		eval('var '+i+' = opal.'+i);
	}

	var em		= extend({emerald_version:'0.5.5'},opal),
		_		= em;


	// ------------------------------------------------------------------------
	// 															  EventRegistry
	// ------------------------------------------------------------------------

	function EventRegistry (notifications) {
		
		TypedSet.call(this,EventType);
		
		this.notifications	= notifications || new NotificationQueue();
		
		this.index(Resolve('name'));
		
		if ( arguments.length > 1 ) {
			this.register.apply(this,Array.prototype.slice.call(arguments,1));
		}
		
	}
	
	EventRegistry.prototype = extend({
		
		constructor: EventRegistry,
		
		register: function _register () {
			return set(arguments).reduce(Method('add',this),this);
		},
		
		filter: function _filter () {
		    events = TypedSet.prototype.filter.apply(this,arguments);
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
				return TypedSet.prototype.predicate.call(this,parameter);
			}
		}
		
	}, new TypedSet(EventType) );
	
	em.EventRegistry = EventRegistry;
	
	
	// ------------------------------------------------------------------------
	// 																  EventType
	// ------------------------------------------------------------------------
	
	function EventType (registry,name,notifications) {
		this.registry		= registry || em.registry;
		this.name			= name;
		this.subscribers	= delegateTo(new SubscriberSet(notifications || this.registry.notifications),'filter');
	}
	
	EventType.prototype = {
		
		constructor: EventType,
	
		subscribe: function _subscribe (subscriber) {
			return this.subscribers().add(subscriber).added;
		},
	
		raise: function _raise () {
			this.subscribers().notify.apply(this.subscribers(),arguments);
		},
		
		fail: function _error () {
			this.subscribers().fail.apply(this.subscribers(),arguments);
		},
		
		derive: function (registry,name,notifications) {
		  return new this.constructor(registry,name,notifications);
		},
		
		where: function (predicate) {
		    var derivedEventType = this.derive();
		    this.subscribe(function (event) {
		        if ( predicate.apply(null,arguments) ) {
		            derivedEventType.raise.apply(derivedEventType,arguments);
		        }
		    });
		    return derivedEventType;
		},
		
		until: function (predicate,inclusive) {
			var derivedEventType = this.derive(),
				active = true;
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
		    var derivedEventType = this.derive();
		    this.subscribe(function () {
		        if ( number <= 0 ) {
		            derivedEventType.raise.apply(derivedEventType,arguments);
		        }
		        number--;
		    });
		    return derivedEventType;
		},
		
		between: function (startEventType,stopEventType) {
			var derivedEventType = this.derive(),
				active = false,
				startEvent, stopEvent;
			this.subscribe(function (event) {
				if ( active ) {
				    args = Array.prototype.slice.call(arguments);
				    args.push(startEvent,stopEvent);
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
		
		waitFor: function (startEventType) {
		    var notifications       = new NotificationQueue(null,true),
		        derivedEventType    = this.derive(this.registry,null,notifications);
		    notifications.suspend();
		    this.subscribe(function () {
		        derivedEventType.raise.apply(derivedEventType,arguments);
		    });
		    startEventType.subscribe(function () {
		        notifications.resume();
		    });
		    return derivedEventType;
		},
		
		effect: function (fn) {
		    var derivedEventType = this.derive();
		    this.subscribe(function (event) {
		        fn(event);
		        derivedEventType.raise.apply(derivedEventType,arguments);
		    });
		    return derivedEventType;
		},
		
		accumulate: function (fn,acc) {
			acc = arguments.length > 1 ? acc : fn.unit;
			var derivedEventType = this.derive();
		    this.subscribe(function (event) {
		        acc = fn(acc,event);
				derivedEventType.raise(acc);
		    });
		    return derivedEventType;
		},
		
		map: function (fn) {
		    var derivedEventType = this.derive();
		    fn = ( typeof fn === 'string' ) ? Resolve(fn) : fn;
		    this.subscribe(function (event) {
		        args = Array.prototype.slice.call(arguments);
		        args[0] = fn.apply(null,args);
		        derivedEventType.raise.apply(derivedEventType,args);
		    });
		    return derivedEventType;
		},
		
		republish: function (republishedEventType) {
		    this.subscribe(function () {
	            republishedEventType.raise.apply(republishedEventType,arguments);
	        });
		    return this;
		}
		
	};
	
	function SwitchCombinator (initialState) {
		return function (controlEvent) {
			var derivedEventType = this.derive(),
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
	
	em.disjoin = function () {
	    var derivedEventType = new EventType(em.registry);
	    Set.fromArguments(arguments).each(function (eventType) {
	        eventType.subscribe(function () {
	            derivedEventType.raise.apply(derivedEventType,arguments);
	        });
	    });
	    return derivedEventType;
	};
	
	em.conjoin = function () {
	    
	    var derivedEventType = new EventType(em.registry),
	        buffer = list();    
	        
	    Set.fromArguments(arguments).each(function (eventType) {
	        var queue = buffer.add([]).added;
	        eventType.subscribe(function () {
    	        queue.push.apply(queue,arguments);
	            if ( bufferReady() ) {
	                sendMessage();
	            }
	        });
	    });
	    
	    function bufferReady () {
            return buffer.reduce(function (full,queue) {
                return full && queue.length > 0;
            },true);
	    }
	    
	    function sendMessage () {
	        derivedEventType.raise.apply(
	            derivedEventType,
	            buffer.map(function (queue) {
	                return queue.shift();
	            }).get()
	        );
	    }
	    
	    return derivedEventType;
	    
	};
	
	
	//
	// Event generators
	//
	
	em.event = {
	    
	    from: function (element,name) {
    	    var eventType = new EventType();
    	    jQuery(element).bind(name, function (event) {
    	        eventType.raise(event);
    	    });
    	    return eventType;
    	},
    	
    	every: function (interval) {
    	    var eventType = new EventType();
    	    function raise() { eventType.raise({}); }
    	    setInterval(raise,interval);
    	    return eventType;
    	},
    	
    	fromAsync: function () {
    	    var eventType = new EventType(),
    	        args = Array.prototype.slice.apply(arguments),
    	        fn = args.shift();
    	    args.push(function () {
    	        eventType.raise.apply(eventType,arguments);
    	    });
    	    fn.apply(this,args);
    	    return eventType;
    	},
    	
    	fromJSON: function () {
    	    var args = Array.prototype.slice.apply(arguments);
    	    args.unshift(jQuery.getJSON);
    	    return em.event.fromAsync.apply(null,args);
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
		TypedSet.call(this,Subscriber);
		this.notifications	= notifications || new NotificationQueue();
	}
	
	SubscriberSet.prototype = extend({
		
		constructor: SubscriberSet,
		
		add: function () { // To support debug plugin
			return TypedSet.prototype.add.apply(this,arguments);
		},
		
		__construct: function (specification,notifications) {
			return new Subscriber(specification,notifications || this.notifications);
		},
		
		notify: function _notify (event) {
			var args = arguments;
			this.each(function (subscriber) {
				subscriber.notify.apply(subscriber,args);
			});
		},
		
		fail: function _error (event) {
			var args = arguments;
			this.each(function (subscriber) {
				subscriber.fail.apply(subscriber,args);
			});
		}
		
	}, new TypedSet(Subscriber) );
	
	em.SubscriberSet = SubscriberSet;
	
	
	function Subscriber (subscription,notifications) {
		this.subscription	= typeof subscription === 'function' ? {message:subscription} : subscription;
		this.notifications 	= notifications;
		this.predicate		= subscription.predicate || AllPredicate;
		this.message		= this.subscription.message;
		this.error 			= this.subscription.error;
	}
	
	Subscriber.prototype = {
		
		constructor: Subscriber,
		
		notify: function (event) {
			if ( this.predicate(event) ) {
				this.notifications.send(new Notification(this.message,arguments));
			}
		},
		
		fail: function (event) {
			if ( this.error && this.predicate(event) ) {
				this.notifications.send(new Notification(this.error,arguments));
			}
		}
		
	};
	
	em.extend({
		Subscriber: Subscriber
	});
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------

	function NotificationQueue (context,application) {

        TypedSet.call(this,Notification);

		this.context		= context;
		this.__suspensions	= 0;
		this.__process		= this.__deliver;
		this.application    = application;

	}
	
	NotificationQueue.prototype = extend({
		
		constructor: NotificationQueue,
		
		send: function _send (messages) {
			messages = (messages instanceof Set || messages instanceof List) ? messages
							: list(messages);
			var that = this;
			messages.each(function __send (message) {
   				that.__process(message);
			});
			return this;
		},
		
		__deliver: function (message) {
			message.deliver();
			return this;
		},
		
		__store: function (message) {
			if ( message.subscription && !message.subscription.application ) {
				this.deliver(message);
			}
			else {
				this.add(message);
			}
			return this;
		},
		
		suspend: function _suspend () {
			this.__suspensions++;
			this.__process = this.__store;
			return this;
		},

		resume: function _resume () {
            this.__suspensions--;
			if ( this.__suspensions === 0 ) {
				this.__process = this.__deliver;
				this.each('deliver');
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
	    
	}, new TypedSet(Notification) );
	
	em.NotificationQueue = NotificationQueue;
	
	
	function Notification (message,args) {
		this.message	= message;
		this.args		= args;
	}
	
	Notification.prototype = {
		
		constructor: Notification,
		
		deliver: function () {
			this.message.apply(null,this.args);
		}
		
	}
	
	
	// ------------------------------------------------------------------------
	//														  Observable Sets
	// ------------------------------------------------------------------------
	
	function observable (proto) {
		
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
	
	function ObservableSet (notifications) {
		Set.apply(this);
		makeObservable.call(this,notifications);
	}
	
	ObservableSet.prototype				= observable(Set.prototype);
	ObservableSet.prototype.constructor	= ObservableSet;
	
	function ObservableTypedSet (constructor,notifications) {
		TypedSet.call(this,constructor);
		makeObservable.call(this,notifications);
	}
	
	ObservableTypedSet.prototype 				= observable(TypedSet.prototype);
	ObservableTypedSet.prototype.constructor	= ObservableTypedSet;
	
	function makeObservable (notifications) {
		notifications = notifications || new NotificationQueue();
		this.events	= new EventRegistry(notifications,'add','remove','initialise','sort');
		this.event	= delegateTo(this.events,'filter');
		return this;
	}
	
	em.ObservableSet = ObservableSet;
	em.ObservableTypedSet = ObservableTypedSet;
	
	em.plugin.set.asObservable = function (notifications) {
		return this.reduce(Method('add'),new ObservableSet(notifications));
	};
	
	em.plugin.typedset.asObservable = function (notifications) {
		return this.reduce(Method('add'),new ObservableTypedSet(this.__constructor,notifications));
	};
	
	
	//
	// Create default EventRegistry
	//
	
	em.registry = new EventRegistry();
	
	
	return em;

	
}();