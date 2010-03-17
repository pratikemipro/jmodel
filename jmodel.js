/*
 *	jModel Javascript Library v0.5.2
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009-2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires opal.js and emerald.js
 *
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

	//
	// Import Emerald
	//
	
	for ( var i in emerald ) {
		eval('var '+i+' = emerald.'+i);
	}

	var external		= function (predicate) { return defaultContext.all.filter.apply(all,arguments); }, /* NOTE: Fix this */
		_				= external;
		
	external.jmodel_version = '0.5.0';
	
	
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

		var contexts = set().of(Context).index(Property('name')).delegateFor(this);
	
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
		this.entity         = delegateTo(this.entities,'filter');
		this.all			= this.collection({description:'All Objects in context '+this.name});
		
		this.events			= new EventRegistry(this.notifications,'checkpoint');
		this.event			= delegateTo(this.events,'filter');
		
	}
	
	Context.prototype = {
		
		constructor: Context,
		
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
			this.event('checkpoint').raise();
			return this;
		},
		
		transaction: function _transaction (trans,that) {
			this.notifications.suspend();
			trans.call(that);
			this.notifications.resume();
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
			external.transaction	= this.transaction;
			return this;
		}
		
	};	
	
	
	// ------------------------------------------------------------------------
	// 																 Prototypes
	// ------------------------------------------------------------------------
	
	function EntityTypeSet (context) {
		TypedSet.call(this);
		this.context = context;
		return this.index(Property('name'));
	}
	
	EntityTypeSet.prototype = extend({
		
		constructor: EntityTypeSet,
		
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
		
	}, new TypedSet(EntityType) );
	
	var	defaultContext	= contexts.create('default').setDefault();
	
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
		
		var that = this;
		this.context.event('checkpoint').subscribe(function () {
			that.objects.each('clean');
			that.deleted.remove(AllPredicate,true);
		});

	};
	
	EntityType.prototype = {
		
		constructor: EntityType,
		
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

			var newObject;

			this.context.transaction(function () {
				
				data = (typeof data == 'object') ? data : {};

				var primaryKey	= this.options.primaryKey;
				data[primaryKey] = data[primaryKey] || this.generateID();

				newObject = new this.constructor();
				newObject.__delegate = (new DomainObject(this.context,newObject,data,primaryKey,this)).delegateFor(newObject);

				this.context.all.add(newObject);

/*				if ( newObject.initialise ) {
					newObject.initialise();
				} */
				
			},this);

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
	
	//
	// Notification types
	//
	
	function ContentNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _contentnotification () {
//			log('notifications/send').debug('Receiving a content notification for '+subscription.key+': '+subscription.description+' ('+subscription.source.get(subscription.key)+')');
			var value = subscription.value ? subscription.value(subscription.source) : subscription.source.get(subscription.key);
			subscription.target.html(subscription.format(value));
		});	
	};
	
	function ValueNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _valuenotification () {
//			log('notifications/send').debug('Receiving a value notification for '+subscription.key+': '+subscription.description);
			subscription.target.val(subscription.source.get(subscription.key));
		});
	};
	
	function MethodNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _methodnotification () {
//			log('notifications/send').debug('Receiving an object method notification'+': '+subscription.description);
			subscription.method.call(subscription.target,subscription.source);
		});	
	};
	
	function EventNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _eventnotification () {
//			log('notifications/send').debug('Receiving an event notification'+': '+subscription.description);
			subscription.target.trigger(jQuery.Event(subscription.event),subscription.source);
		});
	};
	
	// NOTE: Should implement separate RemovalMethodNotification and RemovalEventNotification objects
	function RemovalNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _removalnotification () {
//			log('notifications/send').debug('Receiving a removal notification'+': '+subscription.description);
			subscription.removed.call(subscription.target,subscription.source);
		});
	};
	
	function CollectionMethodNotification (subscription,event,subscriber) {
		return extend({subscription:subscription}, function _collectionmethodnotification () {
			if (subscription[event.method] && event.permutation) {
//				log('notifications/send').debug('Receiving a sort notification');
				subscription[event.method].call(subscription.target,event.permutation);
			}
			else if (subscription[event.method] && typeof subscription[event.method] == 'function' ) {
//				log('notifications/send').debug('Receiving a collection method notification'+': '+subscription.description);
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
//			log('notifications/send').debug('Receiving a collection member notification');
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
	
	function CollectionSubscriber (subscription) {
		return function _collectionsubscriber (event) {
			return ( subscription.filter && !subscription.filter(event) ) ? null
				:  subscription.type(subscription,event);
		};
	}
	
	function ObjectSubscriber (subscription) {
		return function _objectsubscriber (event) {
			return ( event.removed && subscription.removed )
					|| (subscription.key == ':any') 
					|| ( event.key == subscription.key ) ?
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
		this.__base			= specification.base;
		this.__ordering		= specification.ordering;
		this.context		= specification.context || contexts('default');
		this.description	= specification.description;
		
		this.__delegate	= ( specification.objects && specification.objects instanceof Set ) ? specification.objects
								: new Set(specification.objects);
		this.length = this.__delegate.length;
		if ( specification.primaryKey ) {
			this.__delegate.index(Method('primaryKeyValue'));
		}
		this.__delegate.delegateFor(this);
		this.__delegate.sorted = false;
		
		this.events	= new EventRegistry(this.context.notifications,'add','remove','initialise','change','sort');
		this.event	= delegateTo(this.events,'filter');
				
		if ( this.__ordering ) {
			this.sort();
		}
		
		// This collection is a materialised view over a base collection
		if ( this.__base ) {
			var view = new View(this.__base,this,this.__predicate);
		}
		else if ( specification.base ) {
			throw 'Error: Invalid base collection type';
		}
		
	};
	
	DomainObjectCollection.prototype = {
		
		constructor: DomainObjectCollection,
		
		add: function _add (object) {
			var that = this;
			this.__delegate.add(object, function __add () {
				that.length++;
				that.event('add').raise({method:'add',object:object,description:'object addition'});
				if ( that.event('change').subscribers(':first') ) {
					object.subscribe({
						target: that,
						key: ':any',
						change: function _change (object) {
							that.__delegate.sorted = false;
							that.event('change').raise({
								method:'change',
								object:object,
								description:'object change'
							});  
						},
						description: 'object change for '+this.description+' collection change'
					});
				}
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
					that.event('remove').raise({method:'remove',object:object,description:'object removal'});
					if (removeSubscribers) {
					    object.events.each(function (event) {
					        event.subscribers().remove(AllPredicate);
					    })
					}	
				});
				this.length = this.__delegate.length;
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

			if ( arguments.length > 0 ) {
				this.__ordering = this.ordering.apply(null,arguments);
			}
			else if ( typeof this.__ordering != 'function' ) {
				this.__ordering = this.ordering(this.__ordering);
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
				this.event('sort').raise({method:'sort',permutation:permutation,description:'collection sort'});
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
			
//			log('subscriptions/subscribe').startGroup('Subscribing: '+subscription.description);

			if ( subscription.predicate || subscription.selector ) {
//				log('subscriptions/subscribe').debug('Creating a collection member subscription: '+subscription.description);
				subscription.type	= 	CollectionMemberNotification;
				subscription.filter = 	function __subscribe (collection) {
											return function ___subscribe (event) {
												return collection.filter(subscription.predicate).select(subscription.selector) === event.object
														&& ( event.method == 'add' || event.method == 'initialise' ); // NOTE: Fix this
											};
										}(this);							
			}
			else if ( ( typeof subscription.add == 'string' ) && ( typeof subscription.remove == 'string' ) ) {
//				log('subscriptions/subscribe').debug('Creating a collection event subscription: '+subscription.description);
				subscription.type	= CollectionEventNotification;
			}
			else {
//				log('subscriptions/subscribe').debug('Creating a collection method subscription: '+subscription.description);
				subscription.type	= CollectionMethodNotification; 
			}
			
			var that = this, subscriber;
			set('add','remove','initialise','change','sort').each(function (method) {
				if ( subscription[method] ) {
				    subscriber = CollectionSubscriber(subscription);
					that.event(method).subscribe(subscriber);
				}
			});
			
			if ( subscriber && subscription.initialise ) {
//				log('subscriptions/subscribe').startGroup('initialising subscription: '+subscription.description);
				var context = this.context;
				this.each(function __subcribe (object) {
					context.notifications.send(subscriber({
						method: 'initialise',
						object: object,
						description: 'initialisation'
					}));	
				});
//				log('subscriptions/subscribe').endGroup();
			}
			
//			log('subscriptions/subscribe').endGroup();
			
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
					arguments[i] = _ordering(arguments[i]);
				}
				return CompositeOrdering.apply(null,arguments);
			}
			else if ( arguments[0] instanceof Array ) {
				for ( var i=0; i<arguments[0].length; i++ ) {
					arguments[0][i] = _ordering(arguments[0][i]);
				}
				return CompositeOrdering(arguments[0]);
			}
			else if ( typeof arguments[0] == 'function' ) {
				return arguments[0];
			}
			else if ( typeof arguments[0] == 'undefined' ) {
				return ValueOrdering;
			}
			else {
				var pieces = arguments[0].split(' ');
				if ( pieces.length === 1 || pieces[1].toLowerCase() != 'desc' ) {
					return FieldOrdering(pieces[0]);
				}
				else if ( pieces.length > 0 ) {
					return DescendingOrdering(FieldOrdering(pieces[0]));
				}
				else {
					return ValueOrdering;
				}
			}
		}
		
	};
	
	// NOTE: Make this a method of Context
	external.collection = function _collection () {
		return new DomainObjectCollection({
			context: contexts('default'),
			objects: set(arguments).reduce(push,[]),
			description: 'set'
		});
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
		
		constructor: Grouping,
		
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
	
	function DomainObject (context,parent,data,primaryKey,entitytype) {
		
		this.domain = {
			dirty: 	false,
			tags: 	{}
		};
		
		this.primaryKey	= primaryKey;
		this.parent		= parent;
		this.entitytype = entitytype;
		
		this.events	= new EventRegistry(context.notifications,'_any','removed');
		this.event	= delegateTo(this.events,'filter');
		
		var notifications	= context.notifications,
			fields			= new FieldSet(this,this.events),
			relationships	= new RelationshipSet(),
			constraints		= new ConstraintSet;

		this.fields			= delegateTo(fields,'filter');
		this.field			= delegateTo(fields,'getField');
		this.relationships	= delegateTo(relationships,'filter');
		this.relationship   = delegateTo(relationships,'get');
		this.constraints	= delegateTo(constraints,'filter');
		this.context		= context;
		
		this
			.reifyFields()
			.set(data)
			.reifyOneToOneRelationships()
			.reifyOneToManyRelationships()
			.reifyConstraints();		

	};
	
	DomainObject.prototype = {
		
		constructor: DomainObject,
		
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
		
		set: extend({
			
			fields: function () {
				var mappings = arguments[0];
				for ( key in mappings ) {
					this.set(key,mappings[key],false);
				}
				this.event('_any').raise({key:':any',description:'field value change: any'});
			}
			
		}, function _set () {
			
			var key;

			if ( arguments.length == 2 || arguments.length == 3 ) {  // Arguments are key and value
				key = arguments[0];
				var value = arguments[1];
				if ( this.fields().set(key,value,arguments.callee.caller) && ( arguments.length == 2 || arguments[2] ) ) {
					this.event('_any').raise({key:':any',description:'field value change: any'});
				}
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				this.set.fields.apply(this,arguments);
			}

			this.domain.dirty = true;

			return this;
	
		}),
		
		removed: function _removed (collection) {
			this.event('removed').raise({removed:true,description:'object removal'});
		},
		
		subscribe: function _subscribe (subscription) {

			if ( subscription.key instanceof Array ) {
				for(var i=0;i<subscription.key.length;i++) {
					this.subscribe(copy(subscription).set('key',subscription.key[i]));
				}
			}
			else {
			    
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

    			var subscriber = ObjectSubscriber(subscription);
    			if ( subscription.key ) {
    				var key = subscription.key == ':any' ? '_any' : subscription.key;
    				this.event(key).subscribe(subscriber);
    			}
    			else if ( subscription.removed ) {
    				this.event('removed').subscribe();
    			}

    			if ( subscription.initialise ) {
    				this.context.notifications.send(subscriber({key:subscription.key}));
    			}

    			return subscriber;
			    
			}

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
			var fields = this.entitytype.options.has || this.parent.has || [];
			for ( var i in fields ) {
				var descriptor  = fields[i],
					field		= this.fields().add(new Field(descriptor,this.events)).added;
				this.parent[descriptor.accessor]	= delegateTo(field,'get');
				this.parent['set'+field.accessor]	= delegateTo(field,'set');
				this.events.register(descriptor.accessor);
			}
			return this;
		},
		
		reifyOneToOneRelationships: function _reifyOneToOneRelationships () {
			var oneToOnes = this.entitytype.options.hasOne || this.parent.hasOne || [];
			for ( var i in oneToOnes ) {
				var descriptor = oneToOnes[i];
				var relationship = this.relationships().add(new OneToOneRelationship(this,descriptor)).added;
				this.parent[descriptor.accessor]				= delegateTo(relationship,'get');
				this.parent['add'+descriptor.accessor]			= delegateTo(relationship,'add');
			}
			return this;
		},
		
		reifyOneToManyRelationships: function _reifyOneToManyRelationships() {
			var oneToManys = this.entitytype.options.hasMany || this.parent.hasMany || [];
			for ( var i in oneToManys ) {
				var descriptor = oneToManys[i];
				var relationship = this.relationships().add(new OneToManyRelationship(this,descriptor)).added;
				this.parent[(descriptor.plural || descriptor.accessor+'s')] 	= delegateTo(relationship,'get');
				this.parent['add'+descriptor.accessor]							= delegateTo(relationship,'add');
				this.parent['remove'+descriptor.accessor]						= delegateTo(relationship,'remove');
				this.parent['debug'+descriptor.accessor]						= delegateTo(relationship,'debug');
			}
			return this;

		},
		
		reifyConstraints: function _reifyConstraints () {
			var constraints = this.entitytype.options.must || this.parent.must || [];
			for (var i in constraints ) {
				descriptor = constraints[i];
				descriptor.predicate.message = descriptor.message;
				this.constraints().add(descriptor.predicate);
			}
			return this;
		},
		
		clean: function _clean () {
			this.domain.dirty = false;
			return this;
		},
		
		isa: function _isa (cons) {
		    return isa(cons)(this);
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
	
	function FieldSet (object,events) {	
		this.__delegate	= set().of(Field).index(Property('accessor')).delegateFor(this);
		this.getField	= delegateTo(this.__delegate,'get');
	}
	
	FieldSet.prototype = {
		
		constructor: FieldSet,
		
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
		}
		
	};
	
	
	function Field (field,events) {
		this.__delegate		= field.defaultValue || null;
		this.predicate		= field.validation ? field.validation.predicate || AllPredicate : AllPredicate;
		this.message		= ( field.validation && field.validation.message ) ? field.validation.message : '';
		this.events			= events;
		this.event			= delegateTo(this.events,'filter');
		this.accessor		= field.accessor;
	}
	
	Field.prototype = {
		
		constructor: Field,
	
		set: extend({
			
			valid: function (value,publisher) {
				this.__delegate = value;
				this.event(this.accessor).raise({key:this.accessor,description:'field value change: '+this.accessor});
				if ( publisher && publisher.success ) {
					publisher.success();
				}
				return true;
			},
			
			invalid: function (value,publisher) {
				if ( publisher && publisher.failure ) {
					publisher.failure(message);
				}
				return false;
			}
			
		}, function _set (value,publisher) {
			return this.predicate(value) ? this.set.valid.apply(this,arguments)
				   : this.set.invalid.apply(this,arguments);
		}),
	
		get: function _get () {
			return this.__delegate;
		}
		
	};
	
	
	// ------------------------------------------------------------------------
	// 															  Relationships
	// ------------------------------------------------------------------------
	
	function RelationshipSet () {
		TypedSet.apply(this);
		this.constraint = Or( InstancePredicate(OneToOneRelationship), InstancePredicate(OneToManyRelationship) );
		return this.index(Property('name'));
	}
	
	RelationshipSet.prototype = extend({
		
		constructor: RelationshipSet,
		
		predicate: function _predicate (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('name',parameter));
			}
			else {
				return this.__delegate.predicate(parameter);
			}
		}
		
	}, new TypedSet(Relationship) );
	

	function Relationship () {};
	Relationship.prototype.constructor = Relationship;
	
	
	function OneToOneRelationship (parent,relationship) {
		Relationship.apply(this);
		this.parent			= parent;
		this.relationship	= relationship;
		this.accessor		= relationship.accessor;
		this.name			= relationship.accessor;		
	};
	
	OneToOneRelationship.prototype = extend({
		
		constructor: OneToOneRelationship,
		
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
		
	}, new Relationship() );
	
	external.OneToOneRelationship = OneToOneRelationship;
	
	
	function OneToManyRelationship (owner,relationship) {

//		log('domainobject/create').startGroup('Reifying '+relationship.accessor);

		Relationship.apply(this);

		relationship.direction	= 'reverse';
		this.enabled 			= relationship.enabled;
		this.accessor			= relationship.accessor;
		this.name				= relationship.plural || relationship.accessor+'s';

//		log('domainobject/create').startGroup('Creating children collection');
		var children = 	owner.context.collection({
							base: 	     	owner.context.entities.get(relationship.prototype).objects,
							predicate: 	 	RelationshipPredicate(owner,relationship.field),
							description: 	'children by relationship '+relationship.accessor
						});
//		log('domainobject/create').endGroup();
	
		children.delegateFor(this);
		this.get = delegateTo(children,'filter');
	
		// Deletions might cascade								
/*		if ( relationship.cascade ) {
			owner.subscribe({
				removed: 	function () {
								children.each(function (child) {
									entities[relationship.prototype].objects.remove(child);
								});
							}
			});
		} */
		
		// Relationship might specify subscription to children							
		if ( relationship.subscription ) {
			this.subscription = children.subscribe(copy(relationship.subscription)._add({
				application: true,
				source: children,
				target: owner.parent
			}).defaults({
				description: 'subscription by relationship '+this.accessor
			}));
		}
		
		// NOTE: Should this work with arrays of objects too?
		this.add = function _add (data) {
			return owner.context.entities.get(relationship.prototype)
					.create( copy(data).set(relationship.field,owner.primaryKeyValue()) );
		};
		
		this.debug = function _debug () {
//			log().startGroup('Relationship: '+relationship.accessor);
//			log().debug('Object: '+owner.debug());
			if ( relationship.subscription ) {
//				log().debug('Subscription target: '+subscription.target.debug());
			}
//			log().endGroup();
		};
		
//		log('domainobject/create').endGroup();
		
	};
	
	OneToManyRelationship.prototype = new Relationship();
	OneToManyRelationship.prototype.constructor = OneToManyRelationship;
	
	external.OneToManyRelationship = OneToManyRelationship;
	
	
	// ------------------------------------------------------------------------
	// 																Constraints
	// ------------------------------------------------------------------------
	
	function ConstraintSet () {
		
		set().of(Function).delegateFor(this);
		
	}
	
	ConstraintSet.prototype.constructor = ConstraintSet;
	
	
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
	
	
	// ------------------------------------------------------------------------
	// 													Plugin extension points 
	// ------------------------------------------------------------------------
	
	external.plugin = {
		notifications: NotificationQueue.prototype,
		subscribers: SubscriberSet.prototype,
		context: Context.prototype,
		entitytype: EntityType.prototype,
		domaincollection: DomainObjectCollection.prototype,
		domainobject: DomainObject.prototype,
		fieldset: FieldSet.prototype,
		field: Field.prototype,
		relationship: {
			onetomany: OneToManyRelationship.prototype
		}
	};
	
	// ------------------------------------------------------------------------
	// 																	Fluency 
	// ------------------------------------------------------------------------
	
	external.context.notifications		= external.notifications;
	
	external.notifications.context		= external.context;
	
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
				subscription.source.subscribe(opal.copy(subscription).defaults({
					description: 'application subscription'
				})._add({
					application: true,
					target: jQuery(element),
					key: key
				}));
			});
		});
		
	}
	else if ( !subscription.member && subscription.bindings ) { // Multiple subscription through selector/key mapping

		return this.each(function (index,element) {
			for (var selector in subscription.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe(opal.copy(subscription).defaults({
						description: 'application subscription'
					})._add({
						application: true,
						target: jQuery(object),
						key: subscription.bindings[selector]
					}));
				});
			}
		});
		
	}
	else if ( ( subscription.predicate || subscription.selector ) && subscription.member && subscription.member.bindings ) { // Subscription to members of collection with bindings

		return this.each(function (index,element) {
			for (var selector in subscription.member.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe(opal.copy(subscription).defaults({
						description: 'application subscription'
					})._add({
						application: true,
						member: opal.copy(subscription.member).defaults({
							description: 'application subscription'
						})._add({
							application: true,
							target: jQuery(object),
							key: subscription.member.bindings[selector]
						})
					}));
				});
			}
		});

	} 
	else if ( ( subscription.predicate || subscription.selector ) && subscription.member ) { // Subscription to members of collection
		
		return this.each(function (index,element) {
			subscription.source.subscribe(opal.copy(subscription).defaults({
				description: 'application subscription'
			})._add({
				application: true,
				member: opal.copy(subscription.member).defaults({
					description: 'application subscription'
				}).add({
					application: true,
					target: jQuery(element)
				})
			}));
		});
		
	}
	else { // Subscription to collection
		
		return this.each(function (index,element) {
			subscription.source.subscribe(opal.copy(subscription).defaults({
				description: 'application subscription'
			})._add({
				application: true,
				target: jQuery(element)
			}));
		});
		
	}

};

jQuery.fn.pubsub = function (pubsub) {
	return this
			.subscribe(opal.copy(pubsub).add({source:pubsub.object}).remove('object'))
			.publish(opal.copy(pubsub).add({target:pubsub.object}).remove('object'));
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