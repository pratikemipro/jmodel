/*
 *	Emerald Javascript Library v0.4.1
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

	var em		= extend({emerald_version:'0.4.1'},opal),
		_		= em;


	// ------------------------------------------------------------------------
	// 															  EventRegistry
	// ------------------------------------------------------------------------

	function EventRegistry (notifications) {
		
		this.notifications	= notifications || new NotificationQueue();
		this.__delegate		= new TypedSet(EventType);
		
		this.__delegate
			.index(Property('name'))
			.delegateFor(this);
		
		if ( arguments.length > 1 ) {
			this.register.apply(this,Array.prototype.slice.call(arguments,1));
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
	
	function EventType (registry,name,notifications) {
		this.registry		= registry || em.registry;
		this.name			= name;
		this.subscribers	= delegateTo(new SubscriberSet(notifications || this.registry.notifications),'filter');
	}
	
	EventType.prototype = {
	
		subscribe: function _subscribe (subscriber) {
			return this.subscribers().add(subscriber).added;
		},
	
		raise: function _raise () {
			this.subscribers().notify.apply(this.subscribers(),arguments);
		},
		
		where: function (predicate) {
		    var derivedEventType = new EventType(this.registry);
		    this.subscribe(function (event) {
		        if ( predicate.apply(null,arguments) ) {
		            derivedEventType.raise.apply(derivedEventType,arguments);
		        }
		    });
		    return derivedEventType;
		},
		
		until: function (predicate,inclusive) {
			var derivedEventType = new EventType(this.registry),
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
		
		waitFor: function (startEventType) {
		    var notifications       = new NotificationQueue(null,true),
		        derivedEventType    = new EventType(this.registry,null,notifications);
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
		},
		
		map: function (fn) {
		    var derivedEventType = new EventType(this.registry);
		    fn = ( typeof fn === 'string' ) ? Resolve(fn) : fn;
		    this.subscribe(function (event) {
		        args = arrayFromArguments(arguments);
		        args[0] = fn.apply(null,arguments);
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
	
	em.disjoin = function () {
	    var derivedEventType = new EventType(em.registry),
	        that = this;
	    set(arrayFromArguments(arguments)).each(function (eventType) {
	        eventType.subscribe(function () {
	            derivedEventType.raise.apply(derivedEventType,arguments);
	        });
	    });
	    return derivedEventType;
	};
	
	em.conjoin = function () {
	    
	    var derivedEventType = new EventType(em.registry),
	        that = this,
	        buffer = list();    
	        
	    set(arrayFromArguments(arguments)).each(function (eventType) {
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
    	    var derivedEventType = new EventType();
    	    jQuery(element).bind(name, function (event) {
    	        derivedEventType.raise(event);
    	    });
    	    return derivedEventType;
    	},
    	
    	every: function (interval) {
    	    var derivedEventType = new EventType();
    	    function raise() { derivedEventType.raise({}); }
    	    setInterval(raise,interval);
    	    return derivedEventType;
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
		this.__delegate = set().of(Subscriber).delegateFor(this);
		this.notifications	= notifications;
	}
	
	SubscriberSet.prototype = {
		
		add: function () { // To support debug plugin
			return this.__delegate.add.apply(this,arguments);
		},
		
		__construct: function (specification) {
			return new Subscriber(specification);
		},
		
		notify: function _notify (event) {
			var args = arguments;
			this.notifications.send(
			    this.map(function (subscriber) {
				    return subscriber.match.apply(subscriber,args);
			    })
			);
		}
		
	};
	
	em.SubscriberSet = SubscriberSet;
	
	
	function Subscriber (subscription) {
		this.subscription	= typeof subscription === 'function' ? {message:subscription} : subscription;
		this.predicate		= subscription.predicate || AllPredicate;
		this.message		= this.subscription.message;
	}
	
	Subscriber.prototype.match = function (event) {
		return this.predicate(event) ? new Notification(this.message,arguments) : undefined;
	};
	
	em.extend({
		Subscriber: Subscriber
	});
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------

	function NotificationQueue (context,application) {

		set().of(Notification).delegateFor(this);
		this.context		= context;
		this.__suspensions	= 0;
		this.application    = application;

	}
	
	NotificationQueue.prototype = {
		
		send: function _send (messages) {
			messages = (messages instanceof Set || messages instanceof List) ? messages
							: new List([messages]);
			var that = this;
			messages.each(function __send (message) {
			    if ( message instanceof Notification ) {
    				if ( that.__suspensions === 0 || ( message.subscription && !message.subscription.application ) ) {
    					message.deliver();
    				}
    				else {
    //					console.log('Adding to queue');
    //					log('notifications/send').debug('Adding a notification to the queue');
    					that.add(message);
    //					console.log(notifications.count()+' messages on queue');
    				}
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
	    
	};
	
	em.NotificationQueue = NotificationQueue;
	
	
	function Notification (message,args) {
		this.message	= message;
		this.args		= args;
	}
	
	Notification.prototype.deliver = function () {
		this.message.apply(null,this.args);
	};
	
	
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