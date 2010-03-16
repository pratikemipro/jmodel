(function () {

	var _ 		= jModel,
		log 	= _.log,
		extend	= _.extend,
		plugin	= _.plugin;


	function aspect (options) {
	
		return function () {
		
			var returnValue;
		
			if ( options.pre ) {
				options.pre.apply(this,arguments);
			}
			returnValue = options.target.apply(this,arguments);
			if ( options.post ) {
				options.post.apply(this,arguments);
			}
		
			return returnValue;
		
		};
	
	};
	
	_.aspect = aspect;


	//
	// Context
	//
	
	extend({
		
		debug: function _debug (showSubscribers) {
			log().startGroup('Context: '+name);
			this.notifications.debug();
			this.entities.each(function __debug (entity) {
				log().startGroup(entity.name);
				entity.objects.debug(showSubscribers);
				entity.deleted.debug(false);
				log().endGroup();
			});
			log().endGroup();
		}
		
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
			post: function () {
				log('domainobject/create').endGroup();
			}
		})
		
	}, plugin.entitytype );

	
	//
	// DomainObjectCollection
	//
	
	extend({
		
		debug: function _debug (showSubscribers) {
			if ( _.Not(_.EmptySetPredicate)(this) ) {
				log().debug('Objects:  '+this.format(_.listing(_.Method('primaryKeyValue'))));
			}
			if ( showSubscribers ) {
				this.subscribers().debug();
			}
		},
		
		create: aspect({
			target: plugin.entitytype.create,
			pre: function () {
				log('domainobject/create').startGroup('Creating a new '+this.name);
			},
			post: function () {
				log('domainobject/create').endGroup();
			}
		})
		
	}, plugin.domaincollection );

	
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
				post: function () {
					log('domainobject/set').endGroup();
				}
			})
			
		}, plugin.domainobject.set )
		
		reifyFields: aspect({
			target: plugin.domainobject.reifyFields,
			pre: function () {
				log('domainobject/create').startGroup('Reifying fields');
			},
			post: function () {
				log('domainobject/create').endGroup();
			}
		}),
		
		reifyOneToOneRelationships: aspect({
			target: plugin.domainobject.reifyOneToOneRelationships,
			pre: function () {
				log('domainobject/create').startGroup('Reifying one-to-one relationships');
			},
			post: function () {
				log('domainobject/create').endGroup();
			}
		}),
		
		reifyOneToManyRelationships: aspect({
			target: plugin.domainobject.reifyOneToManyRelationships,
			pre: function () {
				log('domainobject/create').startGroup('Reifying one-to-many relationships');
			},
			post: function () {
				log('domainobject/create').endGroup();
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
		
		debug: function _debug () {
			log().debug(this.accessor+': '+this.__delegate);
		}
		
	}, plugin.field );
	

})();