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

function OPAL () {

	var opal = {opal_version:'0.8.6'};
	
	function assert(condition,exception) {
		if (!condition) {
			throw 'Opal exception: '+exception;
		}
	}

    // Tests: full
	function extend (object,target) {
		target = target || this;
		for ( var i in object ) {
	        target[i] = object[i];
		}
		return target;
	}
	opal.extend = extend;

    // Tests: full
	function pipe () {
		var fns = Array.prototype.slice.call(arguments);
		return fns.length == 1 ? fns[0] : function _pipe (x) {
			for (var i in fns) {
				x = fns[i](x);
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
				var label = fns[i] && fns[i].label ? fns[i].label : i;
				arguments[0] = args0[label] != undefined ? args0[label] : args0;
				result[label] = fns[i].apply(null,arguments);
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

    // Tests: partial
	// NOTE: add test that it doesn't set properties that don't exist
	function Property (property,value) {
		return arguments.length === 1 ? function _property (object,value) {
			if ( arguments.length === 1 ) {
				return object[property];
			}
			else if ( typeof object[property] !== 'undefined' ) {
				object[property] = value;
				return object;
			}
		}
		: function _property (object) {
			if ( object[property] ) {
				object[property] = value;
			}
			return object;
		};
	}

    // Tests: full
	function Method () {
		var args = Array.prototype.slice.call(arguments),
			name  = args.shift();
		return function _method () {
			var args1	= Array.prototype.slice.call(arguments),
				object  = args1.shift(),
				args2	= args.concat(args1);
			return ( object[name] && typeof object[name] === 'function' ) ?
						object[name].apply(object,args2) : false;
		}; 
	}
	
	// Tests: full
	function Resolve (name) {
	    var args = Array.prototype.slice.call(arguments),
	        name = args.shift();
		return function _resolve (object) {
		    var args1   = Array.prototype.slice.call(arguments),
		        object  = args1.shift(),
		        args2   = [object].concat(args,args1);
			return ( typeof object[name] === 'function' ) ? Method(name).apply(null,args2) : Property(name).apply(null,args2);
		};
	}

    // Tests: full
	function PropertyPath (path,separator) {
		var resolvers = Set.fromArray( typeof path == 'string' ? path.split(separator||'.') : path ).map(Resolve);
		return function _propertypath (object) {
			try {
				return resolvers.reduce(function (object,resolver) { return resolver(object); },object);
			}
			catch (error) {
				return undefined;
			}
		};
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
		Property: Property,
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
		
		constraint: function constraint (obj) {
			return !this.member(obj);
		},
		
		add: function _add (object) {
			this.added = undefined;
			if ( object !== undefined && this.constraint(object) ) {	
				this.__members.push(object);
				this.length++;
				if ( this.__index ) {
					this.__index.add(object);
				}
				this.added = object;
			}
			return this;
		},
		
		get: function _get (key) {
			if ( arguments.length === 0 ) {
				return this.__members;
			}
			else if ( key == ':first' ) {
				return this.first();
			}
			else if (this.__index) {
				return this.__index.get(key);
			}
			else if ( typeof key === 'number' ) {
				return this.__members[key];
			}
			else {
				var obj = this.filter(key);
				return obj.each ? obj.first() : obj;
			}
		},
		
		remove: function _remove (predicate) {
			var partition = this.partition(predicate,'remove','keep');
			this.__members = partition.keep.get();
			this.length = this.__members.length;
			if ( this.__index ) {
				partition.remove.reduce(Method('remove'),this.__index);
			}
			return partition.remove; 
		},
		
		count: function _count (predicate) {
			return this.reduce(count(predicate));
		},
		
		first: function _first () {
			return this.__members.length > 0 ? this.__members[0] : false;
		},
		
		last: function _last () {
			return this.__members.length > 0 ? this.__members[this.__members.length-1] : false;
		},
		
		member: function _member (object) {
			if ( this.__index ) {
				return this.__index.member(object);
			}
			else if ( this.__members.indexOf ) {
				return this.__members.indexOf(object) > -1;
			}
			else {
				return this.reduce(contains(ObjectIdentityPredicate(object)));
			}
		},
		
		sort: function _sort () {
			this.__members.sort(this.ordering.apply(null,arguments));
			return this;
		},
		
		concat : function _concat (second) {
			return second && second.reduce ? second.reduce(Method('add'),this) : this;
		},
		
		select : function _select (selector) {
			return selector == ':first' ? this.first() : this;
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
					callback.call(this,this.__members[index],index);
				}
			}
			return this;
		},
		
		partition: function _partition (predicate,passName,failName) {

			predicate = this.predicate(predicate);

			var pass		= [],
				fail		= [];

			this.each(function __partition (object) {
				(predicate(object) ? pass : fail).push(object);
			});
			
			return copy({})
						.setProperty(passName||'pass',Set.fromArray(pass))
						.setProperty(failName||'fail',Set.fromArray(fail));

		},
		
		filter: function _filter () {

			var predicate, selector;

			if ( arguments.length === 0 ) {
				return this;
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'string' && arguments[0].charAt(0) == ':' ) {
				predicate 	= AllPredicate;
				selector	= arguments[0];
			}
			else {
				predicate	= this.predicate(arguments[0]);
				selector	= arguments[1];
			}

			if ( predicate && predicate.unique ) {
			    selector = ':first';
			}

			return this.__members.filter ? Set.fromArray(this.__members.filter(predicate)).select(selector)
					: this.reduce(add(predicate),new Set()).select(selector);		

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
/*			if ( this.__members.reduce ) {
				return this.__members.reduce(fn,acc);
			}
			else { */
				this.each(function __reduce (object) {
					acc = fn(acc,object);
				});
				return acc;
//			}
		},
		
		copy: function _copy () {
			return set.apply(null,this.__members.slice(0));
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
			if ( parameter === null || parameter === undefined ) {
				return AllPredicate;
			}
			if ( parameter == ':empty' ) {
				return EmptySetPredicate;
			}
			else if ( parameter instanceof RegExp ) {
				return RegularExpressionPredicate(parameter);
			}
			else if ( typeof parameter == 'function' ) {
				return parameter;
			}
			else if ( typeof parameter == 'object' || typeof parameter == 'string' || typeof parameter == 'number' ) {
				return extend({unique:true},ObjectIdentityPredicate(parameter));
			}
			return AllPredicate;
		},
		
		ordering: function _ordering () {
			if ( arguments.length > 1 ) {
				return CompositeOrdering.apply(null,arguments);
			}
			else if ( arguments[0] instanceof Array ) {
				return CompositeOrdering(arguments[0]);
			}
			else if ( arguments.length === 0 ) {
				return ValueOrdering;
			}
			return arguments[0];
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
			return this.reduce(Method('add'),new TypedSet(cons));
		},
		
		jQuery: function _jQuery () {
			return jQuery( this
							.map(function __jQuery (obj) { return obj.jquery ? obj.get() : obj; })
								.reduce(Method('concat'),new Set())
									.get() );
		},
		
		delegateFor: function _delegateFor (host) {
			for (var i in this) {
				if ( !host[i] ) {
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

	function set () {
		if ( arguments.length === 1 && arguments[0] && arguments[0].jquery ) {
			return Set.fromJQuery(arguments[0]);
		}
		else if ( arguments.length === 1 && arguments[0] && arguments[0].callee ) {
			return Set.fromArguments(arguments[0]);
		}
		else if ( arguments.length === 1 && arguments[0] instanceof Array ) {
			return Set.fromArray(arguments[0]);
		}
		else {
			return Set.fromArguments(arguments);
		}
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
		return this;
	}
	
	TypedSet.prototype = extend({
		
		constructor: TypedSet,
		
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
		
		__construct: function () {
			
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


	// ------------------------------------------------------------------------
	//															           List
	// ------------------------------------------------------------------------

	function List () {
		Set.apply(this,arguments);
	}
	
	List.prototype				= new Set();
	List.prototype.constraint	= AllPredicate;
	List.prototype.constructor	= List;
	
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
	
	function list () {
		if ( arguments.length === 1 && arguments[0].jquery ) {
			return List.fromJQuery(arguments[0]);
		}
		else if ( arguments.length === 1 && arguments[0].callee ) {
			return List.fromArguments(arguments[0]);
		}
		else if ( arguments.length === 1 && arguments[0] instanceof Array ) {
			return List.fromArray(arguments[0]);
		}
		else {
			return List.fromArguments(arguments);
		}
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

	function PropertyPredicate (path,predicate) {
		predicate = ( typeof predicate != 'function' ) ? EqualityPredicate(predicate) : predicate;
		return pipe(PropertyPath(path),predicate);
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
		PropertyPredicate: 			PropertyPredicate,
		property: 					PropertyPredicate,
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
	
	function FieldOrValuePredicate (ValuePredicate,numberValueArguments) {
		numberValueArguments = numberValueArguments || 1;
		return function _fieldorvaluepredicate () {
		    var value    = Array.prototype.slice.call(arguments),
		        field   = ( value.length > numberValueArguments ) ? value.pop() : undefined;
			return field ? FieldPredicate(field,ValuePredicate.apply(null,value))
				            : ValuePredicate.apply(null,value);
		};
	}
	
	opal.extend({
		ComparisonPredicate: 			ComparisonPredicate,
		compare: 						ComparisonPredicate,
		EqualityPredicate: 				EqualityPredicate,
		LessThanPredicate: 				LessThanPredicate,
		GreaterThanPredicate: 			GreaterThanPredicate,
		LessThanEqualPredicate: 		LessThanEqualPredicate,
		GreaterThanEqualPredicate: 		GreaterThanEqualPredicate,
		BetweenPredicate: 				BetweenPredicate,
		RegularExpressionPredicate: 	RegularExpressionPredicate
	});
	
	var Eq		= FieldOrValuePredicate(EqualityPredicate),
		Lt		= FieldOrValuePredicate(LessThanPredicate),
		Gt		= FieldOrValuePredicate(GreaterThanPredicate),
		LtE		= FieldOrValuePredicate(LessThanEqualPredicate),
		GtE		= FieldOrValuePredicate(GreaterThanPredicate),
		Between	= FieldOrValuePredicate(BetweenPredicate,2),
		RegEx	= FieldOrValuePredicate(RegularExpressionPredicate),
		IsNull	= FieldOrValuePredicate(NullPredicate,0);
	
	opal.extend({
		
		eq: 		Eq,
		lt: 		Lt,
		gt: 		Gt,
		lte: 		LtE,
		gte: 		GtE,
		between: 	Between,
		regex: 		RegEx,
		isnull:     IsNull			
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
			if ( fna < fnb ) {
				return -1;
			}
			else if ( fna > fnb ) {
				return 1;
			}
			return 0;
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
				this[key] = this[key] || attributes[key];
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

}

var opal = OPAL();
if ( typeof _ === 'undefined' ) { var _ = opal; }


// ============================================================================
//															 Opal jQuery plugin
// ============================================================================

if ( typeof jQuery != 'undefined' ) {
	jQuery.fn.opal = function () {
		return opal.Set.fromJQuery(this);
	};
	if ( typeof _$ == 'undefined') {
		_$ = opal.pipe(jQuery,opal.Set.fromJQuery);
	}
}