/*
 *	Diamond Javascript Library
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires topaz.js
 *
 */

define(['jmodel/topaz'],function (topaz,a,b,c,undefined) {

	//
	// Import Topaz
	//
 
	// Non-strict section
	for ( var i in topaz ) {
		eval('var '+i+' = topaz.'+i);
	}
	
	return (function () {
		
		// Turn on strict mode for main section of library
		'use strict';
 
		var di		= extend({diamond_version:'0.1.0'},topaz),
			_		= di,
			_slice	= Array.prototype.slice,
			nextKey	= -1; // NOTE: make this nicer


		//
		// Context
		//
		
		function Context (name) {

			this.isDefault		= false;
			this.name			= name;

			this.types			= new EntityTypes(this);
			this.type			= delegateTo(this.types,'get');

/*			this.events			= new EventRegistry(this.notifications,'checkpoint');
			this.event			= delegateTo(this.events,'filter');

	//		this.all			= new ObservableTypedSet(ObservableObject);

	//		this.constraints    = new TypedSet(GlobalReferentialConstraint);

			// Adding a new object of a type in the context should add to the context's
			// collection of all objects
			this.types.event('add')
				.subscribe({
					context: this,
					message: function (type) {
						console.log('Creating inclusion constraint');
						var constraint = TypeInclusionConstraint(type,this.all)
					}
				}); */

		}
		
		Context.prototype = {};
		
		di.Context = Context;


		//
		// EntityTypes
		//
		
		function EntityTypes (context) {
			Map.To(EntityType).apply(this);
			this.ensure = ensure(EntityType,context);
			this.context = context;
		}
		
		EntityTypes.prototype = Object.extend(new (Map.To(EventType))(), {

			
		});
	
		di.EntityTypes = EntityTypes;


		//
		// EntityType
		//
		// Note that this is a higher-order type.
		//

		function EntityType (context,fields,options) {

			var entityType = function (data) {
				ObservableObject.call(this,fields,options);
				if ( data ) {
					this.set(data);
					entityType.objects.add(this);
				}
			};
			
			entityType.displayName = options.name;
			entityType.objects 	   = new Entities(entityType,options.superType ? options.superType.objects : undefined);

			return Object.extend(entityType, {

				constructor:	entityType,
				typeName:		options.name,
				superType:		options.superType,
				prototype:		options.proto instanceof ObservableObject ? options.proto : Object.extend(new ObservableObject(), fields.methods),

				get:			delegateTo(entityType.objects,'get'),
				create: 		delegateTo(entityType.objects,'create'),

				subtype:		function (subfields,suboptions) {
									return context.types.create(
										EnhancedObject.from(fields).addProperties(subfields).removeProperties('methods'),
										EnhancedObject.from(options).addProperties(suboptions).addProperties({
											proto: Object.extend(new entityType(), subfields.methods),
											superType: entityType
										})
									);
								}

			});

		}
		
		EntityType.prototype = {};
		
		di.EntityType = EntityType;
		
		
		//
		// Entities
		//
		
		function Entities (constructor,superType) {
			ObservableTypedSet.call(this,constructor);
/*			if ( super ) {
				var constraint = new TypeInclusionConstraint(this,super);
			} */
		}

		Entities.prototype = Object.extend(new ObservableTypedSet(),{
		
			create: function (data) {
				return this.ensure.apply(null,arguments);
			}
			
		});

		di.Entities = Entities;


/*		
		
		//
		// Context
		//

		di.context = {};


		Context.prototype = {

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
						.reduce(bymethod('add',context,entitytype),context.constraints);
			    });
			}

		};

		//
		// EntityTypeSet
		//

		function EntityTypeSet (context) {

			ObservableSet.call(this,EntityType);

			this.context = context;
			this.index(resolve('typeName'));

		}

		// Can’t inherit from ObservableTypedSet as EntityType isn’t a constructor
		EntityTypeSet.prototype = extend({

			add: function (fields,options) {
				return ObservableSet.prototype.add.call(this, fields instanceof Function ? fields : EntityType(this.context,fields,options))
			},

			create: function () {
				this.add.apply(this,arguments);
				return this.added;
			},

			predicate: function _predicate (parameter) {
				if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
					return extend({unique:true},PropertyPredicate('name',parameter));
				}
				else {
					return ObservableSet.prototype.predicate.apply(this,arguments);
				}
			}

		}, new ObservableSet() );

		//
		// EntitySet
		//

		function EntitySet (constructor,super) {
			ObservableTypedSet.call(this,constructor);
			if ( super ) {
				var constraint = new TypeInclusionConstraint(this,super);
			}
		}

		EntitySet.prototype = extend({

			create: function (data) {
				return this.__construct(data);
			}

		}, new ObservableTypedSet() );


		//
		// TypeInclusionConstraint
		//

		function TypeInclusionConstraint (set,super) {

			// Adding to set adds to superset
			set.event('add')
				.subscribe({
					context: super,
					message: function (entity) {
						this.add(entity);
					}
				});

			// Removing from set removes from superset
			set.event('remove')
				.subscribe({
					context: super,
					message: function (entity) {
						this.remove(entity);
					}
				});

			// Removing from superset removes from set	
			super.event('remove')
				.subscribe({
					context: set,
					message: function (entity) {
						this.remove(entity);
					}
				});

		}


		//
		// Primary Key
		//

		function key (options) {
			options = ( typeof options === 'object' ) ? options : {defaultValue:options};
			return function (object,field,entity_set) {
				var field		= new IntegerField(object,field,options),
					constraint 	= new PrimaryKeyConstraint(field,entity_set);
				return field;
			};
		}

		external.key = key;


		//
		// PrimaryKeyConstraint
		//

		function PrimaryKeyConstraint (field,entity_set) {

			if ( field.get() === null || typeof field.get() === 'undefined' ) {
				field.set(nextKey--);
			}

			field.event.subscribe(function (value) {
				if ( value === null || typeof value === 'undefined' ) {
					field.set(nextKey--);
				}
			});

		}

		//
		// Default context
		//

		external.context = new Context('default');
		
*/
		
			
		return di;

	})();

});