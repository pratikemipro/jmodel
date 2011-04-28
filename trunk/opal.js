/*
 *	OPAL Javascript Library
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

// ============================================================================
//									 Object Predicate and Action Library (OPAL)
// ============================================================================

define(function () {

	var opal = {
		opal_version: '0.13.0',
		extend: extend
	};
	
	//
	// Extend Function.prototype with composition and predicate functions
	// A necessary evil in plain sight
	//
	
	// Tests: none
	Function.prototype.then = function (fn2) {
		var fn1 = this;
		return function () {
			return fn2(fn1.apply(null,arguments)); 
		};
	};
	
	// Tests: full
	Function.prototype.curry = function () {
		var args = Array.prototype.slice.call(arguments),
			fn   = this;
		return function () {
			return fn.apply(null,args.concat(Array.prototype.slice.call(arguments)));
		};
	};
	
	// Tests: none
	Function.prototype.delay = function (duration) {
		var fn = this;
		return function () {
			return setTimeout(fn.curry.apply(fn,arguments),duration || 1);
		}
	}

	// Tests: none
	Function.prototype.is = Function.prototype.then;
	
	// Tests: none
	Function.prototype.eq = function (value) {
		return this.then(eq(value));
	};
	
	// Tests: none
	Function.prototype.neq = function (value) {
		return this.then(neq(value));
	};
	
	// Tests: none
	Function.prototype.lt = function (value) {
		return this.then(lt(value));
	};
	
	// Tests: none
	Function.prototype.gt = function (value) {
		return this.then(gt(value));
	};

	// Tests: none
	Function.prototype.lte = function (value) {
		return this.then(lte(value));
	};
	
	// Tests: none
	Function.prototype.gte = function (value) {
		return this.then(gte(value));
	};
	
	// Tests: none
	Function.prototype.between = function (lower,higher) {
		return this.then(between(lower,higher));
	};
	
	// Tests: none
	Function.prototype.matches = function (expression) {
		return this.then(regex(expression));
	}
	
	// Tests: none
	Function.prototype.isnull = function () {
		return this.then(isnull);
	}
	

	//
	// Function composition
	//

    // Tests: full
	function pipe (fn) {
		return    arguments.length <= 1 ? ( fn || identity )
				: fn.then(pipe.apply(null,Array.prototype.slice.call(arguments,1)));
	}

	// Tests: full
	function compose (fn) {
		return	  arguments.length <= 1 ? ( fn || identity )
				: pipe.apply(null,Array.prototype.slice.call(arguments).reverse());
	}
	
	// Tests: full
	function parallel () {
		var fns = Array.prototype.slice.call(arguments);
		return function _parallel () {
			var args0 = arguments[0],
				result = {};
			for (var i in fns) {
				if ( fns.hasOwnProperty(i) ) {
					var label = fns[i] && fns[i].label ? fns[i].label : i;
					arguments[0] = args0[label] != undefined ? args0[label] : args0;
					result[label] = fns[i].apply(null,arguments);
				}
			}
			return result;
		};
	}
	
	
	//
	// Function application
	//
	
	// Tests: full
	function apply () {
		var args	= Array.prototype.slice.call(arguments),
			context	= ( typeof args[0] === 'object' ) ? args.shift() : null,
			fn		= args.shift();
		return fn.apply(context,args);
	}

    // Tests: full
	function applyto () {
		var args = arguments;
		return function _applyto () {
			var args1	= Array.prototype.slice.call(arguments),
			    context	= ( typeof args1[0] === 'object' ) ? args1.shift() : null,
				fn		= args1.shift();
			return fn.apply(context,args);
		};
	}
	

	//
	// Object functions
	// 

    // Tests: full
	function identity (object) {
		return object;
	}

    // Tests: full
	function type (object) {
		return object !== null && typeof object;
	}

    // Tests: partial
	// NOTE: add test that it doesn't set properties that don't exist
	function property (property,generic) {
		function set (object,property,value) { object[property] = value; return object; }
		return function _property (object,specific) {
			var value =   typeof specific !== 'undefined' ? specific
						: typeof generic  !== 'undefined' ? generic
						: undefined;
			return    typeof object[property] === 'undefined' ? undefined
					: typeof value !== 'undefined' ? set(object,property,value)
					: object[property];
		};
	}
	
    // Tests: full
	function method (name) {
		var args = Array.prototype.slice.call(arguments,1);
		return function _method () {
			var args1	= Array.prototype.slice.call(arguments),
				object  = args1.shift(),
				args2	= args.concat(args1);
			return    typeof object[name] === 'undefined' ? undefined
					: typeof object[name] === 'function' ? object[name].apply(object,args2)
					: undefined;
		};
	}
	
	// Tests: full
	function resolve (name) {
	    var args = Array.prototype.slice.call(arguments,1);
		return function _resolve (object) {
		    var args1   = Array.prototype.slice.call(arguments,1),
		        args2   = [object].concat(args,args1);
			return    typeof object[name] === 'undefined' ? undefined
					: typeof object[name] === 'function' ? method(name).apply(null,args2)
					: property(name).apply(null,args2);
		};
	}

    // Tests: full
	function path (elements,separator) {
		var elements = typeof elements === 'string' ? elements.split(separator||'.') : ( elements || [] );
		return function _path (object) {
			return    typeof object === 'undefined' ? undefined
					: elements.length === 0 ? undefined
					: elements.length === 1 ? resolve(elements[0])(object)
					: path.apply(null,elements.slice(1))(resolve(elements[0])(object));
		}
	}

	// Tests: full
	function transform (name,transformer,extractor) {
		var resolver = resolve(name);
		extractor = extractor || resolver;
		return function _transform (object) {
			return resolver(object,transformer(extractor(object)));
		};
	}
	
	// Tests: none
	function aspect (options) {
		return function () {
			if ( options.pre ) {
				options.pre.apply(this,arguments);
			}
			var returnValue = options.target.apply(this,arguments);
			return options.post ? options.post.call(this,{
				args: arguments,
				returnValue: returnValue
			}) : returnValue;
		};
	}

	opal.extend({
		apply: apply,
		applyto: applyto,
		applyto: applyto,
		compose: compose,
		pipe: pipe,
		parallel: parallel,
		identity: identity,
		type: type,
		property: property,
		method: method,
		resolve: resolve,
		path: path,
		transform: transform,
		aspect: aspect
	});


	//
	// Reduction functions
	//

	// Tests: full
	var plus = extend({unit:0,label:'sum'},function _plus (acc,value) {
		return acc + value;
	});

	// Tests: full
	var times = extend({unit:1,label:'product'},function _times (acc,value) {
		return acc * value;
	});
	
	// Tests: full
	var count = function _count (predicate) {
		predicate = predicate || AllPredicate;
		return extend({unit:0,label:'count'}, function __count (acc,value) {
			return acc += (predicate(value) ? 1 : 0);
		});
	};
	
	// Tests: full
	var withmethod = function _withmethod (name) {
		var fn = method(name);
		return function __withmethod (acc,value) {
			return fn(acc,value);
		};
	};
	
	// Tests: full
	var push = function (acc,value) {
		acc.push(value);
		return acc;
	};
	
	// Tests: none
	var add = function _add () {
		switch (arguments.length) {
			case 0:  return add0.apply(null,arguments);
			case 1:  return add1.apply(null,arguments);
			default: return add2.apply(null,arguments);
		}
	};
	
	function add0 () {
		return function __add (acc,value) {
			return acc.add(value);
		};
	}
	
	function add1 (predicate) {
		return function __add (acc,value) {
			return predicate(value) ? acc.add(value) : acc;
		};
	}
	
	function add2 (predicate,mapping,mapfirst) {
		return function __add (acc,value) {
			var mapped = mapping(value);
			return predicate(mapfirst ? mapped : value) ? acc.add(mapped) : acc;
		};
	};
	
	// Tests: none
	var contains = function _contains (predicate) {
		return extend({unit:false}, function __contains (acc,value) {
			return acc || predicate(value);
		});
	};
	
	// Tests: none
	var max = extend({label:'max'}, function _max (acc,value) {
		return acc > value ? acc : value;
	});
	
	// Tests: none
	var min = extend({label:'min'}, function _min (acc,value) {
		return ( acc < value && acc !== null ) ? acc : value;
	});

	opal.extend({
		plus: plus,
		times: times,
		count: count,
		withmethod: withmethod,
		push: push,
		add: add,
		contains: contains,
		max: max,
		min: min
	});
	
	
	//
	// Predicates: generic
	//

	// Tests: none
	function AllPredicate (candidate) {
		return true;
	}

	// Tests: none
	function NonePredicate (candidate) {
		return false;
	}

	// Tests: none
	function istrue (candidate) {
		return candidate === true;
	}

	// Tests: none
    function isnull (candidate) {
        return candidate === null;
    }

	// Tests: none
	function has () {
		var resolver = resolve.apply(null,arguments);
		return function (candidate) {
			return Boolean(resolver(candidate));
		};
	}

	opal.extend({
		AllPredicate: 			AllPredicate,
		NonePredicate: 			NonePredicate,
		istrue:					istrue,
		isnull:					isnull,
		has: 					has
	});
	
	
	//
	// Predicates: object
	//

	// Tests: full
	function is (object) {
		return identity.eq(object);
	}

	// Tests: none
	function is_of_type (test) {
		return type.eq(test);
	}

	// Tests: full
	function isa (constructor) {
		// NOTE: Put this next line into jModel
		constructor = constructor.entitytype ? constructor.entitytype.constructor : constructor;
		return function _instancepredicate (candidate) {
			return candidate instanceof constructor;
		};
	}

	opal.extend({
		is: 		is,
		is_of_type: is_of_type,
		isa: 		isa,
		isan: 		isa
	});
	
	
	//
	// Predicates: value comparison
	//

	// Tests: none
	function compare (operator) {
		return function _compare (value) {
			return function __compare (candidate) {
				return operator(candidate,value);
			};
		};
	}
	
	// Tests: full
	var eq	= compare(function (a,b) { return a===b; }),
		neq	= compare(function (a,b) { return a!==b; }),
		lt	= compare(function (a,b) { return a<b; }),
		gt	= compare(function (a,b) { return a>b; }),
		lte	= compare(function (a,b) { return a<=b; }),
		gte = compare(function (a,b) { return a>=b; });

	// Tests: none
	function between (lower,higher) {
		return function _between (candidate) {
			return lower <= candidate && candidate <= higher;
		};
	}

	// Tests: none
	function regex (expression) {
		return function _regex (candidate) {
			return expression.test(candidate);
		};
	}
	
	opal.extend({
		compare:	compare,
		eq:			eq,
		neq:		neq,
		lt:			lt,
		gt:			gt,
		lte:		lte,
		gte:		gte,
		between:	between,
		regex:		regex
	});
	
	
	//
	// Logical connectives
	//
	
	// Tests: none
	function or () {
		var predicates = Array.prototype.slice.call(arguments);
		return function (candidate) {
			return    predicates.length === 0 ? false
					: predicates[0](candidate) ? true
					: or.apply(null,predicates.slice(1))(candidate);
		};
	}
	
	// Tests: none
	function and () {
		var predicates = Array.prototype.slice.call(arguments);
		return function (candidate) {
			return    predicates.length === 0 ? true
					: !predicates[0](candidate) ? false
					: and.apply(null,predicates.slice(1))(candidate);
		};
	}
	
	// Tests: none
	function not (predicate) {
		return function (candidate) {
			return !predicate(candidate);
		}
 	}

	opal.extend({
		or:  or,
		and: and,
		not: not
	});


	// ------------------------------------------------------------------------
	// 														  Utility functions
	// ------------------------------------------------------------------------

	function assert (condition,message) {
		if ( console && console.assert ) {
			console.assert(condition,message);
		}	
		else if (!condition) {
			throw 'Opal exception: '+exception;
		}
	}

    // Tests: none
	function extend (object,target) {
		target = target || this;
		for ( var i in object ) {
//			if ( object.hasOwnProperty(i) ) {
				target[i] = object[i];     
//			}
		}
		return target;
	}
	
	function delegateTo (context,methodName) {
		return function () {
			return context[methodName].apply(context,arguments);
		};
	}
	
	function copy (obj,exact) {
		return extend(obj, exact ? {} : new EnhancedObject() );
	}
	
	function EnhancedObject () {}
	
	EnhancedObject.prototype = {
		
		constructor: EnhancedObject,
		
		addProperties: function _add (attributes) {
			return extend(attributes,this);
		},
		
		removeProperties: function _remove () {
			for ( var i=0; i<arguments.length; i++ ) {
				delete this[arguments[i]];
			}
			return this;
		},
		
		defaults: function _defaults (attributes) {
			for ( var key in attributes ) {
				if ( attributes.hasOwnProperty(key) ) {
					this[key] = this[key] || attributes[key];
				}	
			}
			return this;
		},
		
		setProperty: function _set (key,value) {
			this[key] = value;
			return this;
		}
		
	};
	
	EnhancedObject.prototype._add = EnhancedObject.prototype.addProperties;
	EnhancedObject.prototype._remove = EnhancedObject.prototype.removeProperties;
	EnhancedObject.prototype._defaults = EnhancedObject.prototype.defaults;
	EnhancedObject.prototype._set = EnhancedObject.prototype.setProperty;

	opal.extend({
		assert:		assert,
		delegateTo: delegateTo,
		copy: 		copy
	});

	return opal;

});