/*
 *	Emerald Javascript Library v0.11.1
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
 
	var em		= extend({emerald_version:'0.11.1'},opal),
		_		= em;
		
		
		// ------------------------------------------------------------------------
		//															  Notifications
		// ------------------------------------------------------------------------

/*		function NotificationQueue (context,application) {

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

		}, new Notification() ); */
 
 
	// ------------------------------------------------------------------------
	// 															  EventRegistry
	// ------------------------------------------------------------------------
 
	function EventRegistry (/*notifications*/) {
		
		TypedSet.call(this,EventType);
		
//		this.notifications	= notifications || new NotificationQueue();
		
		this.index(Resolve('name'));
		
		if ( arguments.length > 0 ) {
			this.register.apply(this,arguments);
		}
		
	}
	
	EventRegistry.prototype = extend({
		
		constructor: EventRegistry,
		
		register: function _register () {
			return Set.fromArguments(arguments).reduce(Method('add',this),this);
		},
		
		create: function _create () {
			var args = Array.prototype.slice.call(arguments);
			return TypedSet.prototype.create.apply(this,[this].concat(args));
		},
		
		filter: function _filter () {
		    events = TypedSet.prototype.filter.apply(this,arguments);
		    return events;
		},
		
		ensure: function _ensure (name) {
			return this.filter(name) || this.register(name).filter(name);
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
	
	//
	// Create default EventRegistry
	//
	
	em.registry = new EventRegistry();
	
	
	// ------------------------------------------------------------------------
	// 																  EventType
	// ------------------------------------------------------------------------
	
	function EventType (registry,name/*,notifications*/) {
		this.registry		= registry || em.registry;
		this.name			= name;
		this.subscribers	= delegateTo(new SubscriberSet(/*notifications || this.registry.notifications*/),'filter');
		this.events			= [];
		this.__remember		= 0;
	}
	
	EventType.prototype = {
		
		constructor: EventType,
	
		subscribe: function _subscribe (subscriber) {
			var subs = this.subscribers().add(subscriber).added;
			for ( i in this.events ) {
				subs.notify.apply(subs,this.events[i]);
			}
		},
	
		raise: function _raise () {
			if ( this.__remember ) {
				this.events.push(arguments);
				if ( this.__remember !== ':all' && this.events.length > this.__remember) {
					this.events.shift();
				}
			}
			this.subscribers().notify.apply(this.subscribers(),arguments);
		},
		
		fail: function _error () {
			this.subscribers().fail.apply(this.subscribers(),arguments);
		},
		
		as: function (name) {
			this.name = name;
			return this;
		},
		
		remember: function (number) {
			this.__remember = number;
			return this;
		},
		
		derive: function (registry,name/*,notifications*/) {
			var derived = new this.constructor(registry,name/*,notifications*/);
			derived.remember(this.__remember);
			return derived;
		},
		
		where: function () {
		    var derivedEventType = this.derive(),
				context			 = arguments[0].context   || this,
		        predicate        = arguments[0].predicate || ( arguments.length > 1 ? And.apply(this,arguments) : arguments[0] );
		    this.subscribe(function () {
		        if ( predicate.apply(context,arguments) ) {
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
		        if ( number > 0 ) {
		            derivedEventType.raise.apply(derivedEventType,arguments);
		        }
		        number--;
		    });
		    return derivedEventType;
		},
		
		between: function (startEventType,stopEventType,options) {
			
			options = options || {};
			
			var derivedEventType	= this.derive(),
				initial				= options.initial ? options.initial : false,
				active				= initial,
				startEvent			= null,
				last;
				
			this.subscribe(function () {
				var args = Array.prototype.slice.call(arguments);
				if ( active ) {
					derivedEventType.raise.apply(derivedEventType,args.concat(startEvent));
				}
				else if ( options.remember || options.inclusive ) {
					last = args;
				}
			});
			
			startEventType
				.where(function () { return active === initial; })		
				.subscribe(function () {
				    startEvent = Array.prototype.slice.call(arguments);
					active = !initial;
					if ( options.remember && last ) {
						derivedEventType.raise.apply(derivedEventType,last.concat(startEvent));
					}
				});

			stopEventType
				.where(function () { return active !== initial; })
				.subscribe(function () {
					var args = Array.prototype.slice.call(arguments);
					active = initial;
					if ( options.inclusive ) {
						derivedEventType.raise.apply(derivedEventType,[].concat(last,startEvent,args));
					}
				});
			
			
			return derivedEventType;
			
		},
		
		notBetween: function (startEventType,stopEventType,options) {
			options = options || {};
			options.initial = true;
			return this.between.call(this,startEventType,stopEventType,options);
		},
		
		waitFor: function (startEventType) {
		    var derivedEventType    = this.derive(),
				events				= new List(),
				active				= false;
		    this.subscribe(function () {
				if ( active ) {
					derivedEventType.raise.apply(derivedEventType,arguments);
				}
				else {
					events.add(Array.prototype.slice.call(arguments));
				}
		    });
		    startEventType.subscribe(function () {
				active = true;
				events.each(function (event) {
					derivedEventType.raise.apply(derivedEventType,event);
				});
		    });
		    return derivedEventType;
		},
		
		transition: function (fn) {
			var derivedEventType = this.derive(),
				last;
			this.subscribe(function () {
				var current = fn ? fn.apply(null,arguments) : arguments[0];
				if ( current !== last ) {
					derivedEventType.raise.apply(derivedEventType,arguments);
				}
				last = current;
			});
			return derivedEventType;
		},
		
		delay: function (interval) {
			var derivedEventType = this.derive();
			this.subscribe(function () {
				var args = Array.prototype.slice.call(arguments);
				setTimeout(function () {
					derivedEventType.raise.apply(derivedEventType,args);
				}, interval || 0);
			});
			return derivedEventType;
		},
		
		effect: function (fn) {
		    var derivedEventType	= this.derive(),
				context				= fn.context || this,
				fn					= fn.fn		 || fn;
		    this.subscribe(function () {
		        fn.apply(context,arguments);
		        derivedEventType.raise.apply(derivedEventType,arguments);
		    });
		    return derivedEventType;
		},
		
		tag: function () {
			var derivedEventType = this.derive(),
				tags = Array.prototype.slice.call(arguments);
		    this.subscribe(function () {
				var args = Array.prototype.slice.call(arguments);
		        derivedEventType.raise.apply(derivedEventType,args.concat(tags));
		    });
		    return derivedEventType;
		},
		
		accumulate: function (fn,acc,remember) {
			return new AccumulatorEventType(this,fn,acc,remember ? 1 : 0);
		},
		
		map: function (fn,each) {
		    var derivedEventType = this.derive();
		    fn = ( typeof fn === 'string' ) ? Resolve(fn) : fn;
		    this.subscribe(function () {
				derivedEventType.raise.apply(
					derivedEventType,
					each ? Set.fromArguments(arguments).map(fn).get() : [fn.apply(null,arguments)]
				);
		    });
		    return derivedEventType;
		},
		
		partition: function (partition) {
			var events = new EventRegistry();
			this.subscribe(function () {
				var eventType = events.ensure(partition.apply(null,arguments));
				eventType.raise.apply(eventType,arguments);
			});
			return {
				event: delegateTo(events,'ensure')
			};
		},
		
		group: function (partition,fn,acc) {
			var sourceEvents	= this.partition(partition),
				privateEvents	= new EventRegistry(),
				targetEvents	= new EventRegistry();
			this.subscribe(function () {
				var group			= partition.apply(null,arguments),
					privateEvent	= privateEvents.filter(group);
				if ( !privateEvent ) {
					var sourceEvent = sourceEvents.event(group);
					privateEvent = privateEvents.add(
						sourceEvent
							.tag(group)
							.accumulate(fn,acc)
							.as(group)
							.republish(targetEvents.ensure(group))
					).added;
					sourceEvent.raise.apply(sourceEvent,arguments);
				}
			});
			return {
				event: delegateTo(targetEvents,'ensure')
			};
		},
		
		split: function () {
			var matches = List.fromArguments(arguments);
			this.subscribe(function () {
				var args = arguments;
				matches.each(function (match) {
					match.apply(null,args);
				});
			});
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
	
	EventType.prototype.async = EventType.prototype.delay;
	
	function SwitchCombinator (initialState) {
		return function (controlEvent,options) {
			options = options || {};
			var derivedEventType = this.derive(),
				active = initialState,
				last;
			this.subscribe(function () {
				if ( active ) {
					derivedEventType.raise.apply(derivedEventType,arguments);
				}
				else if (options.remember) {
					last = arguments;
				}
			});
			controlEvent.subscribe(function (event) {
				active = !initialState;
				if ( active && options.remember && last ) {
					derivedEventType.raise.apply(derivedEventType,last);
				}
			});
			return derivedEventType;
		};
	}
	
	EventType.prototype.before 	= SwitchCombinator(true);
	EventType.prototype.after 	= SwitchCombinator(false);
	
	em.EventType = EventType;
	
	
	//
	// AccumulatorEventType
	//
	
	function AccumulatorEventType (source,fn,acc,remember) {
	
		EventType.call(this);
		acc = typeof acc !== 'undefined' ? acc : fn.unit;
	
		if ( remember ) {
			this.remember(remember);
		}
	
		source.subscribe({
			context: this,
			message: function () {
				var args = Array.prototype.slice.call(arguments);
				acc = typeof acc === 'function' ? acc.apply(null,args) : acc;
				acc = fn.apply(null,[acc].concat(args));
				this.raise.apply(this,[acc].concat(args));
			}
	    });
	
		this.reset = function (value) {
			acc = value;
			this.raise.call(this,acc);
		};
	
	}
	
	AccumulatorEventType.prototype = new EventType();
	
	
	//
	// Event combinators
	//
	
	em.disjoin = function () {
	    var derivedEventType	= new EventType(em.registry),
			args				= Array.prototype.slice.call(arguments),
			options				= args.length > 1 && !( args[args.length-1] instanceof EventType ) ? args.pop() : {},
			eventTypes			= args[0] instanceof Set ? args[0] : Set.fromArray(args);
		derivedEventType.remember(options.remember || 0);
	    eventTypes.each(function (eventType) {
	        eventType.subscribe(function () {
	            derivedEventType.raise.apply(derivedEventType,arguments);
	        });
	    });
	    return derivedEventType;
	};
	
	em.conjoin = function () {
	    
	    var derivedEventType = new EventType(em.registry),
	        buffer = list(),
			events = arguments[0] instanceof Set ? arguments[0] : Set.fromArguments(arguments);    
	    
	    events.each(function (eventType) {
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
	
	
	function match (predicate,eventtype) {
		return function () {
			if ( predicate.apply(null,arguments) ) {
				eventtype.raise.apply(eventtype,arguments);
			}
		};
	}
	
	em.match = match;
	
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
			return new TimerEventType(interval);
		},
    	
    	every: function (interval,immediate) {
    	    return new PeriodicEventType(interval,immediate);
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
    	    return new AjaxEventType(descriptor);
    	},
    	
    	fromJSON: function () {
    	    var args = [jQuery.getJSON].concat(Array.prototype.slice.apply(arguments));
    	    return em.event.fromAsync.apply(null,args);
    	}
	    
	};
	
	
	//
	// AjaxEventType
	//
	
	function AjaxEventType (descriptor) {
		
		EventType.call(this);
		this.remember(1);
		var that = this;
		
		this.descriptor = copy(descriptor).addProperties({
			success: function () {
		        that.raise.apply(that,arguments);
		    },
			error: function () {
				that.fail.apply(that,arguments);
			}
		});
		
		this.start();
		
	}
	
	AjaxEventType.prototype = extend({
		
		start: function () {
			this.__ajax = jQuery.ajax.call(null,this.descriptor);
		},
		
		stop: function () {
			this.__ajax.abort();
		}
		
	}, new EventType() );
	
	
	//
	// PeriodicEventType
	//
	
	function PeriodicEventType (interval,immediate) {
		EventType.call(this);
		this.interval	= interval;
		this.immediate	= immediate;
		this.start();
	}
	
	PeriodicEventType.prototype = extend({
	
		start: function () {
			var that = this;
	   	    this.__timer = setInterval(function () {
				that.raise({}); 
			}, this.interval);
			if ( this.immediate ) {
				this.remember(1);
				this.raise({});
			}
			return this;
		},
		
		stop: function () {
			clearInterval(this.__timer);
			return this;
		}
		
	}, new EventType() );
	
	
	//
	// TimerEventType
	//
	
	function TimerEventType (interval) {
		EventType.call(this);
		this.interval = interval;
		this.start();
	}
	
	TimerEventType.prototype = extend({
		
		start: function () {
			var that = this;
			this.__timer = setTimeout(function () {
				that.raise({});
			}, this.interval);
			return this;
		},
		
		stop: function () {
			clearTimeout(this.__timer);
			return this;
		}
		
	}, new EventType() );
	
	
	//
	// Helpful time functions
	//
	
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
//		this.notifications	= notifications || new NotificationQueue();
	}
	
	SubscriberSet.prototype = extend({
		
		constructor: SubscriberSet,
		
		add: function () { // To support debug plugin
			return TypedSet.prototype.add.apply(this,arguments);
		},
		
		__construct: function (specification/*,notifications*/) {
			return new Subscriber(specification/*,notifications || this.notifications*/);
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
	
	
	function Subscriber (subscription/*,notifications*/) {
		this.subscription	= typeof subscription === 'function' ? {message:subscription} : subscription;
//		this.notifications 	= notifications;
		this.predicate		= subscription.predicate || AllPredicate;
		this.message		= this.subscription.message;
		this.error 			= this.subscription.error;
		this.context		= ( subscription && subscription.context ) ? subscription.context : null;
	}
	
	Subscriber.prototype = {
		
		constructor: Subscriber,
		
		notify: function (event) {
			if ( this.predicate(event) ) {
				this.message.apply(this.context,arguments);
//				this.notifications.send(new Notification(this.message,arguments,this.subscription));
			}
		},
		
		fail: function (event) {
			if ( this.error && this.predicate(event) ) {
				this.error.apply(this.context,arguments);
//				this.notifications.send(new Notification(this.error,arguments,this.subscription));
			}
		}
		
	};
	
	em.extend({
		Subscriber: Subscriber
	});
	
	
	
	// ------------------------------------------------------------------------
	//														  Observable Sets
	// ------------------------------------------------------------------------
	
	function observable (proto) {
		
		return extend({
			
			add: aspect({
				target: proto.add,
				post: function (state) {
					if ( typeof this.added !== 'undefined' ) {
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
			}),
			
			create: function () {
				var args = Array.prototype.slice.apply(arguments);
				return proto.create.apply(this,[this].concat(arguments));
			}
			
		},copy(proto,true));
		
	}
	
	function ObservableSet (/*notifications*/) {
		Set.apply(this);
		makeObservable.call(this/*,notifications*/);
	}
	
	ObservableSet.prototype				= observable(Set.prototype);
	ObservableSet.prototype.constructor	= ObservableSet;
	
	function ObservableTypedSet (constructor/*,notifications*/) {
		TypedSet.call(this,constructor);
		makeObservable.call(this/*,notifications*/);
	}
	
	ObservableTypedSet.prototype 				= observable(TypedSet.prototype);
	ObservableTypedSet.prototype.constructor	= ObservableTypedSet;
	
	function makeObservable (/*notifications*/) {
		
//		notifications = notifications || new NotificationQueue();
		
		this.events	= new EventRegistry(/*notifications,*/'add','remove','initialise','sort','change');
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
	
	em.plugin.set.asObservable = function (/*notifications*/) {
		return this.reduce(Method('add'),new ObservableSet(/*notifications*/));
	};
	
	em.plugin.typedset.asObservable = function (/*notifications*/) {
		return this.reduce(Method('add'),new ObservableTypedSet(this.__constructor/*,notifications*/));
	};
	
	
	// ------------------------------------------------------------------------
	//														 Observable Objects
	// ------------------------------------------------------------------------
	
	function ObservableObject (data,options) {

		this.options		= options || {};
		this.options.tags	= this.options.tags || [];
	
		this.events = new EventRegistry('change');
		this.event	= delegateTo(this.events,'filter');
		
		for ( var field in data ) {
			this.instantiateField(field,data[field]);
		}
	
	}
	
	ObservableObject.prototype = {
		
		constructor: ObservableObject,
		
		instantiateField: function (field,value) {
			value = typeof value === 'function' ? value : scalar({value:value});
			value.call(this,this,field);
		},
		
		set: function (values) {
			for ( var field in values ) {
				this[field].call(this,values[field]);
			}
			return this;
		}
		
	};
	
	em.ObservableObject = ObservableObject;
	
	
	//
	// Scalar field
	//
	
	function scalar (options) {
		options = typeof options === 'object' ? options : {value:options};
		return function (object,field) {
			return new ScalarField(object,field,options);
		};
	}
	
	em.scalar = scalar;
	
	function ScalarField (object,field,options) {
		
		this.object		= object;
		this.field		= field;
		this.options 	= options;
		
		this.constraint	= this.options.constraint || AllPredicate;
		this.value		= this.options.value || null;
		
		this.event		= null;
		this.change 	= this.object.event('change');
		
		this.instantiate();
		
		if ( this.object.options.persist ) {
			this.persist();	
		}
	
	}
	
	ScalarField.prototype = {
		
		constructor: ScalarField,
		
		instantiate: function () {

			this.event = this.object.events.create(this.field)
				.remember( this.options.remember || this.object.options.remember );
			
			var that = this;
			this.object[this.field] = function (value) {
				return arguments.length === 0 ? that.get() : that.set(value);
			};
			
		},
		
		persist: function () {
		
			this.value = this.object.options.persist[this.object.options.prefix+'_'+this.field] || this.value;
			
			this.event
				.subscribe({
					context: {
						store: 	this.object.options.persist,
						key: 	this.object.options.prefix+'_'+this.field
					},
					message: function (value) {
						this.store[this.key] = value;
					}
				});
			
		},
		
		get: function () {
			return this.value;
		},
		
		set: function (value) {
			
			var oldValue = this.value;
			value = typeof value === 'function' ? value.call(this,oldValue) : value;

			if ( value !== oldValue ) {
				
				if ( this.constraint(value) ) {
					
					this.value = value;

					this.event.raise.apply(this.event,[value,oldValue]);

					this.change.raise({
						field: this.field,
						value: value,
						old: oldValue
					});
					
				}
				else {
					this.event.fail.apply(this.event,[value,oldValue]);
				}
				
			}

			return this.object;
			
		}
		
	};
	
	
	//
	// Collection field
	//
	
	function many (type) {
		return function (object,field) {
			return new CollectionField(object,field,type);
		};
	}
	
	em.many = many;
	
	function CollectionField (object,field,type) {
		
		ObservableTypedSet.call(this,type);
		
		this.object			= object;
		this.field			= field;
		this.__constructor	= type;
		
		this.instantiate();
	
	}
	
	CollectionField.prototype = extend({
		
		constructor: CollectionField,
		
		instantiate: function () {
			this.object[this.field] = delegateTo(this,'filter');
		}
		
	}, new ObservableTypedSet() );
	
	
	//
	// Predicates
	//
	
	em.changed = function (event) {
		return ( arguments.length === 1 && arguments[0].value ) ? ( event.value !== event.old ) : ( arguments[0] !== arguments[1] );
	};
	
	
	return em;
 
	
}();