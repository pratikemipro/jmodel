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

	var opal   = { opal_version: '0.22.0' },
		_slice = Array.prototype.slice,
		assert = ( window.console && window.console.assert ) ? function _assert (condition, message) { window.console.assert(condition,message); }
				 : function _assert (condition, message) { if ( !condition ) { throw 'Opal exception: '+message; } };

	//
	// Utility functions
	//
	
	// Tests: full
	// Docs: none
	// Reimplemented: yes
	Object.extend = Object.extend || function (target,source) {
		for ( var i in source ) {
			target[i] = source[i];
		}
		return target;
	};
	

	// Tests: full
	// Docs: full
	// Reimplemented: yes, as Object.type
	function type (object) {
		return typeof object;
	}


	// Tests: full
	// Docs: none
	// Reimplemented: yes
	function delegateTo (context,methodName) {
		return function _delegateTo () {
			return context[methodName].apply(context,arguments);
		};
	}
	
	Function.delegate = delegateTo;
	
	
	Object.extend(opal, {
		type: 		type,
		assert:		assert,
		delegateTo: delegateTo,
		copy: 		copy
	});


	// ------------------------------------------------------------------------
	//													     		   Function
	// ------------------------------------------------------------------------

	//
	// Basic functions
	//
	
	assert(Function.identity === undefined, '"identity" already defined');
	assert(Function.constant === undefined, '"constant" already defined');
	assert(Function.argument === undefined, '"argument" already defined');
	assert(Function.map === undefined,      '"map" already defined');
	
	Object.extend(Function, {
		
		// Tests: full
		// Docs: full
		// Reimplemented: yes
		identity: function (value) {
			return value;
		},
		
		// Tests: full
		// Docs: full
		// Reimplemented: yes
		constant: function (constant) {
			return function () { return constant; };
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		argument: function (n) {
			return function () {
				return arguments[n];
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		map: function (mapping) {
			return function (key) {
				return mapping[key];
			};
		}
		
	});

	Function.identity.displayName = 'identity';
	Function.constant.displayName = 'constant';
	Function.argument.displayName = 'argument';
	Function.map.displayName	  = 'map';
	
	var first	= Function.argument(0),
		second	= Function.argument(1),
		third	= Function.argument(2),
		_0		= Function.argument(0),
		_1		= Function.argument(1),
		_2		= Function.argument(2),
		_3		= Function.argument(3),
		_4		= Function.argument(4),
		_5		= Function.argument(5);
	
	Object.extend(opal,{
		identity: 	Function.identity,
		constant: 	Function.constant,
		argument: 	Function.argument,
		first: 		first,
		second: 	second,
		third: 		third,
		_0: 		_0,
		_1: 		_1,
		_2: 		_2,
		_3: 		_3,
		_4: 		_4,
		_5: 		_5,
		map: 	  	Function.map
	});

	//
	// Function composition
	//
	
	// Protect existing methods with assertions
	assert(Function.pipe === undefined, '"pipe" already defined');
	assert(Function.compose === undefined, '"compose" already defined');

	Object.extend(Function, {

	    // Tests: full
		// Docs: partial
		// Reimplemented: yes
		pipe: function (fn) {
			return    arguments.length === 1 ? fn
			  		: arguments.length === 0 ? Function.identity
					: fn.then(Function.pipe.apply(null,_slice.call(arguments,1)));
		},

		// Tests: full
		// Docs: partial
		// Reimplemented: yes
		compose: function (fn) {
			return	  arguments.length === 1 ? fn
					: arguments.length === 0 ? Function.identity
					: Function.pipe.apply(null,_slice.call(arguments).reverse());
		}
		
		
	});
	
	Function.pipe.displayName    = 'pipe';
	Function.compose.displayName = 'compose';
	
	Object.extend(opal,{
		pipe: 	 Function.pipe,
		compose: Function.compose
	});
	
	//
	// Logical functions
	//
	
	// Protect existing methods with assertions
	assert(Function.or === undefined, '"or" already defined');
	assert(Function.and === undefined, '"and" already defined');
	assert(Function.not === undefined, '"not" already defined');
	
	Object.extend(Function, {
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		or: function (predicate) {
			return    arguments.length === 1 ? predicate
					: arguments.length === 0 ? Function.constant(false)
					: predicate.or(Function.or.apply(null,_slice.call(arguments,1)));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		and: function (predicate) {
			return    arguments.length === 1 ? predicate
					: arguments.length === 0 ? Function.constant(true)
					: predicate.and(Function.and.apply(null,_slice.call(arguments,1)));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		not: function (predicate) {
			return typeof predicate === 'function' ? predicate.not() : !predicate;
		}
		
	});

	Function.or.displayName  = 'or';
	Function.and.displayName = 'and';
	Function.not.displayName = 'not';

	Object.extend(opal,{
		or:  Function.or,
		and: Function.and,
		not: Function.not
	});
	
	
	//
	// Composite ordering
	//
	
	Function.ordering = Function.or;
	opal.ordering	  = Function.ordering;


	// ------------------------------------------------------------------------
	//													     Function.prototype
	// ------------------------------------------------------------------------

	//
	// Property methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.as === undefined, '"as" method already defined');
	assert(Function.prototype.extend === undefined, '"as" method already defined');
	
	Object.extend(Function.prototype, {
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		as: function (name) {
			this.displayName = name;
			return this;
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		extend: function (properties) {
			return Object.extend(this,properties);
		}
		
	});
		
	Function.prototype.as.displayName     = 'as';
	Function.prototype.extend.displayName = 'extend';
	
	
	//
	// Application methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.memo === undefined, '"delay" method already defined');
	
	Object.extend(Function.prototype, {
		
		// Tests: partial
		// Docs: none
		// Reimplemented: yes
		bind: Function.prototype.bind || function (context) {
			var args = _slice.call(arguments,1),
				fn	 = this;
			return function () {
				return fn.apply(context,args.concat(_slice.call(arguments)));
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		curry: Function.prototype.curry || function () {
			var args = _slice.call(arguments),
				fn   = this;
			return function () {
				return fn.apply(this,args.concat(_slice.call(arguments)));
			};
		},
		
		// Tests: full
		// Docs: full
		// Reimplemented: yes
		except: function (handler) {
			var fn = this;
			return function () {
				try {
					return fn.apply(this,arguments);
				}
				catch (err) {
					return handler.call(this,err);
				}
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		memo: function () {
			var cache = {},
				fn = this.post(function () {
					cache[_slice.call(arguments,1)] = arguments[0];
				});
			return function () {
				var value = cache[_slice.call(arguments)];
				return value !== undefined ? value : fn.apply(this,arguments);
			};
		},
		
		// Tests: none
		// Docs: none
		// Reimplemented: yes
		delay: Function.prototype.delay || function (duration) {
			var fn	 = this,
				args = _slice.call(arguments,1);
			return function () {
				return setTimeout(fn.curry.apply(fn,args.concat(_slice.call(arguments))),duration || 1);
			};
		}
		
	});
	
	Function.prototype.bind.displayName  = 'bind';
	Function.prototype.curry.displayName = 'curry';
	Function.prototype.memo.displayName  = 'memo';
	Function.prototype.delay.displayName = 'delay';
	
	
	//
	// Mapping methods
	//
	
	assert(Function.prototype.map === undefined, '"map" method already defined');
	
	Object.extend(Function.prototype, {
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		map: function (mapping) {
			return this.then(Function.map(mapping));
		}
		
	});
	
	Function.prototype.map.displayName = 'map';
	
	
	//
	// Composition methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.then === undefined, '"then" method already defined');
	assert(Function.prototype.but === undefined, '"but" method already defined');

	Object.extend(Function.prototype, {
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		then: function (fn2) {
			var fn1 = this;
			return function () {
				return fn2.call(this,fn1.apply(this,arguments)); 
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		but: function (fn2) {
			var fn1 = this;
			return function () {
				fn1.apply(this,arguments);
				return fn2.apply(this,arguments);
			};
		}
		
	});
	
	Function.prototype.then.displayName = 'then';
	Function.prototype.but.displayName  = 'but';
	
	
	//
	// Aspect-like methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.pre === undefined, '"pre" method already defined');
	assert(Function.prototype.post === undefined, '"post" method already defined');
	
	Object.extend(Function.prototype, {
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		pre: function (pre) {
			return pre.but(this);
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		post: function (post) {
			var fn = this;
			return function () {
				var ret = fn.apply(this,arguments);
				post.apply(this,[ret].concat(_slice.call(arguments)));
				return ret;
			};
		}
	
	});
	
	Function.prototype.pre.displayName  = 'pre';
	Function.prototype.post.displayName = 'post';
	
	
	//
	// Preconditions and postconditions
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.require === undefined, '"require" method already defined');
	assert(Function.prototype.ensure === undefined, '"ensure" method already defined');
	
	Object.extend(Function.prototype, {
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		require: function () {
			var predicates = _slice.call(arguments),
				message = typeof predicates[predicates.length-1] === 'string' ? predicates.pop() : '',
				predicate = Function.and.apply(null,predicates);
			return this.pre(function () {
				if ( !predicate.apply(this,arguments) ) {
					throw 'Precondition failure'+(message ? ': '+message : '');
				}
			});
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		ensure: function () {
			var predicates = _slice.call(arguments),
				message = typeof predicates[predicates.length-1] === 'string' ? predicates.pop() : '',
				predicate = Function.and.apply(null,predicates);
			return this.post(function () {
				if ( !predicate.apply(this,arguments) ) {
					throw 'Postcondition failure'+(message ? ': '+message : '');
				}
			});
		}
		
	});
	
	Function.prototype.require.displayName = 'require';
	Function.prototype.ensure.displayName  = 'ensure';
	
	
	//
	// Logical methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.and === undefined, '"and" method already defined');
	assert(Function.prototype.or === undefined, '"or" method already defined');
	assert(Function.prototype.not === undefined, '"not" method already defined');
	
	Object.extend(Function.prototype, {
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		and: function (fn2) {
			var fn1 = this;
			return function () {
				return fn1.apply(this,arguments) && fn2.apply(this,arguments);
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		or: function (fn2) {
			var fn1 = this;
			return function () {
				return fn1.apply(this,arguments) || fn2.apply(this,arguments);
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		not: function () {
			var fn = this;
			return function () {
				return !fn.apply(this,arguments);
			};
		}
		
	});
	
	Function.prototype.and.displayName = 'and';
	Function.prototype.or.displayName  = 'or';
	Function.prototype.not.displayName  = 'or';
	

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

	Object.extend(Function.prototype, {
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		is: Function.prototype.then,
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		eq: function (value) {
			return this.is(eq(value));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		neq: function (value) {
			return this.is(neq(value));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		lt: function (value) {
			return this.is(lt(value));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		gt: function (value) {
			return this.is(gt(value));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		lte: function (value) {
			return this.is(lte(value));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		gte: function (value) {
			return this.is(gte(value));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		between: function (lower,higher) {
			return this.is(between(lower,higher));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		matches: function (expression) {
			return this.is(regex(expression));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		isnull: function () {
			return this.then(isnull);
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		isa: function (constructor) {
			return this.then(isa(constructor));
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		hastype: function (type) {
			return this.then(is_of_type(type));
		}
		
	});

	Function.prototype.is.displayName		= 'is';
	Function.prototype.eq.displayName		= 'eq';
	Function.prototype.neq.displayName		= 'neq';
	Function.prototype.lt.displayName		= 'lt';
	Function.prototype.gt.displayName		= 'gt';
	Function.prototype.lte.displayName		= 'lte';
	Function.prototype.gte.displayName		= 'gte';
	Function.prototype.between.displayName	= 'between';
	Function.prototype.matches.displayName	= 'matches';
	Function.prototype.isnull.displayName	= 'isnull';
	Function.prototype.isa.displayName	 	= 'isa';
	Function.prototype.hastype.displayName	= 'hastype';
	
	
	//
	// Ordering methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.asc === undefined, '"asc" method already defined');
	
	Object.extend(Function.prototype, {
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		asc: function () {
			var fn = this;
			return function (a,b) {
				var fna = fn.call(this,a),
					fnb = fn.call(this,b);
				return    fna < fnb ? -1
						: fna > fnb ? 1
						: 0;
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		desc: function () {
			return this.asc().then(function (x) { return -x; } );
		}
		
	});
	
	Function.prototype.asc.displayName = 'asc';
	
	
	//
	// Constructor methods
	//
	
	// Protect existing methods with assertions
	assert(Function.prototype.create === undefined, '"create" method already defined');
	
	Object.extend(Function.prototype, {
		
		// Tests: full
		// Docs: full
		// Reimplemented: yes
		create: function () {
			return Object.construct(this).apply(null,arguments);
		}
		
	});
	
	Function.prototype.create.displayName = 'create';
	

	
	// ------------------------------------------------------------------------
	//													     		     Object
	// ------------------------------------------------------------------------
	
	//
	// Construction
	//
	
	// Protect existing methods with assertions
	assert(Object.construct === undefined, '"construct" method already defined');
	assert(Object.ensure === undefined || Object.ensure === Function.prototype.ensure, '"ensure" method already defined');
	
	Object.extend(Object, {
		
		// Tests: partial (add testing for Nullable)
		// Docs: full
		// Reimplemented: yes
		construct: function (constructor) {
			var args1 = _slice.call(arguments,1);
			return 	  constructor === String ? String
					: constructor === Number ? Number
					: constructor === Boolean ? Boolean
					: constructor === Date ? function () { // Special handling for dates
						var args = args1.concat(_slice.call(arguments));
						if ( args.length === 1 && typeof args[0] === 'string' ) {
							var pieces = args[0].split('T'),
								date = pieces[0].split('-'),
								time = pieces[1] !== undefined ? pieces[1].split(':') : [];
							return    time.length === 0 ? new Date(
																parseInt(date[0],10),
																parseInt(date[1],10)-1,
																parseInt(date[2],10)
															)
									: new Date(
										parseInt(date[0],10),
										parseInt(date[1],10)-1,
										parseInt(date[2],10),
										parseInt(time[0],10),
										parseInt(time[1],10),
										parseInt(time[2],10)
									);
						}
						else {
							return    args.length === 1 ? new Date(args[0])
									: args.length === 3 ? new Date(args[0],args[1],args[2])
									: new Date(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
						}
					}
					: constructor && constructor.nullable ? constructor
					: function () {
						var args = args1.concat(_slice.call(arguments));
						// Need this ugliness to work correctly with Date and other constructors that count arguments.
						return    args.length === 0  ? new constructor()
								: args.length === 1  ? new constructor(args[0])
								: args.length === 2  ? new constructor(args[0],args[1])
								: args.length === 3  ? new constructor(args[0],args[1],args[2])
								: args.length === 4  ? new constructor(args[0],args[1],args[2],args[3])
								: args.length === 5  ? new constructor(args[0],args[1],args[2],args[3],args[4])
								: args.length === 6  ? new constructor(args[0],args[1],args[2],args[3],args[4],args[5])
								: args.length === 7  ? new constructor(args[0],args[1],args[2],args[3],args[4],args[5],args[6])
								: args.length === 8  ? new constructor(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7])
								: args.length === 9  ? new constructor(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8])
								: 					   new constructor(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8],args[9]);
					};
		},
		
		// Tests: partial (add testing for Nullable)
		// Docs: none
		// Reimplemented: yes
		ensure: function (constructor) {
			var _construct = Object.construct.apply(null,arguments);
			return    constructor === String  ? function (value) { return typeof value === 'string' ? value : String(value); }
					: constructor === Number  ? function (value) { return typeof value === 'number' ? value : Number(value); }
					: constructor === Boolean ? function (value) { return typeof value === 'boolean' ? value : Boolean(value); }
					: constructor && constructor.nullable ? function (value) { return value === null || value === undefined ? null : _construct.apply(null,arguments); }
					: function (object) { return object instanceof constructor ? object : _construct.apply(null,arguments); };
		}
		
	});
	
	Object.construct.displayName = 'construct';
	Object.ensure.displayName	 = 'ensure';
	
	Object.extend(opal, {
		construct: Object.construct,
		ensure:    Object.ensure,
		project:   Object.project
	});
	
	
	//
	// Identity
	//
	
	// Reimplemented: yes
	Object.eq = function (value) {
		return function (object) {
			return object === value;
		};
	};
	
	
	//
	// Bare objects
	//
	
	// Protect existing methods with assertions
	assert(Object.project === undefined, '"project" method already defined');
	
	Object.extend(Object, {
		
		// Tests: none
		// Docs: none
		// Reimplemented: yes
		copy: function (obj) {
			return Object.extend({},obj);
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		equal: function (a,b) {
			if ( a === undefined || b === undefined ) {
				return false;
			}
			var equal = true,
				prop;
			for ( prop in a ) {
				if ( a.hasOwnProperty(prop) ) {
					equal = equal && ( a[prop] === b[prop] );
				}
			}
			for ( prop in b ) {
				if ( b.hasOwnProperty(prop) ) {
					equal = equal && ( a[prop] === b[prop] );
				}
			}
			return equal;
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		remove: function () {
			var fields = _slice.call(arguments);
			return function (obj) {
				var removed = Object.copy(obj);
				for (var i=0; i<fields.length; i++) {
					delete removed[fields[i]];
				}
				return removed;
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		project: function () {
			var fields = _slice.call(arguments);
			return function (object) {
				var projection = {};
				for (var i=0; i<fields.length; i++) {
					var field = fields[i];
					if ( object[field] ) {
						projection[field] = object[field];
					}
				}
				return projection;
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		rename: function (renaming) {
			return function (object) {
				var renamed = {};
				for (var i in object) {
					renamed[ renaming[i] || i ] = object[i];
				}
				return renamed;
			};
		},
		
		// Tests: full
		// Docs: none
		// Reimplemented: yes
		union: function (x) {
			return    arguments.length === 1 ? Object.copy(x)
					: arguments.length === 0 ? {}
					: Object.extend(x, Object.union.apply(null,_slice.call(arguments,1)));
		},
		
		// Test: full
		// Docs: none
		// Reimplemented: yes
		intersection: function (x,y) {
			return    arguments.length === 1 ? Object.copy(x)
					: arguments.length === 0 ? {}
					: Object.project.apply(null,Object.keys(Object.intersection.apply(null,_slice.call(arguments,1))))(x);
		},
		
		// Tests: none
		// Docs: none
		// Reimplemented: yes
		difference: function (x,y) {
			return Object.remove.apply(null,Object.keys(y))(x);
		},

		// Tests: none
		// Docs: none
		// Reimplemented: yes
		join: function (predicate) {
			return function () {
				return predicate.apply(null,arguments) ? Object.union.apply(null,arguments) : undefined;
			};
		}
		
		
	});
	
	Object.project.displayName	 = 'project';
	
	Object.extend(opal,{
		project:   Object.project
	});
	
	//
	// Accessors
	//
	
	// Protect existing methods with assertions
	assert(Object.get === undefined, '"get" method already defined');
	assert(Object.set === undefined, '"set" method already defined');
	assert(Object.property === undefined, '"property" method already defined');
	assert(Object.method === undefined, '"method" method already defined');
	assert(Object.resolve === undefined, '"resolve" method already defined');
	assert(Object.path === undefined, '"path" method already defined');
	assert(Object.transform === undefined, '"transform" method already defined');
	
	Object.extend(Object, {
		
		// Tests: none
		// Docs: none
		// Reimplemented: yes
		keys: Object.keys || function (object) {
			var keys = [];
			for( var i in object ) {
				keys.push(i);
			}
			return keys;
		},
		
/*

		REIMPLEMENTED AS FAR AS HERE

*/
		
		// Tests: none
		// Docs: none
		get: function (property,object) {
			return object[property];
		},
		
		// Tests: none
		// Docs: none
		set: function (property,value,object) {
			if ( object[property] !== undefined ) {
				object[property] = value;
				return true;
			}
			return false;
		},
		
		// Tests: full
		// Docs: full
		property: function (property,value) {
			return value === undefined ? Object.get.curry(property) : Object.set.curry(property,value);
		},
		
		// Tests: full
		// Docs: full
		method: function (name) {
			var args = _slice.call(arguments,1);
			return function (object) {
				return typeof object[name] === 'function' ? object[name].apply(object,args) : undefined;
			};
		},
		
		// Tests: full
		// Docs: none
		resolve: function (name) {
		    var args = _slice.call(arguments);
			return function (object) {
				return    typeof object[name] === 'function' ? Object.method.apply(null,args)(object)
						: Object.property.apply(null,args)(object);
			};
		},
		
		// Tests: full
		// Docs: full
		path: function (elements,separator) {
			return    typeof elements === 'string' ? Object.path.call(null,elements.split(separator||'.'))
					: elements === undefined || elements.length === 0 ? Function.constant(undefined)
					: elements.length === 1 ? Object.resolve(elements[0])
					: Object.resolve(elements[0]).then(Object.path.call(null,elements.slice(1)));		
		},
		
		// Tests: full
		// Docs: none
		transform: function (name,transformer,extractor) {
			var transformation = typeof extractor === 'function' ? extractor.then(transformer) : Object.resolve(name).then(transformer);
			return function (object) {
				var value = transformation(object);
				return typeof object[name] === 'function' ? object[name].call(object,value) : Object.set(name,value,object);
			};
		}
		
	});
	
	Object.get.displayName  	 = 'get';
	Object.set.displayName  	 = 'set';
	Object.property.displayName  = 'property';
	Object.method.displayName    = 'method';
	Object.resolve.displayName	 = 'resolve';
	Object.transform.displayName = 'transform';
	
	Object.extend(opal, {
		get: 	   Object.get,
		set: 	   Object.set,
		property:  Object.property,
		method:    Object.method,
		resolve:   Object.resolve,
		path:      Object.path,
		transform: Object.transform
	});


	// ------------------------------------------------------------------------
	//													     		  Functions
	// ------------------------------------------------------------------------
	
	// Tests: full
	// Docs: none
	function parallel () {
		var fns = _slice.call(arguments);
		return function () {
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
	
	// Tests: none
	// Docs: none
	function bind (context,fn) {
		return fn.bind(context);
	}
	
	// Tests: full
	// Docs: partial
	function apply () {
		var args	= _slice.call(arguments),
			context	= ( typeof args[0] === 'object' ) ? args.shift() : null,
			fn		= args.shift();
		return fn.apply(context,args);
	}

    // Tests: full
	// Docs: partial
	function applyto () {
		var args = arguments;
		return function () {
			var args1	= _slice.call(arguments),
			    context	= ( typeof args1[0] === 'object' ) ? args1.shift() : null,
				fn		= args1.shift();
			return fn.apply(context,args);
		};
	}

	Object.extend(opal, {
		bind: bind,
		apply: apply,
		applyto: applyto,
		parallel: parallel
	});


	//
	// Reduction functions
	//

	// Tests: full
	// Docs: none
	var plus = function (acc,value) { return acc + value; } .extend({unit:0,label:'sum'});

	// Tests: full
	// Docs: none
	var times = function (acc,value) { return acc * value; } .extend({unit:1,label:'product'});
	
	// Tests: full
	// Docs: full
	var count = function _count (predicate) {
		predicate = predicate || Function.constant(true);
		return function (acc,value) { return acc += (predicate(value) ? 1 : 0); } .extend({unit:0,label:'count'});
	};
	
	// Tests: full
	// Docs: none
	var withmethod = function method (name) {
		var args = _slice.call(arguments,1);
		return function (object,value) {
			return typeof object[name] === 'function' ? object[name].apply(object,args.concat(value)) : undefined;
		};
	};
	
	var bymethod = withmethod;
	
	// Tests: full
	// Docs: none
	var push = withmethod('push').but(first);
	
	// Tests: none
	// Docs: none
	var add = function () {
		switch (arguments.length) {
			case 0:  return add0.apply(null,arguments);
			case 1:  return add1.apply(null,arguments);
			default: return add2.apply(null,arguments);
		}
	};
	
	function add0 () {
		return function (acc,value) {
			return acc.add(value);
		};
	}
	
	function add1 (predicate) {
		return function (acc,value) {
			return predicate(value) ? acc.add(value) : acc;
		};
	}
	
	function add2 (predicate,mapping,mapfirst) {
		return function (acc,value) {
			var mapped = mapping(value);
			return predicate(mapfirst ? mapped : value) ? acc.add(mapped) : acc;
		};
	};
	
	// Tests: none
	// Docs: none
	var contains = function (predicate) {
		return function (acc,value) { return acc || predicate(value); } .extend({unit:false});
	};
	
	// Tests: none
	// Docs: none
	var max = function (acc,value) { return acc > value ? acc : value; } .extend({label:'max'});
	
	// Tests: none
	// Docs: none
	var min = function (acc,value) { return ( acc < value && acc !== null ) ? acc : value; } .extend({label:'min'});

	Object.extend(opal, {
		plus: plus,
		times: times,
		count: count,
		withmethod: withmethod,
		bymethod: bymethod,
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
	
	// Tests: none
	// Docs: none
	function valid (constructor) {
		return	  constructor === Number ? isNaN.not()
				: constructor === Date ? function (date) { return date.toString() !== 'Invalid Date'; }
				: isa(constructor);
	}

	// Tests: full
	// Docs: none
	function is (object) {
		return eq(object);
	}

	// Tests: full
	// Docs: full
	function is_of_type (type) {
		return opal.type.eq(type);
	}

	// Tests: full
	// Docs: full
	function isa (constructor) {
		return function (candidate) {
			return candidate instanceof constructor;
		};
	}
	
	// Tests: full
	// Docs: none
	function has () {
		return Object.resolve.apply(null,arguments).then(Boolean);
	}

	Object.extend(opal, {
		valid: 		valid,
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
	// Docs: none
	function compare (operator) {
		return function (value) {
			return function (candidate) {
				return operator(candidate,value);
			};
		};
	}
	
	// Tests: full
	var eq  = function (a) { return function (x) { return x===a; }; },	// Docs: full
		neq = function (a) { return function (x) { return x!==a; }; },	// Docs: full
		lt  = function (a) { return function (x) { return x<a;   }; },	// Docs: none
		gt  = function (a) { return function (x) { return x>a;   }; },	// Docs: none
		lte = function (a) { return function (x) { return x<=a;  }; },	// Docs: none
		gte = function (a) { return function (x) { return x>=a;  }; };	// Docs: none

	// Tests: full
	// Docs: none
	function between (lower,higher) {
		return Function.and( gte(lower), lte(higher) );
	}

	// Tests: full
	// Docs: none
	function regex (expression) {
		return expression.test.bind(expression);
	}
	
	Object.extend(opal, {
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
	// Docs: none
	var istrue = eq(true);

	// Tests: full
	// Docs: none
    var isnull = eq(null);

	Object.extend(opal, {
		AllPredicate: 			Function.constant(true),
		NonePredicate: 			Function.constant(false),
		istrue:					istrue,
		isnull:					isnull
	});


	// ------------------------------------------------------------------------
	// 														     EnhancedObject
	// ------------------------------------------------------------------------
	
	// Tests: none
	// Docs: none
	function copy (obj,exact) {
		return Object.extend(exact ? {} : new EnhancedObject(), obj);
	}
	
	function EnhancedObject () {}
	
	// Tests: none
	// Docs: none
	EnhancedObject.from = function (obj) {
		return copy(obj);
	};
	
	EnhancedObject.prototype = {
		
		constructor: EnhancedObject,
		
		// Tests: none
		// Docs: none
		addProperties: function (attributes) {
			return Object.extend(this,attributes);
		},
		
		// Tests: none
		// Docs: none
		removeProperties: function () {
			for ( var i=0; i<arguments.length; i++ ) {
				delete this[arguments[i]];
			}
			return this;
		},
		
		// Tests: none
		// Docs: none
		defaults: function (attributes) {
			for ( var key in attributes ) {
				if ( attributes.hasOwnProperty(key) ) {
					this[key] = this[key] || attributes[key];
				}	
			}
			return this;
		},
		
		// Tests: none
		// Docs: none
		setProperty: function (key,value) {
			this[key] = value;
			return this;
		}
		
	};
	
	EnhancedObject.prototype._add = EnhancedObject.prototype.addProperties;
	EnhancedObject.prototype._remove = EnhancedObject.prototype.removeProperties;
	EnhancedObject.prototype._defaults = EnhancedObject.prototype.defaults;
	EnhancedObject.prototype._set = EnhancedObject.prototype.setProperty;

	opal.EnhancedObject = EnhancedObject;
	opal.copy = copy;
	
	// ------------------------------------------------------------------------
	// 														 		   Nullable
	// ------------------------------------------------------------------------

	// Tests: none
	// Docs: none
	function Nullable (constructor) {
		var construct = Object.construct(constructor);
		return function (x) {
			return arguments.length === 0 || ( arguments.length === 1 && x === null ) ? null : construct.apply(null,arguments);
		}.extend({
			nullable: true
		});
	}
	
	Object.extend(opal, {
		Nullable: Nullable
	});

	return opal;

});