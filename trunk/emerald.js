/*
 *	Emerald Javascript Library v0.6.1
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
 
	var em		= extend({emerald_version:'0.6.1'},opal),
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
			return Set.fromArguments(arguments).reduce(Method('add',this),this);
		},
		
		filter: function _filter () {
		    events = TypedSet.prototype.filter.apply(this,arguments);
		    return events;
		},
		
		predicate: function _predicate (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('name',parameter));
			}
			else {
				return TypedSet.prototype.predicate.apply(this,arguments);
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
			var subs = this.subscribers().add(subscriber).added;
			if ( this.__last ) {
				subs.notify.apply(subs,this.__last);
			}
		},
	
		raise: function _raise () {
			this.__last = this.__remember ? arguments : undefined;
			this.subscribers().notify.apply(this.subscribers(),arguments);
		},
		
		fail: function _error () {
			this.subscribers().fail.apply(this.subscribers(),arguments);
		},
		
		as: function (name) {
			this.name = name;
			return this;
		},
		
		remember: function () {
			this.__remember = true;
			return this;
		},
		
		derive: function (registry,name,notifications) {
			var derived = new this.constructor(registry,name,notifications);
			if ( this.__remember ) {
				derived.remember();
			}
			return derived;
		},
		
		where: function () {
		    var derivedEventType = this.derive(),
		        predicate        = arguments.length > 1 ? And.apply(null,arguments) : arguments[0];
		    this.subscribe(function () {
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
		        if ( active && predicate(event) ) {
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
		
		take: function (number) {
			var derivedEventType = this.derive();
		    this.subscribe(function () {
		        if ( number >= 0 ) {
		            derivedEventType.raise.apply(derivedEventType,arguments);
		        }
		        number--;
		    });
		    return derivedEventType;
		},
		
		between: function (startEventType,stopEventType,options) {
			
			options = options || {};
			
			var derivedEventType = this.derive(),
				active = false,
				startEvent,
				last;
				
			this.subscribe(function () {
				var args = Array.prototype.slice.call(arguments);
				if ( active ) {
					derivedEventType.raise.apply(derivedEventType,args.concat(startEvent));
				}
				else if (options.remember) {
					last = args;
				}
			});
			
			startEventType.subscribe(function () {
			    startEvent = Array.prototype.slice.call(arguments);
				active = true;
				if ( options.remember && last ) {
					derivedEventType.raise.apply(derivedEventType,last.concat(startEvent));
				}
			});
			
			stopEventType.subscribe(function (event) {
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
		
		delay: function (interval) {
			var derivedEventType = this.derive();
			this.subscribe(function () {
				var args = arguments;
				setTimeout(function () {
					derivedEventType.raise.apply(derivedEventType,args);
				}, interval);
			});
			return derivedEventType;
		},
		
		effect: function (fn) {
		    var derivedEventType = this.derive();
		    this.subscribe(function () {
		        fn.apply(null,arguments);
		        derivedEventType.raise.apply(derivedEventType,arguments);
		    });
		    return derivedEventType;
		},
		
		accumulate: function (fn,acc) {
			acc = arguments.length > 1 ? acc : fn.unit;
			var derivedEventType = this.derive();
		    this.subscribe(function () {
				acc = typeof acc === 'function' ? acc.apply(null,arguments) : acc;
				acc = fn.apply(null,[acc].concat(Array.prototype.slice.call(arguments)));
				derivedEventType.raise(acc);
		    });
		    return derivedEventType;
		},
		
		map: function (fn) {
		    var derivedEventType = this.derive();
		    fn = ( typeof fn === 'string' ) ? Resolve(fn) : fn;
		    this.subscribe(function () {
				derivedEventType.raise.call(derivedEventType,fn.apply(null,arguments));
		    });
		    return derivedEventType;
		},
		
		republish: function () {
		    var args1 = Array.prototype.slice.call(arguments),
		        republishedEventType = args1.shift();
		    this.subscribe(function () {
		        var args2 = Array.prototype.slice.call(arguments);
	            republishedEventType.raise.apply(republishedEventType,args1.concat(args2));
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
    	        queue.push.call(queue,Array.prototype.slice.call(arguments));
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
				Array.prototype.concat.apply([],buffer.map(function (queue) {
					return queue.shift();
				}).get())
	        );
	    }
	    
	    return derivedEventType;
	    
	};
	
	
	//
	// Event generators
	//
	
	em.event = {
	    
	    from: function (element,name,options) {
    	    var eventType = new EventType();
    	    jQuery(element).bind(name, function (event) {
				if ( options && options.preventDefault ) {
					event.preventDefault();
				}
				if ( options && options.stopPropagation ) {
					event.stopPropagation();
				}
    	        eventType.raise(event);
    	    });
    	    return eventType;
    	},

		after: function (interval) {
			var eventType = new EventType();
			setTimeout(function () {
				eventType.raise({});
			}, interval);
			return eventType;
		},
    	
    	every: function (interval) {
    	    var eventType = new EventType();
    	    setInterval(function () {
				eventType.raise({}); 
			}, interval);
    	    return eventType;
    	},
    	
    	fromAsync: function () {
    	    var eventType = new EventType(),
    	        args = Array.prototype.slice.apply(arguments).concat(function () {
					eventType.raise.apply(eventType,arguments);
				}),
    	        fn = args.shift();
			eventType.remember();
    	    fn.apply(this,args);
    	    return eventType;
    	},
    	
    	fromAjax: function (descriptor) {
    	    var eventType = new EventType();
			eventType.remember();
    	    descriptor.success = function () {
    	        eventType.raise.apply(eventType,arguments);
    	    };
    	    jQuery.ajax.call(null,descriptor);
    	    return eventType;
    	},
    	
    	fromJSON: function () {
    	    var args = [jQuery.getJSON].concat(Array.prototype.slice.apply(arguments));
    	    return em.event.fromAsync.apply(null,args);
    	}
	    
	};
	
	em.seconds = function (interval) {
		return 1000 * interval;
	};
	
	em.minutes = function (interval) {
		return 60000 * interval;
	};
	
	em.hours = function (interval) {
		return 3600000 * interval;
	};
	
	em.alarm = function (dateString) {
		var interval = Date.parse(dateString) - (new Date()).getTime();
		return em.event.after(interval);
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
				this.notifications.send(new Notification(this.message,arguments,this.subscription));
			}
		},
		
		fail: function (event) {
			if ( this.error && this.predicate(event) ) {
				this.notifications.send(new Notification(this.error,arguments,this.subscription));
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
							: List.fromArguments(arguments);
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
				this.__deliver(message);
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
	
	
	function Notification (message,args,subscription) {
		this.message	    = message;
		this.args		    = Array.prototype.slice.call(args||[]);
		this.subscription   = subscription;
		this.context		= ( subscription && subscription.context ) ? subscription.context : null;
	}
	
	Notification.prototype = {
		
		constructor: Notification,
		
		deliver: function () {
		    this.message.apply(this.context,this.args);
		}
		
	};
	
	
	function AsynchronousNotification (message,args,subscription) {
	    Notification.call(this,message,args,subscription);
	}
	
	AsynchronousNotification.prototype = extend({
	    
	    constructor: AsynchronousNotification,
	    
	    deliver: function () {
	        async.apply(this.context,[this.message].concat(this.args));
	    }
	    
	}, new Notification() );
	
	
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
		
		this.events	= new EventRegistry(notifications,'add','remove','initialise','sort','change');
		this.event	= delegateTo(this.events,'filter');
		
		var change = this.event('change');
		this.event('add')
			.map('object')
			.where(has('event','change'))
			.subscribe(function (object) {
				object.event('change')
				    .map(function (event) {
				        event.object = object;
				        return event;
				    })
				    .republish(change);
			});
		
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
	
	
	// ------------------------------------------------------------------------
	//														 Observable Objects
	// ------------------------------------------------------------------------
	
	function ObservableObject (data,notifications) {
		
		this.__data = data;
	
		this.events = new EventRegistry(notifications || new NotificationQueue(),'change');
		this.event	= delegateTo(this.events,'filter');
		
		for ( var field in this.__data ) {
			
			this.events.register(field);
			
			this[field] = (function (field) {
				return function () {
					return this.getField(field);
				};
			})(field);
			
			this['set'+field] = (function (field) {
				return function (value) {
					return this.setField(field,value);
				};
			})(field);
			
		}
	
	}
	
	ObservableObject.prototype = {
		
		getField: function (field) {
			return this.__data[field];
		},
		
		setField: function (field,value) {
			var oldValue = this.__data[field];
			this.__data[field] = value;
			try {
				var event = this.event(field),
					descriptor = {
						field: field,
						value: value,
						old: oldValue
				};
				event.raise(descriptor);
				this.event('change').raise(descriptor);
			}
			catch (e) {
				this.events.register(field);	
			}
			return this;
		},
		
		set: function (values) {
			for ( var field in values ) {
				this.setField(field,values[field]);
			}
			return this;
		}
		
	};
	
	em.ObservableObject = ObservableObject;
	
	
	//
	// Predicates
	//
	
	em.changed = function (event) {
		return event.value !== event.old;
	};
	
	//
	// Create default EventRegistry
	//
	
	em.registry = new EventRegistry();
	
	
	return em;
 
	
}();