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
		
		var topaz	= Object.extend(emerald,{topaz_version:'0.13.0'}),
			_		= topaz,
			_slice	= Array.prototype.slice;
		
		
		// ------------------------------------------------------------------------
		//														  Observable Sets
		// ------------------------------------------------------------------------

		function observable (proto) {

			return Object.extend(copy(proto,true), {

				add: proto.add.post(function () {
					if ( typeof this.added !== 'undefined' ) {
						this.event('add').raise(this.added,this);
					}
				}),

				remove: proto.remove.post(function (removed) {
					var that = this;
					if ( !removed.each ) {
						console.log(this);
						console.log(removed);
					}
					removed.each(function (item) {
						that.event('remove').raise(item,that);
					});
				}),

				create: function () {
					var args = _slice.call(arguments);
					return proto.create.apply(this,[this].concat(arguments));
				}

			});

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
			return this.reduce(bymethod('add'),new ObservableSet());
		};

		topaz.plugin.typedset.asObservable = function () {
			return this.reduce(bymethod('add'),new ObservableTypedSet(this.__constructor));
		};


		// ------------------------------------------------------------------------
		//														 Observable Objects
		// ------------------------------------------------------------------------

		function ObservableObject (fields,options) {

			this.options		= options || {};
			this.options.tags	= this.options.tags || [];
			this.fields			= [];

			this.events = new EventRegistry('change');
			this.events.addArray(this.options.events || []);
			this.event	= delegateTo(this.events,'get');

			for ( var field in fields ) {
				if ( fields.hasOwnProperty(field) ) {
					this.instantiateField(field,fields[field]);
				}
			}

		}

		ObservableObject.prototype = {

			__constructor: ObservableObject,

			instantiateField: function (field,value) {

				value =	  typeof value === 'function' && value.decorator ? value
						: typeof value === 'function' ? scalar({type:value})
						: typeof value.defaultValue !== 'undefined' ? scalar(value)
						: scalar({defaultValue:value});
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
							if ( !this[property] ) {
								console.log(arguments);
								console.log(this);
								console.log(property);
							}
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
			return function (data) {
				ObservableObject.call(this,fields,options);
				this.set(data);
			}.extend({
				prototype: new ObservableObject()
			});
		}

		topaz.Type = Type;


		//
		// Scalar field
		//

		function scalar (options) {
			options = typeof options === 'object' ? options : { defaultValue:options };
			options.type = options.type || options.defaultValue.constructor;
			return function (object,field) {
				return new ScalarField(object,field,options);
			}.extend({
				decorator: true
			});
		}

		topaz.scalar = scalar;

		function ScalarField (object,field,options) {

			if ( object && field && options ) {
				
				this.ensure		= Object.ensure(options.type);

				this.object		= object;
				this.field		= field;
				this.options 	= options || {};

				this.constraint	= this.options.constraint || AllPredicate;

				this.event		= null;
				this.change 	= this.object.event('change');

				this.instantiate();

				this.set(typeof this.options.defaultValue !== 'undefined' ? this.options.defaultValue : undefined);

				this.toJSON = options.toJSON || undefined;

				if ( this.object.options.persist ) {
					this.persist();	
				}

			}

		}

		ScalarField.prototype = {

			__constructor: ScalarField,

			instantiate: function () {

				this.event = this.object.events.create(this.field)
					.remember( this.options.remember || this.object.options.remember );

				var that = this;
				this.object[this.field] = function (value) {
					return arguments.length === 0 ? that.get() : that.set(value);
				};

			},

			persist: function () {

				var value = this.fromStore();
				if ( value ) {
					this.set(value);
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
			
			fromStore: function () {
				return this.object.options.persist[this.object.options.prefix+'_'+this.field] || undefined;
			},

			get: function () {
				return this.value;
			},

			set: function (value) {
				
				var oldValue = this.value;
				
				value = typeof value === 'function' ? value.call(this,oldValue) : this.ensure.apply(null,arguments);

				if ( this.options.repeat || this.object.options.repeat || ( typeof value !== 'undefined' && !this.equal(value,oldValue) ) ) {

					if ( this.constraint(value) ) {

						this.value = value;

						this.event.raise.apply(this.event,[value,oldValue]);

						this.change.raise({
							object: this.object,
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

			equal: function (a,b) {
				return a === b;
			}

		};

		topaz.ScalarField = ScalarField;
		

		//
		// ObjectField
		//

		function object (options) {
			options = typeof options === 'object' ? options : {defaultValue:options};
			return function (object,field) {
				return new ObjectField(object,field,options);
			}.extend({
				decorator: true
			});
		}

		topaz.object = object;

		function ObjectField (object,field,options) {
			ScalarField.call(this,object,field,options);
		}

		ObjectField.prototype = Object.extend(new ScalarField(), {

			equal: Object.equal

		});

		topaz.ObjectField = ObjectField;


		//
		// Collection field
		//

		function many (type) {
			return function (object,field) {
				return new CollectionField(object,field,type);
			}.extend({
				decorator: true
			});
		}

		topaz.many = many;

		function CollectionField (object,field,type) {

			ObservableTypedSet.call(this,type);

			this.object			= object;
			this.field			= field;
			this.__constructor	= type;

			this.instantiate();

		}

		CollectionField.prototype = Object.extend(new ObservableTypedSet(), {

			instantiate: function () {
				this.object[this.field] = delegateTo(this,'filter');
			}

		});

		topaz.CollectionField = CollectionField;
		
		
		return topaz;
		
	})();

});