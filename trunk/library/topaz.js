/*
 *	Topaz Javascript Library
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires emerald.js
 *
 */
 
 
// ============================================================================
//													Topaz Observables Framework
// ============================================================================
 
define(['jmodel/emerald'],function (emerald,a,b,c,undefined) {

	//
	// Import Emerald
	//
 
	// Non-strict section
	for ( var i in emerald ) {
		eval('var '+i+' = emerald.'+i);
	}
	
	return (function () {
		
		// Turn on strict mode for main section of library
		'use strict';
		
		var topaz	= extend({topaz_version:'0.13.0'},emerald),
			_		= topaz,
			_slice	= Array.prototype.slice;
		
		
		// ------------------------------------------------------------------------
		//														  Observable Sets
		// ------------------------------------------------------------------------

		function observable (proto) {

			return extend({

				add: proto.add.post(function () {
					if ( typeof this.added !== 'undefined' ) {
						this.event('add').raise(this.added,this);
					}
				}),

				remove: proto.remove.post(function (removed) {
					var that = this;
					removed.each(function (item) {
						that.event('remove').raise(item,that);
					});
				}),

				create: function () {
					var args = _slice.call(arguments);
					return proto.create.apply(this,[this].concat(arguments));
				}

			}, copy(proto,true));

		}

		function ObservableSet () {
			Set.apply(this);
			makeObservable.call(this);
		}

		ObservableSet.prototype				= observable(Set.prototype);

		function ObservableTypedSet (constructor) {
			TypedSet.call(this,constructor);
			makeObservable.call(this);
		}

		ObservableTypedSet.prototype 				= observable(TypedSet.prototype);

		function makeObservable () {

			this.events	= new EventRegistry('add','remove','initialise','sort','change');
			this.event	= delegateTo(this.events,'get');

			this.event('add')
				.where(has('event','change'))
				.subscribe({
					context: this.event('change'),
					message: function (object) {
						object.event('change')
					    	.republish(this); 
					}
				});

			return this;

		}

		topaz.ObservableSet = ObservableSet;
		topaz.ObservableTypedSet = ObservableTypedSet;

		topaz.plugin.set.asObservable = function () {
			return this.reduce(method('add'),new ObservableSet());
		};

		topaz.plugin.typedset.asObservable = function () {
			return this.reduce(method('add'),new ObservableTypedSet(this.__constructor));
		};


		// ------------------------------------------------------------------------
		//														 Observable Objects
		// ------------------------------------------------------------------------

		function ObservableObject (fields,options) {

			this.options		= options || {};
			this.options.tags	= this.options.tags || [];
			this.fields			= [];

			this.events = new EventRegistry('change');
			this.event	= delegateTo(this.events,'get');

			for ( var field in fields ) {
				if ( fields.hasOwnProperty(field) ) {
					this.instantiateField(field,fields[field]);
				}
			}

		}

		ObservableObject.prototype = {

			constructor: ObservableObject,

			instantiateField: function (field,value) {
				value = typeof value === 'function' ? value : scalar({defaultValue:value});
				this.fields.push(value.call(this,this,field));
			},

			set: function (properties) {
				for ( var property in properties ) {
					if ( properties.hasOwnProperty(property) ) {
						if ( property === 'methods' ) { // Methods
							var methods = properties[property];
							for ( var method in methods ) {
								if ( methods.hasOwnProperty(method) ) {
									this[method] = methods[method];
								}	
							}
						}
						else { // Field
							this[property].call(this,properties[property]);
						}
					}	
				}
				return this;
			}

		};

		topaz.ObservableObject = ObservableObject;


		//
		// Type
		//

		function Type (fields,options) {
			return extend({
				prototype: new ObservableObject()
			}, function (data) {
				ObservableObject.call(this,fields,options);
				this.set(data);
			});
		}

		topaz.Type = Type;


		//
		// Scalar field
		//

		function scalar (options) {
			options = typeof options === 'object' ? options : {defaultValue:options};
			return function (object,field) {
				return new ScalarField(object,field,options);
			};
		}

		topaz.scalar = scalar;

		function ScalarField (object,field,options) {

			if ( object && field && options ) {

				this.object		= object;
				this.field		= field;
				this.options 	= options || {};

				this.constraint	= this.options.constraint || AllPredicate;

				this.event		= null;
				this.change 	= this.object.event('change');

				this.instantiate();
				this.set(typeof this.options.defaultValue !== 'undefined' ? this.options.defaultValue : null);

				if ( this.object.options.persist ) {
					this.persist();	
				}

			}

		}

		ScalarField.prototype = {

			constructor: ScalarField,

			instantiate: function () {

				this.event = this.object.events.create(this.field)
					.remember( this.options.remember || this.object.options.remember );

				var that = this;
				this.object[this.field] = function (value) {
					return arguments.length === 0 ? that.get() : that.set(value);
				};

			},

			persist: function () {

				var fromStore = this.object.options.persist[this.object.options.prefix+'_'+this.field] || undefined;
				if ( fromStore ) {
					this.set(fromStore);
				}

				this.event
					.subscribe({
						context: {
							store: 	this.object.options.persist,
							key: 	this.object.options.prefix+'_'+this.field
						},
						message: function (value) {
							this.store[this.key] = value;
						}
					});

			},

			get: function () {
				return this.value;
			},

			set: function (value) {

				var oldValue = this.value;
				value = typeof value === 'function' ? value.call(this,oldValue) : value;

				if ( this.options.repeat || ( typeof value !== 'undefined' && !this.equals(value,oldValue) ) ) {

					if ( this.constraint(value) ) {

						this.value = value;

						this.event.raise.apply(this.event,[value,oldValue]);

						this.change.raise({
							field: this.field,
							value: value,
							old: oldValue
						});

					}
					else {
						this.event.fail.apply(this.event,[value,oldValue]);
					}

				}

				return this.object;

			},

			equals: function (a,b) {
				return a === b;
			}

		};

		topaz.ScalarField = ScalarField;

		//
		// BooleanField
		//

		function boolean (options) {
			options = typeof options === 'object' ? options : {defaultValue:options};
			return function (object,field) {
				return new BooleanField(object,field,options);
			};
		}

		topaz.boolean = boolean;

		function BooleanField (object,field,options) {
			ScalarField.call(this,object,field,options);
		}

		BooleanField.prototype = extend({

			set: function (value) {

				value =   typeof value === 'string' && value.toLowerCase() === 'true'  ? true
						: typeof value === 'string' && value.toLowerCase() === 'false' ? false
						: Boolean(value);

				ScalarField.prototype.set.call(this,value);

			}

		}, new ScalarField() );

		topaz.BooleanField = BooleanField;

		//
		// IntegerField
		//

		function integer (options) {
			options = typeof options === 'object' ? options : {defaultValue:options};
			return function (object,field) {
				return new IntegerField(object,field,options);
			};
		}

		topaz.integer = integer;

		function IntegerField (object,field,options) {
			ScalarField.call(this,object,field,options);
		}

		IntegerField.prototype = extend({

			set: function (value) {
				value = typeof value === 'string' ? parseInt(value,10) : value;
				ScalarField.prototype.set.call(this,value);
			}

		}, new ScalarField() );

		topaz.IntegerField = IntegerField;

		//
		// StringField
		//

		function string (options) {
			options = typeof options === 'object' ? options : {defaultValue:options};
			return function (object,field) {
				return new StringField(object,field,options);
			};
		}

		topaz.string = string;

		function StringField (object,field,options) {
			ScalarField.call(this,object,field,options);
		}

		StringField.prototype = extend({

			set: function (value) {
				ScalarField.prototype.set.call(this,String(value));
			}

		}, new ScalarField() );

		topaz.StringField = StringField;

		//
		// DateField
		//

		function date (options) {
			options = typeof options === 'object' ? options : {defaultValue:options};
			return function (object,field) {
				return new DateField(object,field,options);
			};
		}

		topaz.date = date;

		function DateField (object,field,options) {
			ScalarField.call(this,object,field,options);
		}

		DateField.prototype = extend({

			set: function (value) {
				ScalarField.prototype.set.call(this,typeof value === 'date' ? value : new Date(value))
			}

		}, new ScalarField() );

		topaz.DateField = DateField;

		//
		// ObjectField
		//

		function object (options) {
			options = typeof options === 'object' ? options : {defaultValue:options};
			return function (object,field) {
				return new ObjectField(object,field,options);
			};
		}

		topaz.object = object;

		function ObjectField (object,field,options) {
			ScalarField.call(this,object,field,options);
		}

		ObjectField.prototype = extend({

			equals: function (a,b) {
				var equal = true;
				for ( var prop in a ) {
					if ( a.hasOwnProperty(prop) ) {
						equal = equal && ( typeof b !== 'undefined' ) && ( a[prop] === b[prop] );
					}
				}
				return equal;
			}

		}, new ScalarField() );

		topaz.ObjectField = ObjectField;


		//
		// Collection field
		//

		function many (type) {
			return function (object,field) {
				return new CollectionField(object,field,type);
			};
		}

		topaz.many = many;

		function CollectionField (object,field,type) {

			ObservableTypedSet.call(this,type);

			this.object			= object;
			this.field			= field;
			this.__constructor	= type;

			this.instantiate();

		}

		CollectionField.prototype = extend({

			instantiate: function () {
				this.object[this.field] = delegateTo(this,'filter');
			}

		}, new ObservableTypedSet() );

		topaz.CollectionField = CollectionField;
		
		
		return topaz;
		
	})();

});