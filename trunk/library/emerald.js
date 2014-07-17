/*
 *	Emerald Javascript Library
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires sapphire.js
 *
 */
 
 
// ============================================================================
//														Emerald Event Framework
// ============================================================================
 
define(['jmodel/sapphire'],function (sapphire,a,b,c,undefined) {
 
	//
	// Import Sapphire
	//
 
	// Non-strict section
	for ( var i in sapphire ) {
		eval('var '+i+' = sapphire.'+i);
	}
	
	// Strict section
 
	var em		= Object.extend(sapphire,{emerald_version:'0.13.0'}),
		_		= em,
		_slice	= Array.prototype.slice;
 
 
	// ------------------------------------------------------------------------
	// 															  EventRegistry
	// ------------------------------------------------------------------------
 
 	// Reimplemented: yes
	function EventRegistry () {
		Map.To(EventType).apply(this);
		this.addArray.call(this,_slice.call(arguments));
	}
		
	EventRegistry.prototype = Object.extend(new (Map.To(EventType))(), {
			
		// Reimplemented: yes
		register: function () {
			return this.add(_slice.call(arguments));
		},
		
		// Reimplemented: yes	
		create: function (key) {
			this.add.apply(this,arguments);
			return this.get(key);
		},
		
		// Reimplemented: yes
		subscribe: function (map) {
			for ( var eventName in map ) {
				if ( map.hasOwnProperty(eventName) ) {
					this.get(eventName).subscribe(map[eventName]);
				}
			}
			return this;
		},
		
		// Reimplemented: yes
		republish: function (map) {
			for ( var eventName in map ) {
				if ( map.hasOwnProperty(eventName) ) {
					this.get(eventName).republish(map[eventName]);
				}
			}
			return this;
		}
			
	});
	
	em.EventRegistry = EventRegistry;
	
	//
	// Create default EventRegistry
	//
	
	em.registry = new EventRegistry();
	
	
	// ------------------------------------------------------------------------
	// 																  EventType
	// ------------------------------------------------------------------------
	
	function EventType () {
		this.subscribers	= delegateTo(new SubscriberSet(),'filter');
		this.events			= [];
		this.__remember		= 0;
	}
	
	EventType.prototype = {
		
		__constructor: EventType,
	
		// Reimplemented: yes
		subscribe: function _subscribe (subscriber) {
			var subs = this.subscribers().add(subscriber).added;
			for ( var i in this.events ) {
				if ( this.events.hasOwnProperty(i) ) {
					subs.notify.apply(subs,this.events[i]);
				}
			}
		},
	
		// Reimplemented: yes
		raise: function _raise () {
			if ( this.__remember ) {
				this.events.push(arguments);
				if ( this.__remember !== ':all' && this.events.length > this.__remember) {
					this.events.shift();
				}
			}
			return this.subscribers().notify.apply(this.subscribers(),arguments);
		},
		
		// Reimplemented: yes
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
		
		derive: function (handle_with) {
			var derived = new this.__constructor();
			derived.remember(this.__remember);
			if ( typeof handle_with === 'function' ) {
				this.subscribe({
					context: derived,
					message: handle_with.call(derived,derived.raise),
					error: handle_with.call(derived,derived.fail)
				});
			}
			return derived;
		},
		
		where: function () {
		    var context		= arguments[0].context,
		        predicate	= arguments[0].predicate || ( arguments.length > 1 ? and.apply(this,arguments) : arguments[0] );
			return this.derive(function (method) {
				return function () {
					return predicate.apply((context || arguments[0]),arguments) ? method.apply(this,arguments) : true;
				};
			});
		},
		
		until: function (predicate,inclusive) {
			var active = true;
			inclusive = typeof inclusive === 'undefined' ? true : inclusive;
			return this.derive(function (method) {
				return function () {
					var last = active && predicate.apply(null,arguments);
					active = active && !last;
					return ( active || (last && inclusive) ) ? method.apply(this,arguments) : true;
				};
			});
		},
		
		drop: function (number) {
			return this.derive(function (method) {
				return function () {
					return --number < 0 ? method.apply(this,arguments) : true;
				};
			});
		},
		
		take: function (number) {
			return this.derive(function (method) {
				return function () {
					return number-- > 0 ? method.apply(this,arguments) : true;
				};
			});
		},
		
		between: function (start,stop,options) {
			
			options = ( typeof options === 'object' ) ? options : {initial: (typeof options === 'undefined') ? false : options };
			var	active = options.initial,
				startEvent,
				last,
				derived = this.derive(function (method) {
					return function () {
						last = _slice.call(arguments);
						return active ? method.apply(this,_slice.call(arguments).concat(startEvent)) : true;
					};
				});
			
			start.subscribe(function () {
				if ( active === options.initial ) {
					startEvent	= _slice.call(arguments);
					active		= !options.initial;
				}
			});

			stop.subscribe(function () {
				if ( active !== options.initial && options.inclusive ) {
					derived.raise.apply(derived,[].concat(last,startEvent,_slice.call(arguments)));
				}
				active = options.initial;
			});
			
			return derived;
			
		},
		
		notBetween: function (start,stop) {
			return this.between.call(this,start,stop,true);
		},
		
		waitFor: function (startEventType) {
		    var derivedEventType    = this.derive(),
				events				= new List(),
				active				= false;
		    this.subscribe(function () {
				if ( active ) {
					return derivedEventType.raise.apply(derivedEventType,arguments);
				}
				else {
					events.add(_slice.call(arguments));
				}
				return true;
		    });
			// NOTE: handle return values here
		    startEventType.subscribe(function () {
				active = true;
				events.each(function (event) {
					derivedEventType.raise.apply(derivedEventType,event);
				});
		    });
		    return derivedEventType;
		},
		
		transition: function (fn) {
			fn = fn || function (x) {return x;};
			var value;
			return this.derive(function (method) {
				return function () {
					var last = value;
					value = fn.apply(null,arguments);
					return value !== last ? method.call(this,value,last) : true;
				};
			});
		},
		
		delay: function (interval) {
			return this.derive(function (method) {
				return function () {
					var args = _slice.call(arguments),
						that = this;
					setTimeout(function () {
						method.apply(that,args);
					}, interval || 0);
				};
			});
		},
		
		throttle: function (interval) {
				
			var pending,
				timer = new TimerEventType(interval),
				derivedEventType = this.derive();
				
			this.subscribe(function () {
				pending = _slice.call(arguments);
				timer.stop().start();	
			});
				
			timer.subscribe(function () {
				derivedEventType.raise.apply(derivedEventType,pending);
			});
					
			return derivedEventType;
			
		},
			
		effect: function (fn) {
			var context	= fn.context || this;
			fn	= fn.fn || fn;
			return this.derive(function (method) {
				return function () {
					fn.apply(context,arguments);
			        return method.apply(this,arguments);
				};
			});
		},
		
		tag: function () {
			var tags = _slice.call(arguments);
			return this.derive(function (method) {
				return function () {
					return method.apply(this,_slice.call(arguments).concat(tags));
				};
			});
		},
		
		accumulate: function (fn,acc,remember) {
			return new AccumulatorEventType(this,fn,acc,remember ? 1 : 0);
		},
		
		map: function (fn,each) {
			fn = ( typeof fn === 'string' ) ? resolve(fn) : fn;
			return this.derive(function (method) {
				return function () {
					return method.apply(this, each ? Set.fromArguments(arguments).map(fn).get() : [fn.apply(null,arguments)]);
				};
			});
		},
		
		project: function () {
			var indices = Set.fromArguments(arguments);
			return this.derive(function (method) {
				return function () {
					var args = arguments;
					return method.apply(this, indices.map(function (index) {
						return args[index];
					}).get());
				};
			});
		},
		
		partition: function (partition) {
			var events = new EventRegistry();
			this.subscribe(function () {
				var eventType = events.ensure(partition.apply(null,arguments));
				return eventType.raise.apply(eventType,arguments);
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
					privateEvent = privateEvents.add('group',
						sourceEvent
							.tag(group)
							.accumulate(fn,acc)
					).added;
					privateEvent.republish(targetEvents.ensure(group));
					return sourceEvent.raise.apply(sourceEvent,arguments);
				}
				return true;
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
		    var args1 = _slice.call(arguments),
		        republishedEventType = args1.shift();
		    this.subscribe({
				message: function () {
			        var args2 = _slice.call(arguments);
		            return republishedEventType.raise.apply(republishedEventType,args1.concat(args2));
		        },
				error: function () {
					var args2 = _slice.call(arguments);
		            return republishedEventType.fail.apply(republishedEventType,args1.concat(args2));
				}
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
					return derivedEventType.raise.apply(derivedEventType,arguments);
				}
				else if (options.remember) {
					last = arguments;
				}
				return true;
			});
			controlEvent.subscribe(function (event) {
				active = !initialState;
				if ( active && options.remember && last ) {
					return derivedEventType.raise.apply(derivedEventType,last);
				}
				return true;
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
				var args = _slice.call(arguments);
				acc = typeof acc === 'function' ? acc.apply(null,args) : acc;
				acc = fn.apply(null,[acc].concat(args));
				return this.raise.apply(this,[acc].concat(args));
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
	    var derivedEventType	= new EventType(),
			args				= _slice.call(arguments),
			options				= args.length > 1 && !( args[args.length-1] instanceof EventType ) ? args.pop() : {},
			eventTypes			= args[0] instanceof Set ? args[0] : Set.fromArray(args);
		derivedEventType.remember(options.remember || 0);
	    eventTypes.each(function (eventType) {
	        eventType.subscribe({
				message: function () {
	            	return derivedEventType.raise.apply(derivedEventType,arguments);
				},
				error: function () {
					return derivedEventType.fail.apply(derivedEventType,arguments);
				}
			});
	    });
	    return derivedEventType;
	};
	
	em.conjoin = function () {
	    
	    var derivedEventType = new EventType(),
	        buffer = list(),
			events = arguments[0] instanceof Set || arguments[0] instanceof List ? arguments[0] : Set.fromArguments(arguments);    
	    
	    events.each(function (eventType) {
			if ( eventType instanceof EventType ) {
		        var queue = buffer.add([]).added;
		        eventType.subscribe(function () {
	    	        queue.push.call(queue,_slice.call(arguments));
					if ( bufferReady() ) {
		                return sendMessage();
		            }
					return true;
		        });	
			}
	    });
	    
	    function bufferReady () {
            return buffer.reduce(function (full,queue) {
                return full && queue.length > 0;
            },true);
	    }
	    
	    function sendMessage () {
	        return derivedEventType.raise.apply(
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
			return predicate.apply(null,arguments) ? eventtype.raise.apply(eventtype,arguments) : true;
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
    	        return eventType.raise(event);
    	    });
    	    return eventType;
    	},
	
		fromDelegate: function (element,name,selector,options) {
			var eventType = new EventType();
			jQuery(element).on(name,selector,function (event) {
				if ( options && options.preventDefault ) {
					event.preventDefault();
				}
				if ( options && options.stopPropagation ) {
					event.stopPropagation();
				}
    	        return eventType.raise(event);
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
    	        args = _slice.apply(arguments).concat(function () {
					eventType.raise.apply(eventType,arguments);
				}),
    	        fn = args.shift();
			eventType.remember();
    	    fn.apply(this,args);
    	    return eventType;
    	},
    	
    	fromAjax: function (descriptor,immediate) {
    	    return new AjaxEventType(descriptor,immediate);
    	},
    	
    	fromJSON: function () {
    	    var args = [jQuery.getJSON].concat(_slice.call(arguments));
    	    return em.event.fromAsync.apply(null,args);
    	}
	    
	};
	
	
	//
	// AjaxEventType
	//

	function AjaxEventType (descriptor,settings) {
		
		EventType.call(this)

		this.descriptor = Object.copy(descriptor)
		
		if ( typeof settings === 'object' ) {
			this.description.settings = settings;
		}
		
		Object.extend(this.descriptor,{
			success: function () {
		        that.raise.apply(that,_slice.call(arguments).concat(that.descriptor));
		    },
			error: function () {
				that.fail.apply(that,_slice.call(arguments).concat(that.descriptor));
			},
			beforeSend: function (xhr,settings) {
				if ( jQuery.ajaxSettings.beforeSend ) {
					jQuery.ajaxSettings.beforeSend(xhr,settings);
				}
				if ( settings.type != 'GET' && settings.type != 'POST' ) {
					xhr.setRequestHeader('X-HTTP-Method',settings.type);
					settings.type = 'POST';
				}
			}
		});
			
		this.descriptor.immediate = ( typeof this.descriptor.immediate === 'undefined' ) ? true : this.descriptor.immediate;
		
		this.remember( typeof this.descriptor.remember !== 'undefined' ? this.descriptor.remember : 1 );
		var that = this;
		
		if ( this.descriptor.immediate ) {
			this.start();
		}
	
	}
	
	AjaxEventType.prototype = Object.extend(new EventType(), {
		
		start: function (data) {
			if ( this.descriptor.singleton ) {
				this.stop();
			}
			this.descriptor.data = typeof data === 'object' ? Object.extend(this.descriptor.data || {},data) : ( this.descriptor.data || {} );
			this.__ajax = jQuery.ajax.call(null,this.descriptor);
			return this;
		},
		
		stop: function () {
			if ( this.__ajax && this.__ajax.abort ) {
				this.__ajax.abort();
			}
			return this;
		}
		
	});
	
	
	//
	// PeriodicEventType
	//
	
	function PeriodicEventType (interval,immediate) {
		EventType.call(this);
		this.interval	= interval;
		this.immediate	= immediate;
		this.start();
	}
	
	PeriodicEventType.prototype = Object.extend(new EventType(), {
	
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
		
	});
	
	
	//
	// TimerEventType
	//
	
	function TimerEventType (interval) {
		EventType.call(this);
		this.interval = interval;
		this.start();
	}
	
	TimerEventType.prototype = Object.extend(new EventType(), {
		
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
		
	});
	
	
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
	
	function SubscriberSet () {
		TypedSet.call(this,Subscriber);
	}
	
	SubscriberSet.prototype = Object.extend(new TypedSet(Subscriber), {
		
		add: function () { // To support debug plugin
			return TypedSet.prototype.add.apply(this,arguments);
		},
		
		__construct: function (specification) {
			return new Subscriber(specification);
		},
		
		notify: function _notify () {
			var args = arguments;
			return this.reduce(function (ret,subscriber) {
				var returned = subscriber.notify.apply(subscriber,args);
				return ret && ( returned !== undefined ? returned : true );
			},true);
		},
		
		fail: function _error (event) {
			var args = arguments;
			this.each(function (subscriber) {
				subscriber.fail.apply(subscriber,args);
			});
		}
		
	});
	
	em.SubscriberSet = SubscriberSet;
	
	function Subscriber (subscription) {
		this.subscription = typeof subscription === 'function' ? {message:subscription} : subscription;
		this.notify		  = (this.subscription.message || Function.identity).bind(subscription.context || null);
		this.fail		  = (this.subscription.error   || Function.identity).bind(subscription.context || null);
	}
	
	Object.extend(em, {
		Subscriber: Subscriber
	});
	
	//
	// Predicates
	//
	
	em.changed = function (event) {
		return ( arguments.length === 1 && arguments[0].value ) ? ( event.value !== event.old ) : ( arguments[0] !== arguments[1] );
	};
	
	
	return em;
	
});