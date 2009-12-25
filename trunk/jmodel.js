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

	var external		= function (predicate) { return defaultContext.all.filter.apply(all,arguments); }, /* NOTE: Fix this */
		_				= external;


	// ------------------------------------------------------------------------
	//																	Logging
	// ------------------------------------------------------------------------
	
	function Logger (flags) {
		
		var active = false;
		
		function log (type, message) {
				
			var console = window.console;
			
			if ( type == 'startgroup' ) {
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
					case 'info': 	if (console && console.info)  {console.debug(message); break;}
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
			startGroup: function (title) { log('startgroup',title); 	return externalActive; },
			endGroup: 	function () { log('endgroup'); 					return externalActive; },
			error: 		function (message) { log('error',message); 		return externalActive; },
			warning: 	function (message) { log('warning',message);	return externalActive; },
			debug: 		function (message) { log('debug',message); 		return externalActive; },
			info: 		function (message) { log('info',message); 		return externalActive; }
		};
		
		var externalInactive = {
			startGroup: function () { return externalInactive; },
			endGroup: 	function () { return externalInactive; },
			error: 		function () { return externalInactive; },
			warning: 	function () { return externalInactive; },
			debug: 		function () { return externalInactive; },
			info: 		function () { return externalInactive; }
		};
		
		var external = function (condition) {	
			if ( arguments.length === 0 || ( active && enabled(condition) ) ) {
				return externalActive;
			}
			else {
				return externalInactive;
			}
		};
		
		external.enable = function (flag) {
			setFlag(flag,true);
			active = true;
			return this;
		};

		external.disable = function (flag) {
			setFlag(flag,false);
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
	// Import OPAL
	//

	var opal = OPAL();
	for ( var i in opal ) {
		eval('var '+i+' = opal.'+i);
	}

	//
	// Define local variables
	//

	var	contexts		= function (predicate) { return contexts.get(predicate); };
	ContextSet.apply(contexts);
	
	var	defaultContext	= contexts.create('default').setDefault();
	
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
		
		all: 		function () {
						return arguments.length === 0 ? AllPredicate() : AllSetPredicate.apply(null,arguments);
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
	
	external.union = function() {
		var union = new Set();
		for (var i=0; i<arguments.length; i++ ) {
			var collection = makeCollection(arguments[i]);
			collection.each(function (index,object) {
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
	
	external.intersection = function() {
		var intersection = new Set();
		makeCollection(arguments[0]).each(function (index,object) {
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
	
	external.difference = function(first,second) {
		return makeCollection(first).filter( Not(MembershipPredicate(second)) );
	};

	
	// ------------------------------------------------------------------------
	// 																   Contexts
	// ------------------------------------------------------------------------
	
	function ContextSet () {
		
		var contexts = set().index(Property('name')).delegateFor(this);
	
		this.create = function (name) {
			return this.add(new Context(name)).added;
		};
	
	}
	
	
	function Context (name) {
		
		var	isDefault		= false,
			context			= this;
		
		this.name			= name;
		this.notifications	= new NotificationQueue(context);
		this.entities		= new EntityTypeSet(context);
		this.all			= collection({description:'All Objects in context '+context.name});
		
		// Register a new constructor
		this.register = function (name,constructor,options) {
			return this.entities
						.create(name,constructor,options)
							.exposeAt( isDefault ? [context,external] : [context] )
							.context;
		};
		
		// Create a new collection
		function collection (specification) {
			return new DomainObjectCollection( extend({context:context},specification) );
		}
		this.collection = collection;
		
		this.reset = function () {
			this.all.remove(AllPredicate(),true);
			return this;
		};
				
		this.checkpoint = function () {
			this.entities.each(function (index,entity) {
				entity.objects.each('clean');
				entity.deleted.remove(AllPredicate(),true);
			});
			return this;
		};
		
		this.validate = function () {
			return this.all
					.map(function (object) {return {object:object, messages:object.validate()};})
						.filter(function (result) { return result.messages !== ''; });
		};
				
		this.debug = function (showSubscribers) {
			log().startGroup('Context: '+name);
			this.notifications.debug();
			this.entities.each(function (index,entity) {
				log().startGroup(entity.name);
				entity.objects.debug(showSubscribers);
				entity.deleted.debug(false);
				log().endGroup();
			});
			log().endGroup();
		};
		
		this.entity = function (name) {
			return this[name];
		};
		
		this.setDefault = function () {
			isDefault				= true;
			defaultContext			= this;
			external.context		= this;
			external.notifications	= this.notifications;
		};
		
	}
	
	
	
	// ------------------------------------------------------------------------
	// 																 Prototypes
	// ------------------------------------------------------------------------
	
	function EntityTypeSet (context) {
		
		this.context = context;
		
		var	types = set().index(Property('name')).delegateFor(this);
		
		this.predicate = function (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('name',parameter));
			}
			else {
				return types.predicate(parameter);
			}
		};
		
		this.create = function (name,constructor,options) {
			return this.add(new EntityType(context,name,constructor,options)).added;
		}
		
	}
	
	
	function EntityType (context,name,constructor,options) {

		options  		= options || {};
		
		this.options		= options;
		this.name			= name;
		this.constructor	= constructor;
		this.context		= context;

		this.objects =	this.context.collection({
							base: 			this.context.all,
							predicate: 		InstancePredicate(constructor),
							ordering: 		options.ordering,
							description: 	name
						});
							
		// Index if there's a primary key
		if ( options.primaryKey ) {
			this.objects.index(Method(options.primaryKey));
		}
							
		// EntityType methods
		if ( options.methods ) {
			for (var i in options.methods) {
				this.objects[i] = options.methods[i];		
			}
		}
							
		this.deleted = new DeletedObjectsCollection(this.objects);

		this.name	= name;


		this.object = function (criterion) {
			criterion = ( typeof criterion == 'string' && options.primaryKey && parseInt(criterion) ) ? parseInt(criterion) : criterion;
			if ( typeof criterion == 'number' && options.primaryKey ) {
				return this.objects.get(criterion);
			}
			else {
				var objects = this.objects.filter.apply(this.objects,arguments);
				return ( objects instanceof DomainObjectCollection ) ? objects.first() : objects;
			}
		};


		this.create = function (data) {
			
			log('domainobject/create').startGroup('Creating a new '+name);

			data = (typeof data == 'object') ? data : {};

			var newObject = new constructor();
			DomainObject.call(newObject,this.context);
			
			var primaryKey	= options.primaryKey;
			newObject.primaryKey = primaryKey;

			data[primaryKey] = data[primaryKey] || this.generateID();
			newObject.domain.init(data);

			this.context.all.add(newObject);
			
			if ( newObject.initialise ) {
				newObject.initialise();
			}

			log('domainobject/create').endGroup();
			
			return newObject;

		};
		
		
		this.exposeAt = function (targets) {
			
			var plural	= options.plural || name+'s',
				entity = this;
			
			set(targets).each(function (index,target) {
			
				target[name]	 			= delegateTo(entity,'object');
				target[plural]				= delegateTo(entity.objects,'filter');

				target['create'+name]		= delegateTo(entity,'create');
				target['deleted'+plural]	= delegateTo(entity.deleted,'filter');

				target[name].entitytype		= entity;
				target[name].extend			= delegateTo(entity.constructor,'extend');
				
			});
			
			return this;
			
		}


		this.generateID = function () {	
			return -(this.context.all.count()+1);
		}
		

	};
	
	// NOTE: Remove this
	external.entity = function (name) {
		return external[name];
	}
	
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------
	
	function NotificationQueue (context) {
		
		this.context = context;
		
		var	notifications 	= set().delegateFor(this),
			active			= true,
			filter			= AllPredicate();
		
		this.send = function (messages) {
			messages = (messages instanceof Set) ? messages : new Set([messages]);
			messages
				.filter(TypePredicate('function'))
					.each(function (index,message) {
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
		
		this.suspend = function () {
			log('notifications/control').debug('Suspending notifications for '+this.context.name);
			active = false;
			return this;
		};
		
		this.resume = function () {
			log('notifications/control').debug('resuming notifications for '+this.context.name);
			active = true;
			notifications.map(apply);
			this.flush();
			return this;
		};
		
		this.flush = function (predicate) {
			log('notifications/control').debug('Flushing notifications for '+this.context.name);
			notifications.remove(predicate);
			return this;
		};
		
		this.setFilter = function (predicate) {
			filter = predicate;
			return this;
		};
		
		this.debug = function () {
			log().debug('Pending notifications: '+this.count());
		};
		
	};
	
	
	//
	// Notification types
	//
	
	function ContentNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function () {
			log('notifications/send').debug('Receiving a content notification for '+subscription.key+': '+subscription.description+' ('+subscription.source.get(subscription.key)+')');
			var value = subscription.value ? subscription.value(subscription.source) : subscription.source.get(subscription.key);
			subscription.target.html(subscription.format(value));
		});	
	};
	
	function ValueNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function () {
			log('notifications/send').debug('Receiving a value notification for '+subscription.key+': '+subscription.description);
			subscription.target.val(subscription.source.get(subscription.key));
		});
	};
	
	function MethodNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function () {
			log('notifications/send').debug('Receiving an object method notification'+': '+subscription.description);
			subscription.method.call(subscription.target,subscription.source);
		});	
	};
	
	function EventNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function () {
			log('notifications/send').debug('Receiving an event notification'+': '+subscription.description);
			subscription.target.trigger(jQuery.Event(subscription.event),subscription.source);
		});
	};
	
	// NOTE: Should implement separate RemovalMethodNotification and RemovalEventNotification objects
	function RemovalNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function () {
			log('notifications/send').debug('Receiving a removal notification'+': '+subscription.description);
			subscription.removed.call(subscription.target,subscription.source);
		});
	};
	
	function CollectionMethodNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function () {
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
		return extend({subscription:subscription}, function () {
			// NOTE: Implement this
		});
	};
	
	// NOTE: Make this work with bindings
	function CollectionMemberNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function () {
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
		
		var subscribers = set().delegateFor(this);
		
		this.add = function (subscriber) {
			if ( subscribers.add(subscriber) ) {
				log('subscriptions/subscribe').debug('added subscriber: '+subscriber.description);
				this.added = subscriber;
			}
			return this;
		};
		
		this.notify = function (event) {
			var messages = subscribers.map(ApplyTo(event)).filter(function (notification) {return notification != false;});
			if ( _.nonempty(messages) ) {
				log('subscriptions/notify').startGroup('Notifying subscribers of '+event.description);
				notifications.send(messages);
				log('subscriptions/notify').endGroup();
			}
		};
		
		this.debug = function () {
			if ( _.nonempty(subscribers) ) {
				log().debug('Subscribers:  '+subscribers.count());
			}
		};
		
	};
		
	function CollectionSubscriber (subscription) {
		return function (event) {
			return ( subscription.filter && !subscription.filter(event) ) ? false
				:  subscription.type(subscription,event);
		};
	}
	
	function ObjectSubscriber (subscription) {
		return function (event) {
			return ( event.removed && subscription.removed ) || ( event.key == subscription.key ) ?
				subscription.type(subscription,event)
				: false;
		};
	}

	
	
	// ------------------------------------------------------------------------
	// 												   Domain Object Collection
	// ------------------------------------------------------------------------
	
	function DomainObjectCollection (specification) {
		
		specification			= specification || {};
		specification.predicate = specification.predicate || AllPredicate();

		this.context = specification.context || contexts('default');
		
		log('domainobjectcollection/create').startGroup('Creating a DomainObjectCollection: '+specification.description);
		
		var objects	= ( specification.objects && specification.objects instanceof Set ) ? specification.objects : new Set(specification.objects);
		objects.delegateFor(this);
		
		var subscribers		= new SubscriberSet(this.context.notifications);
		this.subscribers	= delegateTo(subscribers,'filter');
		
		
		this.add = function (object) {
			if ( objects.add(object) ) {
				subscribers.notify({method:'add',object:object,description:'object addition'});
				object.subscribe({
					target: this,
					key: ':any',
					change: function (object) {
						sorted = false;
						subscribers.notify({
							method:'change',
							object:object,
							description:'object change'
						}); 
					},
					description: 'object change for '+specification.description+' collection change'
				});
				sorted = false;
			}
			return this;
		};


		this.first = function () {
			if ( !sorted ) { this.sort(); }
			return objects.first();
		};
		
		
		this.remove = function (predicate,fromHere,removeSubscribers) {
			predicate = And(specification.predicate,this.predicate(predicate));
			if ( fromHere ) {
				objects.remove(predicate).each(function (index,object) {
					object.removed();
					subscribers.notify({method:'remove',object:object,description:'object removal'});
					if (removeSubscribers) {
						object.subscribers().remove(AllPredicate);
					}	
				});
			}
			else {
				specification.context.all.remove(And(MembershipPredicate(objects),predicate),true,true);
			}
		
		};
		
		
		this.by = function () {			
			return this.context.collection({
				objects: objects.copy(),
				ordering: this.ordering.apply(null,arguments),
				description:'ordered '+specification.description
			});
		};
		
		
		this.sort = function () {

			if (arguments.length > 0) {
				specification.ordering = this.ordering.apply(null,arguments);
			}

			// Remember old order
			objects.each(function (index) {
				this.domain.tags.position = index;
			});

			// Sort
			objects.sort(specification.ordering);

			// Find permutation
			var permutation = [];
			objects.each(function (index) {
				permutation[index] = this.domain.tags.position;
				delete this.domain.tags.position;
			});

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
				subscribers.notify({method:'sort',permutation:permutation,description:'collection sort'});
			}

			sorted = true;

			return this;

		};
		
		
		this.each = function (callback) {
			if ( !sorted ) { this.sort(); }
			objects.each(callback);
			return this;
		};
		
		
		this.select = function (selector) {
			if ( selector == ':first' ) {
				return this.first();
			}
			else {
				return this;
			}
		};
		
		
		this.filter = function () {

			if ( arguments.length === 0 ) {
				return this;
			}
			
			var filtered = objects.filter.apply(this,arguments);
			
			if ( filtered instanceof Set ) {
				return this.context.collection({
					objects: filtered,
					description:'filtered '+specification.description
				});
			}
			else {
				return filtered;
			} 
			
		};
		
		
		this.debug = function (showSubscribers) {
			if ( Not(EmptySetPredicate)(objects) ) {
				log().debug('Objects:  '+objects.map('primaryKeyValue').join(', '));
			}
			if ( showSubscribers ) {
				subscribers.debug();
			}
		};
		
		
		this.subscribe = function (subscription) {
			
			log('subscriptions/subscribe').startGroup('Subscribing: '+subscription.description);

			if ( subscription.predicate || subscription.selector ) {
				log('subscriptions/subscribe').debug('Creating a collection member subscription: '+subscription.description);
				subscription.type	= 	CollectionMemberNotification;
				subscription.filter = 	function (collection) {
											return function (event) {
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
			
			var subscriber = subscribers.add(CollectionSubscriber(subscription)).added;
			
			if ( subscription.initialise ) {
				log('subscriptions/subscribe').startGroup('initialising subscription: '+subscription.description);
				this.each(function (index,object) {
					this.context.notifications.send(subscriber({method:'initialise',object:object,description:'initialisation'}));	
				});
				log('subscriptions/subscribe').endGroup();
			}
			
			log('subscriptions/subscribe').endGroup();
			
			return subscriber;	
			
		};
		
		this.predicate = function (parameter) {
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
			return AllPredicate();
		};
		
		function ordering () {
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
				else {
					return DescendingOrdering(FieldOrdering(pieces[0]));
				}
			}
		}
		
		this.ordering = ordering;
		
		
		if ( specification.ordering ) {
			specification.ordering = this.ordering(specification.ordering);
		}

		var sorted = false;
		
		this.length = objects.count;
		
		
		// Initial sort
		if ( specification.ordering ) {
			this.sort();
			sorted = true;
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
	
	// NOTE: Make this a method of Context
	external.collection = function() {
		if ( typeof arguments[0] == 'array' ) {
			// NOTE: Need a context here
			return new DomainObjectCollection({context:contexts('default'),objects:arguments[0],description:'set'});
		}
		else {
			var objects = [];
			for (var i=0; i<arguments.length; i++) {
				objects.push(arguments[i]);
			}
			// NOTE: Need a context here
			return new DomainObjectCollection({context:contexts('default'),objects:objects,description:'set'});
		}
	};
	
	function DeletedObjectsCollection (collection) {
		
		var deleted = collection.context.collection({description:'deleted'});
		
		deleted.debug = function () {
			if ( Not(EmptySetPredicate)(deleted) ) {
				log().debug('Deleted:  '+deleted.map('primaryKeyValue').join(', '));
			}
		};
		
		collection.subscribe({
			source: 		collection,
			target: 		deleted,
			remove: 		collectionRemove,
			description: 	'deleted object collection'
		});
		
		function collectionRemove(collection,object) {
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
		parent
			.filter(predicate)
				.each(function (index,object) {
					child.add(object);
				});
		
		function parentAdd(collection,object) {
			if ( predicate(object) ) {
				child.add(object);
			}
		};
		
		function parentRemove(collection,object) {
			child.remove(object,true);
		};
		
		function parentChange(collection,object) {
			// Object sometimes null here
			if ( predicate(object) ) {
				child.add(object);
			}
			else {
				child.remove(object,true);
			}
		};
		
	};
	
	
	
	// ------------------------------------------------------------------------
	//														   Domain Orderings
	// ------------------------------------------------------------------------
	
	var makeOrdering = (new DomainObjectCollection()).ordering;
	

	function FieldOrdering (fieldName) {
		return FunctionOrdering( function (obj) {return obj.get(fieldName);} );
	};
	
	
	function FieldPathOrdering (fieldpath) {	
		return FunctionOrdering( function (obj) {
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
		return function (candidate) {
			return candidate && candidate.get ? predicate(candidate.get(field)) : false;
		};
	}
	
	function FieldOrValuePredicate (ValuePredicate,numberValueArguments) {
		numberValueArguments = numberValueArguments || 1;
		return function () {
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
	
	var IdentityPredicate = external.id = function (id) {
		return FunctionValuePredicate(Method('primaryKeyValue'),id);
	};

	// Example
	
	var ExamplePredicate = external.example = function (example) {

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
	
	var RelationshipPredicate = external.related = function (parent,field) {
		return FieldPredicate(field,Eq(parent.primaryKeyValue()));
	};
	
	// Membership
	
	function MembershipPredicate (collection) {		
		collection = makeCollection(collection);
		return function (candidate) {
			return Not(EmptySetPredicate)(collection.filter(ObjectIdentityPredicate(candidate)));
		};
	};
	
	external.member = MembershipPredicate;
	
	// Modification state
	
	var ModifiedPredicate = function () {
		return function (candidate) {
			return candidate.domain.dirty;
		};
	};	
	
	external.dirty = ModifiedPredicate();
	
	
	// ------------------------------------------------------------------------
	// 														 		 Formatters
	// ------------------------------------------------------------------------
	
	function NoFormat (object) { return object; }
	
	function Prepend (prefix) {
		return function (string) {
			return prefix+string;
		};
	}
	
	function Append (suffix) {
		return function (string) {
			return string+suffix;
		};
	}
	
	function Join (separator) {
		return Method('join',separator);
	}
	
	function Concatenate () {
		var formatters = arrayFromArguments(arguments),
			separator = ' ';
		if ( typeof formatters[formatters.length-1] == 'string' ) {
			separator = formatters.pop();
		}
		return function (object) {
			var mapped = [];
			for (var i=0; i<formatters.length; i++) {
				mapped.push(formatters[i](object));
			}
			return mapped.join(separator);
		};
	}
	
	function Surround (affix) {
		return compose(Prepend(affix),Append(affix));
	}
	
	function Decimal (places) {
		return Method('toFixed',places);
	}
	
	function Locale () {
		return Method('toLocaleString');
	}
	
	function Percentage () {
		return Append('%');
	}
	
	function Currency (symbol,decimals) {
		return function (number) {
			return compose(	Prepend(number < 0 ? '-' : ''),
							Prepend(symbol),
							Locale(),
							Decimal(decimals===false ? 0 : 2) 		)(Math.abs(number));
		};
	}
	
	function Listing () {
		var formatter, terminal;
		if ( typeof arguments[0] == 'function' ) {
			formatter	= arguments[0];
			terminal	= arguments[1];
		}
		else {
			formatter 	= NoFormat;
			terminal	= arguments[0];
		}
		terminal = terminal || ' and ';
		return function (list) {
			var length = list.count(),
				terminalPosition = length > 1 ? length-1 : -1,
				index=0;
			return list.reduce(function (acc,object) {
				var separator = index == terminalPosition ? terminal : ', ';	
				index++;			
				return acc + (acc ? separator : '') + formatter(object);
			},'');
		}
	}
	
	external.extend({
		noformat: 	NoFormat(),
		prepend: 	Prepend,
		append: 	Append,
		join: 		Join,
		concat: 	Concatenate,
		surround: 	Surround,
		decimal: 	Decimal,
		locale: 	Locale(),
		percent: 	Percentage(),
		currency: 	Currency,
		listing: 	Listing
	});
	
	
	// ------------------------------------------------------------------------
	// 														Domain Object mixin
	// ------------------------------------------------------------------------
	
	function DomainObject (context) {
		
		
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
		
		this.get = function () {
		
			if ( arguments[0] == ':all' ) {
				return this.get(fields.keys());
			}
			else if ( arguments[0].each ) {
				var values = {};
				arguments[0].each(function (index,key) {
					values[key] = fields.get(key);
				});
				return values;
			}
			else if ( !(arguments[0] instanceof Array) ) { // Just a key
				var key = arguments[0], field;
				if ( field = fields.getField(key) ) {
					return field.get(key);
				}
				else {
					if ( relationships.get(key) ) {
						return relationships.get(key).get();
					}
				}
			}
			else { // Array of keys
				var keys = arguments[0];
				var values = {};
				for ( var key in keys ) {
					values[keys[key]] = fields.get(keys[key]);
				}
				return values;
			}
	
		};
		
		
		this.set = function () {
			
			var key;

			if ( arguments.length == 2 || arguments.length == 3 ) {  // Arguments are key and value
				key = arguments[0];
				var value = arguments[1];
				if ( fields.set(key,value,arguments.callee.caller) && ( arguments.length == 2 || arguments[2] ) ) {
					subscribers.notify({key:':any',description:'field value change: any'});
				}
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				log('domainobject/set').startGroup('Setting fields');
				var mappings = arguments[0];
				for ( key in mappings ) {
					this.set(key,mappings[key],false);
				}
				subscribers.notify({key:':any',description:'field value change: any'});
				log('domainobject/set').endGroup();
			}

			this.domain.dirty = true;

			return this;
	
		};
		
		
		this.removed = function (collection) {
			subscribers.notify({removed:true,description:'object removal'});
		};
		
		
		this.subscribe = function (subscription) {

			if ( subscription.key instanceof Array ) {
				for(var i=0;i<subscription.key.length;i++) {
					this.subscribe({
						source: subscription.source,
						target: subscription.target,
						key: subscription.key[i],
						format: subscription.format,
						value: subscription.value,
						change: subscription.change,
						removed: subscription.remove,
						initialise: subscription.initialise,
						description: subscription.description
					});
				}
			} 

			subscription.source = this;
			subscription.format = subscription.format || NoFormat;

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

			var subscriber = subscribers.add(ObjectSubscriber(subscription)).added;

			if ( subscription.initialise ) {
				notifications.send(subscriber({key:subscription.key}));
			}

			return subscriber;

		};
		
		
		this.primaryKeyValue = function () {
			return this.get(this.primaryKey);
		};
		
		
		this.matches = function (predicate) {
			return predicate(this);
		};
		
		
		this.validate = function () {
			
			var obj = this;
			return constraints
						.filter(function (constraint) {return Not(constraint)(obj);})
							.map(function (constraint) {return constraint.message;})
								.join('; ');
		};
		
		
		this.domain = function () {
			
			var that = this;
			
			function reifyFields () {

				log('domainobject/create').startGroup('Reifying fields');

				for ( var i in that.has ) {
					var descriptor  			= that.has[i],
						field					= new Field(descriptor,subscribers);
					fields.add(field);
					that[descriptor.accessor]	= delegateTo(field,'get');
					that['set'+field.accessor]	= delegateTo(field,'set');
				}
				
				log('domainobject/create').endGroup();

			}
			
			function reifyRelationships () {

				that.hasOne			= that.hasOne || [];
				that.hasMany		= that.hasMany || [];

				var i, descriptor, relationship;

				log('domainobject/create').startGroup('Reifying OneToOne relationships');
				for ( i in that.hasOne ) {
					descriptor = that.hasOne[i];
					relationship 							= new OneToOneRelationship(that,descriptor);
					relationships.add(relationship);
					that[descriptor.accessor]				= delegateTo(relationship,'get');
					that['add'+descriptor.accessor]			= delegateTo(relationship,'add');
				}
				log('domainobject/create').endGroup();

				log('domainobject/create').startGroup('Reifying OneToMany relationships');
				for ( i in that.hasMany ) {
					descriptor = that.hasMany[i];
					relationship											= new OneToManyRelationship(that,descriptor);
					relationships.add(relationship);
					that[(descriptor.plural || descriptor.accessor+'s')] 	= delegateTo(relationship,'get');
					that['add'+descriptor.accessor]							= delegateTo(relationship,'add');
					that['remove'+descriptor.accessor]						= delegateTo(relationship,'remove');
					that['debug'+descriptor.accessor]						= delegateTo(relationship,'debug');
				}
				log('domainobject/create').endGroup();

			}
			
			function reifyConstraints () {
				
				that.must = that.must || [];
				
				log('domainobject/create').startGroup('Reifying constraints');
				for (var i in that.must ) {
					descriptor = that.must[i];
					descriptor.predicate.message = descriptor.message;
					constraints.add(descriptor.predicate);
				}
				log('domainobject/create').endGroup();
				
			}
			
			return {
				
				dirty: false,
				
				tags: {},
				
				init: function (initialData) {
					reifyFields();
					that.set(initialData); // Must do this before reifying relationships or else initial population of children fails
					reifyRelationships();
					reifyConstraints();
					return that.domain.clean();
				},
				
				clean: function () {
					that.domain.dirty = false;
					return that;
				},
						
				push: function () {
					fields.each(function (index,field) {
						subscribers.notify({key:field.name,description:'field value'});
					});
				},
						
				debug: function (showSubscribers) {
					log().startGroup('Domain Object');
					fields.debug();
					if ( showSubscribers ) {
						subscribers.debug();
					}
					log().endGroup();
				}
				
			};
			
		}.call(this);
		

	};
	
	
	// ------------------------------------------------------------------------
	// 															  		 Fields
	// ------------------------------------------------------------------------
	
	function FieldSet (object,subscribers) {
		
		var fields = set().index(Property('accessor')).delegateFor(this);
		
		this.predicate = function (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('accessor',parameter));
			}
			else {
				return fields.predicate(parameter);
			}
		};
		
		this.get = function (name) {
			try {
				return fields.get(name).get();
			}
			catch (e) {
				return null;
			}
		};
		
		this.getField = delegateTo(fields,'get');
		
		this.set = function (name,value,publisher) {
			try {
				return fields.get(name).set(value,publisher);
			}
			catch (e) {
				return null;
			}
		};
		
		this.keys = function () {
			return fields.map( function (field) { return field.accessor; } );
		};
		
		this.debug = function () {
			this.each('debug');
		};
		
	}
	
	function Field (field,subscribers) {
		
		var data 		= field.defaultValue || null,
			predicate	= field.validation ? field.validation.predicate || AllPredicate : AllPredicate,
			message		= ( field.validation && field.validation.message ) ? field.validation.message : '';
		
		this.accessor	= field.accessor;
		
		this.get = function () {
			return data;
		};
		
		this.set = function (value,publisher) {
			if ( predicate(value) ) {
				log('domainobject/set').debug('Setting '+field.accessor+' to "'+value+'"');
				data = value;
				subscribers.notify({key:field.accessor,description:'field value change: '+field.accessor});
				if ( publisher && publisher.success ) {
					publisher.success();
				}
				return true;
			}
			else {
				log('domainobject/set').debug('Setting '+field.accessor+' to "'+value+'" failed validation');
				if ( publisher && publisher.failure ) {
					publisher.failure(message);
				}
				return false;
			}
		};
		
		this.debug = function () {
			log().debug(field.accessor+': '+data);
		};
		
	}
	
	
	// ------------------------------------------------------------------------
	// 															  Relationships
	// ------------------------------------------------------------------------
	
	function RelationshipSet () {
		
		var relationships = set().index(Property('name')).delegateFor(this);
		
		this.constraint = Or( InstancePredicate(OneToOneRelationship), InstancePredicate(OneToManyRelationship) );
		
		this.predicate = function (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('name',parameter));
			}
			else {
				return relationships.predicate(parameter);
			}
		};
		
	}
	
	function OneToOneRelationship (parent,relationship) {
		
		this.accessor	= relationship.accessor;
		this.name		= relationship.accessor;
		
		this.get = function (create) {
			var child = parent.context.entities.get(relationship.prototype).object(parent.get(relationship.field));
			if ( child ) {
				return child;
			}
			else if ( create ) {
				return this.add();
			}
		};
		
		this.add = function (data) {

			var newObject = parent.context.entities.get(relationship.prototype).create( data || {} );
			
			parent.set(relationship.field, newObject.primaryKeyValue());
			
			return newObject;
			
		};
		
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
								children.each(function (index,child) {
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
		this.add = function (data) {
			
			data = data || {};
			data[relationship.field] = parent.primaryKeyValue();
			return parent.context.entities.get(relationship.prototype).create(data);
			
		};
		
		this.debug = function () {
			log().startGroup('Relationship: '+relationship.accessor);
			log().debug('Object: '+parent.domain.debug());
			if ( relationship.subscription ) {
				log().debug('Subscription target: '+subscription.target.domain.debug());
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
		
		var constraints = extend({constraint:TypePredicate('function')},set()).delegateFor(this);
		
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
			
			thaw: 	function (context,data,options) {
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
		Base.extend = function(prop) {

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
			function Base() {
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
		copy = [];
		for (var i in original) {
			copy[i] = original[i];
		}
		return copy;
	}
	
	function copyObject (original) {
		copy = {};
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
	
	function delegateTo(context,methodName) {
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

if (!_) {
	var _=jModel;
}


// =========================================================================
// 												Domain binding jQuery plugin
// =========================================================================

// NOTE: Make it possible to publish to a method not just a key?
// NOTE: Make publishing work for domain member subscriptions
jQuery.fn.publish = function (publication) {
	
	function Publisher (source,target,key,failure,success) {
		
		var publish = function (event) {
			target.set(key,jQuery(event.target).val());
		};
		
		publish.failure = failure || function (message) {
			source
				.attr('title',message)
				.animate({
					backgroundColor: 'red'
				},250)
				.animate({
					backgroundColor: '#ff7777'
				},500);
		};
		
		publish.success = success || function () {
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
			jQuery(element).append('<option value="'+binding.value(option)+'">'+binding.label(option)+'</option>');
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