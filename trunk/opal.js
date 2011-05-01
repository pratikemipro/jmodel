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

define(function (a,b,c,undefined) {

	var opal   = { opal_version: '0.14.0', extend: extend },
		_slice = Array.prototype.slice,
		assert = ( console && console.assert ) ? function (condition, message) { console.assert(condition,message); }
				 : function (condition, message) { if ( !condition ) { throw 'Opal exception: '+message; } };

	//
	// Utility functions
	//

	function _undefined () { return undefined; }
	function _true () { return true; }
	function _false () { return false; }

	function _not (x) { return !x; }

	function _set (object,property,value) { object[property] = value; return object; }

	// Tests: none
	function arg (n) {
		return function () {
			return arguments[n];
		};
	};

	var first  = arg(0),
		second = arg(1),
		third  = arg(2),
		_0 = arg(0),
		_1 = arg(1),
		_2 = arg(2),
		_3 = arg(3),
		_4 = arg(4),
		_5 = arg(5);

    // Tests: none
	function extend (object,target) {
		target = target || this;
		for ( var i in object ) {
			target[i] = object[i];
		}
		return target;
	}

	// Tests: none
	function delegateTo (context,methodName) {
		return function () {
			return context[methodName].apply(context,arguments);
		};
	}
	
	opal.extend({
		arg: 		arg,
		first: 		first,
		second: 	second,
		third: 		third,
		_0: 		_0,
		_1: 		_1,
		_2: 		_2,
		_3: 		_3,
		_4: 		_4,
		_5: 		_5,
		assert:		assert,
		delegateTo: delegateTo,
		copy: 		copy
	});



	// ------------------------------------------------------------------------
	//													     Function.prototype
	// ------------------------------------------------------------------------

	// A necessary evil in plain sight
	
	//
	// Application methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.curry === undefined, '"curry" method already defined');
	assert(Function.prototype.delay === undefined, '"delay" method already defined');
	
	// Tests: full
	Function.prototype.bind = Function.prototype.bind || function (context) {
		var fn = this;
		return function () {
			return fn.apply(context,arguments);
		};
	};
	
	// Tests: full
	Function.prototype.curry = function () {
		var args = _slice.call(arguments),
			fn   = this;
		return function () {
			return fn.apply(this,args.concat(_slice.call(arguments)));
		};
	};
	
	// Tests: none
	Function.prototype.delay = function (duration) {
		var fn = this;
		return function () {
			return setTimeout(fn.curry.apply(fn,arguments),duration || 1);
		};
	};
	
	//
	// Composition methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.then === undefined, '"then" method already defined');
	assert(Function.prototype.but === undefined, '"but" method already defined');

	// Tests: full
	Function.prototype.then = function (fn2) {
		var fn1 = this;
		return function () {
			return fn2(fn1.apply(this,arguments)); 
		};
	};
	
	// Tests: none
	Function.prototype.but = function (fn2) {
		var fn1 = this;
		return function () {
			fn1.apply(this,arguments);
			return fn2.apply(this,arguments);
		};
	};
	
	//
	// Aspect-like methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.pre === undefined, '"pre" method already defined');
	assert(Function.prototype.post === undefined, '"post" method already defined');
	
	// Tests: none
	Function.prototype.pre = function (pre) {
		return pre.but(this);
	};
	
	// Tests: none
	Function.prototype.post = function (post) {
		var fn = this;
		return function () {
			var ret = fn.apply(this,arguments);
			post.call(this,ret,_slice.call(arguments));
			return ret;
		};
	};
	
	//
	// Preconditions and postconditions
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.require === undefined, '"require" method already defined');
	assert(Function.prototype.ensure === undefined, '"ensure" method already defined');
	
	// Tests: none
	Function.prototype.require = function (predicate,message) {
		return this.pre(function () {
			assert(predicate.apply(this,arguments),message);
		});
	};
	
	// Tests: none
	Function.prototype.ensure = function (predicate,message) {
		return this.post(function () {
			assert(predicate.apply(this,arguments),message);
		});
	};
	
	//
	// Logical connectives
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.and === undefined, '"and" method already defined');
	assert(Function.prototype.or === undefined, '"or" method already defined');
	
	// Tests: none
	Function.prototype.and = function (fn2) {
		var fn1 = this;
		return function () {
			return fn1.apply(this,arguments) && fn2.apply(this,arguments);
		};
	};
	
	// Tests: none
	Function.prototype.or = function (fn2) {
		var fn1 = this;
		return function () {
			return fn1.apply(this,arguments) || fn2.apply(this,arguments);
		};
	};

	//
	// Predicate methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.is === undefined, '"is" method already defined');
	assert(Function.prototype.eq === undefined, '"eq" method already defined');
	assert(Function.prototype.neq === undefined, '"neq" method already defined');
	assert(Function.prototype.lt === undefined, '"lt" method already defined');
	assert(Function.prototype.gt === undefined, '"gt" method already defined');
	assert(Function.prototype.lte === undefined, '"lte" method already defined');
	assert(Function.prototype.gte === undefined, '"gte" method already defined');
	assert(Function.prototype.between === undefined, '"between" method already defined');
	assert(Function.prototype.matches === undefined, '"matches" method already defined');
	assert(Function.prototype.isnull === undefined, '"isnull" method already defined');
	assert(Function.prototype.isa === undefined, '"isa" method already defined');
	assert(Function.prototype.hastype === undefined, '"hastype" method already defined');

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
	};
	
	// Tests: none
	Function.prototype.isnull = function () {
		return this.then(isnull);
	};
	
	// Tests: none
	Function.prototype.isa = function () {
		return this.then(isa);
	};
	
	// Tests: none
	Function.prototype.hastype = function () {
		return this.then(is_of_type);
	};
	


	// ------------------------------------------------------------------------
	//													     		  Functions
	// ------------------------------------------------------------------------

	//
	// Function composition
	//

    // Tests: full
	function pipe (fn) {
		return    arguments.length <= 1 ? ( fn || identity )
				: fn.then(pipe.apply(null,_slice.call(arguments,1)));
	}

	// Tests: full
	function compose (fn) {
		return	  arguments.length <= 1 ? ( fn || identity )
				: pipe.apply(null,_slice.call(arguments).reverse());
	}
	
	// Tests: full
	function parallel () {
		var fns = _slice.call(arguments);
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
		var args	= _slice.call(arguments),
			context	= ( typeof args[0] === 'object' ) ? args.shift() : null,
			fn		= args.shift();
		return fn.apply(context,args);
	}

    // Tests: full
	function applyto () {
		var args = arguments;
		return function _applyto () {
			var args1	= _slice.call(arguments),
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
		return function _property (object,specific) {
			var value = specific || generic;
			return value !== undefined ? _set(object,property,value) : object[property];
		};
	}
	
    // Tests: full
	function method (name) {
		var args = _slice.call(arguments,1);
		return function _method (object) {
			return	  typeof object[name] !== 'function' ? undefined
					: object[name].apply(object,args.concat(_slice.call(arguments,1)));
		};
	}
	
	// Tests: full
	function resolve (name) {
	    var args = _slice.call(arguments,1);
		return function _resolve (object) {
			return ( typeof object[name] === 'function' ? method(name) : property(name) )
					.apply(null,[object].concat(args,_slice.call(arguments,1)));
		};
	}
	
    // Tests: full
	function path (elements,separator) {
		return    typeof elements === 'string' ? path.call(null,elements.split(separator||'.'))
				: elements === undefined || elements.length === 0 ? _undefined
				: elements.length === 1 ? resolve(elements[0])
				: resolve(elements[0]).then(path.call(null,elements.slice(1)));		
	}

	// Tests: full
	function transform (name,transformer,extractor) {
		var resolver = resolve(name);
		extractor = extractor || resolver;
		return function _transform (object) {
			return resolver(object,transformer(extractor(object)));
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
		transform: transform
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
		predicate = predicate || _true;
		return extend({unit:0,label:'count'}, function __count (acc,value) {
			return acc += (predicate(value) ? 1 : 0);
		});
	};
	
	// Tests: full
	var withmethod = method;
	
	// Tests: full
	var push = method('push').but(first);
	
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
	
	
	
	// ------------------------------------------------------------------------
	//													     		 Predicates
	// ------------------------------------------------------------------------
	
	//
	// Predicates: object
	//

	// Tests: full
	function is (object) {
		return identity.eq(object);
	}

	// Tests: full
	function is_of_type (test) {
		return type.eq(test);
	}

	// Tests: full
	function isa (constructor) {
		return function (candidate) {
			return candidate instanceof constructor;
		};
	}
	
	// Tests: full
	function has () {
		return resolve.apply(null,arguments).then(Boolean);
	}

	opal.extend({
		is: 		is,
		is_of_type: is_of_type,
		isa: 		isa,
		isan: 		isa,
		has: 		has
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

	// Tests: full
	function between (lower,higher) {
		return and( gte(lower), lte(higher) );
	}

	// Tests: full
	function regex (expression) {
		return expression.test.bind(expression);
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
	// Predicates: generic
	//

	// Tests: full
	var istrue = eq(true);

	// Tests: full
    var isnull = eq(null);

	opal.extend({
		AllPredicate: 			_true,
		NonePredicate: 			_false,
		istrue:					istrue,
		isnull:					isnull
	});
	
	
	//
	// Logical connectives
	//
	
	// Tests: full
	function or (predicate) {
		return    arguments.length === 0 ? _false
				: arguments.length === 1 ? predicate
				: predicate.or(or.apply(null,_slice.call(arguments,1)));
	}
	
	// Tests: full
	function and (predicate) {
		return    arguments.length === 0 ? _true
				: arguments.length === 1 ? predicate
				: predicate.and(and.apply(null,_slice.call(arguments,1)));
	}
	
	// Tests: full
	function not (predicate) {
		return predicate.then(_not);
	}

	opal.extend({
		or:  or,
		and: and,
		not: not
	});


	// ------------------------------------------------------------------------
	// 														     EnhancedObject
	// ------------------------------------------------------------------------
	
	// Tests: none
	function copy (obj,exact) {
		return extend(obj, exact ? {} : new EnhancedObject() );
	}
	
	function EnhancedObject () {}
	
	EnhancedObject.prototype = {
		
		constructor: EnhancedObject,
		
		// Tests: none
		addProperties: function _add (attributes) {
			return extend(attributes,this);
		},
		
		// Tests: none
		removeProperties: function _remove () {
			for ( var i=0; i<arguments.length; i++ ) {
				delete this[arguments[i]];
			}
			return this;
		},
		
		// Tests: none
		defaults: function _defaults (attributes) {
			for ( var key in attributes ) {
				if ( attributes.hasOwnProperty(key) ) {
					this[key] = this[key] || attributes[key];
				}	
			}
			return this;
		},
		
		// Tests: none
		setProperty: function _set (key,value) {
			this[key] = value;
			return this;
		}
		
	};
	
	EnhancedObject.prototype._add = EnhancedObject.prototype.addProperties;
	EnhancedObject.prototype._remove = EnhancedObject.prototype.removeProperties;
	EnhancedObject.prototype._defaults = EnhancedObject.prototype.defaults;
	EnhancedObject.prototype._set = EnhancedObject.prototype.setProperty;

	opal.copy = copy;

	return opal;

});