/*
 *	OPAL Javascript Library v0.8.6
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009-2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

// ============================================================================
//									 Object Predicate and Action Library (OPAL)
// ============================================================================

define(function () {

	var opal = {opal_version:'0.9.0'};
	
	function assert(condition,exception) {
		if (!condition) {
			throw 'Opal exception: '+exception;
		}
	}

    // Tests: full
	function extend (object,target) {
		target = target || this;
		for ( var i in object ) {
//			if ( object.hasOwnProperty(i) ) {
				target[i] = object[i];     
//			}
		}
		return target;
	}
	opal.extend = extend;

    // Tests: full
	function pipe () {
		var fns = Array.prototype.slice.call(arguments);
		return fns.length == 1 ? fns[0] : function _pipe (x) {
			for (var i in fns) {
				if ( fns.hasOwnProperty(i) ) {
					x = fns[i](x);
				}	
			}
			return x;
		};
	}
	
	// Tests: full
	function compose () {
		return arguments.length == 1 ? arguments[0]
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
	
	// Tests: full
	function curry () {
		var args	= Array.prototype.slice.call(arguments),
			context	= ( typeof args[0] === 'object' ) ? args.shift() : null,
			fn		= args.shift();
		return function _curry () {
			return fn.apply(context,args.concat(Array.prototype.slice.call(arguments)));
		};
	}
	
	var suspend = curry;

	// Tests: full
	function nth (index) {
		return function () {
			return arguments[index];
		};
	}
	
	var first	= nth(0),
		second	= nth(1);


	//
	// Object functions
	// 

    // Tests: full
	function Identity (object) {
		return object;
	}

    // Tests: full
	function type (object) {
		return object !== null && typeof object;
	}


	// Function to add predicates to value extractors
	function add_predicates (extractor) {
		
		extractor.is = function (predicate) {
			return pipe(extractor,predicate);
		};
		
		extractor.eq = function (value) {
			return pipe(extractor,EqualityPredicate(value));
		};
		
		extractor.neq = function (value) {
			return pipe(extractor,InequalityPredicate(value));
		};
		
		extractor.lt = function (value) {
			return pipe(extractor,ComparisonPredicate(lt)(value));
		};
		
		extractor.gt = function (value) {
			return pipe(extractor,ComparisonPredicate(gt)(value));
		};

		extractor.lte = function (value) {
			return pipe(extractor,ComparisonPredicate(lte)(value));
		};
		
		extractor.gte = function (value) {
			return pipe(extractor,ComparisonPredicate(gte)(value));
		};
		
		extractor.between = function (lower,higher) {
			return pipe(extractor,BetweenPredicate(lower,higher));
		};
		
		extractor.matches = function (regex) {
			return pipe(extractor,RegularExpressionPredicate(regex));
		}
		
		extractor.isnull = function () {
			return pipe(extractor,NullPredicate);
		}
		
		return extractor;
		
	}


    // Tests: partial
	// NOTE: add test that it doesn't set properties that don't exist and predicate tests
	function property (property,generic) {
		var _property = function _property (object,specific) {
			var value =   typeof specific !== 'undefined' ? specific
						: typeof generic  !== 'undefined' ? generic
						: undefined;
			if ( typeof value !== 'undefined' && typeof object[property] !== 'undefined' ) {
				object[property] = value;
				return object;
			}
			else {
				return object[property];
			}
		}
		return add_predicates(_property);
	}
	
    // Tests: full
	function Method (name) {
		var args = Array.prototype.slice.call(arguments,1);
		var _method = function _method () {
			var args1	= Array.prototype.slice.call(arguments),
				object  = args1.shift(),
				args2	= args.concat(args1);
			return ( object[name] && typeof object[name] === 'function' ) ?
						object[name].apply(object,args2) : false;
		};
		return add_predicates(_method);
	}
	
	// Tests: full
	function Resolve (name) {
	    var args = Array.prototype.slice.call(arguments,1);
		var _resolve = function _resolve (object) {
		    var args1   = Array.prototype.slice.call(arguments,1),
		        args2   = [object].concat(args,args1);
			return ( typeof object[name] === 'function' ) ? Method(name).apply(null,args2) : property(name).apply(null,args2);
		};
		return add_predicates(_resolve);
	}

    // Tests: full
	function PropertyPath (path,separator) {
		var resolvers = Set.fromArray( typeof path == 'string' ? path.split(separator||'.') : path ).map(Resolve);
		var _propertypath = function _propertypath (object) {
			try {
				return resolvers.reduce(function (object,resolver) { return resolver(object); },object);
			}
			catch (error) {
				return undefined;
			}
		};
		return add_predicates(_propertypath);
	}

	// Tests: none
	function PropertySet (paths,separator) {
		paths = ( paths instanceof Set ) ? paths : Set.fromArray(paths);
		paths = paths.map(function _propertyset (path) { return PropertyPath(path,separator); });
		return function __propertyset (object) {
			return paths.map(applyto(object));
		};
	}

	// Tests: full
	function transform (name,transformer,extractor) {
		var resolve = Resolve(name);
		extractor = extractor || resolve;
		return function _transform (object) {
			return resolve(object,transformer(extractor(object)));
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
	
	// Tests: none
	function async () {
		return setTimeout(opal.suspend.apply(this,arguments),1);
	}

	opal.extend({
		apply: apply,
		applyto: applyto,
		applyto: applyto,
		compose: compose,
		pipe: pipe,
		parallel: parallel,
		curry: curry,
		suspend: suspend,
		nth: nth,
		first: first,
		second: second,
		Identity: Identity,
		type: type,
		property: property,
		Method: Method,
		Resolve: Resolve,
		PropertyPath: PropertyPath,
		PropertySet: PropertySet,
		transform: transform,
		aspect: aspect,
		async: async
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
		var method = Method(name);
		return function __withmethod (acc,value) {
			return method(acc,value);
		};
	};
	
	// Tests: full
	var push = function (acc,value) {
		acc.push(value);
		return acc;
	};
	
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
	
	var contains = function _contains (predicate) {
		return extend({unit:false}, function __contains (acc,value) {
			return acc || predicate(value);
		});
	};
	
	var max = extend({label:'max'}, function _max (acc,value) {
		return acc > value ? acc : value;
	});
	
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
	// Comparison functions
	//
	
	function eq  (a,b) { return a===b; }
	function neq (a,b) { return a!==b; }
	function lt  (a,b) { return a<b; }
	function gt  (a,b) { return a>b; }
	function lte (a,b) { return a<=b; }
	function gte (a,b) { return a>=b; }


	// ------------------------------------------------------------------------
	//																		Set
	// ------------------------------------------------------------------------

	function Set () {

		this.__members = Array.prototype.slice.call(arguments);

		this.length		= this.__members.length;
		this.__index	= false;
		this.added		= null;

	}
	
	Set.prototype = {
		
		constructor: Set,
		
		/* Mutators */
		
		add: function _add (object) {
			this.added = undefined;
			if ( this.constraint(object) ) {	
				this.__members.push(object);
				this.length++;
				if ( this.__index ) {
					this.__index.add(object);
				}
				this.added = object;
			}
			return this;
		},
		
		remove: function _remove (predicate) {
			var partition = this.partition(this.predicate(predicate));
			this.__members = partition[false] ? partition[false].get() : [];
			this.length = this.__members.length;
			if ( this.__index ) {
				partition[true].reduce(Method('remove'),this.__index);
			}
			return partition[true] || new this.constructor();
		},
		
		sort: function _sort () {
			this.__members.sort(this.ordering.apply(null,arguments));
			return this;
		},
		
		concat : function _concat (second) {
			return second && second.reduce ? second.reduce(Method('add'),this) : this;
		},
		
		/* Pure methods */
		
		constraint: function constraint (obj) {
			return typeof obj !== 'undefined' && !this.member(obj);
		},
		
		head: function _head () {
			return this.__members[0];
		},
		
		tail: function _tail () {
			return this.constructor.fromArray(this.__members.slice(1));
		},
		
		reverse: function _reverse () {
			return this.constructor.fromArray(this.__members.slice().reverse());
		},
		
		get: function _get (key) {
			return    arguments.length === 0 ? this.__members
					: key === ':first' ? this.first()
					: key === ':last' ? this.last()
					: this.__index ? this.__index.get(key)
					: typeof key === 'number' ? this.__members[key]
					: this.first(key);
		},
		
		count: function _count (predicate) {
			return arguments.length === 0 ? this.length : this.reduce(count(predicate));
		},
		
		first: function _first (predicate) {
			return    this.length === 0 ? undefined
					: typeof predicate !== 'undefined' ? (
						this.predicate(predicate)(this.head()) ? this.head() : this.tail().first(predicate) 
					)
					: this.head();
		},
		
		last: function _last (predicate) {
			return    this.length === 0 ? false
					: typeof predicate !== 'undefined' ? this.reverse().first(predicate)
					: this.get(this.length-1);
		},
		
		member: function _member (object) {
			return    this.__index ? this.__index.member(object)
					: this.__members.indexOf ? this.__members.indexOf(object) > -1
					: typeof this.first(ObjectIdentityPredicate(object)) !== 'undefined'
		},
		
		select : function _select (selector) {
			return selector ? this.get(selector) : this;
		},
		
		when : function _when (predicate,callback) {
			if ( this.predicate(predicate)(this) ) {
				callback.call(this,this);
			}
			return this;
		},
		
		each: function _each () {
			function makeCallback (obj) { return ( typeof obj === 'string' ) ? Method(obj) : obj; }
			var callback = ( arguments.length == 1 ) ? makeCallback(arguments[0])
							: pipe.apply(null,Set.fromArguments(arguments).map(makeCallback).get());
			if ( this.__members.forEach ) {
				this.__members.forEach(callback,this);
			}
			else {
				for ( var index in this.__members ) {
					if ( this.__members.hasOwnProperty(index) ) {
						callback.call(this,this.__members[index],index);
					}	
				}
			}
			return this;
		},
		
		partition: function _partition (fn) {
			var constructor = this.constructor;
			return this.reduce(function (acc,object) {
				var key = fn(object);
				acc[key] = ( acc[key] || new constructor() ).add(object);
				return acc;
			}, {});
		},
		
		filter: function _filter (predicate) {
			return    typeof predicate === 'undefined' ? this
					: this.__members.filter ? this.constructor.fromArray(this.__members.filter(this.predicate(predicate)))
					: this.reduce(add(predicate), new this.constructor())
		},
		
		map: function _map () {
			function makeMapping (obj) { return ( typeof obj == 'string' ) ? Resolve(obj) : obj; }
			var args    = Array.prototype.slice.call(arguments),
			    mapped  = ( typeof args[args.length-1] === 'object' ) ? args.pop() : new List(),
			    mapping = ( args.length === 1 ) ? makeMapping(args[0])
			                : pipe.apply(null, List.fromArray(args).map(makeMapping).get());
			return this.reduce(add(function (obj) {return obj !== undefined;},mapping,true),mapped);
		},
		
		reduce: function _reduce (fn,acc) {
			acc = arguments.length > 1 ? acc : fn.unit;
			return	  this.length === 0 ? acc
					: this.__members.reduce ? this.__members.reduce(fn,acc)
					: this.tail().reduce(fn,fn(acc,this.head()))
		},
		
		copy: function _copy () {
			return this.constructor.fromArray(this.__members.slice(0));
		},
		
		index: function _index (key) {
			this.__index = new UniqueIndex(this,key);
			return this;
		},
		
		union: function _union () {
			return union.apply(null,[this].concat(Array.prototype.slice.call(arguments)));
		},
		
		intersection: function _intersection () {
			return intersection.apply(null,[this].concat(Array.prototype.slice.call(arguments)));
		},
		
		difference: function _difference (set) {
			return difference(this,set);
		},
		
		predicate: function _predicate (parameter) {
			return	  parameter === ':empty' ? EmptySetPredicate
					: parameter instanceof RegExp ? RegularExpressionPredicate(parameter)
					: typeof parameter === 'function' ? parameter
					: typeof parameter === 'string' && parameter.charAt(0) === ':' ? extend({unique:true},ObjectIdentityPredicate(this.get(parameter)))
					: ( typeof parameter === 'object' && parameter !== null ) || typeof parameter === 'string' || typeof parameter === 'number' ? extend({unique:true},ObjectIdentityPredicate(parameter))
					: AllPredicate
		},
		
		ordering: function _ordering () {
			return    arguments.length > 1 ? CompositeOrdering.apply(null,arguments)
					: arguments[0] instanceof Array ? CompositeOrdering(arguments[0])
					: arguments.length === 0 ? ValueOrdering
					: arguments[0]
		},
		
		aggregate: function _aggregate (combiner,acc) {
			acc = acc || null;
			return function __aggregate () {
				var extractor = ( arguments.length > 1 ) ? pipe.apply(null,arguments) : arguments[0];
				return this.map(extractor || Identity).reduce(combiner,acc);
			};
		},
		
		mean: function _mean () {
			var stat = this.aggregate(parallel(plus,count()),{sum:0,count:0}).apply(this,arguments);
			return stat.sum/stat.count;
		},
		
		format: function _format (formatter) {
			return formatter(this);
		},
		
		join: function _join (separator) {
			return this.__members.join(separator);
		},
		
		zip: function _zip (set2,zipper) {
			return zip(this,set2,zipper);
		},
		
		of: function _of (cons) {
			return this.reduce(Method('add'), new TypedSet(cons));
		},
		
		jQuery: function _jQuery () {
			return jQuery( this
							.map(function __jQuery (obj) { return obj.jquery ? obj.get() : obj; })
								.reduce(Method('concat'), new this.constructor())
									.get() );
		},
		
		delegateFor: function _delegateFor (host) {
			for (var i in this) {
				if ( /*this.hasOwnProperty(i) &&*/ !host[i] ) {
					host[i] = this[i];
				}
			}
			return this;
		}
		
	};
	Set.prototype.max = Set.prototype.aggregate(max);
	Set.prototype.min = Set.prototype.aggregate(min);
	Set.prototype.sum = Set.prototype.aggregate(plus);
	Set.prototype.range = Set.prototype.aggregate(parallel(min,max),{min:null,max:null});

	opal.Set = Set;
	
	Set.from = function () {
		return Set.fromArray(Array.prototype.slice.call(arguments));
	};
	
	Set.fromArray = function (arr) {
		assert(arr instanceof Array, 'List.fromArray parameter is not an array');
		var set = new Set();
		Set.apply(set,arr);
		return set;
	};
	
	Set.fromArguments = function (args) {
		assert(typeof args.callee !== 'undefined', 'List.fromArguments parameter is not an argument object');
		return Set.fromArray(Array.prototype.slice.call(args));
	};
	
	Set.fromJQuery = function (jq) {
		assert(typeof jq.jquery !== 'undefined', 'List.fromJQuery parameter is not a jQuery object');
		return Set.fromArray(jq.get()).map(jQuery,new Set());
	};
	
	Set.fromGenerator = function (fn) {
		var next, items = [];
		while ( typeof( next = fn() ) !== 'undefined' ) {
			items.push(next);
		}
		return Set.fromArray(items);
	};
	
	opal.range = function (lower, higher) {
		return function () {
			return lower <= higher ? lower++ : undefined;
		};
	};

	function set () {
		return    arguments.length === 1 && arguments[0] && arguments[0].jquery ? Set.fromJQuery(arguments[0])
				: arguments.length === 1 && arguments[0] && arguments[0].callee ? Set.fromArguments(arguments[0])
				: arguments.length === 1 && arguments[0] instanceof Array ? Set.fromArray(arguments[0])
				: Set.fromArguments(arguments);
	}
	opal.set = set;

	//
	// Set operations
	//
	
	function zip (first,second,zipper) {
		first = ! (first instanceof Set || first instanceof List) ? list(first) : first;
		second = second.shift ? second : second.get();
		zipper = typeof zipper == 'string' ? Method(zipper) : zipper;
		return first.map(function _zip (obj) {
			return zipper(obj,second.shift());
		});
	}

	function union () {
		return Set.fromArguments(arguments).reduce(Method('concat'),new Set());
	}

	function intersection () {
		return Set.fromArguments(arguments).map(MembershipPredicate).reduce(Method('filter'),arguments[0].copy());
	}

	function difference (first,second) {
		return first.filter( Not(MembershipPredicate(second)) );
	}

	opal.extend({
		zip: 			zip,
		union: 			union,
		intersection: 	intersection,
		difference: 	difference
	});



	// ------------------------------------------------------------------------
	//															       TypedSet
	// ------------------------------------------------------------------------
	
	function TypedSet (constructor) {
	    if ( typeof constructor === 'object' ) {
	        constructor = constructor.entitytype ? constructor.entitytpe.constructor : constructor.constructor;
	    }
		this.__constructor = this.__constructor || constructor;
		Set.apply(this,[]);
		Set.fromArray(Array.prototype.slice.call(arguments,1)).reduce(Method('add'),this);
		return this;
	}
	
	TypedSet.prototype = extend({
		
		add: function () {
			
			var object = arguments[0];
			
			if ( this.__constructor ) {
			    
			    if ( arguments.length > 1
					 || typeof object === 'function'
					 || object.constructor === Object
					 || ! ( object instanceof Object) ) {
    				object = this.__construct ? this.__construct.apply(this,arguments) : object;
    			}

    			var failed;
    			switch (this.__constructor) {

    				case Number:
    					failed = isNaN(object);
    					break;

    				case Date:
    					failed = object.toString() === 'Invalid Date';
    					break;

    				default:
    					failed = ! (object instanceof this.__constructor);
    					break;

    			}
    			
    			if ( failed ) {
    				throw "Opal: Invalid type in TypedSet.";
    			}
			    
			}

			return Set.prototype.add.call(this,object);

		},
		
		__construct: function (value) {
			
			if ( this.__constructor === Number ) {
				return Number(value);
			}
			else if ( this.__constructor === String ) {
				return String(value);
			}
			
			var object;
			
			// This is ugly. Is there a better way?
			switch (arguments.length) {
				
				case 0:
					object = new this.__constructor();
					break;
					
				case 1:
					object = new this.__constructor(arguments[0]);
					break;
					
				case 2:
					object = new this.__constructor(arguments[0],
						                            arguments[1]);
					break;
													
				case 3:
					object = new this.__constructor(arguments[0],
												    arguments[1],
												    arguments[2]);
					break;
												
				case 4:
					object = new this.__constructor(arguments[0],
												    arguments[1],
												    arguments[2],
												    arguments[3]);
					break;
												
				default:
					throw "Opal: too many arguments passed to constructor"; 
				
			}
			
			return object;
			
		},
		
		create: function () {
			this.add.apply(this,arguments);
			return this.added;
		}
		
	}, new Set() );

	opal.TypedSet = TypedSet;
	
	Set.of = TypedSet;


	// ------------------------------------------------------------------------
	//															           List
	// ------------------------------------------------------------------------

	function List () {
		Set.apply(this,arguments);
	}
	
	List.prototype				= new Set();
	List.prototype.constraint	= AllPredicate;
	List.prototype.constructor	= List;
	
	List.from = function () {
		return List.fromArray(Array.prototype.slice.call(arguments));
	};
	
	List.fromArray = function (arr) {
		assert(arr instanceof Array, 'List.fromArray parameter is not an array');
		var list = new List();
		List.apply(list,arr);
		return list;
	};
	
	List.fromArguments = function (args) {
		assert(typeof args.callee !== 'undefined', 'List.fromArguments parameter is not an argument object');
		return List.fromArray(Array.prototype.slice.call(args));
	};
	
	List.fromJQuery = function (jq) {
		assert(typeof jq.jquery !== 'undefined', 'List.fromJQuery parameter is not a jQuery object');
		return List.fromArray(jq.get()).map(jQuery,new List());
	};
	
	List.fromGenerator = function (fn) {
		var next, items = [];
		while ( typeof( next = fn() ) !== 'undefined' ) {
			items.push(next);
		}
		return List.fromArray(items);
	};
	
	function list () {
		return    arguments.length === 1 && arguments[0].jquery ? List.fromJQuery(arguments[0])
				: arguments.length === 1 && arguments[0].callee ? List.fromArguments(arguments[0])
				: arguments.length === 1 && arguments[0] instanceof Array ? List.fromArray(arguments[0])
				: List.fromArguments(arguments);
	}

	opal.extend({
		List: List,
		list: list
	});


	// ------------------------------------------------------------------------
	//															   Unique Index
	// ------------------------------------------------------------------------

	function UniqueIndex (set,key) {

		this.set		= set;
		this.key		= typeof key === 'function' ? key : Resolve(key);
		this.__delegate	= copy({});
		
		this.build();

	}
	
	UniqueIndex.prototype = extend({
		
		constructor: UniqueIndex,
	
		build: function _build () {
			this.set.reduce(Method('add'),this);
		},

		add: function _add (object) {
			this.__delegate[this.key(object)] = object;
			return this;
		},

		remove: function _remove (object) {
			delete this.__delegate[this.key(object)];
			return this; 
		},

		get: function _get (keyval) {
			return this.__delegate[keyval];
		},
		
		member: function _member (object) {
			return this.__delegate.hasOwnProperty(this.key(object));
		}
		
	}, copy({}) );

	opal.extend({
		UniqueIndex: UniqueIndex
	});


	// ------------------------------------------------------------------------
	// 																 Predicates
	// ------------------------------------------------------------------------

	var predicate =  (new Set()).predicate;
	opal.predicate = predicate;

	// Generic

	function AllPredicate (candidate) {
		return true;
	}

	function NonePredicate (candidate) {
		return false;
	}

	function TruePredicate (candidate) {
		return candidate === true;
	}

	function FunctionPredicate (fn) {
		return function _functionpredicate (candidate) {
			return fn(candidate);
		};
	}

	function FunctionValuePredicate (fn,value) {
		return compose(EqualityPredicate(value),fn);
	}

    function NullPredicate (candidate) {
        return candidate === null;
    }

	function ExistentialPredicate () {
		var resolver = Resolve.apply(null,arguments);
		return function (candidate) {
			return Boolean(resolver(candidate));
		};
	}

	opal.extend({
		AllPredicate: 			AllPredicate,
		NonePredicate: 			NonePredicate,
		TruePredicate: 			TruePredicate,
		FunctionPredicate: 		FunctionPredicate,
		test: 					FunctionPredicate,
		FunctionValuePredicate: FunctionValuePredicate,
		NullPredicate:          NullPredicate,
		has: 					ExistentialPredicate
	});

	// Object Predicates

	function ObjectIdentityPredicate (object) {
		return FunctionValuePredicate(Identity,object);
	}

	function TypePredicate (test) {
		return FunctionValuePredicate(type,test);
	}

	function InstancePredicate (constructor) {
		// NOTE: Put this next line into jModel
		constructor = constructor.entitytype ? constructor.entitytype.constructor : constructor;
		return function _instancepredicate (candidate) {
			return candidate instanceof constructor;
		};
	}

	function PropertySetPredicate (paths,predicate) {
		predicate = ( typeof predicate != 'function' ) ? EqualityPredicate(predicate) : predicate;
		return function _propertysetpredicate (candidate) {
			return predicate(PropertySet(paths)(candidate));
		};
	}

	opal.extend({
		ObjectIdentityPredicate: 	ObjectIdentityPredicate,
		is: 						ObjectIdentityPredicate,
		TypePredicate: 				TypePredicate,
		is_of_type: 				TypePredicate,
		InstancePredicate: 			InstancePredicate,
		isa: 						InstancePredicate,
		isan: 						InstancePredicate,
		PropertySetPredicate: 		PropertySetPredicate,
		propset: 					PropertySetPredicate
	});


	// Value comparisons

	function ComparisonPredicate (operator) {
		return function _comparisonpredicate (value) {
			return function __comparisonpredicate (candidate) {
				return operator(candidate,value);
			};
		};
	}
	
	var EqualityPredicate         = ComparisonPredicate(eq),
		InequalityPredicate		  = ComparisonPredicate(neq),
		LessThanPredicate         = ComparisonPredicate(lt),
		GreaterThanPredicate      = ComparisonPredicate(gt),
		LessThanEqualPredicate    = ComparisonPredicate(lte),
		GreaterThanEqualPredicate = ComparisonPredicate(gte);

	function BetweenPredicate (lower,higher) {
		return function _betweenpredicate (candidate) {
			return lower <= candidate && candidate <= higher;
		};
	}

	function RegularExpressionPredicate (regex) {
		return function _regularexpressionpredicate (candidate) {
			return regex.test(candidate);
		};
	}
	
	function FieldPredicate (field,predicate) {
		return function _fieldpredicate (candidate) { 
		    return predicate(Resolve(field)(candidate));
		};
	}
	
	opal.extend({
		ComparisonPredicate: 			ComparisonPredicate,
		compare: 						ComparisonPredicate,
		EqualityPredicate: 				EqualityPredicate,
		eq:								EqualityPredicate,
		InequalityPredicate:			InequalityPredicate,
		neq:							InequalityPredicate,
		LessThanPredicate: 				LessThanPredicate,
		lt:								LessThanPredicate,
		GreaterThanPredicate: 			GreaterThanPredicate,
		gt:								GreaterThanPredicate,
		LessThanEqualPredicate: 		LessThanEqualPredicate,
		lte:							LessThanEqualPredicate,
		GreaterThanEqualPredicate: 		GreaterThanEqualPredicate,
		gte:							GreaterThanEqualPredicate,
		BetweenPredicate: 				BetweenPredicate,
		between:						BetweenPredicate,
		RegularExpressionPredicate: 	RegularExpressionPredicate,
		regex:							RegularExpressionPredicate,
		isnull:							NullPredicate
	});

	// Membership

	function MembershipPredicate (set) {
		return function _membershippredicate (candidate) {
			return set.member(candidate);
		};
	}

	opal.MembershipPredicate	= MembershipPredicate;
	opal.member 				= MembershipPredicate;


	//
	// Logical connectives
	//
	
	var or  = extend({unit:false}, function _or  (a,b) { return a || b; } ),
		nor = extend({unit:false}, function _nor (a,b) { return !( a || b ); } ),
		and = extend({unit:true},  function _and (a,b) { return a && b; } ); 

	function ConjunctionPredicate (conjunction) {
		return function _conjunctionpredicate () {
			var predicates = Set.fromArguments(arguments);
			return function __conjunctionpredicate (candidate) {
			    return predicates.map(applyto(candidate)).reduce(conjunction);
			};
		};
	}
	
	var Or  = ConjunctionPredicate(or),
		And = ConjunctionPredicate(and),
		Not = ConjunctionPredicate(nor);

	opal.extend({
		Or:  Or,
		or:  Or,
		And: And,
		and: And,
		Not: Not,
		not: Not
	});

	// Set predicates

	function CardinalityPredicate (predicate) {
		predicate = (typeof predicate == 'function') ? predicate : EqualityPredicate(predicate);
		return compose(predicate,Method('count'));
	}
	
	var EmptySetPredicate = CardinalityPredicate(0);

	function SetPredicate (conjunction) {
		return function _setpredicate () {
			var predicate = And.apply(null,arguments);
			return function __setpredicate (candidate) {
				return set(candidate).map(predicate).reduce(conjunction);
			};
		};
	}

	var AllSetPredicate  = SetPredicate(and),
		SomeSetPredicate = SetPredicate(or),
		NoneSetPredicate = SetPredicate(nor);

	opal.extend({
		EmptySetPredicate: 		EmptySetPredicate,
		empty: 					EmptySetPredicate,
		AllSetPredicate: 		AllSetPredicate,
		all: 					AllSetPredicate,
		SomeSetPredicate: 		SomeSetPredicate,
		some: 					SomeSetPredicate,
		NoneSetPredicate: 		NoneSetPredicate,
		none: 					NoneSetPredicate,
		CardinalityPredicate: 	CardinalityPredicate
	});



	// ------------------------------------------------------------------------
	//														   		  Orderings
	// ------------------------------------------------------------------------

	var makeOrdering = (new Set()).ordering;

	function FunctionOrdering (fn) {
		return function _functionordering (a,b) {
			var fna = fn(a),
				fnb = fn(b);
			return    fna < fnb ? -1
					: fna > fnb ? 1
					: 0
		};
	}

	var ValueOrdering = FunctionOrdering(Identity);

	function PredicateOrdering () {
		var predicates = Set.fromArguments(arguments);
		return FunctionOrdering( function _predicateordering (obj) {
			return -predicates.count(applyto(obj));
		});
	}

	function DescendingOrdering (ordering) {
		return function _descendingordering (a,b) {
			return -ordering(a,b);
		};
	}
	
	function CompositeOrdering () {
	    var orderings = Set.fromArguments(arguments);
	    return function _compositeordering (a,b) {
	        return orderings.reduce(function (acc,ordering) {
	           return acc || ordering(a,b);
	        },0);
	    };
	}
	

	opal.extend({
		FunctionOrdering: 	FunctionOrdering,
		func: 				FunctionOrdering,
		ValueOrdering: 		ValueOrdering,
		value: 				ValueOrdering,
		PredicateOrdering: 	PredicateOrdering,
		score: 				PredicateOrdering,
		DescendingOrdering: DescendingOrdering,
		desc: 				DescendingOrdering,
		CompositeOrdering: 	CompositeOrdering,
		composite: 			CompositeOrdering
	});
	
	
	// ------------------------------------------------------------------------
	// 														 		 Formatters
	// ------------------------------------------------------------------------
	
	function NoFormat (object) { return object; }
	
	opal.extend({
		noformat: 	NoFormat
	});


	// ------------------------------------------------------------------------
	// 														  Utility functions
	// ------------------------------------------------------------------------
	
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
			var that = this;
			Set.fromArguments(arguments).each(function __remove (key) {
				delete that[key];
			});
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
		delegateTo: 					delegateTo,
		copy: 							copy
	});

	opal.plugin = {
		set: Set.prototype,
		typedset: TypedSet.prototype
	};


	return opal;

});