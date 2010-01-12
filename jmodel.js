/*
 *	jModel Javascript Library v0.4.3
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires opal.js
 */


// ============================================================================
//														 	Domain Object Model
// ============================================================================

var jModel = function () {

	//
	// Import OPAL
	//

	var opal = OPAL();
	for ( var i in opal ) {
		eval('var '+i+' = opal.'+i);
	}

	var external		= function (predicate) { return defaultContext.all.filter.apply(all,arguments); }, /* NOTE: Fix this */
		_				= external;
		
	external.jmodel_version = '0.4.3';


	// ------------------------------------------------------------------------
	//																	Logging
	// ------------------------------------------------------------------------
	
	function Logger (flags) {
		
		var active = false,
			logElement = null;
		
		function log (type, message) {
				
			var console = window.console;
			
			if (logElement) {
				var p = document.createElement('p');
				p.innerText = message;
				logElement.appendChild(p);
			}
			else if ( type == 'startgroup' ) {
				if ( console && console.group ) {
					console.group(message);
				}
				else if ( console && console.log ) {
					console.log(message);
				}
			}
			else if ( type == 'endgroup' ) {
				if ( console && console.groupEnd ) {
					console.groupEnd();
				}
			}
			else {
				switch (type) {	
					case 'error': 	if (console && console.error) {console.error(message); break;}
					case 'warning': if (console && console.warn)  {console.warn(message);  break;}
					case 'debug': 	if (console && console.debug) {console.debug(message); break;}
					case 'info': 	if (console && console.info)  {console.info(message);  break;}
					default: 		if (console && console.log)   {console.log(message);   break;}	
				}
			}
			
		}
				
		function enabled (path) {
			if ( !path ) {
				return false;
			}
			var pieces = path.split('/'),
				property = flags;
			for ( var i=0; i<pieces.length; i++ ) {
				if ( typeof property.all == 'boolean' && property.all ) {
					return true;
				}
				property = property[pieces[i]];
				if ( !property ) {
					return false;
				}
				else if ( property && typeof property == 'boolean' ) {
					return property;
				}
			}
			return false;
		}
				
		function setFlag (path,value) {
			var pieces = path.split('/'),
				property = flags;
			for (var i=0; i<pieces.length-1; i++) {
				if ( typeof property[pieces[i]] == 'object' ) {
					property = property[pieces[i]];
				}
				else if ( typeof property[pieces[i]] == 'undefined' ) {
					property[pieces[i]] = {all:false};
					property = property[pieces[i]];
				}
			}
			property[pieces[pieces.length-1]] = value;
		}		
		
		var externalActive = {
			startGroup: function _startGroup (title) { log('startgroup',title); 	return externalActive; },
			endGroup: 	function _endGroup () { log('endgroup'); 					return externalActive; },
			error: 		function _error (message) { log('error',message); 		return externalActive; },
			warning: 	function _warning (message) { log('warning',message);	return externalActive; },
			debug: 		function _debug (message) { log('debug',message); 		return externalActive; },
			info: 		function _info (message) { log('info',message); 		return externalActive; }
		};
		
		var externalInactive = {
			startGroup: function _startGroup () { return externalInactive; },
			endGroup: 	function _endGroup () { return externalInactive; },
			error: 		function _error () { return externalInactive; },
			warning: 	function _warning () { return externalInactive; },
			debug: 		function _debug () { return externalInactive; },
			info: 		function _info () { return externalInactive; }
		};
		
		var external = function _external (condition) {	
			if ( arguments.length === 0 || ( active && enabled(condition) ) ) {
				return externalActive;
			}
			else {
				return externalInactive;
			}
		};
		
		external.enable = function _enable (flag) {
			setFlag(flag,true);
			active = true;
			return this;
		};

		external.disable = function _disable (flag) {
			setFlag(flag,false);
			return this;
		};
		
		external.element = function _element (element) {
			logElement = element;
			return this;
		};
		
		return external;
			
	}
	
	var log = external.log = Logger({
		
		all: false,
		application: {
			all: false
		},
		domainobject: {
			all: false,
			create: false,
			set: false
		},
		domainobjectcollection: {
			all: false,
			create: false,
			add: false
		},
		subscriptions: {
			all: false,
			subscribe: false,
			notify: false
		},
		notifications: {
			all: false,
			control: false,
			send: false
		},
		json: {
			all: false,
			thaw: false
		}
		
	});
	
	
	// ------------------------------------------------------------------------
	//															 Initialisation
	// ------------------------------------------------------------------------

	//
	// Define local variables
	//

	var	contexts		= function _contexts (predicate) { return contexts.get(predicate); };
	ContextSet.apply(contexts);
	
	external.extend = opal.extend;
	
	external.extend({
		contexts: contexts
	});
		
	//
	// External interface to OPAL
	//
	
	for (var i in opal) {
		external[i] = opal[i];
	}
	
	external.extend({
		
		method: 	Method,
		plus: 		plus,
		times: 		times,
		
		/* Set */
		set: 		opal.set,
		
		/* Predicates */
		predicate: 	predicate,
		
		is: 		ObjectIdentityPredicate,
		istrue: 	TruePredicate,
		
		test: 		FunctionPredicate,
		type: 		TypePredicate,
		isa: 		InstancePredicate,
		isan: 		InstancePredicate,
		property: 	PropertyPredicate,
		propset: 	PropertySetPredicate,
		
		member: 	MembershipPredicate,
		
		or: 		Or,
		and: 		And,
		not: 		Not,
		
		empty: 		EmptySetPredicate,
		nonempty: 	Not(EmptySetPredicate),
		
		all: 		function _all () {
						return arguments.length === 0 ? AllPredicate : AllSetPredicate.apply(null,arguments);
					},
		
		some: 		SomeSetPredicate,
		none: 		NoneSetPredicate,
		
		/* Orderings */
		
		func: 		FunctionOrdering,
		value: 		ValueOrdering,
		score: 		PredicateOrdering,
		desc: 		DescendingOrdering,
		composite: 	CompositeOrdering
		
	});
	
	
	// ------------------------------------------------------------------------
	//															 Set operations
	// ------------------------------------------------------------------------
	
	function makeCollection (set) {
		if ( set instanceof Set || set instanceof DomainObjectCollection ) {
			return set;
		}
		else if ( typeof set == 'function' ) {
			return set();
		}
		else {
			return new Set();
		}
	};
	
	external.union = function _union () {
		var union = new Set();
		for (var i=0; i<arguments.length; i++ ) {
			var collection = makeCollection(arguments[i]);
			collection.each(function __union (object) {
				union.add(object);
			});
		}
		if ( arguments[0] instanceof Set ) {
			return union;
		}
		else {
			return contexts('default').collection({
				objects: union,
				description:'union'
			});
		}
	};
	external.union.unit = set();
	
	external.intersection = function _intersection () {
		var intersection = new Set();
		makeCollection(arguments[0]).each(function __intersection (object) {
			intersection.add(object);
		});
		for (var i=1; i<arguments.length; i++ ) {
			intersection = intersection.filter(MembershipPredicate(arguments[i]));
		}
		if ( arguments[0] instanceof Set ) {
			return intersection;
		}
		else {
			return contexts('default').collection({
				objects: intersection,
				description:'intersection'
			});
		}
	};
	
	external.difference = function difference (first,second) {
		return makeCollection(first).filter( Not(MembershipPredicate(second)) );
	};

	
	// ------------------------------------------------------------------------
	// 																   Contexts
	// ------------------------------------------------------------------------
	
	function ContextSet () {
		
		var contexts = set().index(Property('name')).delegateFor(this);
	
		this.create = function _create (name) {
			return this.add(new Context(name)).added;
		};
	
	}
	
	
	function Context (name) {

		var context = this;

		this.isDefault		= false;
		this.name			= name;
		this.notifications	= new NotificationQueue(this);
		this.entities		= new EntityTypeSet(this);
		this.all			= this.collection({description:'All Objects in context '+this.name});
		
	}
	
	Context.prototype = {
		
		register: function _register (name,constructor,options) {
			return this.entities
						.create(name,constructor,options)
							.exposeAt( this.isDefault ? [this,external] : [this] )
							.context;
		},
		
		collection: function _collection (specification) {
			return new DomainObjectCollection( extend({context:this},specification) );
		},
		
		reset: function _reset () {
			this.all.remove(AllPredicate,true);
			return this;
		},
		
		checkpoint: function _checkpoint () {
			this.entities.each(function __checkpoint (entity) {
				entity.objects.each('clean');
				entity.deleted.remove(AllPredicate,true);
			});
			return this;
		},
		
		validate: function _validate () {
			return this.all
					.map(function __validate (object) {return {object:object, messages:object.validate()};})
						.filter(function ___validate (result) { return result.messages !== ''; });
		},
		
		setDefault: function _setDefault () {
			this.isDefault			= true;
			defaultContext			= this;
			external.context		= this;
			external.notifications	= this.notifications;
		},
		
		debug: function _debug (showSubscribers) {
			log().startGroup('Context: '+name);
			this.notifications.debug();
			this.entities.each(function __debug (entity) {
				log().startGroup(entity.name);
				entity.objects.debug(showSubscribers);
				entity.deleted.debug(false);
				log().endGroup();
			});
			log().endGroup();
		}
		
	};
	
	var	defaultContext	= contexts.create('default').setDefault();
	
	
	// ------------------------------------------------------------------------
	// 																 Prototypes
	// ------------------------------------------------------------------------
	
	function EntityTypeSet (context) {
		this.context	= context;
		this.__delegate	= set().index(Property('name')).delegateFor(this);
	}
	
	EntityTypeSet.prototype = {
		
		create: function _create (name,constructor,options) {
			return this.add(new EntityType(this.context,name,constructor,options)).added;
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
	
	
	
	function EntityType (context,name,constructor,options) {

		this.options		= options || {};
		this.name			= name;
		this.constructor	= constructor;
		this.context		= context;

		this.objects =	this.context.collection({
							base: 			this.context.all,
							predicate: 		InstancePredicate(this.constructor),
							ordering: 		this.options.ordering,
							description: 	this.name,
							primaryKey: 	this.options.primaryKey
						});
							
		// EntityType methods
		if ( this.options.methods ) {
			extend(this.options.methods,this.objects);
		}
							
		this.deleted = new DeletedObjectsCollection(this.objects);

	};
	
	EntityType.prototype = {
		
		object: function _object (criterion) {
			criterion = ( typeof criterion == 'string' && this.options.primaryKey && parseInt(criterion,10) ) ? parseInt(criterion,10) : criterion;
			if ( typeof criterion == 'number' && this.options.primaryKey ) {
				return this.objects.get(criterion);
			}
			else {
				var objects = this.objects.filter.apply(this.objects,arguments);
				return ( objects instanceof DomainObjectCollection ) ? objects.first() : objects;
			}
		},
		
		create: function _create (data) {

			log('domainobject/create').startGroup('Creating a new '+this.name);

			data = (typeof data == 'object') ? data : {};

			var primaryKey	= this.options.primaryKey;
			data[primaryKey] = data[primaryKey] || this.generateID();
			
			var newObject = new this.constructor();
			newObject.__delegate = new DomainObject(this.context,newObject,data);
			newObject.__delegate.primaryKey = primaryKey;
			newObject.__delegate.delegateFor(newObject);

			this.context.all.add(newObject);

			if ( newObject.initialise ) {
				newObject.initialise();
			}

			log('domainobject/create').endGroup();

			return newObject;

		},
		
		exposeAt: function _exposeAt (targets) {
			
			var name	= this.name,
				plural	= this.options.plural || this.name+'s',
				entity	= this;
			
			set(targets).each(function __exposeAt (target) {
			
				target[name] 				= delegateTo(entity,'object');
				target[plural]				= delegateTo(entity.objects,'filter');

				target['create'+name]		= delegateTo(entity,'create');
				target['deleted'+plural]	= delegateTo(entity.deleted,'filter');

				target[name].entitytype		= entity;
				target[name].extend			= delegateTo(entity.constructor,'extend');
				
			});
			
			return this;
			
		},
		
		generateID: function __generateID () {	
			return -(this.context.all.count()+1);
		}
		
	};
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------
	
	function NotificationQueue (context) {
		
		this.context = context;
		
		var	notifications 	= set().delegateFor(this),
			active			= true,
			filter			= AllPredicate;
		
		this.send = function _send (messages) {
			messages = (messages instanceof Set) ? messages : new Set([messages]);
			messages.each(function __send (message) {
				if ( !filter(message) ) {
				}
				else if ( active || !message.subscription.application ) {
					message();
				}
				else {
					log('notifications/send').debug('Adding a notification to the queue');
					notifications.add(message);
				}
			});
			return this;
		};
		
		this.suspend = function _suspend () {
			log('notifications/control').debug('Suspending notifications for '+this.context.name);
			active = false;
			return this;
		};
		
		this.resume = function _resume () {
			log('notifications/control').debug('resuming notifications for '+this.context.name);
			active = true;
			notifications.map(apply);
			return this.flush();
		};
		
		this.flush = function _flush (predicate) {
			log('notifications/control').debug('Flushing notifications for '+this.context.name);
			notifications.remove(predicate);
			return this;
		};
		
		this.setFilter = function _setFilter (predicate) {
			filter = predicate;
			return this;
		};
		
		this.debug = function _debug () {
			log().debug('Pending notifications: '+this.count());
		};
		
	};
	
	
	//
	// Notification types
	//
	
	function ContentNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _contentnotification () {
			log('notifications/send').debug('Receiving a content notification for '+subscription.key+': '+subscription.description+' ('+subscription.source.get(subscription.key)+')');
			var value = subscription.value ? subscription.value(subscription.source) : subscription.source.get(subscription.key);
			subscription.target.html(subscription.format(value));
		});	
	};
	
	function ValueNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _valuenotification () {
			log('notifications/send').debug('Receiving a value notification for '+subscription.key+': '+subscription.description);
			subscription.target.val(subscription.source.get(subscription.key));
		});
	};
	
	function MethodNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _methodnotification () {
			log('notifications/send').debug('Receiving an object method notification'+': '+subscription.description);
			subscription.method.call(subscription.target,subscription.source);
		});	
	};
	
	function EventNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _eventnotification () {
			log('notifications/send').debug('Receiving an event notification'+': '+subscription.description);
			subscription.target.trigger(jQuery.Event(subscription.event),subscription.source);
		});
	};
	
	// NOTE: Should implement separate RemovalMethodNotification and RemovalEventNotification objects
	function RemovalNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _removalnotification () {
			log('notifications/send').debug('Receiving a removal notification'+': '+subscription.description);
			subscription.removed.call(subscription.target,subscription.source);
		});
	};
	
	function CollectionMethodNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _collectionmethodnotification () {
			if (subscription[event.method] && event.permutation) {
				log('notifications/send').debug('Receiving a sort notification');
				subscription[event.method].call(subscription.target,event.permutation);
			}
			else if (subscription[event.method] && typeof subscription[event.method] == 'function' ) {
				log('notifications/send').debug('Receiving a collection method notification'+': '+subscription.description);
				subscription[event.method].call(subscription.target,subscription.source,event.object);
			}
		});
	};
	
	function CollectionEventNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _collectioneventnotification () {
			// NOTE: Implement this
		});
	};
	
	// NOTE: Make this work with bindings
	function CollectionMemberNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _collectionmembernotification () {
			log('notifications/send').debug('Receiving a collection member notification');
			subscription.member.key = ( subscription.member.key instanceof Array ) ?
												subscription.member.key
												: [subscription.member.key];
			for (var i in subscription.member.key) {
				event.object.subscribe({
					application: subscription.application,
					source: event.object,
					target: subscription.member.target,
					key: subscription.member.key[i],
					change: subscription.member.change,
					initialise: subscription.member.initialise,
					format: subscription.member.format,
					value: subscription.member.value,
					description: subscription.member.description || 'collection member subscription for key '+subscription.member.key[i]
				});
			}
		});
	};
	
	
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
				log('subscriptions/subscribe').debug('added subscriber: '+subscriber.description);
				that.added = subscriber;
			});
			return this;
		},
		
		notify: function _notify (event) {
			var messages = this.__delegate.map(ApplyTo(event))
								.filter(function (msg) { return msg != null; } );
			if ( messages.count() > 0 ) {
				log('subscriptions/notify').startGroup('Notifying subscribers of '+event.description);
				this.notifications.send(messages);
				log('subscriptions/notify').endGroup();
			}
		},
		
		debug: function _debug () {
			if ( _.nonempty(this.__delegate) ) {
				log().debug('Subscribers:  '+this.__delegate.count());
			}
		}
		
	};
	
		
	function CollectionSubscriber (subscription) {
		return function _collectionsubscriber (event) {
			return ( subscription.filter && !subscription.filter(event) ) ? null
				:  subscription.type(subscription,event);
		};
	}
	
	function ObjectSubscriber (subscription) {
		return function _objectsubscriber (event) {
			return ( event.removed && subscription.removed ) || ( event.key == subscription.key ) ?
				subscription.type(subscription,event)
				: null;
		};
	}

	
	
	// ------------------------------------------------------------------------
	// 												   Domain Object Collection
	// ------------------------------------------------------------------------
	
	function DomainObjectCollection (specification) {
		
		var that=this;
		
		specification		= specification || {};
		this.__predicate	= specification.predicate || AllPredicate;
		this.context		= specification.context || contexts('default');
		this.description	= specification.description;
		
		log('domainobjectcollection/create').startGroup('Creating a DomainObjectCollection: '+this.description);
		
		this.__delegate	= ( specification.objects && specification.objects instanceof Set ) ? specification.objects
								: new Set(specification.objects);
		if ( specification.primaryKey ) {
			this.__delegate.index(Method('primaryKeyValue'));
		}
		this.__delegate.delegateFor(this);
		this.__delegate.sorted = false;
		
		this.subscribers	= delegateTo(new SubscriberSet(this.context.notifications),'filter');
				
		if ( specification.ordering ) {
			this.__ordering = this.ordering(specification.ordering);
			this.sort();
		}
		
		// This collection is a materialised view over a base collection
		if ( specification.base ) {
			var view = new View(specification.base,this,specification.predicate);
		}
		else if ( specification.base ) {
			throw 'Error: Invalid base collection type';
		}
		
		log('domainobjectcollection/create').endGroup();
		
		
	};
	
	DomainObjectCollection.prototype = {
		
		add: function _add (object) {
			var that = this;
			this.__delegate.add(object, function __add () {
				that.subscribers().notify({method:'add',object:object,description:'object addition'});
				object.subscribe({
					target: that,
					key: ':any',
					change: function _change (object) {
						that.__delegate.sorted = false;
						that.subscribers().notify({
							method:'change',
							object:object,
							description:'object change'
						}); 
					},
					description: 'object change for '+this.description+' collection change'
				});
				that.__delegate.sorted = false;
			});
			return this;
		},
		
		remove: function _remove (predicate,fromHere,removeSubscribers) {
			predicate = And(this.__predicate,this.predicate(predicate));
			var that = this;
			if ( fromHere ) {
				this.__delegate.remove(predicate).each(function __remove (object) {
					object.removed();
					that.subscribers().notify({method:'remove',object:object,description:'object removal'});
					if (removeSubscribers) {
						object.subscribers().remove(AllPredicate);
					}	
				});
			}
			else {
				this.context.all.remove(And(MembershipPredicate(this.__delegate),predicate),true,true);
			}

		},
		
		first: function _first () {
			if ( !this.__delegate.sorted ) { this.sort(); }
			return this.__delegate.first();
		},
		
		select: function _select (selector) {
			return selector == ':first' ? this.first() : this;
		},
		
		filter: function _filter () {

			if ( arguments.length === 0 ) {
				return this;
			}

			var filtered = this.__delegate.filter.apply(this,arguments);

			if ( filtered instanceof Set ) {
				return this.context.collection({
					objects: filtered,
					description:'filtered '+this.description
				});
			}
			else {
				return filtered;
			} 

		},
		
		each: function _each (callback) {
			if ( !this.__delegate.sorted ) { this.sort(); }
			this.__delegate.each(callback);
			return this;
		},
		
		sort: function _sort () {

			if ( this.__delegate.sorted ) {
				return this;
			}

			if (arguments.length > 0) {
				this.__ordering = this.ordering.apply(null,arguments);
			}

			// Remember old order
//			this.__delegate.each(function __sort (object,index) {
//				object.domain.tags.position = index;
//			});

			// Sort
			this.__delegate.sort(this.__ordering);

			// Find permutation
			var permutation = [];
//			this.__delegate.each(function ___sort (object,index) {
//				permutation[index] = object.domain.tags.position;
//				delete object.__delegate.domain.tags.position;
//			});

			// Find whether permutation is not identity permutation
			var permuted = false;
			for(var i=0; i<permutation.length; i++) {
				if ( permutation[i] != i ) {
					permuted = true;
					break;
				}
			}

			// Notify subscribers
			if ( permuted ) {
				this.subscribers().notify({method:'sort',permutation:permutation,description:'collection sort'});
			}

			this.__delegate.sorted = true;

			return this;

		},
		
		by : function _by () {			
			return this.context.collection({
				objects: this.copy(),
				ordering: this.ordering.apply(null,arguments),
				description:'ordered '+this.description
			});
		},
		
		group: function _group (extractor) {
			return new Grouping(this,extractor);
		},
		
		subscribe: function _subscribe (subscription) {
			
			log('subscriptions/subscribe').startGroup('Subscribing: '+subscription.description);

			if ( subscription.predicate || subscription.selector ) {
				log('subscriptions/subscribe').debug('Creating a collection member subscription: '+subscription.description);
				subscription.type	= 	CollectionMemberNotification;
				subscription.filter = 	function __subscribe (collection) {
											return function ___subscribe (event) {
												return collection.filter(subscription.predicate).select(subscription.selector) === event.object
														&& ( event.method == 'add' || event.method == 'initialise' ); // NOTE: Fix this
											};
										}(this);							
			}
			else if ( ( typeof subscription.add == 'string' ) && ( typeof subscription.remove == 'string' ) ) {
				log('subscriptions/subscribe').debug('Creating a collection event subscription: '+subscription.description);
				subscription.type	= CollectionEventNotification;
			}
			else {
				log('subscriptions/subscribe').debug('Creating a collection method subscription: '+subscription.description);
				subscription.type	= CollectionMethodNotification; 
			}
			
			var subscriber = this.subscribers().add(CollectionSubscriber(subscription)).added;
			
			if ( subscription.initialise ) {
				log('subscriptions/subscribe').startGroup('initialising subscription: '+subscription.description);
				this.each(function __subcribe (object) {
					this.context.notifications.send(subscriber({
						method: 'initialise',
						object: object,
						description: 'initialisation'
					}));	
				});
				log('subscriptions/subscribe').endGroup();
			}
			
			log('subscriptions/subscribe').endGroup();
			
			return subscriber;	
			
		},
		
		predicate: function _predicate (parameter) {
			if ( parameter == ':empty' ) {
				return EmptySetPredicate;
			}
			else if ( typeof parameter == 'function' ) {
				return parameter;
			}
			else if ( parameter && parameter.domain ) {
				return ObjectIdentityPredicate(parameter);
			}
			else if ( typeof parameter == 'object' && parameter !== null ) {
				return ExamplePredicate(parameter);
			} 
			else if ( typeof parameter == 'number' ) {
				return IdentityPredicate(parameter);
			}
			return AllPredicate;
		},
		
		ordering: function _ordering () {
			if ( arguments.length > 1 ) {
				for ( var i=0; i<arguments.length; i++ ) {
					arguments[i] = ordering(arguments[i]);
				}
				return CompositeOrdering.apply(null,arguments);
			}
			else if ( arguments[0] instanceof Array ) {
				for ( var i=0; i<arguments[0].length; i++ ) {
					arguments[0][i] = ordering(arguments[0][i]);
				}
				return CompositeOrdering(arguments[0]);
			}
			else if ( typeof arguments[0] == 'function' ) {
				return arguments[0];
			}
			else {
				var pieces = arguments[0].split(' ');
				if ( pieces.length === 1 || pieces[1].toLowerCase() != 'desc' ) {
					return FieldOrdering(pieces[0]);
				}
				else if ( piece.length > 0 ) {
					return DescendingOrdering(FieldOrdering(pieces[0]));
				}
				else {
					return ValueOrdering;
				}
			}
		},
		
		debug: function _debug (showSubscribers) {
			if ( Not(EmptySetPredicate)(this) ) {
				log().debug('Objects:  '+this.format(listing(Method('primaryKeyValue'))));
			}
			if ( showSubscribers ) {
				this.subscribers().debug();
			}
		}
		
	};
	
	// NOTE: Make this a method of Context
	external.collection = function _collection () {
			return new DomainObjectCollection({
				context: contexts('default'),
				objects: set(arguments).reduce(push,[]),
				description: 'set'});
	};
	
	function DeletedObjectsCollection (collection) {
		
		var deleted = collection.context.collection({description:'deleted'});
		
		deleted.debug = function _debug () {
			if ( Not(EmptySetPredicate)(deleted) ) {
				log().debug('Deleted:  '+deleted.format(listing(Method('primaryKeyValue'))));
			}
		};
		
		collection.subscribe({
			source: 		collection,
			target: 		deleted,
			remove: 		collectionRemove,
			description: 	'deleted object collection'
		});
		
		function collectionRemove (collection,object) {
			deleted.add(object);
		}
		
		return deleted;
		
	};
	
	
	function View (parent,child,predicate) {
		
		parent.subscribe({
			source: 		parent,
			target: 		child,
			add: 			parentAdd,
			remove: 		parentRemove,
			change: 		parentChange,
			description: 	'view'
		});
		
		// NOTE: this is ugly, and really should be done by subscription initialisation
		parent.reduce(add(predicate),child);
		
		function parentAdd (collection,object) {
			add(predicate)(child,object);
		};
		
		function parentRemove (collection,object) {
			child.remove(object,true);
		};
		
		function parentChange (collection,object) {
			// Object sometimes null here
			if ( predicate(object) ) {
				child.add(object);
			}
			else {
				child.remove(object,true);
			}
		};
		
	};
	
	
	function Grouping (parent,extractor) {
		this.parent		= parent;
		this.extractor	= ( typeof extractor == 'string' ) ? Method(extractor) : extractor;
		this.__delegate	= set().index(Property('value')).delegateFor(this);
		this.build();
	}
	
	Grouping.prototype = {
		
		build: function _build () {
			return this.parent.reduce(Method('add'),this);
		},
		
		add: function _add (object) {
			var value = this.extractor(object);
			( this.__delegate.get(value) || this.__delegate.add(new Group(this.parent,this.extractor,value)).added ).add(object);
			return this;
		}
		
	};
	
	
	function Group (parent,extractor,value) {
		this.value		= value;
		this.objects	= parent.context.collection().delegateFor(this);
	}
	
	
	// ------------------------------------------------------------------------
	//														   Domain Orderings
	// ------------------------------------------------------------------------
	
	var makeOrdering = (new DomainObjectCollection()).ordering;
	

	function FieldOrdering (fieldName) {
		return FunctionOrdering( function _fieldordering (obj) {return obj.get(fieldName);} );
	};
	
	
	function FieldPathOrdering (fieldpath) {	
		return FunctionOrdering( function _fieldpathordering (obj) {
			var property, value;
			for (var i=0; i<path.length; i++) {
				value = obj.get(path[i]);
				if ( !(typeof value == 'object') ) {
					return value;
				}
				else {
					obj = value instanceof DomainObjectCollection ? value.first() : value;
				}
			}
			return 0;
		});	
	};
	
	
	external.extend({
		ordering: 	makeOrdering,
		field: 		FieldOrdering,
		path: 		FieldPathOrdering
	});
	
	
	// ------------------------------------------------------------------------
	// 														  Domain Predicates
	// ------------------------------------------------------------------------
	
	external.predicate = (new DomainObjectCollection()).predicate;
	
	//
	// Field predicates
	//
	
	function FieldPredicate (field,predicate) {
		return function _fieldpredicate (candidate) {
			return candidate && candidate.get ? predicate(candidate.get(field)) : false;
		};
	}
	
	function FieldOrValuePredicate (ValuePredicate,numberValueArguments) {
		numberValueArguments = numberValueArguments || 1;
		return function _fieldorvaluepredicate () {
			var field = arguments[arguments.length-1],
				value = arrayFromArguments(arguments).slice(0,numberValueArguments);
			return arguments.length > numberValueArguments ?
				FieldPredicate(field,ValuePredicate.apply(null,value))
				: ValuePredicate.apply(null,value);
		};
	}
	
	var Eq		= FieldOrValuePredicate(EqualityPredicate),
		Lt		= FieldOrValuePredicate(LessThanPredicate),
		Gt		= FieldOrValuePredicate(GreaterThanPredicate),
		LtE		= FieldOrValuePredicate(LessThanEqualPredicate),
		GtE		= FieldOrValuePredicate(GreaterThanPredicate),
		Between	= FieldOrValuePredicate(BetweenPredicate,2),
		RegEx	= FieldOrValuePredicate(RegularExpressionPredicate);
	
	external.extend({
		
		eq: 		Eq,
		lt: 		Lt,
		gt: 		Gt,
		lte: 		LtE,
		gte: 		GtE,
		between: 	Between,
		regex: 		RegEx
					
	});

	// Primary Key Identity
	
	var IdentityPredicate = external.id = function _id (id) {
		return FunctionValuePredicate(Method('primaryKeyValue'),id);
	};

	// Example
	
	var ExamplePredicate = external.example = function _example (example) {

		var predicates = [];
		
		for( var key in example ) {
			if ( example[key] instanceof RegExp ) {
				predicates.push(FieldPredicate(key,RegularExpressionPredicate(example[key])));
			}
			else if ( typeof example[key] == 'function' ) {
				predicates.push(FieldPredicate(key,example[key]));
			}
			else if ( typeof example[key] == 'object' ) {
				predicates.push(FieldPredicate(key,SomeSetPredicate(ExamplePredicate(example[key]))));
			} 
			else {
				predicates.push(FieldPredicate(key,EqualityPredicate(example[key])));
			}
		}
		
		return And(predicates);

	};
	
	// Relationship
	
	var RelationshipPredicate = external.related = function _related (parent,field) {
		return FieldPredicate(field,Eq(parent.primaryKeyValue()));
	};
	
	// Membership
	
	function MembershipPredicate (collection) {		
		collection = makeCollection(collection);
		return function _member (candidate) {
			return collection.member(candidate);
		};
	};
	
	external.member = MembershipPredicate;
	
	// Modification state
	
	var ModifiedPredicate = function _dirty () {
		return function __dirty (candidate) {
			return candidate.domain.dirty;
		};
	};	
	
	external.dirty = ModifiedPredicate();
	
	
	// ------------------------------------------------------------------------
	// 													 Domain Object delegate
	// ------------------------------------------------------------------------
	
	function DomainObject (context,parent,data) {
		
		this.domain = {
			dirty: 	false,
			tags: 	{}
		};
		
		this.parent = parent;
		
		var notifications	= context.notifications,
			subscribers 	= new SubscriberSet(notifications),
			fields			= new FieldSet(this,subscribers),
			relationships	= new RelationshipSet(),
			constraints		= new ConstraintSet;
			
		this.subscribers	= delegateTo(subscribers, 'filter');
		this.fields			= delegateTo(fields,'filter');
		this.field			= delegateTo(fields,'getField');
		this.relationships	= delegateTo(relationships,'filter');
		this.relationship   = delegateTo(relationships,'get');
		this.constraints	= delegateTo(constraints,'filter');
		this.context		= context;
		
		this.reifyFields();
		this.set(data);
		this.reifyRelationships();
		this.reifyConstraints();		

	};
	
	DomainObject.prototype = {
		
		get: function _get () {
		
			if ( arguments.length == 0 || typeof arguments[0] == 'undefined' ) {
				return false;
			}
			else if ( arguments[0] == ':all' ) {
				return this.get(this.fields().keys());
			}
			else if ( arguments[0].each ) {
				var values	= {},
					that	= this;
				arguments[0].each(function __get (key) {
					values[key] = that.fields().get(key);
				});
				return values;
			}
			else if ( !(arguments[0] instanceof Array) ) { // Just a key
				var key = arguments[0], field, relationship;
				if ( field = this.fields().getField(key) ) {
					return field.get();
				}
				else {
					if ( relationship = this.relationships(key) ) {
						return relationship.get();
					}
				}
			}
			else { // Array of keys
				var keys = arguments[0];
				var values = {};
				for ( var key in keys ) {
					values[keys[key]] = this.fields().get(keys[key]);
				}
				return values;
			}
	
		},
		
		set: function _set () {
			
			var key;

			if ( arguments.length == 2 || arguments.length == 3 ) {  // Arguments are key and value
				key = arguments[0];
				var value = arguments[1];
				if ( this.fields().set(key,value,arguments.callee.caller) && ( arguments.length == 2 || arguments[2] ) ) {
					this.subscribers().notify({key:':any',description:'field value change: any'});
				}
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				log('domainobject/set').startGroup('Setting fields');
				var mappings = arguments[0];
				for ( key in mappings ) {
					this.set(key,mappings[key],false);
				}
				this.subscribers().notify({key:':any',description:'field value change: any'});
				log('domainobject/set').endGroup();
			}

			this.domain.dirty = true;

			return this;
	
		},
		
		removed: function _removed (collection) {
			this.subscribers().notify({removed:true,description:'object removal'});
		},
		
		subscribe: function _subscribe (subscription) {

			if ( subscription.key instanceof Array ) {
				for(var i=0;i<subscription.key.length;i++) {
					this.subscribe(copy(subscription).set('key',subscription.key[i]));
				}
			} 

			subscription.source = this;
			subscription.format = subscription.format || noformat;

			if ( subscription.removed ) {
				subscription.type		= RemovalNotification;
			}
			else if ( subscription.change && typeof subscription.change == 'string' ) {
				subscription.type		= EventNotification;
				subscription.event		= subscription.change;
			}
			else if ( subscription.change && typeof subscription.change == 'function' ) {
				subscription.type		= MethodNotification;
				subscription.method		= subscription.change;
			}
			else if ( subscription.target.is('input:input,input:checkbox,input:hidden,select') ) {
				subscription.type = ValueNotification;
			}
			else {
				subscription.type = ContentNotification;
			}

			var subscriber = this.subscribers().add(ObjectSubscriber(subscription)).added;

			if ( subscription.initialise ) {
				this.context.notifications.send(subscriber({key:subscription.key}));
			}

			return subscriber;

		},
		
		primaryKeyValue: function _primaryKeyValue () {
			return this.get(this.primaryKey);
		},
		
		matches: function _matches (predicate) {
			return predicate(this);
		},
		
		validate: function _validate () {
			var obj = this;
			return this.constraints()
						.filter(function __validate (constraint) {return Not(constraint)(obj);})
							.map(function ___validate (constraint) {return constraint.message;})
								.join('; ');
		},
		
		reifyFields: function _reifyFields () {
			log('domainobject/create').startGroup('Reifying fields');
			for ( var i in this.parent.has ) {
				var descriptor  = this.parent.has[i],
					field		= this.fields().add(new Field(descriptor,this.subscribers())).added;
				this.parent[descriptor.accessor]	= delegateTo(field,'get');
				this.parent['set'+field.accessor]	= delegateTo(field,'set');
			}
			log('domainobject/create').endGroup();
		},
		
		reifyRelationships: function _reifyRelationships () {

			this.parent.hasOne	= this.parent.hasOne || [];
			this.parent.hasMany	= this.parent.hasMany || [];

			var i, descriptor, relationship;

			log('domainobject/create').startGroup('Reifying OneToOne relationships');
			for ( i in this.parent.hasOne ) {
				descriptor = this.parent.hasOne[i];
				relationship = this.relationships().add(new OneToOneRelationship(this,descriptor)).added;
				this.parent[descriptor.accessor]				= delegateTo(relationship,'get');
				this.parent['add'+descriptor.accessor]			= delegateTo(relationship,'add');
			}
			log('domainobject/create').endGroup();

			log('domainobject/create').startGroup('Reifying OneToMany relationships');
			for ( i in this.parent.hasMany ) {
				descriptor = this.parent.hasMany[i];
				relationship = this.relationships().add(new OneToManyRelationship(this,descriptor)).added;
				this.parent[(descriptor.plural || descriptor.accessor+'s')] 	= delegateTo(relationship,'get');
				this.parent['add'+descriptor.accessor]							= delegateTo(relationship,'add');
				this.parent['remove'+descriptor.accessor]						= delegateTo(relationship,'remove');
				this.parent['debug'+descriptor.accessor]						= delegateTo(relationship,'debug');
			}
			log('domainobject/create').endGroup();

		},
		
		reifyConstraints: function _reifyConstraints () {
			this.parent.must = this.parent.must || [];
			log('domainobject/create').startGroup('Reifying constraints');
			for (var i in this.parent.must ) {
				descriptor = this.parent.must[i];
				descriptor.predicate.message = descriptor.message;
				this.constraints().add(descriptor.predicate);
			}
			log('domainobject/create').endGroup();
		},
		
		clean: function _clean () {
			this.domain.dirty = false;
			return this;
		},
		
		debug: function _debug (showSubscribers) {
			log().startGroup('Domain Object');
			this.fields().debug();
			if ( showSubscribers ) {
				this.subscribers().debug();
			}
			log().endGroup();
		},
		
		push: function _push () {
			var that = this;
			this.fields().each(function __push (field) {
				that.subscribers.notify({
					key: field.name,
					description: 'field value'
				});
			});
		},
		
		delegateFor: function _delegateFor (host) {
			for (var i in this) {
				if ( !host[i] ) {
					host[i] = this[i];
				}
			}
			return this;
		}
		
	};

	
	// ------------------------------------------------------------------------
	// 															  		 Fields
	// ------------------------------------------------------------------------
	
	function FieldSet (object,subscribers) {	
		this.__delegate	= set().index(Property('accessor')).delegateFor(this);
		this.getField	= delegateTo(this.__delegate,'get');
	}
	
	FieldSet.prototype = {
		
		get: function _get (name) {
			try {
				return this.__delegate.get(name).get();
			}
			catch (e) {
				return null;
			}
		},
		
		set: function _set (name,value,publisher) {
			try {
				return this.__delegate.get(name).set(value,publisher);
			}
			catch (e) {
				return null;
			}
		},
		
		keys: function _keys () {
			return this.__delegate.map(Property('accessor'));
		},
		
		predicate: function _predicate (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('accessor',parameter));
			}
			else {
				return this.__delegate.predicate(parameter);
			}
		},
		
		debug: function _debug () {
			this.__delegate.each('debug');
		}
		
	};
	
	
	function Field (field,subscribers) {
		this.__delegate		= field.defaultValue || null;
		this.predicate		= field.validation ? field.validation.predicate || AllPredicate : AllPredicate;
		this.message		= ( field.validation && field.validation.message ) ? field.validation.message : '';
		this.subscribers	= subscribers;
		this.accessor		= field.accessor;
	}
	
	Field.prototype = {
	
		set: function _set (value,publisher) {
			if ( this.predicate(value) ) {
				log('domainobject/set').debug('Setting '+this.accessor+' to "'+value+'"');
				this.__delegate = value;
				this.subscribers.notify({key:this.accessor,description:'field value change: '+this.accessor});
				if ( publisher && publisher.success ) {
					publisher.success();
				}
				return true;
			}
			else {
				log('domainobject/set').debug('Setting '+this.accessor+' to "'+value+'" failed validation');
				if ( publisher && publisher.failure ) {
					publisher.failure(message);
				}
				return false;
			}
		},
	
		get: function _get () {
			return this.__delegate;
		},
	
		debug: function _debug () {
			log().debug(this.accessor+': '+this.__delegate);
		}
		
	};
	
	
	// ------------------------------------------------------------------------
	// 															  Relationships
	// ------------------------------------------------------------------------
	
	function RelationshipSet () {
		this.__delegate = set().index(Property('name')).delegateFor(this);
		this.constraint = Or( InstancePredicate(OneToOneRelationship), InstancePredicate(OneToManyRelationship) );
	}
	
	RelationshipSet.prototype = {
		
		predicate: function _predicate (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('name',parameter));
			}
			else {
				return this.__delegate.predicate(parameter);
			}
		}
		
	};
	
	
	function OneToOneRelationship (parent,relationship) {
		this.parent			= parent;
		this.relationship	= relationship;
		this.accessor		= relationship.accessor;
		this.name			= relationship.accessor;		
	};
	
	OneToOneRelationship.prototype = {
		
		get: function _get (create) {
			var child = this.parent.context.entities.get(this.relationship.prototype)
							.object(this.parent.get(this.relationship.field));
			if ( child ) {
				return child;
			}
			else if ( create ) {
				return this.add();
			}
		},
		
		add: function _add (data) {
			var newObject = this.parent.context.entities.get(this.relationship.prototype).create( data || {} );
			this.parent.set(this.relationship.field, newObject.primaryKeyValue());
			return newObject;
		}
		
	};
	
	external.OneToOneRelationship = OneToOneRelationship;
	
	
	function OneToManyRelationship (parent,relationship) {

		log('domainobject/create').startGroup('Reifying '+relationship.accessor);

		relationship.direction	= 'reverse';
		this.enabled 			= relationship.enabled;
		this.accessor			= relationship.accessor;
		this.name				= relationship.plural || relationship.accessor+'s';

		var example = {};
		log('domainobject/create').startGroup('Getting primary key value');
		example[relationship.field] = parent.primaryKeyValue();
		log('domainobject/create').endGroup();


		log('domainobject/create').startGroup('Creating children collection');
		var children = 	parent.context.collection({
							base: 	     	parent.context.entities.get(relationship.prototype).objects,
							predicate: 	 	RelationshipPredicate(parent,relationship.field),
							description: 	'children by relationship '+relationship.accessor
						});
		log('domainobject/create').endGroup();
	
		// Deletions might cascade								
/*		if ( relationship.cascade ) {
			parent.subscribe({
				removed: 	function () {
								children.each(function (child) {
									entities[relationship.prototype].objects.remove(child);
								});
							}
			});
		} */
		
		// Relationship might specify subscription to children							
		if ( relationship.subscription ) {
			var subscription = copyObject(relationship.subscription);
			subscription.application = true;
			subscription.source = children;
			subscription.target = parent;
			subscription.description = subscription.description || 'subscription by relationship '+relationship.accessor;
			this.subscription = children.subscribe(subscription);
		}
		
		children.delegateFor(this);
		this.get = delegateTo(children,'filter');
		
		// NOTE: Should this work with arrays of objects too?
		this.add = function _add (data) {
			
			data = data || {};
			data[relationship.field] = parent.primaryKeyValue();
			return parent.context.entities.get(relationship.prototype).create(data);
			
		};
		
		this.debug = function _debug () {
			log().startGroup('Relationship: '+relationship.accessor);
			log().debug('Object: '+parent.debug());
			if ( relationship.subscription ) {
				log().debug('Subscription target: '+subscription.target.debug());
			}
			log().endGroup();
		};
		
		log('domainobject/create').endGroup();
		
	};
	
	external.OneToManyRelationship = OneToManyRelationship;
	
	
	// ------------------------------------------------------------------------
	// 																Constraints
	// ------------------------------------------------------------------------
	
	function ConstraintSet () {
		
		extend({constraint:TypePredicate('function')},set()).delegateFor(this);
		
	}
	
	
	// ------------------------------------------------------------------------
	// 																	   JSON
	// ------------------------------------------------------------------------
	
	external.json = function () {
		
		
		function makeObject (key,data,parent,context) {
			
			log('json/thaw').startGroup('thawing a '+key);
			
			var partitionedData = partitionObject(data,TypePredicate('object'),'children','fields');
			
			var object;
			if ( parent && parent.relationships && _.nonempty(parent.relationships(PropertyPredicate('accessor',key))) ) {
				log('json/thaw').debug('adding object to relationship');
				object = parent.relationships(PropertyPredicate('accessor',key)).first().add(partitionedData.fields);
			}
			else {
				if ( context.entities.get(key) ) {
					log('json/thaw').debug('creating free object');
					object = context.entities.get(key).create(partitionedData.fields);
				}
				else {
					log('json/thaw').debug('unknown entity type: '+key);
				}
			}
			
			for ( var childKey in partitionedData.children ) {
				var childData = partitionedData.children[childKey];
				childData = ( childData instanceof Array ) ? childData : [childData];
				for ( var i=0; i<childData.length; i++) {
					makeObject(childKey,childData[i],object||parent,context);
				}
			} 
			
			log('json/thaw').endGroup();

		}
		
		
		return {
			
			thaw: 	function _thaw (context,data,options) {
						log('json/thaw').startGroup('thawing JSON');
						options = options || {};
						data = ( data instanceof Array ) ? data : [data];
						for ( var i in data ) {
							for ( var key in data[i] ) {
								makeObject(key,data[i][key],options.parent,context);
							}
						}
						log('json/thaw').endGroup();
						return external.json;
					}
			
		};
		
		
	}();
	
	
	
	// ------------------------------------------------------------------------
	//													  Inheritance utilities
	// ------------------------------------------------------------------------

	//
	// This is provided as a very lightweight system for implementing inheritance
	// in Javascript. It's possible to use jModel with more elaborate schemes too
	//


	// Slight modification of John Resig's code inspired by base2 and Prototype
	external.Base = (function(){

		var	initializing	= false,
			fnTest 			= /xyz/.test(function(){xyz;}) ? (/\b_super\b/) : (/.*/);

		// The base Base implementation (does nothing)
		var Base = function(){};

		// Create a new Base that inherits from this class
		Base.extend = function _extend (prop) {

			var _super = this.prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			initializing = true;
			var prototype = new this();
			initializing = false;

			// Copy the properties over onto the new prototype or merge as required
			for (var name in prop) {
				if ( typeof prop[name] == 'function' && typeof _super[name] == 'function' && fnTest.test(prop[name])) { // Check if we're overwriting an existing function
					prototype[name] = (function(name, fn){
						return function() {
							var tmp = this._super;

							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _super[name];

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							var ret = fn.apply(this, arguments);
							this._super = tmp;

							return ret;
						};
					})(name, prop[name]);
				}
				else if ( prop[name] instanceof Array && _super[name] instanceof Array ) { // Need to merge arrays
					prototype[name] = _super[name].concat(prop[name]);
				}
				else { // Just a scalar
					prototype[name] = prop[name];
				}
			}

			// The dummy class constructor
			function Base () {
				// All construction is actually done in the init method
				if ( !initializing && this.init ) {
					this.init.apply(this, arguments);
				}
			}

			// Populate our constructed prototype object
			Base.prototype = prototype;

			// Enforce the constructor to be what we expect
			prototype.constructor = Base;

			// And make this class extendable
			Base.extend = arguments.callee;

			return Base;

		};
		
		return Base;

	})();

	
	
	// ------------------------------------------------------------------------
	//															      Utilities
	// ------------------------------------------------------------------------
	
	function copyArray (original) {
		var copy = [];
		for (var i in original) {
			copy[i] = original[i];
		}
		return copy;
	}
	
	function copyObject (original) {
		var copy = {};
		for (var i in original) {
			if ( typeof original[i] == 'object' ) {
				copy[i] = copyObject(original[i]);
			}
			else {
				copy[i] = original[i];
			}
		}
		return copy;
	}
	
	function partitionArray (array,predicate,passName,failName) {
		return partition( array, predicate, passName, failName, Array, function (destination,index,object) {
			destination.push(object);
		});
	}
	
	function partitionObject (object,predicate,passName,failName) {
		return partition( object, predicate, passName, failName, Object, function (destination,index,object) {
			destination[index] = object;
		});
	}
	
	function partition (source,predicate,passName,failName,constructor,add) {
		var partition = {};
		var pass = partition[passName||'pass'] = new constructor();
		var fail = partition[failName||'fail'] = new constructor();
		for (var i in source) {
			var candidate = source[i];
			if ( predicate(candidate) ) {
				add(pass,i,candidate);
			}
			else {
				add(fail,i,candidate);
			}
		}
		return partition;
	}
	
	function delegateTo (context,methodName) {
		return function () {
			return context[methodName].apply(context,arguments);
		}
	}
	
	
	
	// ------------------------------------------------------------------------
	// 																	Fluency 
	// ------------------------------------------------------------------------
	
	external.log.context		= external.context;
	external.log.notifications	= external.notifications;
	external.log.json			= external.json;
	
	external.context.notifications		= external.notifications;
	external.context.json				= external.json;
	external.context.log				= external.log;
	
	external.notifications.context		= external.context;
	external.notifications.json			= external.json;
	external.notifications.log			= external.log;
	
	external.json.context				= external.context;
	external.json.notifications			= external.notifications;
	external.json.log					= external.log;
	
	return external;
	
}();

