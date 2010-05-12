/*
 *	jModel Debug Plugin v0.1.1
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

(function () {

	var _ 		= jModel,
		extend	= _.extend,
		plugin	= _.plugin,
		aspect	= _.aspect;
	
	
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
	
	var log = Logger({
		
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
	
	_.log = log;


	// ------------------------------------------------------------------------
	//															   Debug output
	// ------------------------------------------------------------------------
	
	//
	// EventRegistry
	//
	
	extend({
	    
		debug: function _debug () {
			this.each(function (eventtype) {
				log().debug(eventtype.name);
			});
        }
	    
	}, plugin.events );
	
	//
	// SubscriberSet
	//

	extend({
		
		debug: function _debug () {
			log().debug('Subscribers:  '+this.count());
		},
		
		add: aspect({
			target: plugin.subscribers.add,
			post: function (state) {
				var subscription = state.args[0].subscription || {};
				if ( this.added ) {
					var description = typeof subscription.description != 'unknown' ? subscription.description : 'unknown';
					log('subscriptions/subscribe').debug('added subscriber: '+description);
				}
				return state.returnValue;
			}
		}),
		
		notify: aspect({
            target: plugin.subscribers.notify,
            pre: function (event) {
                if ( event ) {
                    log('notifications/send').debug('Notifying subscribers of '+event.description);
                }
	        }
        })
		
	}, plugin.subscribers );
	
	
	//
	// NotificationQueue
	//
	
	extend({
	    
		debug: function _debug () {
			log().debug('Pending notifications: '+this.count());
        },
	   
	    flush: aspect({
            target: plugin.notifications.flush,
            pre: function () {
	            log('notifications/control').debug('Flushing notifications for '+this.context.name);
	        }
        })
	    
	}, plugin.notifications );
	
	
	//
	// Notifications
	//
	
	extend({
		
		ContentNotification: aspect({
			target: _.notification.ContentNotification,
			post: function (state) {
				return extend(state.returnValue,function () {
					var subscription = state.args[0];
					log('notifications/send').debug('Receiving a content notification for '+subscription.key+': '+subscription.description+' ('+subscription.source.get(subscription.key)+')');
					state.returnValue();
				});
			}
		}),
		
		ValueNotification: aspect({
			target: _.notification.ValueNotification,
			post: function (state) {
				return extend(state.returnValue,function () {
					var subscription = state.args[0];
					log('notifications/send').debug('Receiving a value notification for '+subscription.key+': '+subscription.description);
					state.returnValue();
				});
			}
		}),
		
		MethodNotification: aspect({
			target: _.notification.MethodNotification,
			post: function (state) {
				return extend(state.returnValue,function () {
					var subscription = state.args[0];
					log('notifications/send').debug('Receiving an object method notification'+': '+subscription.description);
					state.returnValue();
				});
			}
		}),
		
		EventNotification: aspect({
			target: _.notification.EventNotification,
			post: function (state) {
				return extend(state.returnValue,function () {
					var subscription = state.args[0];
					log('notifications/send').debug('Receiving an event notification'+': '+subscription.description);
					state.returnValue();
				});
			}
		}),
		
		RemovalNotification: aspect({
			target: _.notification.RemovalNotification,
			post: function (state) {
				return extend(state.returnValue,function () {
					var subscription = state.args[0];
					log('notifications/send').debug('Receiving a removal notification'+': '+subscription.description);					state.returnValue();
				});
			}
		})
		
/*		CollectionMemberNotification: aspect({
			target: _.notification.CollectionMemberNotification,
			post: function (state) {
				return extend(state.returnValue,function () {
					var subscription = state.args[0];
					log('notifications/send').debug('Receiving a collection member notification');
				});
			}
		}) */
		
	}, _.notification );
	

	//
	// Context
	//
	
	extend({
		
		debug: function _debug (showSubscribers) {
			log().startGroup('Context: '+name);
			this.notifications.debug();
			log().debug('EntityTypes: '+this.entities.count());
			this.entities.each(function __debug (entity) {
				log().startGroup(entity.name);
				entity.objects.debug(showSubscribers);
//				entity.deleted.debug(false); // NOTE: Fix this
				log().endGroup();
			});
			log().endGroup();
		},

		collection: aspect({
			target: plugin.context.collection,
			pre: function (specification) {
			    var description = (specification && specification.description) ? ': '+specification.description : '';
				log('domainobjectcollection/create')
					.startGroup('Creating a DomainObjectCollection: '+description);
			},
			post: function (state) {
				log('domainobjectcollection/create').endGroup();
				return state.returnValue;
			}
		})
		
	}, plugin.context );


	//
	// EntityType
	//
	
	extend({
		
		create: aspect({
			target: plugin.entitytype.create,
			pre: function () {
				log('domainobject/create').startGroup('Creating a new '+this.name);
			},
			post: function (state) {
				log('domainobject/create').endGroup();
				return state.returnValue;
			}
		}),

		collection: aspect({
			target: plugin.entitytype.collection,
			pre: function (specification) {
				log('domainobjectcollection/create')
					.startGroup('Creating a typed DomainObjectCollection: '+specification.description);
			},
			post: function (state) {
				log('domainobjectcollection/create').endGroup();
				return state.returnValue;
			}
		})
		
	}, plugin.entitytype );

	
	//
	// DomainObjectCollection
	//
	
	extend({
		
		debug: function _debug (showSubscribers) {
		    if ( showSubscribers ) {
		        log().startGroup('DomainObjectCollection');
		    }
			if ( _.Not(_.EmptySetPredicate)(this) ) {
				log().debug('Objects ('+this.count()+'):  '+this.format(_.listing(_.Method('name'))));
			}
			if ( showSubscribers ) {
			    log().startGroup('events');
				this.events.each(function (eventtype) {
				    log().debug(eventtype.name+': '+eventtype.subscribers().count());
				});
				log().endGroup();
				log().endGroup();
			}
		},
		
		create: aspect({
			target: plugin.entitytype.create,
			pre: function () {
				log('domainobject/create').startGroup('Creating a new '+this.name);
			},
			post: function (state) {
				log('domainobject/create').endGroup();
				return state.returnValue;
			}
		})
		
	}, plugin.domaincollection );


	_.collection = aspect({
		target: _.collection,
		pre: function () {
			log('domainobjectcollection/create').startGroup('Creating a DomainObjectCollection: set');
		},
		post: function (state) {
			log('domainobjectcollection/create').endGroup();
			return state.returnValue;
		}
	});

	
	//
	// DomainObject
	//
	
	extend({
		
		debug: function _debug (showSubscribers) {
			log().startGroup('Domain Object');
			this.fields().debug();
			if ( showSubscribers ) {
				this.subscribers().debug();
			}
			log().endGroup();
		},
		
		set: extend({
			
			fields: aspect({
				target: plugin.domainobject.set.fields,
				pre: function () {
					log('domainobject/set').startGroup('Setting fields');
				},
				post: function (state) {
					log('domainobject/set').endGroup();
					return state.returnValue;
				}
			})
			
		}, plugin.domainobject.set ),
		
		reifyFields: aspect({
			target: plugin.domainobject.reifyFields,
			pre: function () {
				log('domainobject/create').startGroup('Reifying fields');
			},
			post: function (state) {
				log('domainobject/create').endGroup();
				return state.returnValue;
			}
		}),
		
		reifyOneToOneRelationships: aspect({
			target: plugin.domainobject.reifyOneToOneRelationships,
			pre: function () {
				log('domainobject/create').startGroup('Reifying one-to-one relationships');
			},
			post: function (state) {
				log('domainobject/create').endGroup();
				return state.returnValue;
			}
		}),
		
		reifyOneToManyRelationships: aspect({
			target: plugin.domainobject.reifyOneToManyRelationships,
			pre: function () {
				log('domainobject/create').startGroup('Reifying one-to-many relationships');
			},
			post: function (state) {
				log('domainobject/create').endGroup();
				return state.returnValue;
			}
		})
		
	}, plugin.domainobject);

	
	//
	// FieldSet
	//
	
	extend({
		
		debug: function _debug () {
			this.__delegate.each('debug');
		}
		
	}, plugin.fieldset );
	
	
	//
	// Field
	//
	
	extend({
		
		set: extend({
			
			valid: aspect({
				target: plugin.field.set.valid,
				pre: function (value) {
					log('domainobject/set').debug('Setting '+this.accessor+' to "'+value+'"');
				}
			}),
			
			invalid: aspect({
				target: plugin.field.set.invalid,
				pre: function (value) {
					log('domainobject/set').debug('Setting '+this.accessor+' to "'+value+'" failed validation');
				}
			})
			
		}, plugin.field.set),
		
		debug: function _debug () {
			log().debug(this.accessor+': '+this.__delegate);
		}
		
	}, plugin.field );
	
	
	//
	// JSON
	//
	
	if ( _.json ) {
		
		extend({

			thaw: aspect({
				target: _.json.thaw,
				pre: function () {
					log('json/thaw').startGroup('thawing JSON');
				},
				post: function (state) {
					log('json/thaw').endGroup();
					return state.returnValue;
				}
			})

		}, _.json);	
		
	}
	

})();