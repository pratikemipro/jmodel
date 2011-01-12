/*
 *	jModel Javascript Library v2.0.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009-2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires opal.js and emerald.js
 *
 */

var jModel = (function () {
	
	
	var external	= _,
		nextKey		= -1; // NOTE: make this nicer
		
	external.jmodel_version = '2.0.0';
	
	
	//
	// Import Emerald
	//
	
	for ( var i in emerald ) {
		eval('var '+i+' = emerald.'+i);
		external[i] = emerald[i];
	}
	
	
	//
	// Context
	//
	
	external.context = {};
	
	
	//
	// EntityTypeSet
	//
	
	function EntityTypeSet (context) {
		
		ObservableTypedSet.call(this,EntityType);
		
		this.context = context;
		this.index(Resolve('typeName'));
		
	}
	
	// Can’t inherit from ObservableTypedSet as EntityType isn’t a constructor
	EntityTypeSet.prototype = extend({
		
		constructor: EntityTypeSet,
		
		add: function (fields,options) {
			return Set.prototype.add.call(this, fields instanceof Function ? fields : EntityType(this.context,fields,options));
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
	
	external.context.types = new EntityTypeSet(external.context);
	
	//
	// EntityType
	//
	
	// Note that this isn’t a constructor but a generator function that returns a constructor
	function EntityType (context,fields,options) {
		
		var entityType = function (data) {
			ObservableObject.call(this,fields,options);
			if ( data ) {
				this.set(data);
				entityType.objects.add(this);
			}
		};
		
		return extend({
			
			constructor:	entityType,
			typeName:		options.name,
			base:			options.base,
			prototype:		options.proto || extend(fields.methods, new ObservableObject()),
			
			objects:		new EntitySet(entityType),
			find:			delegateTo(entityType.objects,'filter'),
			
			subtype:		function (subfields,suboptions) {
								return context.types.create(
									copy(fields).addProperties(subfields).removeProperties('methods'),
									copy(options).addProperties(suboptions).addProperties({
										proto: extend(subfields.methods, new entityType()),
										base: entityType
									})
								);
							}
			
		}, entityType);
		
		
/*		entityType.constructor	= entityType;
		entityType.typeName		= options.name;
		entityType.base			= options.base;
		entityType.prototype	= options.proto || extend(fields.methods, new ObservableObject());
		
		entityType.objects		= new EntitySet(entityType);
		entityType.find			= delegateTo(entityType.objects,'filter');
		
		entityType.subtype = function (subfields,suboptions) {
			return context.types.create(
				copy(fields).addProperties(subfields).removeProperties('methods'),
				copy(options).addProperties(suboptions).addProperties({
					proto: extend(subfields.methods, new entityType()),
					base: entityType
				})
			);
		};
		
		return entityType; */
		
	}
	
	
	//
	// EntitySet
	//
	
	function EntitySet (constructor) {
		TypedSet.call(this,constructor);
	}
	
	EntitySet.prototype = extend({
		
		constructor: EntitySet,
		
		create: function (data) {
			return this.__construct(data);
		}
		
	}, new TypedSet() );
	
	
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
	
	
	return external;
	
	
})();


if (_ && _.opal_version) {
	var _ = jModel;
}