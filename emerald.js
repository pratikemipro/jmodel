/*
 *	Emerald Javascript Library v0.12.1
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
 
define(['jmodel/opal'],function (opal) {
 
	//
	// Import OPAL
	//
 
	for ( var i in opal ) {
		eval('var '+i+' = opal.'+i);
	}
 
	var em		= extend({emerald_version:'0.11.1'},opal),
		_		= em;
 
 
	// ------------------------------------------------------------------------
	// 															  EventRegistry
	// ------------------------------------------------------------------------
 
	function EventRegistry () {
		
		TypedSet.call(this,EventType);
		
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
		this.subscribers	= delegateTo(new SubscriberSet(),'filter');
		this.events			= [];
		this.__remember		= 0;
	}
	
	EventType.prototype = {
		
		constructor: EventType,
	
		subscribe: function _subscribe (subscriber) {
			var subs = this.subscribers().add(subscriber).added;
			for ( var i in this.events ) {
				if ( this.events.hasOwnProperty(i) ) {
					subs.notify.apply(subs,this.events[i]);
				}
			}
		},
	
		raise: function _raise () {
			if ( this.__remember ) {
				this.events.push(arguments);
				if ( this.__remember !== ':all' && this.events.length > this.__remember) {
					this.events.shift();
				}
			}
			return this.subscribers().notify.apply(this.subscribers(),arguments);
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
		
		derive: function (handle_with) {
			var derived = new this.constructor();
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
		    var context		= arguments[0].context   || this,
		        predicate	= arguments[0].predicate || ( arguments.length > 1 ? And.apply(this,arguments) : arguments[0] );
			return this.derive(function (method) {
				return function () {
					return predicate.apply(context,arguments) ? method.apply(this,arguments) : true;
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
			
			var options = ( typeof options === 'object' ) ? options : {initial: (typeof options === 'undefined') ? false : options },
				active = options.initial,
				startEvent,
				last,
				derived = this.derive(function (method) {
					return function () {
						last = Array.prototype.slice.call(arguments);
						return active ? method.apply(this,Array.prototype.slice.call(arguments).concat(startEvent)) : true;
					};
				});
			
			start.subscribe(function () {
				if ( active === options.initial ) {
					startEvent	= Array.prototype.slice.call(arguments);
					active		= !options.initial;
				}
			});

			stop.subscribe(function () {
				if ( active !== options.initial && options.inclusive ) {
					derived.raise.apply(derived,[].concat(last,startEvent,Array.prototype.slice.call(arguments)));
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
					events.add(Array.prototype.slice.call(arguments));
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
					return value !== last ? method.apply(this,arguments) : true;
				};
			});
		},
		
		delay: function (interval) {
			return this.derive(function (method) {
				return function () {
					var args = Array.prototype.slice.call(arguments),
						that = this;
					setTimeout(function () {
						method.apply(that,args);
					}, interval || 0);
				};
			});
		},
		
		effect: function (fn) {
			var context	= fn.context || this,
				fn		= fn.fn		 || fn;
			return this.derive(function (method) {
				return function () {
					fn.apply(context,arguments);
			        return method.apply(this,arguments);
				};
			});
		},
		
		tag: function () {
			var tags = Array.prototype.slice.call(arguments);
			return this.derive(function (method) {
				return function () {
					return method.apply(this,Array.prototype.slice.call(arguments).concat(tags));
				};
			});
		},
		
		accumulate: function (fn,acc,remember) {
			return new AccumulatorEventType(this,fn,acc,remember ? 1 : 0);
		},
		
		map: function (fn,each) {
			fn = ( typeof fn === 'string' ) ? Resolve(fn) : fn;
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
					privateEvent = privateEvents.add(
						sourceEvent
							.tag(group)
							.accumulate(fn,acc)
							.as(group)
							.republish(targetEvents.ensure(group))
					).added;
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
		    var args1 = Array.prototype.slice.call(arguments),
		        republishedEventType = args1.shift();
		    this.subscribe({
				message: function () {
			        var args2 = Array.prototype.slice.call(arguments);
		            return republishedEventType.raise.apply(republishedEventType,args1.concat(args2));
		        },
				error: function () {
					var args2 = Array.prototype.slice.call(arguments);
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
				var args = Array.prototype.slice.call(arguments);
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
	    var derivedEventType	= new EventType(em.registry),
			args				= Array.prototype.slice.call(arguments),
			options				= args.length > 1 && !( args[args.length-1] instanceof EventType ) ? args.pop() : {},
			eventTypes			= args[0] instanceof Set ? args[0] : Set.fromArray(args);
		derivedEventType.remember(options.remember || 0);
	    eventTypes.each(function (eventType) {
	        eventType.subscribe(function () {
	            return derivedEventType.raise.apply(derivedEventType,arguments);
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
	                return sendMessage();
	            }
				return true;
	        });
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
			if ( predicate.apply(null,arguments) ) {
				return eventtype.raise.apply(eventtype,arguments);
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
    	        args = Array.prototype.slice.apply(arguments).concat(function () {
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
    	    var args = [jQuery.getJSON].concat(Array.prototype.slice.apply(arguments));
    	    return em.event.fromAsync.apply(null,args);
    	}
	    
	};
	
	
	//
	// AjaxEventType
	//

	function AjaxEventType (descriptor,settings) {
		
		this.settings = ( typeof settings === 'object' ) ? settings : {};
		this.settings.immediate = ( typeof this.settings.immediate === 'undefined' ) ? true : this.settings.immediate;
		
		EventType.call(this);
		this.remember( typeof this.settings.remember == 'undefined' ? this.settings.remember : 1 );
		var that = this;
		
		this.descriptor = copy(descriptor).addProperties({
			success: function () {
		        that.raise.apply(that,Array.prototype.slice.apply(arguments).concat(that.descriptor));
		    },
			error: function () {
				that.fail.apply(that,Array.prototype.slice.apply(arguments).concat(that.descriptor));
			}
		});
		
		if ( this.settings.immediate ) {
			this.start();
		}
	
	}
	
	AjaxEventType.prototype = extend({
		
		start: function (data) {
			if ( this.settings.singleton ) {
				this.stop();
			}
			this.descriptor.data = typeof data === 'object' ? extend(data,this.descriptor.data) : this.descriptor.data;
			this.__ajax = jQuery.ajax.call(null,this.descriptor);
			return this;
		},
		
		stop: function () {
			if ( this.__ajax && this.__ajax.abort ) {
				this.__ajax.abort();
			}
			return this;
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
	
	function SubscriberSet () {
		TypedSet.call(this,Subscriber);
	}
	
	SubscriberSet.prototype = extend({
		
		constructor: SubscriberSet,
		
		add: function () { // To support debug plugin
			return TypedSet.prototype.add.apply(this,arguments);
		},
		
		__construct: function (specification) {
			return new Subscriber(specification);
		},
		
		notify: function _notify () {
			var args = arguments,
				returnVal = true;
			this.each(function (subscriber) {
				var returned = subscriber.notify.apply(subscriber,args);
				returnVal = ( typeof returned !== 'undefined' ? returned : true ) && returnVal;
			});
			return returnVal;
		},
		
		fail: function _error (event) {
			var args = arguments;
			this.each(function (subscriber) {
				subscriber.fail.apply(subscriber,args);
			});
		}
		
	}, new TypedSet(Subscriber) );
	
	em.SubscriberSet = SubscriberSet;
	
	
	function Subscriber (subscription) {
		this.subscription	= typeof subscription === 'function' ? {message:subscription} : subscription;
		this.predicate		= subscription.predicate || AllPredicate;
		this.message		= this.subscription.message;
		this.error 			= this.subscription.error;
		this.context		= ( subscription && subscription.context ) ? subscription.context : null;
	}
	
	Subscriber.prototype = {
		
		constructor: Subscriber,
		
		notify: function (event) {
			if ( this.message && this.predicate(event) ) {
				return this.message.apply(this.context,arguments);
			}
			return true;
		},
		
		fail: function (event) {
			if ( this.error && this.predicate(event) ) {
				this.error.apply(this.context,arguments);
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
						this.event('add').raise(this.added,this);
					}
					return state.returnValue;
				}
			}),
			
			remove: aspect({
				target: proto.remove,
				post: function (state) {
					var that = this;
					state.returnValue.each(function (item) {
						that.event('remove').raise(item,that);
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
	
	function ObservableSet () {
		Set.apply(this);
		makeObservable.call(this);
	}
	
	ObservableSet.prototype				= observable(Set.prototype);
	ObservableSet.prototype.constructor	= ObservableSet;
	
	function ObservableTypedSet (constructor) {
		TypedSet.call(this,constructor);
		makeObservable.call(this);
	}
	
	ObservableTypedSet.prototype 				= observable(TypedSet.prototype);
	ObservableTypedSet.prototype.constructor	= ObservableTypedSet;
	
	function makeObservable () {
		
		this.events	= new EventRegistry('add','remove','initialise','sort','change');
		this.event	= delegateTo(this.events,'filter');
		
		var change = this.event('change');
		this.event('add')
			.where(has('event','change'))
			.subscribe(function (object) {
				object.event('change')
				    .republish(change); 
			});
		
		return this;
		
	}
	
	em.ObservableSet = ObservableSet;
	em.ObservableTypedSet = ObservableTypedSet;
	
	em.plugin.set.asObservable = function () {
		return this.reduce(Method('add'),new ObservableSet());
	};
	
	em.plugin.typedset.asObservable = function () {
		return this.reduce(Method('add'),new ObservableTypedSet(this.__constructor));
	};
	
	
	// ------------------------------------------------------------------------
	//														 Observable Objects
	// ------------------------------------------------------------------------
	
	function ObservableObject (fields,options) {

		this.options		= options || {};
		this.options.tags	= this.options.tags || [];
		this.fields			= [];
	
		this.events = new EventRegistry('change');
		this.event	= delegateTo(this.events,'filter');
		
		for ( var field in fields ) {
			if ( fields.hasOwnProperty(field) ) {
				this.instantiateField(field,fields[field]);
			}
		}
	
	}
	
	ObservableObject.prototype = {
		
		constructor: ObservableObject,
		
		instantiateField: function (field,value) {
			value = typeof value === 'function' ? value : scalar({defaultValue:value});
			this.fields.push(field);
			value.call(this,this,field);
		},
		
		set: function (properties) {
			for ( var property in properties ) {
				if ( properties.hasOwnProperty(property) ) {
					if ( property === 'methods' ) { // Methods
						var methods = properties[property];
						for ( var method in methods ) {
							if ( methods.hasOwnProperty(method) ) {
								this[method] = methods[method];
							}	
						}
					}
					else { // Field
						this[property].call(this,properties[property]);
					}
				}	
			}
			return this;
		}
		
	};
	
	em.ObservableObject = ObservableObject;
	
	
	//
	// Type
	//
	
	function Type (fields,options) {
		return extend({
			prototype: new ObservableObject()
		}, function (data) {
			ObservableObject.call(this,fields,options);
			this.set(data);
		});
	}
	
	em.Type = Type;
	
	
	//
	// Scalar field
	//
	
	function scalar (options) {
		options = typeof options === 'object' ? options : {defaultValue:options};
		return function (object,field) {
			return new ScalarField(object,field,options);
		};
	}
	
	em.scalar = scalar;
	
	function ScalarField (object,field,options) {
		
		if ( object && field && options ) {
			
			this.object		= object;
			this.field		= field;
			this.options 	= options || {};

			this.constraint	= this.options.constraint || AllPredicate;

			this.event		= null;
			this.change 	= this.object.event('change');

			this.instantiate();
			this.set(typeof this.options.defaultValue !== 'undefined' ? this.options.defaultValue : null);

			if ( this.object.options.persist ) {
				this.persist();	
			}
			
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
		
			var fromStore = this.object.options.persist[this.object.options.prefix+'_'+this.field] || undefined;
			if ( fromStore ) {
				this.set(fromStore);
			}
			
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

			if ( this.options.repeat || ( typeof value !== 'undefined' && !this.equals(value,oldValue) ) ) {
				
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
			
		},
		
		equals: function (a,b) {
			return a === b;
		}
		
	};
	
	em.ScalarField = ScalarField;
	
	//
	// BooleanField
	//
	
	function boolean (options) {
		options = typeof options === 'object' ? options : {defaultValue:options};
		return function (object,field) {
			return new BooleanField(object,field,options);
		};
	}
	
	em.boolean = boolean;
	
	function BooleanField (object,field,options) {
		ScalarField.call(this,object,field,options);
	}
	
	BooleanField.prototype = extend({
		
		set: function (value) {
			
			if ( typeof value === 'string' && value.toLowerCase() === 'true' ) {
				value = true;
			}
			else if ( typeof value === 'string' && value.toLowerCase() === 'false' ) {
				value = false;
			}
			else {
				value = Boolean(value);
			}
			
			ScalarField.prototype.set.call(this,value);
			
		}
		
	}, new ScalarField() );
	
	em.BooleanField = BooleanField;
	
	//
	// IntegerField
	//
	
	function integer (options) {
		options = typeof options === 'object' ? options : {defaultValue:options};
		return function (object,field) {
			return new IntegerField(object,field,options);
		};
	}
	
	em.integer = integer;
	
	function IntegerField (object,field,options) {
		ScalarField.call(this,object,field,options);
	}
	
	IntegerField.prototype = extend({
		
		set: function (value) {
			value = typeof value === 'string' ? parseInt(value,10) : value;
			ScalarField.prototype.set.call(this,value);
		}
		
	}, new ScalarField() );
	
	em.IntegerField = IntegerField;
	
	//
	// StringField
	//
	
	function string (options) {
		options = typeof options === 'object' ? options : {defaultValue:options};
		return function (object,field) {
			return new StringField(object,field,options);
		};
	}
	
	em.string = string;
	
	function StringField (object,field,options) {
		ScalarField.call(this,object,field,options);
	}
	
	StringField.prototype = extend({
		
		set: function (value) {
			ScalarField.prototype.set.call(this,String(value));
		}
		
	}, new ScalarField() );
	
	em.StringField = StringField;
	
	//
	// DateField
	//
	
	function date (options) {
		options = typeof options === 'object' ? options : {defaultValue:options};
		return function (object,field) {
			return new DateField(object,field,options);
		};
	}
	
	em.date = date;
	
	function DateField (object,field,options) {
		ScalarField.call(this,object,field,options);
	}
	
	DateField.prototype = extend({
		
		set: function (value) {
			ScalarField.prototype.set.call(this,typeof value === 'date' ? value : new Date(value))
		}
		
	}, new ScalarField() );
	
	em.DateField = DateField;
	
	//
	// ObjectField
	//
	
	function object (options) {
		options = typeof options === 'object' ? options : {defaultValue:options};
		return function (object,field) {
			return new ObjectField(object,field,options);
		};
	}
	
	em.object = object;
	
	function ObjectField (object,field,options) {
		ScalarField.call(this,object,field,options);
	}
	
	ObjectField.prototype = extend({
		
		equals: function (a,b) {
			var equal = true;
			for ( var prop in a ) {
				if ( a.hasOwnProperty(prop) ) {
					equal = equal && ( typeof b !== 'undefined' ) && ( a[prop] === b[prop] );
				}
			}
			return equal;
		}
		
	}, new ScalarField() );
	
	em.ObjectField = ObjectField;
	
	
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
	
	em.CollectionField = CollectionField;
	
	//
	// Predicates
	//
	
	em.changed = function (event) {
		return ( arguments.length === 1 && arguments[0].value ) ? ( event.value !== event.old ) : ( arguments[0] !== arguments[1] );
	};
	
	
	return em;
 
	
});