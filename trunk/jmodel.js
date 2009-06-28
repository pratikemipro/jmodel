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


// ============================================================================
//														 	Domain Object Model
// ============================================================================

var _ = function () {


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
										predicate: 	internal.InstancePredicate(constructor) } :
									{}
							);
							
		this.deleted = new internal.DeletedObjectsCollection(this.objects);

		this.name	= name;


		this.object = function (criterion) {
			return internal.entities[base]
					.objects
						.filter(internal.InstancePredicate(constructor))
						.filter(( typeof criterion != 'string' ) ? internal.IdentityPredicate(criterion) : null)
						.select(( typeof criterion == 'string' ) ? criterion : ':first');
		};


		this.create = function (data) {

			data = (typeof data == 'object') ? data : {};

			var newObject = new constructor();
			internal.DomainObject.call(newObject,internal.entities[name]);

			var primaryKey	= newObject.primaryKey;

			data[primaryKey] = data[primaryKey] || generateID();

			set(data[primaryKey],newObject); // Must do this before parsing JSON data or else generated keys are all identical

			newObject.domain.init(data);

			// To trigger subscribers
			set(data[primaryKey],newObject);

			return newObject;

		};


		function set (id,object) {
			internal.entities[base].objects.set(id,object);
		}


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
						internal.entities[entityName].objects.remove(external.all);
					}
					return external.context;
				},
				
		checkpoint: function () {
						for ( var entityName in internal.entities ) {
							internal.entities[entityName].objects.each(function (index,object) {
								object.domain.dirty = false;
							});
							internal.entities[entityName].deleted.remove(external.all);
						}
						return external.context;
					}, 
				
		debug: 	function () {
					var contents = '';
					for ( var entityName in internal.entities ) {
						contents += entityName+': ['+internal.entities[entityName].objects.debug()
									+internal.entities[entityName].deleted.debug()+'] ';
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
			if (subscription[event.method]) {
				subscription[event.method].call(subscription.target,subscription.source,event.object);
			}
		};
	};
	
	internal.CollectionEventNotification = function (subscription,event) {
		this.receive = function () {
			// NOTE: Implement this
		};
	};
	
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
		
		this.objects		= specification.objects ? specification.objects : {};
		this.subscribers	= new internal.SubscriptionList(internal.notifications);

		if ( specification.base instanceof this.constructor ) { // This collection is a materialised view over a base collection
			var view = new internal.View(specification.base,this,specification.predicate);
		}
		else if ( specification.base ) {
			throw 'Error: Invalid base collection type';
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
		
		this.set = function (id,value,immediate) {
			// NOTE: Work out why this is sometimes called with invalid id
			if ( id ) {
				var method = this.objects[id] ? 'change' : 'add';
				this.objects[id] = value;
				this.subscribers.notify({method:method,object:value});
			}
		};
		
		this.first = function () {
			for ( var i in this.objects ) {
				return this.objects[i];
			}
			return false;
		};
		
		// NOTE: Make this work on base collections
		this.remove = function (predicate,immediate) {
			// NOTE: Move this into filtering
			if ( predicate.domain ) {
				predicate = internal.ObjectIdentityPredicate(predicate);
			}
			else if ( typeof predicate != 'function' ) {
				predicate = internal.IdentityPredicate(predicate);
			}
			var that = this;
			this.filter(predicate).each(function (key,object) {
				var removed = object;
				delete that.objects[key];
				removed.removed();
				that.subscribers.notify({method:'remove',object:removed});
			});
			return this;
		};
	
		
		this.each = function (callback) {
			for(var index in this.objects) {
				callback.call(this.objects[index],index,this.objects[index]);
			}
			return this;
		};
		
		
		this.map = function (mapping,mapped) {
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
			
			// No predicate
			if ( ( arguments.length === 0 ) || ( arguments[0] === internal.AllPredicate ) ) {
				return this;
			}
			
			var selector;
			
			if ( typeof arguments[0] == 'function' || typeof arguments[0] == 'undefined' ) {
				var predicate	= arguments[0];
				selector		= arguments[1];
			}
			else {
				selector 		= arguments[0];
			}
			
			if ( predicate && predicate !== null && (typeof predicate != 'undefined') ) {
				var objs = new internal.DomainObjectCollection({});
				this.each(function (index,object) {
					if ( predicate(object) ) {
						objs.set(index,object);
					}
				});
				return objs.select(selector);
			}
			else {
				return this.select(selector);
			}
			
		};
		
		this.debug = function () {
			var contents = '';
			for ( var i in this.objects ) {
				var obj = this.objects[i];
				contents += ' '+obj.primaryKeyValue()+' ';
			}
			return contents;
		};
		
		this.subscribe = function (subscription) {

			if ( subscription.predicate || subscription.selector ) {
				subscription.type	= 	internal.CollectionMemberNotification;
				subscription.filter = 	function (collection) {
											return function (event) {
												return collection.filter(subscription.predicate, subscription.selector) === event.object
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
		
		
	};
	
	
	external.set = function() {
		var objects = {};
		for (var i=0; i<arguments.length; i++) {
			objects[arguments[i].primaryKeyValue()] = arguments[i];
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
			deleted.set(object.primaryKeyValue(), object);
		}
		
		return deleted;
		
	};
	
	
	internal.View = function (parent,child,predicate) {
		
		parent.each(function (index,object) {
			if ( predicate(object) ) {
				child.set(object.primaryKeyValue(), object, true);
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
				child.set(object.primaryKeyValue(), object, true);
			}
		};
		
		function parentRemove(collection,object) {
			child.remove(object,true);
		};
		
		function parentChange(collection,object) {
			if ( predicate(object) ) {
				child.set(object.primaryKeyValue(), object,true);
			}
			else {
				if ( object.primaryKeyValue() in child.objects ) {
					child.remove(object,true);
				}
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
				union.set(object.primaryKeyValue(),object);
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
	// 																 Predicates
	// ------------------------------------------------------------------------
	
	// All
	
	external.all = internal.AllPredicate = function () {
		return function (candidate) {
			return true;
		};
	};
	
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
					entitytype.objects.subscribers.notify({
						method:'change',
						object:this
					});
				}

			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings

				var mappings = arguments[0];
				for ( key in mappings ) {
					this.set(key,mappings[key],false);
				}
				entitytype.objects.subscribers.notify({
					method:'change',
					object:this
				});

			}

			this.domain.dirty = true;

			return this;
	
		};
		
		
		this.removed = function () {
			subscribers.notify({removed:true});
		};
		
		
		this.subscribe = function (subscription) {

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
					that[descriptor.accessor] 				= relationship.get;
					that['add'+descriptor.accessor]			= relationship.add;
				}

				for ( i in that.hasMany ) {
					descriptor = that.hasMany[i];
					relationship											= new internal.OneToManyRelationship(that,descriptor);
					that.relationships[descriptor.accessor] 				= relationship;
					that[(descriptor.plural || descriptor.accessor+'s')] 	= relationship.get;
					that['add'+descriptor.accessor]							= relationship.add;
					that['remove'+descriptor.accessor]						= relationship.remove;
					that['debug'+descriptor.accessor]						= relationship.debug;
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
						
				debug: function () {
					var fields = '';
					for ( var i in data ) {
						fields += i + ':'+data[i]+' ';
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
			return children.filter(predicate,selector);
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