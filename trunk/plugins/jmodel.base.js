/*
 *	jModel Base Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Dual licensed under the MIT and GPL licenses
 *
 */


//
// This is provided as a very lightweight system for implementing inheritance
// in Javascript. It's possible to use jModel with more elaborate schemes too
//


// Slight modification of John Resig's code inspired by base2 and Prototype
jModel.Base = (function(){

	var	initializing	= false,
		fnTest 			= /xyz/.test(function(){xyz;}) ? (/\b_super\b/) : (/.*/);

	// The base Base implementation (does nothing)
	var Base = function(){};

	// Create a new Base that inherits from this class
	Base.extend = function _extend (prop) {

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
		function Base () {
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
