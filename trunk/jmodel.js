/*
 *	jModel Javascript Library v0.1
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

// =========================================================================
// 												Domain binding jQuery plugin
// =========================================================================

// NOTE: Make it possible to publish to a method not just a key?
// NOTE: Make publishing work for domain member subscriptions
jQuery.fn.publish = function (publication) {
	
	if ( publication.bindings ) {
		
		for (var selector in publication.bindings) {
			jQuery(selector,this).each(function (index,object) {
				jQuery(object).bind('change',function (key) {
					return function (event) {
						publication.target.set(key,jQuery(event.target).val());
					};
				}(publication.bindings[selector]));
			});
		}
		return this;
		
	}
	else {
		
		return this.change ? this.change(function (event) {
			publication.target.set(publication.key,jQuery(event.target).val());
		}) :
		this;
		
	}
	
};

jQuery.fn.subscribe = function (subscription) {
	
	if ( subscription.key && !subscription.selector ) { // Basic subscription
		
		return this.each(function (index,element) {
			subscription.key = subscription.key instanceof Array ? subscription.key : [subscription.key];
			jQuery.each(subscription.key,function (index,key) {
				subscription.source.subscribe({
					source: subscription.source,
					target: jQuery(element),
					key: key,
					change: subscription.onChange,
					removed: subscription.onRemove,
					initialise: subscription.initialise
				});
			});
		});
		
	}
	else if ( subscription.bindings ) { // Multiple subscription through selector/key mapping
		
		return this.each(function (index,element) {
			for (var selector in subscription.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe({
						source: subscription.source,
						target: jQuery(object),
						key: subscription.bindings[selector],
						initialise: subscription.initialise
					});
				});
			}
		});
		
	}
	else if ( subscription.predicate || subscription.selector ) { // Subscription to members of collection
		
		return this.each(function (index,element) {
			for (var selector in subscription.subscription.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe({
						source: subscription.source,
						predicate: subscription.predicate,
						selector: subscription.selector,
						subscription: {
							target: jQuery(object),
							key: subscription.subscription.bindings[selector],
							change: subscription.subscription.onChange,
							initialise: subscription.subscription.initialise
						}
					});
				});
			}
		});
		
	} 
	else { // Subscription to collection
		
		return this.each(function (index,element) {
			subscription.source.subscribe({
				source: subscription.source,
				target: jQuery(element),
				add: subscription.onAdd,
				remove: subscription.onRemove,
				change: subscription.onChange,
				sort: subscription.onSort,
				initialise: subscription.initialise
			});
		});
		
	}

};

jQuery.fn.pubsub = function (pubsub) {
	pubsub.source = pubsub.object;
	pubsub.target = pubsub.object;
	return this.subscribe(pubsub).publish(pubsub);
};

jQuery.fn.permute = function (permutation) {

	if ( this.length != permutation.length ) {
		return false;
	}
	
	var copies = [], placeholders = [];
	for(var i=0; i<this.length; i++) {
		copies[i] 		= this.get(i);
		placeholders[i] = document.createComment('');
		copies[i].parentNode.replaceChild(placeholders[i],copies[i])
	};
	
	for(var i=0; i<copies.length; i++) {
		placeholders[i].parentNode.replaceChild(copies[permutation[i]],placeholders[i]);
	}
	
}


// ============================================================================
//														 	Domain Object Model
// ============================================================================

var jmodel = function () {


	var external	= {},
		internal	= {entities:{}};
	
	
	
	// ------------------------------------------------------------------------
	// 																 Prototypes
	// ------------------------------------------------------------------------
	
	internal.EntityType = function (name,constructor,options) {

		options  		= options || {};
		
		this.options	= options;
		
		this.constructor = constructor;

		// Figure out the current type's base entity
		entity = this;
		while ( entity.options && ( entity.options.base !== true ) ) {
			entity = ( entity.options && entity.options.parent ) ? internal.entities[entity.options.parent] : null;
		}
		var base = entity.name || name;

		this.objects = new	internal.DomainObjectCollection(
								( base != name) ?
									{	base: 		internal.entities[base].objects,
										predicate: 	internal.InstancePredicate(constructor),
										ordering: 	options.ordering } :
									{	ordering: 	options.ordering }
							);
							
		this.deleted = new internal.DeletedObjectsCollection(this.objects);

		this.name	= name;


		this.object = function (criterion) {
			return internal.entities[base]
					.objects
						.filter(internal.InstancePredicate(constructor))
						.filter(( typeof criterion != 'string' ) ? internal.predicate(criterion) : null)
						.select(( typeof criterion == 'string' ) ? criterion : ':first');
		};


		this.create = function (data) {

			data = (typeof data == 'object') ? data : {};

			var newObject = new constructor();
			internal.DomainObject.call(newObject,internal.entities[name]);

			var primaryKey	= newObject.primaryKey;

			data[primaryKey] = data[primaryKey] || generateID();
			newObject.domain.init(data);
			internal.entities[base].objects.add(newObject)

			return newObject;

		};


		function generateID() {			
			return -(internal.entities[base].objects.count()+1);
		}
		

	};


	internal.getObjects = function (prototypeName) {
		return internal.entities[prototypeName].objects;
	};

	
	external.prototype = {
		
		register: function (name,constructor,options) {

			internal.entities[name]			= new internal.EntityType(name,constructor,options);

			var names = [name].concat( options.synonyms || [] );

			// NOTE: Make this handle synonyms more gracefully
			for ( var i in names ) {
				var synonym 										= names[i];
				internal.entities[synonym]							= internal.entities[name];
				external[synonym] 									= function (predicate) { return internal.entities[name].object(predicate); };
				external[synonym].entitytype						= internal.entities[name];
				external[synonym].extend							= function (prop) { return internal.entities[name].constructor.extend(prop); };
				external['create'+synonym]							= internal.entities[name].create;
				external[options.plural || synonym+'s']				= function (predicate) { return internal.entities[name].objects.filter(predicate); };
				external['deleted'+(options.plural || synonym+'s')]	= function (predicate) { return internal.entities[name].deleted.filter(predicate); };
			}

			return external.prototype;

		}
		
	};


	
	// ------------------------------------------------------------------------
	//																	Context
	// ------------------------------------------------------------------------
	
	external.context = {
	
		reset: 	function () {
					for ( var entityName in internal.entities ) {
						internal.entities[entityName].objects.remove(internal.AllPredicate());
					}
					return external.context;
				},
				
		checkpoint: function () {
						for ( var entityName in internal.entities ) {
							internal.entities[entityName].objects.each(function (index,object) {
								object.domain.dirty = false;
							});
							internal.entities[entityName].deleted.remove(internal.AllPredicate());
						}
						return external.context;
					}, 
				
		debug: 	function (showSubscribers) {
					var contents = '';
					for ( var entityName in internal.entities ) {
						contents += entityName+': ['+internal.entities[entityName].objects.debug(showSubscribers)
									+internal.entities[entityName].deleted.debug(false)+'] ';
					}
					return contents;
				}
		
	};
	
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------
	
	internal.NotificationQueue = function () {
		
		var	notifications 	= [],
			active			= true;
		
		this.send = function (notification) {
			if ( active ) {
				notification.receive();
			}
			else {
				notifications.push(notification);
			}
			return this;
		};
		
		this.suspend = function () {
			active = false;
			return this;
		};
		
		this.resume = function () {
			active = true;
			while ( notifications.length ) {
				notifications.shift().receive();
			}
			return this;
		};
		
		this.flush = function () {
			notifications = [];
			return this;
		};
		
	};
	
	internal.notifications = new internal.NotificationQueue();
	
	external.notifications = {
		
		suspend: 	function () {
						internal.notifications.suspend();
						return external.notifications;
					},
					
		resume: 	function () {
						internal.notifications.resume();
						return external.notifications;
					},
					
		flush: 		function () {
						internal.notifications.flush();
						return external.notifications;
					},
					
		push: 		function () {
						for(var prototypeName in internal.entities) {
							internal.entities[prototypeName].objects.each(function (index,object) {
								object.domain.push();
							});
						}
						return external.notifications;
					}
	
	};
	
	
	//
	// Notification types
	//
	
	internal.ContentNotification = function (subscription) {
		this.receive = function () {
			subscription.target.html(subscription.source.get(subscription.key));
		};	
	};
	
	internal.ValueNotification = function (subscription) {
		this.receive = function () {
			subscription.target.val(subscription.source.get(subscription.key));
		};
	};
	
	internal.MethodNotification = function (subscription) {
		this.receive = function () {
			subscription.method.call(subscription.target,subscription.source);
		};	
	};
	
	internal.EventNotification = function (subscription) {
		this.receive = function () {
			subscription.target.trigger(jQuery.Event(subscription.event),subscription.source);
		};
	};
	
	// NOTE: Should implement separate RemovalMethodNotification and RemovalEventNotification objects
	internal.RemovalNotification = function (subscription) {
		this.receive = function () {
			subscription.removed.call(subscription.target,subscription.source);
		};
	};
	
	internal.CollectionMethodNotification = function (subscription,event) {
		this.receive = function () {
			if (subscription[event.method] && event.permutation) {
				subscription[event.method].call(subscription.target,event.permutation);
			}
			else if (subscription[event.method]) {
				subscription[event.method].call(subscription.target,subscription.source,event.object);
			}
		};
	};
	
	internal.CollectionEventNotification = function (subscription,event) {
		this.receive = function () {
			// NOTE: Implement this
		};
	};
	
	// NOTE: Make this work with bindings
	internal.CollectionMemberNotification = function (subscription,event) {
		this.receive = function () {
			subscription.subscription.key = ( subscription.subscription.key instanceof Array ) ?
												subscription.subscription.key
												: [subscription.subscription.key];
			for (var i in subscription.subscription.key) {
				event.object.subscribe({
					source: event.object,
					target: subscription.subscription.target,
					key: subscription.subscription.key[i],
					change: subscription.subscription.change,
					initialise: subscription.subscription.initialise
				});
			}
		};
	};
	
	
	//
	// Subscription list
	//
	// This contains a list of subscription objects, each of which produces
	// notification objects when required and adds them to the notification
	// queue.
	//
	
	internal.SubscriptionList = function (notifications) {
		
		var subscribers = [];
		
		this.each = function (callback) {
			for(var index in subscribers) {
				callback(subscribers[index]);
			}
		};
		
		this.add = function (subscriber) {
			var found = false;
			for (var i in subscribers) {
				if ( subscribers[i] == subscriber ) {
					found = true;
					break;
				}
			}
			if ( !found ) {
				subscribers.push(subscriber);
			}
		};
		
		this.notify = function (event) {
			this.each(function (subscriber) {
				if ( subscriber.matches(event) ) {
					notifications.send(subscriber.notification(event));
				}
			});
		};
		
		this.debug = function () {
			return subscribers.length > 0 ? '{'+subscribers.length+' subscribers}' : '';
		}
		
	};
	
	
	internal.CollectionSubscriber = function (subscription) {
	
		// NOTE: Implement filters here
		this.matches = function (event) {
			if ( !subscription.filter ) {
				return true;
			}
			else {
				return subscription.filter(event);
			}
		};
	
		this.notification = function (event) {
			return new subscription.type(subscription,event);
		};
		
	};
	
	
	internal.ObjectSubscriber = function (subscription) {

		this.matches = function (event) {
			return ( event.removed && subscription.removed ) || ( event.key == subscription.key );
		};
		
		this.notification = function (event) {
			return new subscription.type(subscription,event);
		};
		
	};
	
	
	
	// ------------------------------------------------------------------------
	// 												   Domain Object Collection
	// ------------------------------------------------------------------------
	
	internal.DomainObjectCollection = function (specification) {
		
		specification = specification || {};
		if ( specification.ordering ) {
			specification.ordering = internal.ordering(specification.ordering);
		}
		
		this.objects		= specification.objects ? specification.objects : [];
		this.subscribers	= new internal.SubscriptionList(internal.notifications);
		
		var sorted = false;
		if ( specification.ordering ) {
			this.sort();
		}
		
		this.length = function () {
			return this.count();
		};
		
		this.count = function () {
			var count = 0;
			for ( var i in this.objects ) {
				count++;
			}
			return count;
		};
		
		this.get = function (id) {
			return this.objects[id];
		};
		
		this.add = function (object) {
			if ( this.filter(object).count() === 0 ) {
				this.objects.push(object);
				this.subscribers.notify({method:'add',object:object});
				object.subscribe({
					target: this,
					key: ':any',
					change: function (object) {
						sorted = false;
						this.subscribers.notify({
							method:'change',
							object:object
						}); 
					}		
				});
				sorted = false;
			}
		};
		
		this.first = function () {
			if ( !sorted ) { this.sort(); }
			return this.objects.length > 0 ? this.objects[0] : false;
		};
		
		// NOTE: Make this work on base collections
		this.remove = function (predicate) {
			predicate = internal.predicate(predicate) || internal.NonePredicate();
			var newObjects = [], that=this;
			this.each(function (index,object) {
				if ( predicate(object) ) {
					object.removed();
					that.subscribers.notify({method:'remove',object:object});
				}
				else {
					newObjects.push(object);
				}
			});
			this.objects = newObjects;
			return this;
		};
		
		this.by = function () {
			var ordering = internal.ordering.apply(null,arguments);
			var ordered = [];
			this.each(function (index,object) {
				ordered.push(object);
			});
			ordered.sort(ordering);
			return new internal.DomainObjectCollection({objects:ordered});
		};
		
		
		this.sort = function () {
			
			if (arguments.length > 0) {
				specification.ordering = internal.ordering.apply(null,arguments);
			}
			
			// Remember old order
			for(var i=0; i<this.objects.length; i++) {
				this.objects[i].domain.position = i;
			}
			
			// Sort
			this.objects.sort(specification.ordering);
			
			// Find permutation
			var permutation = [];
			for(var i=0; i<this.objects.length; i++) {
				permutation[i] = this.objects[i].domain.position;
			}
			
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
				this.subscribers.notify({method:'sort',permutation:permutation});
			}
			
			sorted = true;
			
			return this;
			
		}
		
		this.each = function (callback) {
			if ( !sorted ) { this.sort(); }
			for(var index in this.objects) {
				callback.call(this.objects[index],index,this.objects[index]);
			}
			return this;
		};
		
		this.map = function (mapping,mapped) {
			if ( !sorted ) { this.sort(); }
			mapped = mapped || [];
			for(var index in this.objects) {
				mapped.push(mapping(this.objects[index]));
			}
			return mapped;
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
			
			var selector,predicate;

			if ( arguments.length === 0 ) {
				return this;
			}
			else if ( arguments.length == 1 && ( typeof arguments[0] == 'string' ) ) {
				predicate 	= null;
				selector	= arguments[0];
			}
			else {
				predicate	= internal.predicate(arguments[0]);
				selector	= arguments[1];
			}
			
			if ( predicate && predicate !== null && (typeof predicate != 'undefined') ) {
				var objs = new internal.DomainObjectCollection({});
				this.each(function (index,object) {
					if ( predicate(object) ) {
						objs.add(object);
					}
				});
				return objs.select(selector);
			}
			else {
				return this.select(selector);
			}
			
		};
		
		
		this.debug = function (showSubscribers) {
			var contents = '';
			for ( var i in this.objects ) {
				var obj = this.objects[i];
				contents += ' '+obj.primaryKeyValue()+' ';
			}
			if ( showSubscribers ) {
				contents += ' '+this.subscribers.debug()+' ';
			}
			return contents;
		};
		
		this.subscribe = function (subscription) {

			if ( subscription.predicate || subscription.selector ) {
				subscription.type	= 	internal.CollectionMemberNotification;
				subscription.filter = 	function (collection) {
											return function (event) {
												return collection.filter(subscription.predicate).select(subscription.selector) === event.object
														&& event.method == 'add'; // NOTE: Fix this
											};
										}(this);							
			}
			else if ( ( typeof onAdd == 'string' ) && ( typeof onRemove == 'string' ) ) {
				subscription.type	= internal.CollectionEventNotification;
			}
			else {
				subscription.type	= internal.CollectionMethodNotification; 
			}
			
			this.subscribers.add( new internal.CollectionSubscriber(subscription) );
			
			return this;	
			
		};
		
		
		// Set methods
		
		this.union = function () {
			return external.union.apply(null,argumentsArray.apply(this,arguments));
		};
		
		this.intersection = function () {
			return external.intersection.apply(null,argumentsArray.apply(this,arguments));
		};
		
		this.difference = function (set) {
			return external.difference(this,set);
		};
		
		
		// Note carefully that argumentsArray includes the current collection in the array
		function argumentsArray() {
			var args = [this];
			for (var i=0; i<arguments.length; i++) {
				args.push(arguments[i]);
			}
			return args;
		}
		
		// This collection is a materialised view over a base collection
		if ( specification.base instanceof this.constructor ) {
			var view = new internal.View(specification.base,this,specification.predicate);
		}
		else if ( specification.base ) {
			throw 'Error: Invalid base collection type';
		}
		
		
	};
	
	
	external.set = function() {
		var objects = [];
		for (var i=0; i<arguments.length; i++) {
			objects.push(arguments[i]);
		}
		return new internal.DomainObjectCollection({objects:objects});
	};
	
	
	internal.DeletedObjectsCollection = function (collection) {
		
		var deleted = new internal.DomainObjectCollection();
		
		deleted.debug = function () {
			var contents = '';
			for ( var i in this.objects ) {
				var obj = this.objects[i];
				contents += ' ('+obj.primaryKeyValue()+') ';
			}
			return contents;
		};
		
		collection.subscribe({
			source: collection,
			target: deleted,
			remove: collectionRemove
		});
		
		function collectionRemove(collection,object) {
			deleted.add(object);
		}
		
		return deleted;
		
	};
	
	
	internal.View = function (parent,child,predicate) {
		
		predicate = internal.predicate(predicate);
		
		parent.each(function (index,object) {
			if ( predicate(object) ) {
				child.add(object);
			}
		});
		
		parent.subscribe({
			source: parent,
			target: child,
			add: 	parentAdd,
			remove: parentRemove,
			change: parentChange
		});
		
		function parentAdd(collection,object) {
			if ( predicate(object) ) {
				child.add(object);
			}
		};
		
		function parentRemove(collection,object) {
			child.remove(object);
		};
		
		function parentChange(collection,object) {
			// Object sometimes null here
			if ( predicate(object) ) {
				child.add(object);
			}
			else {
				child.remove(object);
			}
		};
		
	};
	
	
	// ------------------------------------------------------------------------
	//															 Set operations
	// ------------------------------------------------------------------------
	
	internal.set = function(set) {
		return (set instanceof internal.DomainObjectCollection) ? set : set();
	};
	
	external.union = function() {
		var union = new internal.DomainObjectCollection({});
		for (var i=0; i<arguments.length; i++ ) {
			var collection = internal.set(arguments[i]);
			collection.each(function (index,object) {
				if ( union.filter(object).count() == 0 ) {
					union.add(object);
				}
			});
		}
		return union;
	};
	
	external.intersection = function() {
		var intersection = internal.set(arguments[0]);
		for (var i=1; i<arguments.length; i++ ) {
			intersection = intersection.filter(internal.MembershipPredicate(internal.set(arguments[i])));
		}
		return intersection;
	};
	
	external.difference = function(first,second) {
		return internal.set(first).filter(
			internal.Not(
				internal.MembershipPredicate(internal.set(second))
			)
		);
	};
	
	
	// ------------------------------------------------------------------------
	//														   		  Orderings
	// ------------------------------------------------------------------------
	
	external.ordering = internal.ordering = function () {
		if ( arguments.length > 1 ) {
			return internal.CompositeOrdering.apply(null,arguments);
		}
		else if ( arguments[0] instanceof Array ) {
			return internal.CompositeOrdering(arguments[0]);
		}
		else if ( typeof arguments[0] == 'function' ) {
			return arguments[0];
		}
		else {
			var pieces = arguments[0].split(' ');
			if ( pieces.length === 1 || pieces[1].toLowerCase() != 'desc' ) {
				return internal.FieldOrdering(pieces[0]);
			}
			else {
				return internal.DescendingOrdering(internal.FieldOrdering(pieces[0]));
			}
		}
	};
	
	external.field = internal.FieldOrdering = function (fieldName,getter) {
		
		return function (a,b) {
			if ( a.get(fieldName) < b.get(fieldName) ) {
				return -1;
			}
			else if ( a.get(fieldName) > b.get(fieldName) ) {
				return 1;
			}
			return 0;
		};
	};
	
	external.score = internal.PredicateOrdering = function () {
		
		var predicates = internal.arrayFromArguments(arguments);
		
		function numberMatches(object) {
			var matches = 0;
			for (var i=0; i<predicates.length; i++) {
				matches += predicates[i](object) ? 1 : 0;
			}
			return matches;
		}
		
		return function (a,b) {
			return numberMatches(b)-numberMatches(a);
		};
		
	};
	
	external.path = internal.FieldPathOrdering = function (fieldpath) {
		
		function getFieldValue(object,path) {
			var property, value;
			for (var i=0; i<path.length; i++) {
				property = path[i];
				value = object[property]();
				if ( !(typeof value == 'object') ) {
					return value
				}
				else {
					object = value instanceof internal.DomainObjectCollection ? value.first() : value;
				}
			}
			return 0;
		}
		
		return function (a,b) {
			if ( getFieldValue(a,fieldpath) < getFieldValue(b,fieldpath) ) {
				return -1;
			}
			else if ( getFieldValue(a,fieldpath) > getFieldValue(b,fieldpath) ) {
				return 1;
			}
			return 0;
		};
		
	}
	
	external.desc = internal.DescendingOrdering = function (ordering) {
		ordering = internal.ordering(ordering);
		return function (a,b) {
			return -ordering(a,b);
		};
	};
	
	external.composite = internal.CompositeOrdering = function () {
		var orderings = internal.arrayFromArguments(arguments);
		for (var i=0; i<orderings.length; i++) {
			orderings[i] = internal.ordering(orderings[i]);
		}
		return function (a,b) {
			for (var i=0; i<orderings.length; i++) {
				var value = orderings[i](a,b);
				if ( value !== 0 ) {
					return value;
				}
			}
			return 0;
		};
	};
	
	
	
	// ------------------------------------------------------------------------
	// 																 Predicates
	// ------------------------------------------------------------------------
	
	external.predicate = internal.predicate = function (parameter) {
		if ( typeof parameter == 'function' ) {
			return parameter;
		}
		else if ( parameter && parameter.domain ) {
			return internal.ObjectIdentityPredicate(parameter);
		}
		else if ( typeof parameter == 'object' && parameter !== null ) {
			return internal.ExamplePredicate(parameter);
		} 
		else if ( typeof parameter == 'number' ) {
			return internal.IdentityPredicate(parameter);
		}
		return null;
	};
	
	// All
	
	internal.AllPredicate = function () {
		return function (candidate) {
			return true;
		};
	};
	
	external.all = internal.AllPredicate();
	
	// None
	
	internal.NonePredicate = function () {
		return function (candidate) {
			return false;
		};
	};
	
	external.none = internal.NonePredicate();
	
	// Object Identity
	
	external.is = internal.ObjectIdentityPredicate = function (object) {
		return function (candidate) {
			return candidate === object;
		};
	};
	
	// Primary Key Identity
	
	external.id = internal.IdentityPredicate = function (id) {
		return function (candidate) {
			return candidate.primaryKeyValue() == id;
		};		
	};
	
	// Generic function
	
	external.test = internal.FunctionPredicate = function (fn) {
		return function (candidate) {
			return fn(candidate);
		};
	};
	
	// Example
	
	external.example = internal.ExamplePredicate = function (example) {
		return function (candidate) {
			
			var exampleForeignKeys = [];

			for( var key in example ) {

				if ( typeof example[key] == 'object' && typeof candidate[key] == 'function' ) { // Some kind of foreign key
					exampleForeignKeys.push(key);
				}
				else if ( example[key] instanceof RegExp && !example[key].test(candidate.get(key)) ) {
					return false;
				}
				else if ( !(example[key] instanceof RegExp) && candidate.get(key) != example[key] ) { // Scalar field
					return false;
				}

				for( var index in exampleForeignKeys ) {
					var exampleForeignKey = exampleForeignKeys[index];
					var children = candidate[exampleForeignKey]();
					var collection = children.length ? children : new internal.DomainObjectCollection({objects:[children]});
					if ( collection.filter(example[exampleForeignKey]).length() === 0 ) {
						return false;
					}
				}

			}
			
			return true;
			
		};		
	};
	
	// Instance
	
	external.isa = internal.InstancePredicate = function (constructor) {
		constructor = constructor.entitytype ? constructor.entitytype.constructor : constructor;
		return function (candidate) {
			return candidate instanceof constructor;
		};
	};
	
	// Relationship
	
	external.related = internal.RelationshipPredicate = function (parent,field) {
		return function (candidate) {
			return candidate.get(field) == parent.primaryKeyValue();
		};
	};
	
	// Membership
	
	external.member = internal.MembershipPredicate = function (collection) {		
		collection = internal.set(collection);
		return function (candidate) {
			return collection.filter(internal.ObjectIdentityPredicate(candidate)).count() > 0;
		};
	};
	
	// Modification state
	
	external.dirty = internal.ModifiedPredicate = function () {
		return function (candidate) {
			return candidate.domain.dirty;
		};
	};	
	
	// Comparisons
	
	external.eq = internal.Eq = function (field,value) {
		return function (candidate) {
			return candidate.get(field) == value;
		};
	};
	
	external.lt = internal.Lt = function (field,value) {
		return function (candidate) {
			return candidate.get(field) < value;
		};
	};
	
	external.gt = internal.Gt = function (field,value) {
		return function (candidate) {
			return candidate.get(field) > value;
		};
	};
	
	external.lte = internal.LtE = function (field,value) {
		return internal.Not(internal.Gt(field,value));
	};
	
	external.gte = internal.GtE = function (field,value) {
		return internal.Not(internal.Lt(field,value));
	};
	
	external.between = function (field,lower,higher) {
		return internal.And(
					internal.Gt(field,lower),
					internal.Lt(field,higher) 
				);
	};
	
	// Logical connectives
	
	external.or = internal.Or = function () {
		var predicates = internal.arrayFromArguments(arguments);
		return function (candidate) {
			for (var i=0; i<predicates.length; i++) {
				if (predicates[i](candidate)) {
					return true;
				}
			}
			return false;
		};
	};
	
	external.and = internal.And = function () {
		var predicates = internal.arrayFromArguments(arguments);
		return function (candidate) {
			for (var i=0; i<predicates.length; i++) {
				if (!(predicates[i](candidate))) {
					return false;
				}
			}
			return true;
		};
	};
	
	external.not = internal.Not = function (predicate) {
		return function (candidate) {
			return !predicate(candidate);
		};
	};
	
	// Utility function used by And and Or.
	internal.arrayFromArguments = function (args) {
		if ( args[0] instanceof Array ) {
			return args[0];
		}
		else {
			var args2 = [];
			for (var i=0; i<args.length;i++) {
				args2.push(args[i]);
			}
			return args2;
		}
	};
		
	
	
	// ------------------------------------------------------------------------
	// 														Domain Object mixin
	// ------------------------------------------------------------------------
	
	internal.DomainObject = function (entitytype) {
		
		
		var data 		= {},
			subscribers = new internal.SubscriptionList(internal.notifications);
			
		
		this.get = function () {
		
			if ( arguments[0] == ':all' ) {
				return data;
			}
			else if ( !(arguments[0] instanceof Array) ) { // Just a key
				return data[arguments[0]];
			}
			else { // Array of keys
				var keys = arguments[0];
				var values = {};
				for ( var key in keys ) {
					values[keys[key]] = this.get(keys[key]);
				}
				return values;
			}
	
		};
		
		
		this.set = function () {
			
			var key;

			if ( arguments.length == 2 || arguments.length == 3 ) {  // Arguments are key and value
				key = arguments[0];
				var value = arguments[1];
				data[key] = value;
				subscribers.notify({key:key});
				if ( arguments.length == 2 || arguments[2] ) {
					subscribers.notify({key:':any'});
				}
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				var mappings = arguments[0];
				for ( key in mappings ) {
					this.set(key,mappings[key],false);
				}
				subscribers.notify({key:':any'});
			}

			this.domain.dirty = true;

			return this;
	
		};
		
		
		this.removed = function (collection) {
			subscribers.notify({removed:true});
		};
		
		
		this.subscribe = function (subscription) {

			subscription.source = this;

			if ( subscription.removed ) {
				subscription.type		= internal.RemovalNotification;
			}
			else if ( subscription.change && typeof subscription.change == 'string' ) {
				subscription.type		= internal.EventNotification;
				subscription.event		= subscription.change;
			}
			else if ( subscription.change && typeof subscription.change == 'function' ) {
				subscription.type		= internal.MethodNotification;
				subscription.method		= subscription.change;
			}
			else if ( subscription.target.is('input:input,input:checkbox,input:hidden,select') ) {
				subscription.type = internal.ValueNotification;
			}
			else {
				subscription.type = internal.ContentNotification;
			}

			var subscriber = new internal.ObjectSubscriber(subscription);

			subscribers.add(subscriber);

			if ( subscription.initialise ) {
				internal.notifications.send(subscriber.notification({key:subscription.key}));
			}

			return this;

		};
		
		
		this.primaryKeyValue = function () {
			return this.get(this.primaryKey);
		};
		
		
		this.matches = function (predicate) {
			return predicate(this);
		};
		
		
		this.domain = function () {
			
			that = this;
			
			function reifyFields () {

				for ( var i in that.fields ) {

					var field = that.fields[i];

					that.set(field.accessor,field.defaultValue);

					that[field.accessor] = 	function (field) {
						 						return function () {
													return this.get(field);
												};
											}(field.accessor);

					that['set'+field.accessor]	=	function (field) {
														return function (value) {
															return this.set(field,value);
														};
													}(field.accessor); 

				}

			};
			
			function reifyRelationships() {

				that.hasOne			= that.hasOne || [];
				that.hasMany		= that.hasMany || [];
				that.relationships	= that.relationships || {};

				var i, descriptor, relationship;

				for ( i in that.hasOne ) {
					descriptor = that.hasOne[i];
					relationship 							= new internal.OneToOneRelationship(that,descriptor);
					that.relationships[descriptor.accessor] = relationship;
					that[descriptor.accessor] 				= function (relationship) {return relationship.get;}(relationship);
					that['add'+descriptor.accessor]			= function (relationship) {return relationship.add;}(relationship);
				}

				for ( i in that.hasMany ) {
					descriptor = that.hasMany[i];
					relationship											= new internal.OneToManyRelationship(that,descriptor);
					that.relationships[descriptor.accessor] 				= relationship;
					that[(descriptor.plural || descriptor.accessor+'s')] 	= function (relationship) {return relationship.get;}(relationship);
					that['add'+descriptor.accessor]							= function (relationship) {return relationship.add;}(relationship);
					that['remove'+descriptor.accessor]						= function (relationship) {return relationship.remove;}(relationship);
					that['debug'+descriptor.accessor]						= function (relationship) {return relationship.debug;}(relationship);
				}

			};
			
			return {
				
				dirty: false,
				
				init: function (initialData) {
					reifyFields();
					reifyRelationships();
					return that.set(initialData).domain.clean();
				},
				
				clean: function () {
					that.domain.dirty = false;
					return that;
				},
						
				push: function () {
					for (var i in data) {
						subscribers.notify({key:i});
					}
				},
						
				debug: function (showSubscribers) {
					var fields = '';
					for ( var i in data ) {
						fields += i + ':'+data[i]+' ';
					}
					if ( showSubscribers ) {
						fields += ' '+subscribers.debug()+' ';
					} 
					return fields;
				}
				
			};
			
		}.call(this);
		

	};
	
	
	
	// ------------------------------------------------------------------------
	// 															  Relationships
	// ------------------------------------------------------------------------
	
	internal.OneToOneRelationship = function (parent,relationship) {
		
		this.get = function (create) {
			var child = internal.entities[relationship.prototype].object(parent.get(relationship.field));
			if ( child ) {
				return child;
			}
			else if ( create ) {
				return this.add();
			}
		};
		
		this.add = function (data) {
			
			data = data || {};
			var newObject = internal.entities[relationship.prototype].create(data);
			
			parent.set(relationship.field, newObject.primaryKeyValue());
			
			return newObject;
			
		};
		
	};
	
	
	internal.OneToManyRelationship = function (object,relationship) {
		
		relationship.direction	= 'reverse';

		var children			= new internal.DomainObjectCollection({
											base: 		internal.entities[relationship.prototype].objects,
											predicate: 	internal.RelationshipPredicate(object,relationship.field)
										});
		
		// Deletions might cascade								
		if ( relationship.cascade ) {
			object.subscribe({
				removed: 	function () {
								children.each(function (index,child) {
									internal.entities[relationship.prototype].objects.remove(child);
								});
							}
			});
		}
		
		// Relationship might specify subscription to children								
		if ( relationship.onAdd || relationship.onRemove || relationship.onChange ) {
			var subscription = {
				source: children,
				target: object
			};
			if ( relationship.onAdd)    { subscription.add    = relationship.onAdd;	   }
			if ( relationship.onRemove) { subscription.remove = relationship.onRemove; }
			if ( relationship.onChange) { subscription.change = relationship.onChange; }
			children.subscribe(subscription);
		}
		
		this.get = function (predicate,selector) {
			return children.filter(predicate).select(selector);
		};
		
		// NOTE: Should this work with arrays of objects too?
		this.add = function (data) {
			
			data = data || {};
			data[relationship.field] = object.primaryKeyValue();
			return internal.entities[relationship.prototype].create(data);
			
		};
		
		this.remove = function (id) {
			
			internal.entities[relationship.prototype].objects.remove(id);
			return this;
			
		};
		
		this.debug = function () {
			return children.debug();
		};
		
	};
	
	
	
	// ------------------------------------------------------------------------
	// 																	   JSON
	// ------------------------------------------------------------------------
	
	external.json = function () {
		
		
		function makeObject (key,data,parent) {
			
			var partitionedData = partitionData(data), object;
			
			if ( parent && parent.relationships[key] ) {
				object = parent.relationships[key].add(partitionedData.fields);
			}
			else {
				if ( internal.entities[key] ) {
					object = internal.entities[key].create(partitionedData.fields);
				}
			}
			
			for ( var childKey in partitionedData.children ) {
				var childData = partitionedData.children[childKey];
				childData = ( childData instanceof Array ) ? childData : [childData];
				for ( var i=0; i<childData.length; i++) {
					makeObject(childKey,childData[i],object||parent);
				}
			}

		}
		
		
		function partitionData (data) {
			
			var partitioned = { fields:{}, children:{} };
			
			for ( var key in data ) {
				if ( !(typeof data[key] == 'object') ) {
					partitioned.fields[key] = data[key];
				}
				else {
					partitioned.children[key] = data[key];
				}
			}
			
			return partitioned;
			
		}
		
		
		return {
			
			thaw: 	function (data,options) {
						options = options || {};
						data = ( data instanceof Array ) ? data : [data];
						for ( var i in data ) {
							for ( var key in data[i] ) {
								makeObject(key,data[i][key],options.parent);
							}
						}
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
	// 																	Fluency 
	// ------------------------------------------------------------------------
	
	external.prototype.context			= external.context;
	external.prototype.notifications	= external.notifications;
	external.prototype.json				= external.json;
	
	external.context.prototype			= external.prototype;
	external.context.notifications		= external.notifications;
	external.context.json				= external.json;
	
	external.notifications.prototype	= external.prototype;
	external.notifications.context		= external.context;
	external.notifications.json			= external.json;
	
	external.json.prototype				= external.prototype;
	external.json.context				= external.context;
	external.json.notifications			= external.notifications;
	
	return external;
	
}();

if (!_) {
	var _=jmodel;
}