if (_ && _.opal_version) {
	var _ = jModel;
}


// =========================================================================
// 												Domain binding jQuery plugin
// =========================================================================

// NOTE: Make it possible to publish to a method not just a key?
// NOTE: Make publishing work for domain member subscriptions
jQuery.fn.publish = function (publication) {
	
	function Publisher (source,target,key,failure,success) {
		
		var publish = function _publish (event) {
			target.set(key,jQuery(event.target).val());
		};
		
		publish.failure = failure || function _failure (message) {
			source
				.attr('title',message)
				.animate({
					backgroundColor: 'red'
				},250)
				.animate({
					backgroundColor: '#ff7777'
				},500);
		};
		
		publish.success = success || function _success () {
			source
				.attr('title','')
				.animate({
					backgroundColor: 'white'
				},500);
		};

		return publish;
		
	}
	
	if ( publication.selector && publication.member.bindings ) {
		
		this.each(function (index,element) {
			for (var selector in publication.member.bindings) {
				jQuery(selector,element).each(function (index,object) {
					var publisher = new Publisher();
					publication.target.subscribe({
						source: publication.target,
						predicate: publication.predicate,
						selector: publication.selector,
						initialise: publication.initialise,
						description: publication.description || 'domain collection publication',			
						member: {
							target: jQuery(object),
							key: publication.member.bindings[selector],
							change: function (key,object) {
								return function (target) {
									jQuery(object).bind('blur',  Publisher(jQuery(object),target,key));
									jQuery(object).bind('change',Publisher(jQuery(object),target,key));
								};
							}(publication.member.bindings[selector],object),
							initialise: publication.initialise,
							description: publication.description || 'domain collection member subscription'
						}
					});
				});
			}
		});
		
		return this;
		
	}
	else if ( publication.selector ) {
	
		var that=this;
			
		publication.target.subscribe({
			source: publication.target,
			predicate: publication.predicate,
			selector: publication.selector,
			initialise: publication.initialise,
			description: publication.description || 'domain collection publication',			
			member: {
				target: that,
				key: publication.key,
				change: function (target) {
					that.bind('blur',  Publisher(that,target,publication.member.key));
					that.bind('change',Publisher(that,target,publication.member.key));	
				},
				initialise: publication.initialise,
				description: publication.description || 'domain collection member subscription'
			}
		});
		
		return this;
		
	}
	else if ( publication.bindings ) {
		
		for (var selector in publication.bindings) {
			jQuery(selector,this).each(function (index,object) {
				jQuery(object).bind('blur',  Publisher(jQuery(object),publication.target,publication.bindings[selector]));
				jQuery(object).bind('change',Publisher(jQuery(object),publication.target,publication.bindings[selector]));
			});
		}
		return this;
		
	}
	else {
		
		if ( this.blur ) {
			this.blur(function (event) {
				Publisher(jQuery(this),publication.target,publication.key)(event);
			});
		}
		if ( this.change ) {
			this.change(function (event) {
				Publisher(jQuery(this),publication.target,publication.key)(event);
			});
		}
		return this;
		
	}
	
};

