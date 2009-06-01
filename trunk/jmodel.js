//
// Domain binding plugin
//

// NOTE: Make it possible to publish to a method not just a key?
jQuery.fn.publish = function (publication) {
	return this.change ? this.change(function (event) {
		publication.target.set(publication.key,jQuery(event.target).val());
	}) :
	this;
};

jQuery.fn.subscribe = function (subscription) {
	return	(subscription.key && !subscription.selector) ?
				this.each(function (index,element) {
					subscription.key = subscription.key instanceof Array ? subscription.key : [subscription.key];
					jQuery.each(subscription.key,function (index,key) {
						subscription.source.subscribe({
							source: subscription.source,
							target: jQuery(element),
							key: key,
							change: subscription.onChange
						});
					});
				}) :
				this.each(function (index,element) {
					subscription.source.subscribe({
						source: subscription.source,
						target: jQuery(element),
						add: subscription.onAdd,
						remove: subscription.onRemove,
						change: subscription.onChange,
						filter: subscription.filter,
						selector: subscription.selector,
						key: subscription.key
					});
				});
};

jQuery.fn.pubsub = function (domainObject,key) {
	return this
			.subscribe({source:domainObject,key:key})
			.publish({target:domainObject,key:key});
};


//
// Domain Object Model
//

var _ = function () {


	var prototypes	= {},
		synonyms	= {},
		options		= {},
	    objects 	= {},
		public		= {},
		private		= {},
		$			= jQuery;
		
	//
	// Public methods
	//
	
	public.registerPrototype = function (name,constructor,options) {
	
		constructor.prototype		= new prototypes.DomainObject();
	
		prototypes[name]					= constructor;
		public[name]						= function (id,data) { return private.getObject(name,id,data); };
		public[options.plural || name+'s']	= function() { return objects[name]; }; 
		objects[name]						= new private.DomainObjectCollection({});
	
		options = options || {};
		options[name] = options;
		options.synonyms = options.synonyms || [];
		for ( var i in options.synonyms ) {
			synonyms[options.synonyms[i]] = name;
		}
	
		return public;
	
	};
	
	
	public.resetModel = function () {
		
		for ( var prototypeName in prototypes ) {
			if ( objects[prototypeName] ) {
				objects[prototypeName].each(function (index,object) {
					objects[prototypeName].remove(object.primaryKeyValue());
				});
			}
		}
		
		return public;
		
	};
	
	
	public.debugObjects = function () {
		
		var contents = '';
		
		for ( var prototypeName in objects ) {
			contents += prototypeName+': ['+objects[prototypeName].debug()+'] ';
		}
		
		return contents;
		
	};
	
	
	//
	// Private methods
	//
	
	private.getObject = function (prototypeName,id,data) {
		
		prototypeName = synonyms[prototypeName] || prototypeName;

		if ( !objects[prototypeName] ) {
			alert('Unknown prototype: '+prototypeName );
			return false;
		}
		
		if ( typeof arguments[1] != 'object' && ( id == ':first' || objects[prototypeName].get(id) ) ) {		// Object already exists
			if ( id == ':first' ) {
				return objects[prototypeName].first();
			}
			else {
				return objects[prototypeName].get(id);
			}
		}
		else {									// Need to create a new object from prototype
			return private.createObject(prototypeName,id,data);
		}
		
	};
	
	
	private.getObjects = function (prototypeName) {
		return objects[prototypeName];
	};
	
	
	private.generateID = function (prototypeName) {
		return -(objects[prototypeName].count()+1);
	};
	
	
	//
	// Notification queue
	//
	
	private.NotificationQueue = function () {
		
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
	
	private.notifications = new private.NotificationQueue();
	
	// Public interface to notification queue
	
	public.suspendNotifications = function () {
		private.notifications.suspend();
		return public;
	};
	
	public.resumeNotifications = function () {
		private.notifications.resume();
		return public;
	};
	
	public.flushNotifications = function () {
		private.notifications.flush();
		return public;
	};
	
	public.pushNotifications = function () {
		for(var prototypeName in objects) {
			objects[prototypeName].each(function (index,object) {
				object.pushNotifications();
			});
		}
		return public;
	}
	
	
	//
	// Notification types
	//
	
	private.ContentNotification = function (subscription) {
		this.receive = function () {
			subscription.target.html(subscription.source.get(subscription.key));
		};	
	};
	
	private.ValueNotification = function (subscription) {
		this.receive = function () {
			subscription.target.val(subscription.source.get(subscription.key));
		};
	};
	
	private.MethodNotification = function (subscription) {
		this.receive = function () {
			subscription.method.call(subscription.target,subscription.source);
		};	
	};
	
	private.EventNotification = function (subscription) {
		this.receive = function () {
			subscription.target.trigger(jQuery.Event(subscription.event),subscription.source);
		};
	};
	
	private.CollectionMethodNotification = function (subscription,event) {
		this.receive = function () {
			if (subscription[event.method]) {
				subscription[event.method].call(subscription.target,subscription.source,event.object);
			}
		};
	};
	
	private.CollectionEventNotification = function (subscription,event) {
		this.receive = function () {
			// NOTE: Implement this
		};
	};
	
	private.CollectionMemberNotification = function (subscription,event) {
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
		}
	}
	
	
	//
	// Subscription list
	//
	// This contains a list of subscription objects, each of which produces
	// notification objects when required and adds them to the notification
	// queue.
	//
	
	private.SubscriptionList = function (notifications) {
		
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
	
	
	private.CollectionSubscriber = function (subscription) {
	
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
	
	
	private.ObjectSubscriber = function (subscription) {

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
	
	private.DomainObjectCollection = function (specification) {
		
		this.objects		= specification.objects ? specification.objects : [];
		this.subscribers	= new private.SubscriptionList(private.notifications);

		if ( specification.base instanceof this.constructor ) { // This collection is a materialised view over a base collection
			
			specification.base.each(function (key,candidate) {
				if ( specification.view(candidate) ) {
					this.set(candidate.primaryKeyValue(), candidate, true);
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
		
		this.remove = function (criteria,immediate) {
			var that = this;
			if ( typeof arguments[0] != 'object' ) {
				var removed = this.objects[criteria];
				delete this.objects[criteria];
				this.subscribers.notify({method:'remove',object:removed});
			}
			else { // NOTE: Fix this
				this.filter(criteria).each(function (key,object) {
					that.remove(key);
				});
			}
		};
	
		
		this.each = function (callback) {
			for(var index in this.objects) {
				callback(index,this.objects[index]);
			}
			return this;
		};
		
		
		this.map = function (mapping,mapped) {
			var mapped = mapped || [];
			for(var index in this.objects) {
				mapped.push(mapping(this.objects[index]));
			}
			return mapped;
		}
		
		
		this.select = function (selector) {
			if ( selector == ':first' ) {
				return this.first();
			}
			else {
				return this;
			}
		};
		
		
		this.filter = function () {
			
			if ( typeof arguments[0] == 'object' ) {
				var example		= arguments[0];
				var selector	= arguments[1];
			}
			else {
				var selector = arguments[0];
			}
			
			if ( example ) {
				var objs = new private.DomainObjectCollection({});
				this.each(function (index,object) {
					if ( object.matches(example) ) {
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
				subscription.type	= 	private.CollectionMemberNotification;
				subscription.filter = 	function (collection) {
											return function (event) {
												return collection.filter(subscription.selector) === event.object;
											};
										}(this);							
			}
			else if ( ( typeof onAdd == 'string' ) && ( typeof onRemove == 'string' ) ) {
				subscription.type	= private.CollectionEventNotification;
			}
			else {
				subscription.type	= private.CollectionMethodNotification; 
			}
			
			this.subscribers.add( new private.CollectionSubscriber(subscription) );
			
			return this;	
			
		};
		
		
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
	// Object creation
	//
	
	private.createObject = function (prototypeName,id,data) {
		
		var newObject	= new prototypes[prototypeName]();
		var primaryKey	= newObject.primaryKey;
		
		newObject.data	= newObject.data || {};
		
		if ( typeof arguments[1] == 'object' ) { // Need to deduce ID from JSON
			data = arguments[1];
		}
		else {
			data = data || {};
		}
		
		if ( !data[primaryKey] ) {
			data[primaryKey] = private.generateID(prototypeName);
		}

		objects[prototypeName][data[primaryKey]] = newObject; // Must do this before parsing JSON data or else generated keys are all identical
		newObject.baseCollection = objects[prototypeName];
		newObject.subscribers = new private.SubscriptionList(private.notifications);
		
		newObject
			.reifyFields()
			.reifyRelationships()
			.parseJSON(data)
			.parseChildrenFromJSON(data);

		objects[prototypeName].set(data[primaryKey],newObject); // To trigger subscribers

		return newObject;
		
	}
	
	
	//	
	// Domain Object prototype
	//
	
	prototypes.DomainObject = function () {


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
			
			if ( arguments.length == 2 || arguments.length == 3 ) {  // Arguments are key and value
				
				var key = arguments[0], value = arguments[1];
				this.data[key] = value;
				this.subscribers.notify({key:key});
				if ( arguments.length == 2 || arguments[2] ) { 
					this.baseCollection.subscribers.notify({method:'change',object:this});
				}
				
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				
				var mappings = arguments[0];
				for ( var key in mappings ) {
					this.set(key,mappings[key],false);
				}
				this.baseCollection.subscribers.notify({method:'change',object:this});
				
			}
			// NOTE: Should log problem here
					
			return this; 
			
		};
		

		this.parseJSON = function (data) {
			
			var values = {};
			for ( var key in data ) {
				var value = data[key];
				if ( !(typeof value == 'object') ) { // Just a scalar value
					values[key] = value;
				}
			}
			this.set(values);
			
			return this;
		
		};
		
		
		this.parseChildrenFromJSON = function (data) {
			
			for ( var key in data ) {
				var value = data[key];
				if ( typeof value == 'object' ) { // Just a scalar value
					if ( value instanceof Array ) { // Need to deal with multiple children
						for ( var i=0; i<value.length; i++) {
							this.makeChildFromJSON(key,value[i]);
						}
					}
					else { // Just a foreign key reference
						this.makeChildFromJSON(key,value);
					}
				}
			}
			
			return this;
			
		}
		
		
		this.makeChildFromJSON = function (key,value) {
			
			if ( this.relationships[key] ) { // New object is related to existing object
				this.relationships[key].add(value);
			}
			else { // Unrelated new object
				private.getObject(key,value);
			}
			
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
			
			for ( var i in this.hasOne ) {
				var descriptor = this.hasOne[i];
				this.relationships[descriptor.accessor] = new private.OneToOneRelationship(this,descriptor);
			}
			
			for ( var i in this.hasMany ) {
				var descriptor = this.hasMany[i]
				this.relationships[descriptor.accessor] = new private.OneToManyRelationship(this,descriptor);
			}
			
			return this;
			
		};


		this.subscribe = function (subscription) {

			if ( subscription.change && typeof subscription.change == 'string' ) {
				subscription.type		= private.EventNotification;
				subscription.event		= subscription.change;
			}
			else if ( subscription.change && typeof subscription.change == 'function' ) {
				subscription.type		= private.MethodNotification;
				subscription.method		= subscription.change;
			}
			else if ( subscription.target.is('input:input,input:checkbox,input:hidden') ) {
				subscription.type = private.ValueNotification;
			}
			else {
				subscription.type = private.ContentNotification;
			}
			
			this.subscribers.add( new private.ObjectSubscriber(subscription) );
			
			return this;
			
		};
		
		
		this.pushNotifications = function () {
		
			for (var i in this.data) {
				this.subscribers.notify({key:i});
			}
			
		}
		
		
		this.matches = function (example) {
			
			var exampleForeignKeys = [];

			for( var key in example ) {

				if ( typeof example[key] == 'object' && typeof this[key] == 'function' ) { // Some kind of foreign key
					exampleForeignKeys.push(key);
				}
				else if ( example[key] instanceof RegExp && !example[key].test(this.get(key)) ) {
					return false;
				}
				else if ( this.get(key) != example[key] ) { // Scalar field
					return false;
				}

				for( var index in exampleForeignKeys ) {
					var exampleForeignKey = exampleForeignKeys[index];
					var children = this[exampleForeignKey]();
					var collection = children.length ? children : new private.DomainObjectCollection({objects:[children]});
					if ( collection.filter(example[exampleForeignKey]).length() === 0 ) {
						return false;
					}
				}

			}
			
			return true;
			
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
	
	private.OneToOneRelationship = function (object,relationship) {
		
		this.get = function () {
			return private.getObject(relationship.prototype,object.get(relationship.field));
		};
		
		this.add = function (data) {
			
			data = data || {};
			var newObject = private.getObject(relationship.prototype,data);
			
			object.set(relationship.field, newObject.primaryKeyValue());
			
			return newObject;
			
		}
		
		object[relationship.accessor] = this.get;
		
	};
	
	
	private.OneToManyRelationship = function (object,relationship) {
		
		relationship.direction	= 'reverse';

		var children			= new private.DomainObjectCollection({
											base: objects[relationship.prototype],
											view: function (field,parent) {
												return function (candidate) {
													return candidate.get(field) == parent.primaryKeyValue();
												}
											}(relationship.field,object)
										});
										
		if ( relationship.onAdd || relationship.onRemove || relationship.onChange ) {
			var subscription = {
				source: children,
				target: object
			};
			if ( relationship.onAdd)    subscription.add    = relationship.onAdd;
			if ( relationship.onRemove) subscription.remove = relationship.onRemove;
			if ( relationship.onChange) subscription.change = relationship.onChange;
			children.subscribe(subscription);
		}
		
		this.get = function (example,selector) {
			return children.filter(example,selector);
		};
		
		// NOTE: Should this work with arrays of objects too?
		this.add = function (data) {
			
			data = data || {};
			data[relationship.field] = object.primaryKeyValue();
			return private.getObject(relationship.prototype,data);
			
		};
		
		this.remove = function (id) {
			
			private.getObjects(relationship.prototype).remove(id);
			return this;
			
		};
		
		this.debug = function () {
			return children.debug();
		}
		
		object[(relationship.plural || relationship.accessor+'s')] 	= this.get;
		object['add'+relationship.accessor]							= this.add;
		object['remove'+relationship.accessor]						= this.remove;
		object['debug'+relationship.accessor]						= this.debug;
		
	};
	
	
	return public;
	
}();