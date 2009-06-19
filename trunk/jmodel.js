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
	else { // Subscription to collection
		
		return this.each(function (index,element) {
			subscription.source.subscribe({
				source: subscription.source,
				target: jQuery(element),
				add: subscription.onAdd,
				remove: subscription.onRemove,
				change: subscription.onChange,
				initialise: subscription.initialise,
				filter: subscription.filter,
				selector: subscription.selector,
				key: subscription.key
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


	var entities	= {},
		external	= {},
		internal	= {},
		$			= jQuery;
	
	
	
	// ------------------------------------------------------------------------
	// 																 Prototypes
	// ------------------------------------------------------------------------
	
	internal.EntityType = function (name,constructor,options) {

		options  		= options || {};
		this.options	= options;

		// Figure out the current type's base entity
		entity = this;
		while ( entity.options && ( entity.options.base !== true ) ) {
			entity = ( entity.options && entity.options.parent ) ? entities[entity.options.parent] : null;
		}
		var base = entity.name || name;

		var descriptor = 	( base != name) ? 	{
								base: 		entities[base].objects,
								predicate: 	new internal.InstancePredicate(constructor)
							} : {}; 

		var objects 			= new internal.DomainObjectCollection(descriptor);

		this.objects 			= objects;
		this.name				= name;


		this.object = function (criterion) {
			
			var selector  = ( typeof criterion == 'string' ) ? criterion : ':first';
			var predicate = ( typeof criterion != 'string' ) ? new internal.IdentityPredicate(criterion) : null;
			
			return entities[base].objects.filter(new internal.InstancePredicate(constructor)).filter(predicate).select(selector);

		};


		this.create = function (data) {

			data = (typeof data == 'object') ? data : {};

			var newObject = mixin(
								new internal.DomainObject(this),
								new constructor()
							);

			var primaryKey	= newObject.primaryKey;

			if ( !data[primaryKey] ) {
				data[primaryKey] = generateID();
			}

			set(data[primaryKey],newObject); // Must do this before parsing JSON data or else generated keys are all identical

			newObject.initDomain(data);

			// To trigger subscribers
			set(data[primaryKey],newObject);

			return newObject;

		};


		function set (id,object) {
			entities[base].objects.set(id,object);
		}


		function generateID() {			
			return -(entities[base].objects.count()+1);
		}
		
		
		function mixin(donor,recipient) {
			for (var prop in donor) {
				if ( donor[prop] instanceof Array && recipient[prop] instanceof Array ) { // Need to merge arrays
					recipient[prop] = recipient[prop].concat(donor[prop]);
				}
				else {
					recipient[prop] = donor[prop];	
				}	
			}
			return recipient;
		}


	};


	internal.getObjects = function (prototypeName) {
		return entities[prototypeName].objects;
	};

	
	external.prototype = {
		
		register: function (name,constructor,options) {

			entities[name] = new internal.EntityType(name,constructor,options);

			var names = [name].concat( options.synonyms || [] );

			// NOTE: Make this handle synonyms more gracefully
			for ( var i in names ) {
				var synonym 							= names[i];
				entities[synonym]						= entities[name];
				external[synonym] 						= function (predicate) { return entities[name].object(predicate); };
				external['create'+synonym]				= entities[name].create;
				external[options.plural || synonym+'s']	= function (predicate) { return entities[name].objects.filter(predicate); };
			}

			return external.prototype;

		}
		
	};


	
	// ------------------------------------------------------------------------
	//																	Context
	// ------------------------------------------------------------------------
	
	external.context = {
	
		reset: 	function () {
					for ( var entityName in entities ) {
						entities[entityName].objects.each(function (index,object) {
							entities[entityName].objects.remove(object.primaryKeyValue());
						});
					}
					return external.context;
				},
				
		checkpoint: function () {
						for ( var entityName in entities ) {
							entities[entityName].objects.each(function (index,object) {
								entities[entityName].objects.dirty = false;
							});
						}
						return external.context;
					}, 
				
		debug: 	function () {
					var contents = '';
					for ( var entityName in entities ) {
						contents += entityName+': ['+entities[entityName].objects.debug()+'] ';
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
						for(var prototypeName in entities) {
							entities[prototypeName].objects.each(function (index,object) {
								object.pushNotifications();
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
			subscription.key = ( subscription.key instanceof Array ) ? subscription.key : [subscription.key];
			for (var i in subscription.key) {
				event.object.subscribe({
					source: event.object,
					target: subscription.target,
					key: subscription.key[i],
					change: subscription.change
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
			return event.key == subscription.key;
		};
		
		this.notification = function (event) {
			return new subscription.type(subscription,event);
		};
		
	};
	
	
	
	// ------------------------------------------------------------------------
	// 												   Domain Object Collection
	// ------------------------------------------------------------------------
	
	internal.DomainObjectCollection = function (specification) {
		
		this.objects		= specification.objects ? specification.objects : [];
		this.subscribers	= new internal.SubscriptionList(internal.notifications);

		
		this.length = function () {
			return this.objects.length;
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
			var method = this.objects[id] ? 'change' : 'add';
			this.objects[id] = value;
			this.subscribers.notify({method:method,object:value});
		};
		
		this.first = function () {
			for ( var i in this.objects ) {
				return this.objects[i];
			}
			return false;
		};
		
		this.remove = function (predicate,immediate) {
			predicate = (typeof predicate == 'object') ? predicate : new internal.IdentityPredicate(predicate);
			var that = this;
			this.filter(predicate).each(function (key,object) {
				var removed = object;
				delete that.objects[key];
				that.subscribers.notify({method:'remove',object:removed});
			});
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
			if ( arguments.length === 0 ) {
				return this;
			}
			
			var selector;
			
			if ( typeof arguments[0] == 'object' ) {
				var predicate	= arguments[0];
				selector		= arguments[1];
			}
			else {
				selector 		= arguments[0];
			}
			
			if ( predicate && predicate !== null ) {
				var objs = new internal.DomainObjectCollection({});
				this.each(function (index,object) {
					if ( predicate.test(object) ) {
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
				if ( obj.data ) {
					contents += ' '+obj.primaryKeyValue()+' ';
				}
			}
			return contents;
		};
		
		this.subscribe = function (subscription) {

			if ( subscription.selector ) {
				subscription.type	= 	internal.CollectionMemberNotification;
				subscription.filter = 	function (collection) {
											return function (event) {
												return collection.filter(subscription.selector) === event.object;
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
		
		
		if ( specification.base instanceof this.constructor ) { // This collection is a materialised view over a base collection
			
			var that = this;
			specification.base.each(function (key,candidate) {
				if ( specification.predicate.test(candidate) ) {
					that.set(candidate.primaryKeyValue(), candidate, true);
				}
			});
			
			specification.base.subscribe({
				source: specification.base,
				target: this,
				add: 	baseAdd,
				remove: baseRemove,
				change: baseChange
			});
			
		}
		else if ( specification.base ) {
			throw 'Error: Invalid base collection type';
		}
		
		
		// Subcollection methods
		
		function baseAdd(collection,object) {
			if ( specification.predicate.test(object) ) {
				this.set(object.primaryKeyValue(), object, true);
			}
		}
		
		function baseRemove(collection,object) {
			this.remove(object.primaryKeyValue(),true);
		}
		
		function baseChange(collection,object) {
			if ( specification.predicate.test(object) ) {
				this.set(object.primaryKeyValue(), object,true);
			}
			else {
				if ( object.primaryKeyValue() in this.objects ) {
					this.remove(object.primaryKeyValue(),true);
				}
			}
		}
		
		
	};
	
	
	
	// ------------------------------------------------------------------------
	// 																 Predicates
	// ------------------------------------------------------------------------
	
	// Identity
	
	internal.IdentityPredicate = function (id) {
	
		this.id = id;
	
		this.test = function (candidate) {
			return candidate.primaryKeyValue() == id;
		};
		
	};
	
	external.id = function (id) {
		return new internal.IdentityPredicate(id);
	};
	
	// Generic function
	
	internal.FunctionPredicate = function (fn) {
		this.test = function (candidate) {
			return fn(candidate);
		};
	};
	
	external.test = function (fn) {
		return new internal.FunctionPredicate(fn);
	};
	
	// Example
	
	internal.ExamplePredicate = function (example) {
		
		this.test = function (candidate) {
			
			var exampleForeignKeys = [];

			for( var key in example ) {

				if ( typeof example[key] == 'object' && typeof candidate[key] == 'function' ) { // Some kind of foreign key
					exampleForeignKeys.push(key);
				}
				else if ( example[key] instanceof RegExp && !example[key].test(candidate.get(key)) ) {
					return false;
				}
				else if ( candidate.get(key) != example[key] ) { // Scalar field
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
	
	external.example = function (example) {
		return new internal.ExamplePredicate(example);
	};
	
	// Instance
	
	internal.InstancePredicate = function (constructor) {
		this.test = function (candidate) {
			return candidate instanceof constructor;
		};
	};
	
	external.isa = function (constructor) {
		return new internal.InstancePredicate(constructor);
	};
	
	// Relationship
	
	internal.RelationshipPredicate = function (parent,field) {
		this.test = function (candidate) {
			return candidate.get(field) == parent.primaryKeyValue();
		};
	};
	
	external.related = function (parent,field) {
		return new internal.RelationshipPredicate(parent.field);
	};
	
	// Modification state
	
	internal.ModifiedPredicate = function () {
		this.test = function (candidate) {
			return candidate.dirty;
		};
	};
	
	external.dirty = new internal.ModifiedPredicate();
	
	
	// Comparisons
	
	internal.Eq = function (field,value) {
		this.test = function (candidate) {
			return candidate.get(field) == value;
		};
	};
	
	internal.Lt = function (field,value) {
		this.test = function (candidate) {
			return candidate.get(field) < value;
		};
	};
	
	internal.Gt = function (field,value) {
		this.test = function (candidate) {
			return candidate.get(field) > value;
		};
	};
	
	external.eq = function (field,value) {
		return new internal.Eq(field,value);
	};
	
	external.lt = function (field,value) {
		return new internal.Lt(field,value);
	};
	
	external.gt = function (field,value) {
		return new internal.Gt(field,value);
	};
	
	external.lte = function (field,value) {
		return new internal.Not(new internal.Gt(field,value));
	};
	
	external.gte = function (field,value) {
		return new internal.Not(new internal.Lt(field,value));
	};
	
	
	// Logical connectives
	
	internal.Or = function (predicates) {
		this.test = function (candidate) {
			for (var i=0; i<predicates.length; i++) {
				if (predicates[i].test(candidate)) {
					return true;
				}
			}
			return false;
		};
	};
	
	external.or = function () {
		return new internal.Or(arguments);
	};
	
	internal.And = function (predicates) {
		this.test = function (candidate) {
			for (var i=0; i<predicates.length; i++) {
				if (!predicates[i].test(candidate)) {
					return false;
				}
			}
			return true;
		};
	};
	
	external.and = function () {
		return new internal.And(arguments);
	};
	
	internal.Not = function (predicate) {
		this.test = function (candidate) {
			return !predicate.test(candidate);
		};
	};
	
	external.not = function (predicate) {
		return new internal.Not(predicate);
	};
	
	
	
	// ------------------------------------------------------------------------
	// 															  Domain Object
	// ------------------------------------------------------------------------
	
	internal.DomainObject = function (entitytype) {


		this.data 			= {};
		this.subscribers 	= new internal.SubscriptionList(internal.notifications);


		this.initDomain = function (data) {
			
			this
				.reifyFields()
				.reifyRelationships()
				.set(data)
				.dirty = false;
			
			return this;
			
		}


		this.primaryKeyValue = function () {
			return this.get(this.primaryKey);
		};
		
		
		this.get = function () {
			
			if ( !(arguments[0] instanceof Array) ) { // Just a key
				return this.data[arguments[0]];
			}
			else { // Array of keys
				var keys = arguments[0];
				var values = {};
				for ( var key in keys ) {
					values[keys[key]] = this.get(keys[key]);
				}
				return values;
			}
			// NOTE: Should log problems here
			
		};


		this.set = function () {
			
			var key;
			
			if ( arguments.length == 2 || arguments.length == 3 ) {  // Arguments are key and value
				
				key = arguments[0];
				var value = arguments[1];
				this.data[key] = value;
				this.subscribers.notify({key:key});
				if ( arguments.length == 2 || arguments[2] ) { 
					entitytype.objects.subscribers.notify({method:'change',object:this});
				}
				
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				
				var mappings = arguments[0];
				for ( key in mappings ) {
					this.set(key,mappings[key],false);
				}
				entitytype.objects.subscribers.notify({method:'change',object:this});
				
			}
			// NOTE: Should log problem here
			
			this.dirty = true;
			
			return this; 
			
		};
		

		this.reifyFields = function () {
			
			for ( var i in this.fields ) {
				
				var field = this.fields[i];
				
//				if ( !this[field.accessor] ) {
					
					this.data[field.accessor] = field.defaultValue;
					
					this[field.accessor] = 	function (field) {
						 						return function () {
													return this.get(field);
												};
											}(field.accessor);
											
					this['set'+field.accessor]	=	function (field) {
														return function (value) {
															return this.set(field,value);
														};
													}(field.accessor); 
//				}
				
			}
			
			return this;
			
		};


		this.reifyRelationships = function () {
			
			this.hasOne			= this.hasOne || [];
			this.hasMany		= this.hasMany || [];
			this.relationships	= this.relationships || {};
			
			var i, descriptor, relationship;
			
			for ( i in this.hasOne ) {
				descriptor = this.hasOne[i];
				relationship 							= new internal.OneToOneRelationship(this,descriptor);
				this.relationships[descriptor.accessor] = relationship
				this[descriptor.accessor] 				= relationship.get;
				this['add'+descriptor.accessor]			= relationship.add;
			}
			
			for ( i in this.hasMany ) {
				descriptor = this.hasMany[i];
				relationship											= new internal.OneToManyRelationship(this,descriptor);
				this.relationships[descriptor.accessor] 				= relationship
				this[(descriptor.plural || descriptor.accessor+'s')] 	= relationship.get;
				this['add'+descriptor.accessor]							= relationship.add;
				this['remove'+descriptor.accessor]						= relationship.remove;
				this['debug'+descriptor.accessor]						= relationship.debug;
			}
			
			return this;
			
		};


		this.subscribe = function (subscription) {

			if ( subscription.change && typeof subscription.change == 'string' ) {
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
			
			this.subscribers.add(subscriber);
			
			if ( subscription.initialise ) {
				internal.notifications.send(subscriber.notification({key:subscription.key}));
			}
			
			return this;
			
		};
		
		
		this.pushNotifications = function () {
		
			for (var i in this.data) {
				this.subscribers.notify({key:i});
			}
			
		};
		
		
		this.debugData = function () {

			var fields = '';

			for ( var i in this.data ) {
				fields += i + ':'+this.data[i]+' ';
			}

			return fields;

		};
		

	};
	
	
	
	// ------------------------------------------------------------------------
	// 															  Relationships
	// ------------------------------------------------------------------------
	
	internal.OneToOneRelationship = function (parent,relationship) {
		
		this.get = function (create) {
			var child = entities[relationship.prototype].object(parent.get(relationship.field));
			if ( child ) {
				return child;
			}
			else if ( create ) {
				return this.add();
			}
		};
		
		this.add = function (data) {
			
			data = data || {};
			var newObject = entities[relationship.prototype].create(data);
			
			parent.set(relationship.field, newObject.primaryKeyValue());
			
			return newObject;
			
		};
		
	};
	
	
	internal.OneToManyRelationship = function (object,relationship) {
		
		relationship.direction	= 'reverse';

		var children			= new internal.DomainObjectCollection({
											base: 		entities[relationship.prototype].objects,
											predicate: 	new internal.RelationshipPredicate(object,relationship.field)
										});
										
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
			return entities[relationship.prototype].create(data);
			
		};
		
		this.remove = function (id) {
			
			entities[relationship.prototype].objects.remove(id);
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
				if ( entities[key] ) {
					object = entities[key].create(partitionedData.fields);
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



// =========================================================================
//													   Inheritance utilities
// =========================================================================

//
// This is provided as a very lightweight system for implementing inheritance
// in Javascript. It's possible to use jModel with more elaborate schemes too
//


// Slight modification of John Resig's code inspired by base2 and Prototype
(function(){
	
	var	initializing	= false,
		fnTest 			= /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	
	// The base Base implementation (does nothing)
	this.Base = function(){};
  
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
	
})();