//
// Domain binding plugin
//

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


//
// Domain Object Model
//

var _ = function () {


	var entities	= {},
		external	= {},
		internal	= {},
		$			= jQuery;
		
	//
	// Public methods
	//
	
	external.prototype = {
		
		register: function (name,constructor,options) {

			entities[name] = new internal.EntityType(name,constructor,options);

			var names = [name].concat( options.synonyms || [] );

			// NOTE: Make this handle synonyms more gracefully
			for ( var i in names ) {
				var synonym 							= names[i];
				entities[synonym]						= entities[name];
				external[synonym] 						= entities[name].object;
				external['create'+synonym]				= entities[name].create;
				external[options.plural || synonym+'s']	= function() { return entities[name].objects; };
			}

			return external.prototype;

		},
		
		context: 		external.context,
		notifications: 	external.notifications,
		json: 			external.json
		
	};
	
	
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
				},
				
		prototype: 		external.prototype,
		notifications: 	external.notifications,
		json: 			external.json
		
	};
	
	
	//
	// Entity Type
	//
	
	internal.EntityType = function (name,constructor,options) {
		
		options  = options || {};
		var base = options.base || name; 
		
		var objects 			= new internal.DomainObjectCollection({});
		
		this.objects 			= objects;
		this.name				= name;
		this.options			= options;
		this.constructor		= constructor;
		
//		var cons = constructor;
//		while ( cons.prototype != Object.prototype ) {
//			alert('here');
//			cons = cons.prototype.constructor;
//		}
//		cons.prototype = new internal.DomainObject();
		
		constructor.prototype 	= new internal.DomainObject();
		
		
		this.object = function (id,data) {
			
			if ( typeof arguments[1] != 'object' && ( id == ':first' || objects.get(id) ) ) {		// Object already exists
				if ( id == ':first' ) {
					return objects.first();
				}
				else {
					return objects.get(id);
				}
			}
			else {	// May need to create a new object
				if ( typeof arguments[arguments.length-1] == 'boolean' && arguments[arguments.length-1] ) {
					return this.create(id,data);
				}
				else {
					return false;
				}						
			}
			
		};
		
		
		this.create = function (id,data) {
			
			var newObject	= new constructor();
			
			var primaryKey	= newObject.primaryKey;

			newObject.data	= newObject.data || {};

			if ( typeof arguments[0] == 'object' ) { // Need to deduce ID from JSON
				data = arguments[0];
			}
			else {
				data = data || {};
			}

			if ( !data[primaryKey] ) {
				data[primaryKey] = generateID();
			}

			set(data[primaryKey],newObject); // Must do this before parsing JSON data or else generated keys are all identical

			newObject.baseCollection = entities[base].objects;
			newObject.subscribers = new internal.SubscriptionList(internal.notifications);

			newObject
				.reifyFields()
				.reifyRelationships()
				.set(data)
				.dirty = false;

			// To trigger subscribers
			set(data[primaryKey],newObject);

			return newObject;
			
		};
		
		var that=this;
		function set (id,object) {
			var entity = that;
			do {
				entity.objects.set(id,object);
//				alert(entity.constructor);
//				entity = internal.getEntityTypeByConstructor(entity.constructor.prototype.constructor);
				entity = ( entity.options && entity.options.parent ) ? entities[entity.options.parent] : null;
			}
			while ( entity )
		}
		
		
		function generateID() {			
			return -(entities[base].objects.count()+1);
		}
		
		
	};
	
	
	internal.getEntityTypeByConstructor = function (constructor) {
		for( var key in entities ) {
			if ( entities[key].constructor == constructor ) {
				return entities[key];
			}
		}
		return false;
	};
	
	internal.getObjects = function (prototypeName) {
		return entities[prototypeName].objects;
	};
	
	
	//
	// Notification queue
	//
	
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
	
	// Public interface to notification queue
	
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
					},
					
		prototype: 	external.prototype,
		context: 	external.context,
		json: 		external.json
	
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
	
	
	//
	// Domain object collection
	//
	
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
			if ( !this.objects[id] ) {
				this.objects[id] = value;
				this.subscribers.notify({method:'add',object:value});
			}
			else {
				this.objects[id] = value;
				this.subscribers.notify({method:'change',object:value});
			}
		};
		
		this.first = function () {
			for ( var i in this.objects ) {
				return this.objects[i];
			}
			return false;
		};
		
		this.remove = function (predicate,immediate) {
			var that = this;
			if ( typeof arguments[0] != 'object' ) {
				var id = predicate;
				var removed = this.objects[id];
				delete this.objects[id];
				this.subscribers.notify({method:'remove',object:removed});
			}
			else { // NOTE: Fix this
				this.filter(predicate).each(function (key,object) {
					that.remove(key);
				});
			}
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
			
			var selector;
			
			if ( typeof arguments[0] == 'object' ) {
				var predicate	= arguments[0];
				selector		= arguments[1];
			}
			else {
				selector 		= arguments[0];
			}
			
			if ( predicate ) {
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
				if ( specification.view(candidate) ) {
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
			if ( specification.view(object) ) {
				this.set(object.primaryKeyValue(), object, true);
			}
		}
		
		function baseRemove(collection,object) {
			this.remove(object.primaryKeyValue(),true);
		}
		
		function baseChange(collection,object) {
			if ( specification.view(object) ) {
				this.set(object.primaryKeyValue(), object,true);
			}
			else {
				if ( object.primaryKeyValue() in this.objects ) {
					this.remove(object.primaryKeyValue(),true);
				}
			}
		}
		
		
	};
	
	
	//
	// Predicates
	//
	
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
	
	internal.InstancePredicate = function (constructor) {
		this.test = function (candidate) {
			return candidate instanceof constructor;
		};
	};
	
	external.instance = function (constructor) {
		return new internal.InstancePredicate(constructor);
	};
	
	internal.ModifiedPredicate = function () {
		this.test = function (candidate) {
			return candidate.dirty;
		};
	};
	
	external.dirty = new internal.ModifiedPredicate();
	
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
	
	
	//	
	// Domain Object prototype
	//
	
	internal.DomainObject = function () {


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
					this.baseCollection.subscribers.notify({method:'change',object:this});
				}
				
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				
				var mappings = arguments[0];
				for ( key in mappings ) {
					this.set(key,mappings[key],false);
				}
				this.baseCollection.subscribers.notify({method:'change',object:this});
				
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
			
			var i, descriptor;
			
			for ( i in this.hasOne ) {
				descriptor = this.hasOne[i];
				this.relationships[descriptor.accessor] = new internal.OneToOneRelationship(this,descriptor);
			}
			
			for ( i in this.hasMany ) {
				descriptor = this.hasMany[i];
				this.relationships[descriptor.accessor] = new internal.OneToManyRelationship(this,descriptor);
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
	
	
	//
	// Relationships
	//
	
	internal.OneToOneRelationship = function (parent,relationship) {
		
		this.get = function (create) {
			return entities[relationship.prototype].object(parent.get(relationship.field),create);
		};
		
		this.add = function (data) {
			
			data = data || {};
			var newObject = entities[relationship.prototype].create(data);
			
			parent.set(relationship.field, newObject.primaryKeyValue());
			
			return newObject;
			
		};
		
		parent[relationship.accessor] 		= this.get;
		parent['add'+relationship.accessor]	= this.add;
		
	};
	
	
	internal.OneToManyRelationship = function (object,relationship) {
		
		relationship.direction	= 'reverse';

		var children			= new internal.DomainObjectCollection({
											base: 	entities[relationship.prototype].objects,
											view: 	function (field,parent) {
														return function (candidate) {
															return candidate.get(field) == parent.primaryKeyValue();
														};
													}(relationship.field,object)
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
		
		object[(relationship.plural || relationship.accessor+'s')] 	= this.get;
		object['add'+relationship.accessor]							= this.add;
		object['remove'+relationship.accessor]						= this.remove;
		object['debug'+relationship.accessor]						= this.debug;
		
	};
	
	
	//
	// JSON parsing
	//
	
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
					},
					
			prototype: 		external.prototype,
			context: 		external.context,
			notifications: 	external.notifications
			
		};
		
		
	}();
	
	
	return external;
	
}();