jQuery.fn.subscribe = function (subscription) {
	
	if ( subscription.key && !subscription.selector ) { // Basic subscription
		
		return this.each(function (index,element) {
			subscription.key = subscription.key instanceof Array ? subscription.key : [subscription.key];
			jQuery.each(subscription.key,function (index,key) {
				subscription.source.subscribe({
					application: true,
					source: subscription.source,
					target: jQuery(element),
					key: key,
					change: subscription.change,
					removed: subscription.remove,
					initialise: subscription.initialise,
					format: subscription.format,
					value: subscription.value,
					description: subscription.description || 'application subscription'
				});
			});
		});
		
	}
	else if ( subscription.bindings ) { // Multiple subscription through selector/key mapping
		
		return this.each(function (index,element) {
			for (var selector in subscription.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe({
						application: true,
						source: subscription.source,
						target: jQuery(object),
						key: subscription.bindings[selector],
						initialise: subscription.initialise,
						format: subscription.format,
						value: subscription.value,
						description: subscription.description || 'application subscription'
					});
				});
			}
		});
		
	}
	else if ( ( subscription.predicate || subscription.selector ) && subscription.member && subscription.member.bindings ) { // Subscription to members of collection with bindings

		return this.each(function (index,element) {
			for (var selector in subscription.member.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe({
						application: true,
						source: subscription.source,
						predicate: subscription.predicate,
						selector: subscription.selector,
						initialise: subscription.initialise,
						description: subscription.description || 'application subscription',
						member: {
							application: true,
							target: jQuery(object),
							key: subscription.member.bindings[selector],
							change: subscription.member.change,
							initialise: subscription.member.initialise,
							format: subscription.member.format,
							value: subscription.member.value,
							description: subscription.member.description || 'application subscription'
						}
					});
				});
			}
		});

	} 
	else if ( ( subscription.predicate || subscription.selector ) && subscription.member ) { // Subscription to members of collection

		return this.each(function (index,element) {
			subscription.source.subscribe({
				application: true,
				source: subscription.source,
				predicate: subscription.predicate,
				selector: subscription.selector,
				initialise: subscription.initialise,
				description: subscription.description || 'application subscription',
				member: {
					application: true,
					target: jQuery(element),
					key: subscription.member.key,
					change: subscription.member.change,
					initialise: subscription.member.initialise,
					format: subscription.member.format,
					value: subscription.member.value,
					description: subscription.member.description || 'application subscription'
				}
			});
		});
		
	}
	else { // Subscription to collection
		
		return this.each(function (index,element) {
			subscription.source.subscribe({
				application: true,
				source: subscription.source,
				target: jQuery(element),
				predicate: subscription.predicate,
				add: subscription.add,
				remove: subscription.remove,
				change: subscription.change,
				sort: subscription.sort,
				initialise: subscription.initialise,
				format: subscription.format,
				value: subscription.value,
				description: subscription.description || 'application subscription'
			});
		});
		
	}

};

