/*
 *	jModel Javascript Library
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires opal.js and emerald.js
 *
 */


// ============================================================================
//														 	Domain Object Model
// ============================================================================

var jModel = function () {

	var external		= function (predicate) { return defaultContext.all.filter.apply(all,arguments); }, /* NOTE: Fix this */
		_				= external;
		
	external.jmodel_version = '0.6.12';

	//
	// Import Emerald
	//
	
	for ( var i in emerald ) {
		eval('var '+i+' = emerald.'+i);
		external[i] = emerald[i];
	}


	
	
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
	
	external.extend({
		
		method: 	method,
		plus: 		plus,
		times: 		times,
		
		/* Set */
		set: 		set,
		
		/* Predicates */
		predicate: 	predicate,
		
		is: 		is,
		istrue: 	istrue,
		
		test: 		FunctionPredicate,
		type: 		is_of_type,
		isa: 		isa,
		isan: 		isa,
		property: 	PropertyPredicate,
		
		member: 	MembershipPredicate,
		
		or: 		or,
		and: 		and,
		not: 		not,
		
		empty: 		EmptySetPredicate,
		nonempty: 	not(EmptySetPredicate),
		
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
	}
	
	external.union = function _union () {
		var union = new Set();
		for (var i in arguments ) {
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
		for (var i in arguments ) {
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
		
		this.__delegate = new ObservableTypedSet(Context);
		
		this.__delegate
			.index(resolve('name'))
			.delegateFor(this);
			
	}
	
	
	function Context (name) {

		this.isDefault		= false;
		this.name			= name;
		
		this.notifications	= new NotificationQueue(this);
		
		this.entities		= new EntityTypeSet(this);
		this.entity         = delegateTo(this.entities,'filter');
		
		this.events			= new EventRegistry(this.notifications,'checkpoint');
		this.event			= delegateTo(this.events,'filter');
		
		this.all			= this.collection({description:'All Objects in context '+this.name});
		
		this.constraints    = new TypedSet(GlobalReferentialConstraint);
		
		// Adding a new object of a type in the context should add to the context's
		// collection of all objects
		var context = this;
		this.entities.event('add').map('object').subscribe(function (entitytype) {
		    entitytype.objects.event('add').map('object').subscribe(function (object) {
		        context.all.add(object);
		    });
		});
		
	}
	
	Context.prototype = {
		
		constructor: Context,
		
		register: function _register (name,constructor,options) {
			return this.entities.create(name,constructor,options)
						.exposeAt( this.isDefault ? [this,external] : [this] )
						.context;
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
		},
		
		collection: function _collection (specification) {
			return new DomainObjectCollection( extend({context:this},specification || {}) );
		},
		
		createConstraints: function _constraints () {  
		    var context = this;
		    this.entities.each(function (entitytype) {
	            Set.fromArray(entitytype.constructor.prototype.hasMany)
					.reduce(method('add',context,entitytype),context.constraints);
		    });
		}
		
	};	
	
	
	function GlobalReferentialConstraint (context,parentType,relationship) {
	    
	    var range = context.entity(relationship.prototype).objects;

        // Adding an object to a relationship's range or changing its foreign key might
        // add the object to the relationship
        disjoin(
            range.event('add'),
            range.event('change').where(Eq(relationship.field,'key')) 
        )
        .map('object')
        .subscribe(function (child) {
            var key = child.get(relationship.field);
            if ( key ) {
                var parent = parentType.object(key);
                if ( parent ) {
                    parent.relationship(relationship.accessor).add(child);
                }
            }
        });

        // Removing an object from the range will remove the object from the relationship
        range.event('remove').map('object').subscribe(function (child) {
		    var parent = parentType.object(child.get(relationship.field));
		    if ( parent ) {
                parent.relationship(relationship.accessor).remove(child);
            }
		});
	    
	}
	
	
	// ------------------------------------------------------------------------
	// 																 Prototypes
	// ------------------------------------------------------------------------
	
	function EntityTypeSet (context) {
		
		ObservableTypedSet.call(this,EntityType,context.notifications);
		
		this.context = context;
		this.index(resolve('name'));

	}
	
	EntityTypeSet.prototype = extend({
		
		constructor: EntityTypeSet,
		
		__construct: function (name,constructor,options) {
			return new EntityType(this.context,name,constructor,options);
		},
		
		predicate: function _predicate (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('name',parameter));
			}
			else {
				return ObservableTypedSet.prototype.predicate.apply(this,arguments);
			}
		}
		
	}, new ObservableTypedSet(EntityType) );
	
	var	defaultContext	= contexts.create('default').setDefault();
	
	function EntityType (context,name,constructor,options) {

		this.options		= options || {};
		this.name			= name;
		this.constructor	= constructor;
		this.context		= context;
		
		this.nextKey        = -1;

		this.objects =	this.collection({
		                    entitytype:     this,
							predicate: 		isa(this.constructor),
							ordering: 		this.options.ordering,
							description: 	this.name,
							primaryKey: 	this.options.primaryKey
						});
		
		var base = this.options.parent ? this.context.entity(this.options.parent).objects : null;
		if ( base ) {
		    this.objects.event('add').map('object').subscribe(function (object) {
		        base.add(object);
		    });
		}					
							
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
		
		this.objects.event('remove').map('object').subscribe(function (removed) {
			removed.event('deleted').raise({object:removed});
			removed.events.each(function (event) {
		        event.subscribers().remove(AllPredicate);
		    });
		});

	}
	
	EntityType.prototype = {
		
		constructor: EntityType,
		
		object: function _object (criterion) {
			criterion = ( typeof criterion == 'string' && this.options.primaryKey && parseInt(criterion,10) ) ? parseInt(criterion,10) : criterion;
			if ( criterion === null || typeof criterion === 'undefined' ) {
			    return false;
			}
			if ( typeof criterion == 'number' && this.options.primaryKey ) {
				return this.objects.get(criterion);
			}
			else {
			    var args = Array.prototype.slice.call(arguments);
			    if ( args[args.length-1] !== ':first' ) {
			        args.push(':first');
			    }
			    return this.objects.filter.apply(this.objects,args);
			}
		},
		
		create: function _create (data) {

			var newObject;

			this.context.transaction(function () {

				newObject = new this.constructor();
				newObject.__delegate = (new DomainObject(this,newObject,data)).delegateFor(newObject);

				if ( newObject.initialise ) {
					newObject.initialise();
				}
				
				this.objects.add(newObject);
				
			},this);

			return newObject;

		}, 
		
		exposeAt: function _exposeAt (targets) {
			
			var name	= this.name,
				plural	= this.options.plural || this.name+'s',
				entity	= this;
			
			Set.fromArray(targets).each(function __exposeAt (target) {
			
				target[name] 				= delegateTo(entity,'object');
				target[plural]				= delegateTo(entity.objects,'filter');

				target['create'+name]		= delegateTo(entity,'create');
				target['remove'+name]       = delegateTo(entity.objects,'remove')
				target['deleted'+plural]	= delegateTo(entity.deleted,'filter');

				target[name].entitytype		= entity;
				target[name].extend			= delegateTo(entity.constructor,'extend');
				
			});
			
			return this;
			
		},
		
		generateID: function __generateID () {	
			return this.nextKey--;
		},
		
		collection: function _collection (specification) {
			return new DomainObjectCollection( extend({entitytype:this},specification) );
		}
		
	};
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------
	
	//
	// Notification types
	//
	
	function ContentNotification (subscription) {
		return function (event) {
			var value = subscription.value ? subscription.value(subscription.source) : subscription.source.get(subscription.key);
			subscription.target.html(subscription.format(value));
		};
	}
	
	function ValueNotification (subscription) {
		return function (event) {
			subscription.target.val(subscription.source.get(subscription.key));
		};
	}
	
	function FunctionNotification (subscription) {
		return function (event) {
			subscription.change.call(subscription.target,subscription.source);
		};
	}
	
	function EventNotification (subscription) {
		return function (event) {
			subscription.target.trigger(jQuery.Event(subscription.change),subscription.source);
		};
	}
	
	function RemovalNotification (subscription) {
		return function (event) {
			subscription.removed.call(subscription.target,subscription.source);
		};
	}
	
	function CollectionMethodNotification (subscription) {
		return extend({subscription:subscription}, function _collectionmethodnotification (event) {
			if (subscription[event.method] && event.permutation) {
//				log('notifications/send').debug('Receiving a sort notification');
				subscription[event.method].call(subscription.target,event.permutation);
			}
			else if (subscription[event.method] && typeof subscription[event.method] == 'function' ) {
//				log('notifications/send').debug('Receiving a collection method notification'+': '+subscription.description);
				subscription[event.method].call(subscription.target,subscription.source,event.object);
			}
		});
	}
	
	function CollectionEventNotification (subscription) {
		return extend({subscription:subscription}, function _collectioneventnotification (event) {
			// NOTE: Implement this
		});
	}
	
	// NOTE: Make this work with bindings
	function CollectionMemberNotification (subscription) {
		return extend({subscription:subscription}, function _collectionmembernotification (event) {
			var keys = ( subscription.member.key instanceof Array ) ? subscription.member.key : [subscription.member.key];
			for (var i in keys) {
				event.object.subscribe({
					application: subscription.application,
					source: event.object,
					target: subscription.member.target,
					key: keys[i],
					change: subscription.member.change,
					initialise: subscription.member.initialise,
					format: subscription.member.format,
					value: subscription.member.value,
					description: subscription.member.description || 'collection member subscription for key '+subscription.member.key[i]
				});
			}
		});
	}
	
	external.notification = {
		ContentNotification: ContentNotification,
		ValueNotification: ValueNotification,
		FunctionNotification: FunctionNotification,
		EventNotification: EventNotification,
		RemovalNotification: RemovalNotification,
		CollectionMethodNotification: CollectionMethodNotification,
		CollectionEventNotification: CollectionEventNotification,
		CollectionMemberNotification: CollectionMemberNotification
	};
	
	
	
	// ------------------------------------------------------------------------
	// 												   Domain Object Collection
	// ------------------------------------------------------------------------
	
	function DomainObjectCollection (specification) {
		
		var that			= this;
		specification		= specification || {};
		this.entitytype		= specification.entitytype;
		this.context		= this.entitytype ? this.entitytype.context
								: ( specification.context || contexts('default') );
		
		ObservableTypedSet.call(this,this.entitytype,this.context.notifications);
		
		if ( this.entitytype ) {
			this.__construct = delegateTo(this.entitytype,'create');
		}
		
		this.__predicate	= specification.predicate || AllPredicate;
		this.__base			= specification.base;
		this.__ordering		= specification.ordering;
		this.description	= specification.description;
		this.__removeOnDelete = (typeof specification.removeOnDelete !== 'undefined') ? specification.removeOnDelete : true; 
								
		if ( specification.objects ) {
		    specification.objects = specification.objects instanceof Array ? Set.fromArray(specification.objects) : specification.objects;
		    specification.objects.reduce(method('add'),this);
		}						
								

		if ( specification.primaryKey ) {
			this.index(method('primaryKeyValue'));
		} 
		this.sorted = false;
		
//		this.events.register('change');

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
		
		// We need to observe objects added to the collection
		this.event('add').map('object').subscribe(function (object) {
			
		    that.sorted = false;
		
			// If the object is deleted we should remove it from the collection
			if ( that.__removeOnDelete ) {
			    object.event('deleted').subscribe(function (event) {
    				that.remove(event.object);
    			});
			}

		    // If an object is changed we must assume that the collection becomes unsorted
		    object.event('change').subscribe(function () {
		        that.sorted = false;
		    });
		    
		    // Object changes are republished as collection changes
/*		    object.event('change').map(function (event) {
		        return {
		            method: 'change',
		            object: event.object,
		            key: event.key,
		            value: event.value,
		            description: 'object change for '+that.description+' collection change'
		        };
		    }).republish(that.event('change')); */

		});
		
	}
	
	DomainObjectCollection.prototype = extend({
		
		constructor: DomainObjectCollection,
		
		remove: function (predicate) {
			predicate = this.predicate(predicate);
			ObservableTypedSet.prototype.remove.call(this,predicate);
		},
		
/*		remove: function _remove (predicate,fromHere,removeSubscribers) {
			predicate = and(this.__predicate,this.predicate(predicate));
			var that = this;
			if ( fromHere ) {
				this.__delegate.remove(predicate).each(function __remove (object) {
				    console.log('object removed');
					object.removed();
					that.event('remove').raise({
						method:'remove',
						object:object,
						description:'object removal'
					}); 
					if (removeSubscribers) {
					    object.events.each(function (event) {
					        event.subscribers().remove(AllPredicate);
					    });
					}	
				});
				this.length = this.__delegate.length;
			}
			else {
				this.context.all.remove(and(MembershipPredicate(this.__delegate),predicate),true,true);
			}

		}, */
		
		first: function _first () {
			if ( !this.sorted ) { this.sort(); }
			return ObservableTypedSet.prototype.first.apply(this);
		},
		
		select: function _select (selector) {
			return selector == ':first' ? this.first() : this;
		},
		
		filter: function _filter () {

			if ( arguments.length === 0  ) {
				return this;
			}

			var filtered = ObservableTypedSet.prototype.filter.apply(this,arguments);

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
		
		each: function _each () {
			if ( !this.sorted ) { this.sort(); }
			ObservableTypedSet.prototype.each.apply(this,arguments);
			return this;
		},
		
		sort: function _sort () {

			if ( this.sorted ) {
				return this;
			}

			if ( arguments.length > 0 ) {
				this.__ordering = this.ordering.apply(null,arguments);
			}
			else if ( typeof this.__ordering != 'function' ) {
				this.__ordering = this.ordering(this.__ordering);
			}

			// Remember old order
//			this.each(function __sort (object,index) {
//				object.domain.tags.position = index;
//			});

			// Sort
			ObservableTypedSet.prototype.sort.call(this,this.__ordering);

			// Find permutation
			var permutation = [];
//			this.each(function ___sort (object,index) {
//				permutation[index] = object.domain.tags.position;
//				delete object.__delegate.domain.tags.position;
//			});

			// Find whether permutation is not identity permutation
			var permuted = false;
			for(var i in permutation) {
				if ( permutation[i] != i ) {
					permuted = true;
					break;
				}
			}

			// Notify subscribers
			if ( permuted ) {
				this.event('sort').raise({
					method:'sort',
					permutation:permutation,
					description:'collection sort'
				});
			}

			this.sorted = true;

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

		    subscription = copy(subscription,true);

//			log('subscriptions/subscribe').startGroup('Subscribing: '+subscription.description);

			if ( subscription.predicate || subscription.selector ) {
//				log('subscriptions/subscribe').debug('Creating a collection member subscription: '+subscription.description);
				subscription.message   = external.notification.CollectionMemberNotification(subscription);
				subscription.predicate = function __subscribe (collection,predicate) {
											return function ___subscribe (event) {
												return ( event.method == 'add' || event.method == 'initialise' ) 
														&& collection.filter(predicate).select(subscription.selector) === event.object;
											};
										}(this,subscription.predicate);							
			}
			else if ( ( typeof subscription.add == 'string' ) && ( typeof subscription.remove == 'string' ) ) {
//				log('subscriptions/subscribe').debug('Creating a collection event subscription: '+subscription.description);
				subscription.message	= external.notification.CollectionEventNotification(subscription);
			}
			else {
//				log('subscriptions/subscribe').debug('Creating a collection method subscription: '+subscription.description);
				subscription.message	= external.notification.CollectionMethodNotification(subscription); 
			}
			
			subscription.description = subscription.description || 'unknown';

			
			//
			// NOTE: Simplify the next two sections
			//
			var that = this, subscriber;
			set('add','remove','initialise','change','sort').each(function (eventtype) {
				if ( subscription.hasOwnProperty(eventtype) ) {
				    subscriber = new Subscriber(subscription,that.context.notifications);
					that.event(eventtype).subscribe(subscriber);
				}
			});
			
			if ( subscription.member ) {
				subscriber = new Subscriber(subscription,this.context.notifications);
				this.event('add').subscribe(subscriber);
				this.event('change').subscribe(subscriber);
				this.event('initialise').subscribe(subscriber);
			}
			
			if ( subscriber && subscription.initialise ) {
//				log('subscriptions/subscribe').startGroup('initialising subscription: '+subscription.description);
				var context = this.context;
				this.each(function __subcribe (object) {
					subscriber.notify({
						method: 'add',
						object: object,
						description: 'initialisation'
					});	
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
				return is(parameter);
			}
			else if ( typeof parameter == 'object' && parameter !== null ) {
				return ExamplePredicate(parameter);
			} 
			else if ( typeof parameter == 'number' || typeof parameter == 'string' ) {
				return extend({unique:true},IdentityPredicate(parameter));
			}
			return AllPredicate;
		},
		
		ordering: function _ordering () {
		    var i;
			if ( arguments.length > 1 ) {
				for ( i in arguments ) {
					arguments[i] = _ordering(arguments[i]);
				}
				return CompositeOrdering.apply(null,arguments);
			}
			else if ( arguments[0] instanceof Array ) {
				for ( i in arguments ) {
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
		
	}, new ObservableTypedSet() );
	
	// NOTE: Make this a method of Context
/*	external.collection = function _collection () {
		return new DomainObjectCollection({
			context: contexts('default'),
			objects: set(arguments).reduce(push,[]),
			description: 'set'
		});
	}; */
	
	function DeletedObjectsCollection (collection) {
		
		var deleted = collection.entitytype.collection({description:'deleted',removeOnDelete:false});
		
		deleted.debug = function _debug () {
			if ( Not(EmptySetPredicate)(deleted) ) {
				console.log('Deleted:  '+deleted.format(listing(method('primaryKeyValue'))));
//				log().debug('Deleted:  '+deleted.format(listing(method('primaryKeyValue'))));
			}
		};
		
		collection.event('remove').map('object').subscribe(function (object) {
//			console.log(event.object);
			deleted.add(object);
		});
		
		return deleted;
		
	}
	
	
	function View (parent,child,predicate) {
		
		parent.subscribe({
			source: 		parent,
			target: 		child,
			add: 			parentAdd,
			remove: 		parentRemove,
			change: 		parentChange,
			description: 	'view: '+parent.description+' -> '+child.description
		});
		
		// NOTE: this is ugly, and really should be done by subscription initialisation
		parent.reduce(add(predicate),child);
		
		function parentAdd (collection,object) {
			add(predicate)(child,object);
		}
		
		function parentRemove (collection,object) {
			child.remove(object,true);
		}
		
		function parentChange (collection,object) {
			// Object sometimes null here
			if ( predicate(object) ) {
				child.add(object);
			}
			else {
				child.remove(object,true);
			}
		}
		
	}
	
	
/*	function Grouping (parent,extractor) {
		this.parent		= parent;
		this.extractor	= ( typeof extractor == 'string' ) ? method(extractor) : extractor;
		this.__delegate	= set().index(resolve('value')).delegateFor(this);
		this.build();
	}
	
	Grouping.prototype = {
		
		constructor: Grouping,
		
		build: function _build () {
			return this.parent.reduce(method('add'),this);
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
	} */
	
	
	// ------------------------------------------------------------------------
	//														   Domain Orderings
	// ------------------------------------------------------------------------
	
	var makeOrdering = (new DomainObjectCollection()).ordering;
	

	function FieldOrdering (fieldName) {
		return FunctionOrdering( function _fieldordering (obj) {return obj.get(fieldName);} );
	}
	
	
	function FieldPathOrdering (fieldpath) {	
		return FunctionOrdering( function _fieldpathordering (obj) {
			var property, value;
			for (var i in path) {
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
	}
	
	
	external.extend({
		ordering: 	makeOrdering,
		field: 		FieldOrdering,
		path: 		FieldPathOrdering
	});
	
	
	// ------------------------------------------------------------------------
	// 														  Domain Predicates
	// ------------------------------------------------------------------------
	
	external.predicate = (new DomainObjectCollection()).predicate;

	// Primary Key Identity
	
	var IdentityPredicate = external.id = function _id (id) {
		return method('primaryKeyValue').eq(id);
	};

	// Example
	
	var ExamplePredicate = external.example = function _example (example) {

		var predicates = [];
		
		for( var key in example ) {
			if ( example[key] instanceof RegExp ) {
				predicates.push(FieldPredicate(key,regex(example[key])));
			}
			else if ( typeof example[key] == 'function' ) {
				predicates.push(FieldPredicate(key,example[key]));
			}
			else if ( typeof example[key] == 'object' ) {
				predicates.push(FieldPredicate(key,SomeSetPredicate(ExamplePredicate(example[key]))));
			}
			else {
				predicates.push(FieldPredicate(key,eq(example[key])));
			}
		}
		
		return and.apply(null,predicates);

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
	}
	
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
	
	function DomainObject (entitytype,parent,data) {
		
		this.domain = {
			dirty: 	false,
			tags: 	{}
		};
		
		data = (typeof data == 'object') ? data : {};

		this.primaryKey         = entitytype.options.primaryKey || entitytype.options.relativeKey;
		data[this.primaryKey]   = data[this.primaryKey] || entitytype.generateID();
		
		this.nameField  = entitytype.options.nameField;
		this.parent		= parent;
		this.entitytype = entitytype;
		this.context	= entitytype.context;
		
		this.events	= new EventRegistry(this.context.notifications,'change','removed','deleted');
		this.event	= delegateTo(this.events,'filter');
		
		var fields			= new FieldSet(this,this.events),
			relationships	= new RelationshipSet(),
			constraints		= new ConstraintSet;

		this.fields			= delegateTo(fields,'filter');
		this.field			= delegateTo(fields,'getField');
		this.relationships	= delegateTo(relationships,'filter');
		this.relationship   = delegateTo(relationships,'get');
		this.constraints	= delegateTo(constraints,'filter');
		
		this
			.reifyFields()
			.set(data)
			.reifyOneToOneRelationships()
			.reifyOneToManyRelationships()
			.reifyConstraints();
			
    	if ( entitytype.options.primaryKey ) {
    	    var primaryKeyConstraint = new PrimaryKeyConstraint(this);
    	}

	}
	
	DomainObject.prototype = {
		
		constructor: DomainObject,
		
		get: function _get () {
		
		    var values = {};
		
			if ( arguments.length === 0 || typeof arguments[0] === 'undefined' ) {
				return false;
			}
			else if ( arguments[0] == ':all' ) {
				return this.get(this.fields().keys());
			}
			else if ( arguments[0].each ) {
				var that = this;
				arguments[0].each(function __get (key) {
					values[key] = that.fields().get(key);
				});
				return values;
			}
			else if ( !(arguments[0] instanceof Array) ) { // Just a key
				var key = arguments[0],
				    field = this.fields().getField(key),
				    relationship;
				if ( field ) {
					return field.get();
				}
				else {
				    relationship = this.relationships(key);
					if ( relationship ) {
						return relationship.get();
					}
				}
			}
			else { // Array of keys
				var keys = arguments[0];
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
			}
			
		}, function _set () {
			
			var key;

			if ( arguments.length == 2 || arguments.length == 3 ) {  // Arguments are key and value
				key = arguments[0];
				var value = arguments[1];
/*				if ( */this.fields().set(key,value,arguments.callee.caller);/* && ( arguments.length == 2 || arguments[2] ) ) {
				} */
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				this.set.fields.apply(this,arguments);
			}

			this.domain.dirty = true;

			return this;
	
		}),
		
		removed: function _removed (collection) {
			this.event('removed').raise({
				removed: true,
				description: 'object removal'
			});
		},
		
		dispose: function _delete  () {
		    this.entitytype.objects.remove(this);
		},
		
		subscribe: function _subscribe (subscription) {

			if ( subscription.key instanceof Array ) {
				for(var i in subscription.key) {
					this.subscribe(copy(subscription).setProperty('key',subscription.key[i]));
				}
			}
			else {
			    
			    subscription.source 		= this;
    			subscription.format 		= subscription.format || noformat;
				subscription.description	= subscription.description || 'unknown';

				var event, message;
    			if ( subscription.removed ) {
					event	= 'removed';
    				message	= external.notification.RemovalNotification(subscription);
    			}
				else {
					event = ( subscription.key == ':any' || !subscription.key ) ? 'change' : subscription.key;
					if ( subscription.change && typeof subscription.change == 'string' ) {
	    				message	= external.notification.EventNotification(subscription);
	    			}
	    			else if ( subscription.change && typeof subscription.change == 'function' ) {
	    				message	= external.notification.FunctionNotification(subscription);
	    			}
	    			else if ( subscription.target.is('input:input,input:checkbox,input:hidden,select') ) {
	    				message = external.notification.ValueNotification(subscription);
	    			}
	    			else {
	    				message = external.notification.ContentNotification(subscription);
	    			}
				}	

				var subscriber = this.event(event).subscribe({
					message: message
				});

    			if ( subscription.initialise ) {
    				subscriber.notify({
						description: 'Initialisation: '+event
					});
    			}

    			return subscriber;
			    
			}

		},
		
		name: function _name () {
		    return this.get( this.nameField || this.primaryKey );
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
						.filter(function __validate (constraint) {return not(constraint)(obj);})
							.map(function ___validate (constraint) {return constraint.message;})
								.join('; ');
		},
		
		reifyFields: function _reifyFields () {
		    
			var fields = this.entitytype.options.has || this.parent.has || [],
			    that = this;
			    
			for ( var i in fields ) {
				
				var descriptor = fields[i];
				
				this.events.register(descriptor.accessor);
				this.event(descriptor.accessor).map(function (event) {
				    return {
				        object: that.parent,
				        key: event.key,
				        value: event.value
				    };
				}).republish(that.event('change'));
			    
				var field = this.fields().add(new Field(descriptor,this.events)).added;
					
				this.parent[descriptor.accessor]	= delegateTo(field,'get');
				this.parent['set'+field.accessor]	= delegateTo(field,'set');
				
			}
			
			return this;
			
		},
		
		reifyOneToOneRelationships: function _reifyOneToOneRelationships () {
		    
			var oneToOnes = this.entitytype.options.hasOne || this.parent.hasOne || [];
			
			for ( var i in oneToOnes ) {
				var descriptor = oneToOnes[i],
				    relationship = this.relationships().add(new OneToOneRelationship(this,descriptor)).added;
				this.parent[descriptor.accessor]				= delegateTo(relationship,'get');
				this.parent['add'+descriptor.accessor]			= delegateTo(relationship,'add');
			}
			
			return this;
			
		},
		
		reifyOneToManyRelationships: function _reifyOneToManyRelationships() {
		    
			var oneToManys = this.entitytype.options.hasMany || this.parent.hasMany || [];
			
			for ( var i in oneToManys ) {
			    
				var descriptor = oneToManys[i],
				    relationship = this.relationships().add(new OneToManyRelationship(this,descriptor)).added;
				
				this.parent[(descriptor.singular || descriptor.accessor)]           = delegateTo(relationship,'filter');
				this.parent[(descriptor.plural || descriptor.accessor+'s')] 	    = delegateTo(relationship,'filter');
				
				this.parent['add'+(descriptor.singular || descriptor.accessor)]		= (function (relationship) {
				    return function (data) {
				        return relationship.add(data||{}).added;
				    };
				})(relationship); 
				
				this.parent['remove'+(descriptor.singular || descriptor.accessor)]	= (function (relationship) {
				    return function (predicate) {
				        return relationship.remove(predicate);
				    };
				})(relationship);
				this.parent['debug'+(descriptor.singular || descriptor.accessor)]	= delegateTo(relationship,'debug');
				
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


    function PrimaryKeyConstraint (object) {
        object.event(object.primaryKey)
            .map('value')
            .where(IsNull)
            .subscribe(function (event) {
                object.parent.dispose();
            });
    }

	
	// ------------------------------------------------------------------------
	// 															  		 Fields
	// ------------------------------------------------------------------------
	
	function FieldSet (object,events) {	
		TypedSet.call(this,Field);
		this.index(resolve('accessor'));
	}
	
	FieldSet.prototype = extend({
		
		constructor: FieldSet,
		
		getField: function _getfield (name) {
			return TypedSet.prototype.get.call(this,name);
		},
		
		get: function _get (name) {
			try {
				return this.getField(name).get();
			}
			catch (e) {
				return null;
			}
		},
		
		set: function _set (name,value) {
			try {
				return this.getField(name).set(value);
			}
			catch (e) {
				return null;
			}
		},
		
		keys: function _keys () {
			return this.map(property('accessor'));
		},
		
		predicate: function _predicate (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				return extend({unique:true},PropertyPredicate('accessor',parameter));
			}
			else {
				return TypedSet.prototype.predicate.apply(this,arguments);
			}
		}
		
	}, new TypedSet(Field) );
	
	
	function Field (field,events) {
		this.__delegate		= field.defaultValue || null;
		this.predicate		= field.validation ? field.validation.predicate || AllPredicate : AllPredicate;
		this.message		= ( field.validation && field.validation.message ) ? field.validation.message : '';
		this.accessor		= field.accessor;
		this.event			= events.filter(this.accessor);
	}
	
	Field.prototype = {
		
		constructor: Field,
	
		set: function (value) {
			
			if ( this.predicate(value) ) {
				
				this.__delegate = value;
				this.event.raise({
					key: this.accessor,
					value: value,
					description:'field value change: '+this.accessor
				});
				return true;
				
			}
			else {
				
				this.event.fail({
					key: this.accessor,
					value: value,
					description:'field value change failure: '+this.accessor
				});
				return false;
				
			}
			
		},
	
		get: function _get () {
			return this.__delegate;
		}
		
	};
	
	
	// ------------------------------------------------------------------------
	// 															  Relationships
	// ------------------------------------------------------------------------
	
	function RelationshipSet () {
		TypedSet.call(this,Relationship);
		this.index(resolve('name'));
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
	

	function Relationship () {}
	Relationship.prototype.constructor = Relationship;
	
	
	function OneToOneRelationship (parent,relationship) {
		Relationship.apply(this);
		this.parent			= parent;
		this.relationship	= relationship;
		this.accessor		= relationship.accessor;
		this.name			= relationship.accessor;
		this.related        = undefined;	
	}
	
	OneToOneRelationship.prototype = extend({
		
		constructor: OneToOneRelationship,
		
		get: function _get () {
		    return this.relationship.field ? this.parent.context.entities.get(this.relationship.prototype).object(this.parent.get(this.relationship.field))
		                    : this.related;
		},
		
		add: function _add (data) {
		    var newObject;
		    if ( data.__delegate && data.__delegate instanceof DomainObject ) {
	            newObject = data;
	        }
	        else {
		        newObject = this.parent.context.entities.get(this.relationship.prototype).create( data || {} );
            }
			if ( this.relationship.field ) {
			    this.parent.set(this.relationship.field, newObject.primaryKeyValue());
			}
			else {
			    this.related = newObject;
			}
			return newObject;
		}
		
	}, new Relationship() );
	
	external.OneToOneRelationship = OneToOneRelationship;
	
	
	function OneToManyRelationship (owner,relationship) {

//		log('domainobject/create').startGroup('Reifying '+relationship.accessor);

		Relationship.apply(this);

		relationship.direction	= 'reverse';
		this.owner		= owner;
		this.enabled 	= relationship.enabled;
		this.accessor	= relationship.accessor;
		this.name		= relationship.plural || relationship.accessor+'s';

//		log('domainobject/create').startGroup('Creating children collection');
		var childEntityType = owner.context.entities.get(relationship.prototype),
			children = 	childEntityType.collection({
				description: 	'children by relationship '+relationship.accessor,
				primaryKey: 	childEntityType.options.primaryKey || relationship.relativeKey
			});
//		log('domainobject/create').endGroup();
		
		children.delegateFor(this);
		this.filter = delegateTo(children,'filter');
		this.get    = delegateTo(children,'get');

		if ( relationship.field ) {
			var base = owner.context.entities.get(relationship.prototype).objects;
			var referentialConstraint = new LocalReferentialConstraint(this,base,relationship.field);
		}
	
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
			this.subscription = children.subscribe(copy(relationship.subscription).addProperties({
				application: true,
				source: children,
				target: owner.parent
			}).defaults({
				description: 'subscription by relationship '+this.accessor
			}));
		}
		
		this.debug = function _debug () {
//			log().startGroup('Relationship: '+relationship.accessor);
//			log().debug('Object: '+owner.debug());
			if ( relationship.subscription ) {
//				log().debug('Subscription target: '+subscription.target.debug());
			}
//			log().endGroup();
		};
		
//		log('domainobject/create').endGroup();
		
	}
	
	OneToManyRelationship.prototype = new Relationship();
	OneToManyRelationship.prototype.constructor = OneToManyRelationship;
	
	external.OneToManyRelationship = OneToManyRelationship;
	
	
	function LocalReferentialConstraint (relationship,range,foreignKey) {
		
		var related = RelationshipPredicate(relationship.owner,foreignKey);
		
		//
		// Handle foreign key changes
		//
		
        // Changed foreign key might remove object from relationship
        relationship.event('change')
            .where(Eq(foreignKey,'key'))
            .map('object')
            .where(not(related))
            .subscribe(function (object) {
                relationship.remove(object);
            });
		
		//
		// Handle direct manipulation of relationship collection
		//
		
		// Make sure foreign keys are correct after addition
		relationship.event('add')
		    .map('object')
		    .where(not(related))
		    .subscribe(function (added) {
    		    added.set(foreignKey,relationship.owner.primaryKeyValue());
    		});
		
		// Make sure foreign keys are correct after removal
		relationship.event('remove')
		    .map('object')
		    .where(related)
		    .subscribe(function (object) {
    			object.set(foreignKey,null);
    		});
		
		//
		// Initialise the members of the relationship
		//
		
		range.reduce(add(related),relationship);
		
	}
	
	
	// ------------------------------------------------------------------------
	// 																Constraints
	// ------------------------------------------------------------------------
	
	function ConstraintSet () {
		
		this.__delegate = new TypedSet(Function);
		this.__delegate.delegateFor(this);
		
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
	
	external.plugin = extend({
		events: EventRegistry.prototype,
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
	},external.plugin);
	
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