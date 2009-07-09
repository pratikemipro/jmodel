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
	
	if ( publication.selector && publication.member.bindings ) {
		
		this.each(function (index,element) {
			for (var selector in publication.member.bindings) {
				jQuery(selector,element).each(function (index,object) {
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
									jQuery(object).bind('change',function (event) {
										target.set(key,jQuery(event.target).val());
									});
								}
							}(publication.member.bindings[selector],object),
							initialise: publication.initialise,
							description: publication.description || 'domain collection member subscription'
						}
					});
				})
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
					that.bind('change',function (event) {
						target.set(publication.member.key,jQuery(event.target).val());
					});
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
					change: subscription.change,
					removed: subscription.remove,
					initialise: subscription.initialise,
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
						source: subscription.source,
						target: jQuery(object),
						key: subscription.bindings[selector],
						initialise: subscription.initialise,
						description: subscription.description || 'application subscription'
					});
				});
			}
		});
		
	}
	else if ( ( subscription.predicate || subscription.selector ) && subscription.member.bindings ) { // Subscription to members of collection with bindings

		return this.each(function (index,element) {
			for (var selector in subscription.member.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe({
						source: subscription.source,
						predicate: subscription.predicate,
						selector: subscription.selector,
						initialise: subscription.initialise,
						description: subscription.description || 'application subscription',
						member: {
							target: jQuery(object),
							key: subscription.member.bindings[selector],
							change: subscription.member.change,
							initialise: subscription.member.initialise,
							description: subscription.member.description || 'application subscription'
						}
					});
				});
			}
		});

	} 
	else if ( subscription.predicate || subscription.selector ) { // Subscription to members of collection

		return this.each(function (index,element) {
			subscription.source.subscribe({
				source: subscription.source,
				predicate: subscription.predicate,
				selector: subscription.selector,
				initialise: subscription.initialise,
				description: subscription.description || 'application subscription',
				member: {
					target: jQuery(element),
					key: subscription.member.key,
					change: subscription.member.change,
					initialise: subscription.member.initialise,
					description: subscription.member.description || 'application subscription'
				}
			});
		});
		
	}
	else { // Subscription to collection
		
		return this.each(function (index,element) {
			subscription.source.subscribe({
				source: subscription.source,
				target: jQuery(element),
				add: subscription.add,
				remove: subscription.remove,
				change: subscription.change,
				sort: subscription.sort,
				initialise: subscription.initialise,
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
	for(i=0; i<this.length; i++) {
		copies[i] 		= this.get(i);
		placeholders[i] = document.createComment('');
		copies[i].parentNode.replaceChild(placeholders[i],copies[i]);
	}
	
	for(i=0; i<copies.length; i++) {
		placeholders[i].parentNode.replaceChild(copies[permutation[i]],placeholders[i]);
	}
	
	return this;
	
};

jQuery.fn.view = function (options) {
	this.each(function (index,element) {
		var view = new options.constructor(element,options);
	});
	return this;
}

jQuery.fn.views = function (views) {
	for (var selector in views) {
		jQuery(selector,this).view(views[selector]);
	}
	return this;
}


// ============================================================================
//														 	Domain Object Model
// ============================================================================

var jModel = function () {


	var external={},
		entities={};
		
		
	// ------------------------------------------------------------------------
	//																	Logging
	// ------------------------------------------------------------------------
	
	var log = {
		
		active: 	false,
		
		flags: 		{
						all: false,
						application: false,
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
							send: false
						},
						json: {
							all: false,
							thaw: false
						}
					},
				
		startGroup: function (condition,title) { log.log(condition,title,'startgroup');	},
				
		endGroup: 	function (condition) { log.log(condition,'','endgroup'); },
					
		error: 		function (condition,message) { log.log(condition,message,'error'); },
					
		warning: 	function (condition,message) { log.log(condition,message,'warning'); },
					
		debug: 		function (condition, message) { log.log(condition,message,'debug'); },
					
		info: 		function (condition, message) {	log.log(condition,message,'info'); },
					
		log: 		function (condition, message, type) {
			
						if ( log.active && ( log.flags.all || condition ) ) {
							
							if ( type == 'startgroup' ) {
								if ( console.group ) {
									console.group(message);
								}
								else if ( console.log ) {
									console.log(message);
								}
							}
							else if ( type == 'endgroup' ) {
								if ( console.groupEnd ) {
									console.groupEnd();
								}
							}
							else {
								switch (type) {	
									case 'error': 	if (console.error) {console.error(message); break;}
									case 'warning': if (console.warn)  {console.warn(message);  break;}
									case 'debug': 	if (console.debug) {console.debug(message); break;}
									case 'info': 	if (console.info)  {console.debug(message); break;}
									default: 		if (console.log)   {console.log(message);         }	
								}
							}
							
						}
						
					},
					
		enable: 	function (flag) {
						setFlag(flag,true);
						log.active = true;
						return log.flags;
					},

		disable: 	function (flag) {
						setFlag(flag,false);
						return external.log;
					}
		
	};
	
	external.log = log;
	
	function setFlag(path,value) {
		pieces = path.split('.');
		var property=log.flags;
		for (var i=0; i<pieces.length-1; i++) {
			if ( typeof property[pieces[i]] == 'object' ) {
				property=property[pieces[i]];
			}
		}
		property[pieces[pieces.length-1]] = value;
	}



	// ------------------------------------------------------------------------
	//																		Set
	// ------------------------------------------------------------------------

	var Set = function (objects) {
		
		var members = objects || [];
		
		this.add = function (object) {
			if ( members.indexOf(object) == -1 ) {
				members.push(object);
				return true;
			}
			else {
				return false;
			}
		};
		
		this.count = function () {
			return members.length;
		};
		
		this.first = function () {
			return members.length > 0 ? members[0] : false;
		};
		
		this.each = function (callback) {
			for(var index in members) {
				callback.call(members[index],index,members[index]);
			}
			return this;
		};
		
		this.partition = function (predicate,passName,failName) {
			
			var partition = {};
			var pass = partition[passName||'pass'] = new Set();
			var fail = partition[failName||'fail'] = new Set();
			
			this.each(function () {
				if ( predicate(this) ) {
					pass.add(this);
				}
				else {
					fail.add(this);
				}
			})

			return partition;

		};
		
		this.filter = function (predicate) {
			return this.partition(predicate).pass;
		};
		
		this.remove = function (predicate) {
			var partition = this.partition(predicate,'remove','keep');
			members = [];
			partition.keep.each(function () {
				members.push(this);
			})
			return partition.remove; 
		};
		
		this.map = function (mapping,mapped) {
			mapped = new Set() || [];
			this.each(function () {
				mapped.add(mapping(this));
			});
			return mapped;
		};
		
		this.delegateFor = function (host) {
			for (var i in this) {
				if ( !host[i] ) {
					host[i] = this[i];
				}
			}
		}
		
	}

	
	
	// ------------------------------------------------------------------------
	// 																 Prototypes
	// ------------------------------------------------------------------------
	
	var EntityType = function (name,constructor,options) {

		options  		= options || {};
		
		this.options	= options;
		
		this.constructor = constructor;

		// Figure out the current type's base entity
		entity = this;
		while ( entity.options && ( entity.options.base !== true ) ) {
			entity = ( entity.options && entity.options.parent ) ? entities[entity.options.parent] : null;
		}
		var base = entity.name || name;

		this.objects = new	DomainObjectCollection(
								( base != name) ?
									{	base: 			entities[base].objects,
										predicate: 		InstancePredicate(constructor),
										ordering: 		options.ordering,
										description: 	name } :
									{	ordering: 		options.ordering,
										description: 	name }
							);
							
		this.deleted = new DeletedObjectsCollection(this.objects);

		this.name	= name;


		this.object = function (criterion) {
			return entities[base]
					.objects
						.filter(InstancePredicate(constructor))
						.filter(( typeof criterion != 'string' ) ? makePredicate(criterion) : null)
						.select(( typeof criterion == 'string' ) ? criterion : ':first');
		};


		this.create = function (data) {
			
			log.startGroup(log.flags.domainobject.create,'Creating a new '+name);

			data = (typeof data == 'object') ? data : {};

			var newObject = new constructor();
			DomainObject.call(newObject,entities[name]);

			var primaryKey	= newObject.primaryKey;

			data[primaryKey] = data[primaryKey] || generateID();
			newObject.domain.init(data);
			entities[base].objects.add(newObject);

			log.endGroup(log.flags.domainobject.create);

			return newObject;

		};


		function generateID() {			
			return -(entities[base].objects.count()+1);
		}
		

	};

	
	external.prototype = {
		
		register: function (name,constructor,options) {

			entities[name] = new EntityType(name,constructor,options);

			var names = [name].concat( options.synonyms || [] );

			// NOTE: Make this handle synonyms more gracefully
			for ( var i in names ) {
				var synonym 										= names[i];
				entities[synonym]									= entities[name];
				external[synonym] 									= function (predicate) { return entities[name].object(predicate); };
				external[synonym].entitytype						= entities[name];
				external[synonym].extend							= function (prop) { return entities[name].constructor.extend(prop); };
				external['create'+synonym]							= entities[name].create;
				external[options.plural || synonym+'s']				= function (predicate) { return entities[name].objects.filter(predicate); };
				external['deleted'+(options.plural || synonym+'s')]	= function (predicate) { return entities[name].deleted.filter(predicate); };
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
						entities[entityName].objects.remove(AllPredicate());
					}
					return external.context;
				},
				
		checkpoint: function () {
						for ( var entityName in entities ) {
							entities[entityName].objects.each(function (index,object) {
								object.domain.dirty = false;
							});
							entities[entityName].deleted.remove(AllPredicate());
						}
						return external.context;
					}, 
				
		debug: 	function (showSubscribers) {
					var contents = '';
					for ( var entityName in entities ) {
						contents += entityName+': ['+entities[entityName].objects.debug(showSubscribers)
									+entities[entityName].deleted.debug(false)+'] ';
					}
					return contents;
				}
		
	};
	
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------
	
	var NotificationQueue = function () {
		
		var	notifications 	= [],
			active			= true;
		
		this.send = function (notification) {
			if ( active ) {
				notification.receive();
			}
			else {
				log.debug(log.flags.notifications.send,'Adding a notification to the queue');
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
	
	var notifications = new NotificationQueue();
	
	external.notifications = {
		
		suspend: 	function () {
						notifications.suspend();
						return external.notifications;
					},
					
		resume: 	function () {
						notifications.resume();
						return external.notifications;
					},
					
		flush: 		function () {
						notifications.flush();
						return external.notifications;
					},
					
		push: 		function () {
						for(var prototypeName in entities) {
							entities[prototypeName].objects.each(function (index,object) {
								object.domain.push();
							});
						}
						return external.notifications;
					}
	
	};
	
	
	//
	// Notification types
	//
	
	var ContentNotification = function (subscription) {
		this.receive = function () {
			log.debug(log.flags.notifications.send,'Receiving a content notification for '+subscription.key+': '+subscription.description);
			subscription.target.html(subscription.source.get(subscription.key));
		};	
	};
	
	var ValueNotification = function (subscription) {
		this.receive = function () {
			log.debug(log.flags.notifications.send,'Receiving a value notification for '+subscription.key+': '+subscription.description);
			subscription.target.val(subscription.source.get(subscription.key));
		};
	};
	
	var MethodNotification = function (subscription) {
		this.receive = function () {
			log.debug(log.flags.notifications.send,'Receiving an object method notification'+': '+subscription.description);
			subscription.method.call(subscription.target,subscription.source);
		};	
	};
	
	var EventNotification = function (subscription) {
		this.receive = function () {
			log.debug(log.flags.notifications.send,'Receiving an event notification'+': '+subscription.description);
			subscription.target.trigger(jQuery.Event(subscription.event),subscription.source);
		};
	};
	
	// NOTE: Should implement separate RemovalMethodNotification and RemovalEventNotification objects
	var RemovalNotification = function (subscription) {
		this.receive = function () {
			log.debug(log.flags.notifications.send,'Receiving a removal notification'+': '+subscription.description);
			subscription.removed.call(subscription.target,subscription.source);
		};
	};
	
	var CollectionMethodNotification = function (subscription,event) {
		this.receive = function () {
			if (subscription[event.method] && event.permutation) {
				log.debug(log.flags.notifications.send,'Receiving a sort notification');
				subscription[event.method].call(subscription.target,event.permutation);
			}
			else if (subscription[event.method]) {
				log.debug(log.flags.notifications.send,'Receiving a collection method notification'+': '+subscription.description);
				subscription[event.method].call(subscription.target,subscription.source,event.object);
			}
		};
	};
	
	var CollectionEventNotification = function (subscription,event) {
		this.receive = function () {
			// NOTE: Implement this
		};
	};
	
	// NOTE: Make this work with bindings
	var CollectionMemberNotification = function (subscription,event) {
		this.receive = function () {
			log.debug(log.flags.notifications.send,'Receiving a collection member notification');
			subscription.member.key = ( subscription.member.key instanceof Array ) ?
												subscription.member.key
												: [subscription.member.key];
			for (var i in subscription.member.key) {
				
				event.object.subscribe({
					source: event.object,
					target: subscription.member.target,
					key: subscription.member.key[i],
					change: subscription.member.change,
					initialise: subscription.member.initialise,
					description: 'collection member subscription for key '+subscription.member.key[i]
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
	
	var SubscriptionList = function (notifications) {
		
		var subscribers = new Set();
		subscribers.delegateFor(this);
		
		this.add = function (subscriber) {
			if ( subscribers.add(subscriber) ) {
				log.debug(log.flags.subscriptions.subscribe,'added subscriber: '+subscriber.description);
			}
		};
		
		this.notify = function (event) {
			var needNotification = subscribers.filter(function (subscriber) {return subscriber.matches(event);});
			if ( needNotification.count() > 0 ) {
				log.startGroup(log.flags.subscriptions.notify,'Notifying subscribers of '+event.description);
				needNotification.each(function () {
					notifications.send(this.notification(event));
				});
				log.endGroup(log.flags.subscriptions.notify);
			}
		};
		
		this.debug = function () {
			return subscribers.count() > 0 ? '{'+subscribers.count()+' subscribers}' : '';
		};
		
	};
	
	
	var CollectionSubscriber = function (subscription) {
	
		this.description = subscription.description;
	
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
	
	
	var ObjectSubscriber = function (subscription) {

		this.description = subscription.description;

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
	
	var DomainObjectCollection = function (specification) {
		
		specification = specification || {};
		
		log.startGroup(log.flags.domainobjectcollection.create,'Creating a DomainObjectCollection: '+specification.description);
		
		if ( specification.ordering ) {
			specification.ordering = makeOrdering(specification.ordering);
		}
		
		this.objects		= specification.objects ? specification.objects : [];
		this.subscribers	= new SubscriptionList(notifications);
		
		var sorted = false;
		
		this.length = this.count = function () {
			return this.objects.length;
		};
		
		this.get = function (id) {
			return this.objects[id];
		};
		
		this.add = function (object) {
			if ( !MembershipPredicate(this)(object) ) {
				this.objects.push(object);
				this.subscribers.notify({method:'add',object:object,description:'object addition'});
				object.subscribe({
					target: this,
					key: ':any',
					change: function (object) {
						sorted = false;
						this.subscribers.notify({
							method:'change',
							object:object,
							description:'object change'
						}); 
					},
					description: 'object change for '+specification.description+' collection change'
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
			var partition = partitionArray( this.objects, makePredicate(predicate) || NonePredicate() );
			this.objects = partition.fail;
			for (var i in partition.pass) {
				partition.pass[i].removed();
				this.subscribers.notify({method:'remove',object:partition.pass[i],description:'object removal'});
			}
			return this;
		};
		
		this.by = function () {			
			return new DomainObjectCollection({
				objects: copyArray(this.objects),
				ordering: makeOrdering.apply(null,arguments),
				description:'ordered '+specification.description
			});	
		};
		
		
		this.sort = function () {
			
			if (arguments.length > 0) {
				specification.ordering = makeOrdering.apply(null,arguments);
			}
			
			// Remember old order
			for(var i=0; i<this.objects.length; i++) {
				this.objects[i].domain.tags.position = i;
			}
			
			// Sort
			this.objects.sort(specification.ordering);
			
			// Find permutation
			var permutation = [];
			for(var i=0; i<this.objects.length; i++) {
				permutation[i] = this.objects[i].domain.tags.position;
				delete this.objects[i].domain.tags.position;
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
				this.subscribers.notify({method:'sort',permutation:permutation,description:'collection sort'});
			}
			
			sorted = true;
			
			return this;
			
		};
		
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
				predicate	= makePredicate(arguments[0]);
				selector	= arguments[1];
			}
			
			if ( predicate && predicate !== null && (typeof predicate != 'undefined') ) {
				return (
					new	DomainObjectCollection({
							objects: partitionArray(this.objects,predicate).pass,
							description:'filtered '+specification.description
						})
					).select(selector);
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
			
			log.startGroup(log.flags.subscriptions.subscribe,'Subscribing: '+subscription.description);

			if ( subscription.predicate || subscription.selector ) {
				log.debug(log.flags.subscriptions.subscribe,'Creating a collection member subscription: '+subscription.description);
				subscription.type	= 	CollectionMemberNotification;
				subscription.filter = 	function (collection) {
											return function (event) {
												return collection.filter(subscription.predicate).select(subscription.selector) === event.object
														&& ( event.method == 'add' || event.method == 'initialise' ); // NOTE: Fix this
											};
										}(this);							
			}
			else if ( ( typeof subscription.add == 'string' ) && ( typeof subscription.remove == 'string' ) ) {
				log.debug(log.flags.subscriptions.subscribe,'Creating a collection event subscription: '+subscription.description);
				subscription.type	= CollectionEventNotification;
			}
			else {
				log.debug(log.flags.subscriptions.subscribe,'Creating a collection method subscription: '+subscription.description);
				subscription.type	= CollectionMethodNotification; 
			}
			
			var subscriber = new CollectionSubscriber(subscription)
			this.subscribers.add(subscriber);
			
			if ( subscription.initialise ) {
				log.startGroup(log.flags.subscriptions.subscribe,'initialising subscription');
				this.each(function (index,object) {
					var event = {method:'initialise',object:object,description:'initialisation'}
					if ( subscriber.matches(event) ) {
						notifications.send(subscriber.notification(event));
					}
				});
				log.endGroup(log.flags.subscriptions.subscribe);
			}
			
			log.endGroup(log.flags.subscriptions.subscribe);
			
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
		
		
		// Initial sort
		if ( specification.ordering ) {
			this.sort();
			sorted = true;
		}

		
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
			var view = new View(specification.base,this,specification.predicate);
		}
		else if ( specification.base ) {
			throw 'Error: Invalid base collection type';
		}
		
		log.endGroup(log.flags.domainobjectcollection.create);
		
		
	};
	
	
	external.set = function() {
		var objects = [];
		for (var i=0; i<arguments.length; i++) {
			objects.push(arguments[i]);
		}
		return new DomainObjectCollection({objects:objects,description:'set'});
	};
	
	
	var DeletedObjectsCollection = function (collection) {
		
		var deleted = new DomainObjectCollection({description:'deleted'});
		
		deleted.debug = function () {
			var contents = '';
			for ( var i in this.objects ) {
				var obj = this.objects[i];
				contents += ' ('+obj.primaryKeyValue()+') ';
			}
			return contents;
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
	
	
	var View = function (parent,child,predicate) {
		
		predicate = makePredicate(predicate);
		
		parent.each(function (index,object) {
			if ( predicate(object) ) {
				child.add(object);
			}
		});
		
		parent.subscribe({
			source: 		parent,
			target: 		child,
			add: 			parentAdd,
			remove: 		parentRemove,
			change: 		parentChange,
			description: 	'view'
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
	
	var makeCollection = function(set) {
		return (set instanceof DomainObjectCollection) ? set : set();
	};
	
	external.union = function() {
		var union = new DomainObjectCollection({description:'union'});
		for (var i=0; i<arguments.length; i++ ) {
			var collection = makeCollection(arguments[i]);
			collection.each(function (index,object) {
				union.add(object);
			});
		}
		return union;
	};
	
	external.intersection = function() {
		var intersection = makeCollection(arguments[0]);
		for (var i=1; i<arguments.length; i++ ) {
			intersection = intersection.filter(MembershipPredicate(arguments[i]));
		}
		return intersection;
	};
	
	external.difference = function(first,second) {
		return makeCollection(first).filter( Not(MembershipPredicate(second)) );
	};
	
	
	// ------------------------------------------------------------------------
	//														   		  Orderings
	// ------------------------------------------------------------------------
	
	var makeOrdering = external.ordering = function () {
		if ( arguments.length > 1 ) {
			return CompositeOrdering.apply(null,arguments);
		}
		else if ( arguments[0] instanceof Array ) {
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
	};
	
	var FieldOrdering = external.field = function (fieldName,getter) {
		
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
	
	var PredicateOrdering = external.score = function () {
		
		var predicates = arrayFromArguments(arguments);
		
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
	
	var FieldPathOrdering = external.path = function (fieldpath) {
		
		function getFieldValue(object,path) {
			var property, value;
			for (var i=0; i<path.length; i++) {
				property = path[i];
				value = object[property]();
				if ( !(typeof value == 'object') ) {
					return value;
				}
				else {
					object = value instanceof DomainObjectCollection ? value.first() : value;
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
		
	};
	
	var DescendingOrdering = external.desc = function (ordering) {
		ordering = makeOrdering(ordering);
		return function (a,b) {
			return -ordering(a,b);
		};
	};
	
	var CompositeOrdering = external.composite = function () {
		var orderings = arrayFromArguments(arguments);
		for (var i=0; i<orderings.length; i++) {
			orderings[i] = makeOrdering(orderings[i]);
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
	
	var makePredicate = external.predicate = function (parameter) {
		if ( typeof parameter == 'function' ) {
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
		return null;
	};
	
	// All
	
	var AllPredicate = function () {
		return function (candidate) {
			return true;
		};
	};
	
	external.all = AllPredicate();
	
	// None
	
	var NonePredicate = function () {
		return function (candidate) {
			return false;
		};
	};
	
	external.none = NonePredicate();
	
	// Object Identity
	
	var ObjectIdentityPredicate = external.is = function (object) {
		return function (candidate) {
			return candidate === object;
		};
	};
	
	// Primary Key Identity
	
	var IdentityPredicate = external.id = function (id) {
		return function (candidate) {
			return candidate.primaryKeyValue() == id;
		};		
	};
	
	// Generic function
	
	var FunctionPredicate = external.test = function (fn) {
		return function (candidate) {
			return fn(candidate);
		};
	};
	
	// Example
	
	var ExamplePredicate = external.example = function (example) {
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
					var collection = children.length ? children : new DomainObjectCollection({objects:[children],description:'children'});
					if ( collection.filter(example[exampleForeignKey]).length() === 0 ) {
						return false;
					}
				}

			}
			
			return true;
			
		};		
	};
	
	// Type
	
	var TypePredicate = external.type = function (type) {
		return function (candidate) {
			return typeof candidate === type;
		};
	};
	
	// Instance
	
	var InstancePredicate = external.isa = function (constructor) {
		constructor = constructor.entitytype ? constructor.entitytype.constructor : constructor;
		return function (candidate) {
			return candidate instanceof constructor;
		};
	};
	
	// Relationship
	
	var RelationshipPredicate = external.related = function (parent,field) {
		return function (candidate) {
			return candidate.get(field) == parent.primaryKeyValue();
		};
	};
	
	// Membership
	
	var MembershipPredicate = external.member = function (collection) {		
		collection = makeCollection(collection);
		return function (candidate) {
			return collection.filter(ObjectIdentityPredicate(candidate)).count() > 0;
		};
	};
	
	// Modification state
	
	var ModifiedPredicate = function () {
		return function (candidate) {
			return candidate.domain.dirty;
		};
	};	
	
	external.dirty = ModifiedPredicate();
	
	// Comparisons
	
	var Eq = external.eq = function (field,value) {
		return function (candidate) {
			return candidate.get(field) == value;
		};
	};
	
	var Lt = external.lt = function (field,value) {
		return function (candidate) {
			return candidate.get(field) < value;
		};
	};
	
	var Gt = external.gt = function (field,value) {
		return function (candidate) {
			return candidate.get(field) > value;
		};
	};
	
	var LtE = external.lte = function (field,value) {
		return Not(Gt(field,value));
	};
	
	var GtE = external.gte = function (field,value) {
		return Not(Lt(field,value));
	};
	
	external.between = function (field,lower,higher) {
		return And(	GtE(field,lower), LtE(field,higher) );
	};
	
	// Logical connectives
	
	var Or = external.or = function () {
		var predicates = arrayFromArguments(arguments);
		return function (candidate) {
			for (var i=0; i<predicates.length; i++) {
				if (predicates[i](candidate)) {
					return true;
				}
			}
			return false;
		};
	};
	
	var And = external.and = function () {
		var predicates = arrayFromArguments(arguments);
		return function (candidate) {
			for (var i=0; i<predicates.length; i++) {
				if (!(predicates[i](candidate))) {
					return false;
				}
			}
			return true;
		};
	};
	
	var Not = external.not = function (predicate) {
		return function (candidate) {
			return !predicate(candidate);
		};
	};
	
	// Utility function used by And and Or.
	var arrayFromArguments = function (args) {
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
	
	var DomainObject = function (entitytype) {
		
		
		var data 		= {},
			subscribers = new SubscriptionList(notifications);
			
		
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
				log.debug(log.flags.domainobject.set,'Setting '+key+' to "'+value+'"');
				data[key] = value;
				subscribers.notify({key:key,description:'field value change: '+key});
				if ( arguments.length == 2 || arguments[2] ) {
					subscribers.notify({key:':any',description:'field value change: any'});
				}
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				log.startGroup(log.flags.domainobject.set,'Setting fields');
				var mappings = arguments[0];
				for ( key in mappings ) {
					this.set(key,mappings[key],false);
				}
				subscribers.notify({key:':any',description:'field value change: any'});
				log.endGroup();
			}

			this.domain.dirty = true;

			return this;
	
		};
		
		
		this.removed = function (collection) {
			subscribers.notify({removed:true,description:'object removal'});
		};
		
		
		this.subscribe = function (subscription) {

			subscription.source = this;

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

			var subscriber = new ObjectSubscriber(subscription);

			subscribers.add(subscriber);

			if ( subscription.initialise ) {
				notifications.send(subscriber.notification({key:subscription.key}));
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
					relationship 							= new OneToOneRelationship(that,descriptor);
					that.relationships[descriptor.accessor] = relationship;
					that[descriptor.accessor] 				= function (relationship) {return relationship.get;}(relationship);
					that['add'+descriptor.accessor]			= function (relationship) {return relationship.add;}(relationship);
				}

				for ( i in that.hasMany ) {
					descriptor = that.hasMany[i];
					relationship											= new OneToManyRelationship(that,descriptor);
					that.relationships[descriptor.accessor] 				= relationship;
					that[(descriptor.plural || descriptor.accessor+'s')] 	= function (relationship) {return relationship.get;}(relationship);
					that['add'+descriptor.accessor]							= function (relationship) {return relationship.add;}(relationship);
					that['remove'+descriptor.accessor]						= function (relationship) {return relationship.remove;}(relationship);
					that['debug'+descriptor.accessor]						= function (relationship) {return relationship.debug;}(relationship);
				}

			};
			
			return {
				
				dirty: false,
				
				tags: {},
				
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
						subscribers.notify({key:i,description:'field value'});
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
	
	var OneToOneRelationship = function (parent,relationship) {
		
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
	
	
	var OneToManyRelationship = function (object,relationship) {
		
		relationship.direction	= 'reverse';
		this.enabled 			= relationship.enabled;

		var children			= new DomainObjectCollection({
											base: 	     entities[relationship.prototype].objects,
											predicate: 	 RelationshipPredicate(object,relationship.field),
											description: 'children by relationship '+relationship.accessor
										});
		
		// Deletions might cascade								
		if ( relationship.cascade ) {
			object.subscribe({
				removed: 	function () {
								children.each(function (index,child) {
									entities[relationship.prototype].objects.remove(child);
								});
							}
			});
		}
		
		// Relationship might specify subscription to children							
		if ( relationship.subscription ) {
			var subscription = relationship.subscription;
			subscription.source = children;
			subscription.target = object;
			subscription.description = subscription.description || 'subscription to relationship children';
			children.subscribe(subscription);
		}
		
		this.get = function () {
			return children.filter.apply(children,arguments);
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
			
			log.startGroup(log.flags.json.thaw,'thawing a '+key);
			
			var partitionedData = partitionObject(data,TypePredicate('object'),'children','fields');
			
			var object;
			if ( parent && parent.relationships[key] ) {
				log.debug(log.flags.json.thaw,'adding object to relationship');
				object = parent.relationships[key].add(partitionedData.fields);
			}
			else {
				if ( entities[key] ) {
					log.debug(log.flags.json.thaw,'creating free object');
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
			
			log.endGroup(log.flags.json.thaw);

		}
		
		
		return {
			
			thaw: 	function (data,options) {
						log.startGroup(log.flags.json.thaw,'thawing JSON');
						options = options || {};
						data = ( data instanceof Array ) ? data : [data];
						for ( var i in data ) {
							for ( var key in data[i] ) {
								makeObject(key,data[i][key],options.parent);
							}
						}
						log.endGroup(log.flags.json.thaw);
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
		for(var i in original) {
			copy[i] = original[i];
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
	
	
	// ------------------------------------------------------------------------
	// 																	Fluency 
	// ------------------------------------------------------------------------
	
	external.log.prototoype		= external.prototype;
	external.log.context		= external.context;
	external.log.notifications	= external.notifications;
	external.log.json			= external.json;
	
	external.prototype.context			= external.context;
	external.prototype.notifications	= external.notifications;
	external.prototype.json				= external.json;
	external.prototype.log				= external.log;
	
	external.context.prototype			= external.prototype;
	external.context.notifications		= external.notifications;
	external.context.json				= external.json;
	external.context.log				= external.log;
	
	external.notifications.prototype	= external.prototype;
	external.notifications.context		= external.context;
	external.notifications.json			= external.json;
	external.notifications.log			= external.log;
	
	external.json.prototype				= external.prototype;
	external.json.context				= external.context;
	external.json.notifications			= external.notifications;
	external.json.log					= external.log;
	
	return external;
	
}();

if (!_) {
	var _=jModel;
}