jQuery.fn.pubsub = function (pubsub) {
	// NOTE: Should rewrite publication here rather than using this shortcut
	pubsub.source = pubsub.object;
	pubsub.target = pubsub.object;
	return this.subscribe(pubsub).publish(pubsub);
};

jQuery.fn.permute = function (permutation) {

	if ( this.length != permutation.length ) {
		return false;
	}
	
	var copies = [], placeholders = [], i;
	for (i=0; i<this.length; i++) {
		copies[i] 		= this.get(i);
		placeholders[i] = document.createComment('');
		copies[i].parentNode.replaceChild(placeholders[i],copies[i]);
	}
	
	for (i=0; i<copies.length; i++) {
		placeholders[i].parentNode.replaceChild(copies[permutation[i]],placeholders[i]);
	}
	
	return this;
	
};

jQuery.fn.view = function (options) {
	this.each(function (index,element) {
		var view = new options.constructor(element,options);
	});
	return this;
};

jQuery.fn.views = function (views) {
	for (var selector in views) {
		jQuery(selector,this).view(views[selector]);
	}
	return this;
};

jQuery.fn.domainSelect = function (binding) {
	
	binding.value = (typeof binding.value == 'string') ? jModel.Method(binding.value) : binding.value;
	binding.label = (typeof binding.label == 'string') ? jModel.Method(binding.label) : binding.label;
	
	return this.each(function (index,element) {
	
		function addOption (collection,option) {
			jQuery(element).append(	$('<option/>').attr('value',binding.value(option)).text(binding.label(option)) );
		}
		
		function removeOption (collection, option) {
			$('option[value="'+binding.value(option)+'"]').remove();
		}
	
		jQuery(element).subscribe({
			source: 		binding.source,
			initialise: 	true,
			description: 	'Domain select',
			initialise: 	addOption,
			add: 			addOption,
			remove: 		removeOption
		});
		
	});
	
};