/*
 *	OPAL Javascript Library v0.8.0
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

	var opal = {opal_version:'0.8.0'};

	function extend (object,target) {
		target = target || this;
		for ( var i in object ) {
			target[i] = object[i];
		}
		return target;
	}
	opal.extend = extend;

	function pipe () {
		var fns = arguments;
		return fns.length == 1 ? fns[0] : function _pipe (x) {
			for (var i=0;i<fns.length;i++) {
				x = fns[i](x);
			}
			return x;
		};
	}
	
	function compose () {
		return arguments.length == 1 ? arguments[0]
				: pipe.apply(null,arrayFromArguments(arguments).reverse());
	}
	
	function parallel () {
		var fns = arguments;
		return function _parallel () {
			var args0 = arguments[0],
				result = {};
			for (var i=0; i<fns.length;i++) {
				var label = fns[i] && fns[i].label ? fns[i].label : i;
				arguments[0] = args0[label] != undefined ? args0[label] : args0;
				result[label] = fns[i].apply(null,arguments);
			}
			return result;
		};
	}
	
	function apply () {
		var fn   = arguments[0],
			args = arrayFromArguments(arguments).slice(1);
		return fn.apply(null,args);
	}

	function ApplyTo () {
		var args = arguments;
		return function _applyto (fn) {
			return fn.apply(null,args);
		};
	}
	
	function curry (fn) {
		var args1 = arrayFromArguments(arguments).slice(1);
		return function _curry () {
			return fn.apply(null,args1.concat(arrayFromArguments(arguments)));
		};
	}
	
	var suspend = curry;

	//
	// Concurrency functions
	//
	
	function async () {
		return setTimeout(suspend.apply(null,arguments),1);
	}
	
	function sequence () {
		var operations	= arrayFromArguments(arguments),
			operation	= operations.shift(),
			callback	= operations.shift();
		function makeCallback () {
			return function () {
				callback.apply(null,arguments);
				operation = operations.shift();
				callback = operations.shift();
				if ( operation && callback ) {
					performOperation();
				}
			};
		}
		function performOperation () {
			operation(makeCallback());
		}
		return performOperation();
	}
	
	function synchronise () {
		var args = arrayFromArguments(arguments),
			last = args.pop(),
			left = args.length/2;
		while ( args.length > 0 ) {
			(function () {
				var operation = args.shift(), callback = args.shift();
				operation(function () {
					callback.apply(null,arguments);
					if ( --left == 0 ) {
						last();
					}
				});
			})();	
		}
	}


	//
	// Object functions
	// 

	function Identity (object) {
		return object;
	}

	function Type (object) {
		return object != null && typeof object;
	}

	function Property (property,value) {
		return arguments.length == 1 ? function _property (object,value) {
			if ( arguments.length == 1 ) {
				return object[property];
			}
			else {
				object[property] = value;
				return object;
			}
		}
		: function _property (object) {
			object[property] = value;
			return object;
		};
	}

	function Method () {
		var name = arguments[0],
			args1 = arrayFromArguments(arguments).slice(1);
		return function _method (object) {
				if ( ! ( object[name] && typeof object[name] == 'function' ) ) {
					return false;
				}
				var args = args1.concat(arrayFromArguments(arguments).slice(1));
				return args ? object[name].apply(object,args) : object[name].apply(object);
			};
	}
	
	function Resolve (name) {
		var method = Method.apply(null,arguments),
			property = Property.apply(null,arguments);
		return function _resolve (object) {
			return object[name] && typeof object[name] == 'function' ? method.apply(null,arguments)
						: property.apply(null,arguments);
		};
	}

	function PropertyPath (path,separator) {
		var resolvers = set( typeof path == 'string' ? path.split(separator||'.') : path ).map(Resolve);
		return function _propertypath (object) {
			try {
				return resolvers.reduce(function (object,resolver) { return resolver(object); },object);
			}
			catch (error) {
				return false;
			}
		};
	}

	function PropertySet (paths,separator) {
		paths = ( paths instanceof Set ) ? paths : new Set(paths);
		paths = paths.map(function _propertyset (path) { return PropertyPath(path,separator); });
		return function __propertyset (object) {
			return paths.map(ApplyTo(object));
		};
	}

	function transform (name,transformer,extractor) {
		var resolve = Resolve(name);
		extractor = extractor || resolve;
		return function _transform (object) {
			return resolve(object,transformer(extractor(object)));
		};
	}
	
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
		ApplyTo: ApplyTo,
		applyto: ApplyTo,
		compose: compose,
		pipe: pipe,
		parallel: parallel,
		curry: curry,
		suspend: suspend,
		async: async,
		sequence: sequence,
		synchronise: synchronise,
		synchronize: synchronise,
		Identity: Identity,
		Type: Type,
		Property: Property,
		Method: Method,
		Resolve: Resolve,
		PropertyPath: PropertyPath,
		PropertySet: PropertySet,
		transform: transform,
		aspect: aspect
	});


	//
	// Reduction functions
	//

	var plus = extend({unit:0,label:'sum'},function _plus (acc,value) {
		return acc + value;
	});

	var times = extend({unit:1,label:'product'},function _times (acc,value) {
		return acc * value;
	});
	
	var count = function _count (predicate) {
		var predicate = predicate || AllPredicate;
		return extend({unit:0,label:'count'}, function __count (acc,value) {
			return acc += (predicate(value) ? 1 : 0);
		});
	};
	
	var withmethod = function _withmethod (name) {
		var method = Method(name);
		return function __withmethod (acc,value) {
			return method(acc,value);
		};
	};
	
	var push = withmethod('push');
	
	var add = function _add () {
		if ( arguments.length == 0 ) {
			return function __add (acc,value) {
				return acc.add(value);
			};
		}
		else if ( arguments.length == 1 ) {
			var predicate = arguments[0];
			return function __add (acc,value) {
				return predicate(value) ? acc.add(value) : acc;
			};
		}
		else {
			var predicate   = arguments[0],
				mapping		= arguments[1],
				mapfirst	= arguments[2] || false;
			return function __add (acc,value) {
				var mapped = mapping(value);
				return predicate(mapfirst ? mapped : value) ? acc.add(mapped) : acc;
			};
		}
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
		return ( acc < value && acc != null ) ? acc : value;
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

	function Set (objects) {

		this.__members = ( objects && objects.jquery && jQuery ) ?
								set(objects.get()).map(jQuery).get()
								: (objects || []);

		this.length		= this.__members.length;
		this.__index	= false;
		this.added		= null;

	}
	
	Set.prototype = {
		
		constructor: Set,
		
		constraint: function constraint (obj) {
			return !this.member(obj);
		},
		
		add: function _add (object,success,failure) {
			this.added = undefined;
			if ( this.constraint(object) ) {	
				this.__members.push(object);
				this.length++;
				if ( this.__index ) {
					this.__index.add(object);
				}
				this.added = object;
				if (success && typeof success=='function') {
					success.call(this,object);
				}
			}
			else {
				if (failure && typeof failure=='function') {
					failure.call(this,object);
				}	
			}
			return this;
		},
		
		get: function _get (key) {
			if ( arguments.length == 0 ) {
				return this.__members;
			}
			else if ( key == ':first' ) {
				return this.first();
			}
			else if (this.__index) {
				return this.__index.get(key);
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
			return arguments.length == 0 ? this.length : this.reduce(count(predicate));
		},
		
		first: function _first () {
			return this.__members[0] || false;
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
			function makeCallback (obj) { return ( typeof obj == 'string' ) ? Method(obj) : obj; }
			var callback = ( arguments.length == 1 ) ? makeCallback(arguments[0])
							: pipe.apply(null,set(arguments).map(makeCallback).get());
			if ( this.__members.forEach ) {
				this.__members.forEach(callback,this);
			}
			else {
				for (var index=0; index<this.__members.length; index++) {
					callback.apply(this,[this.__members[index],index]);
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
						.set(passName||'pass',set(pass))
						.set(failName||'fail',set(fail));

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

			return this.__members.filter ? set(this.__members.filter(predicate)).select(selector)
					: this.reduce(add(predicate),set()).select(selector);		

		},
		
		map: function _map () {
			function makeMapping (obj) { return ( typeof obj == 'string' ) ? Resolve(obj) : obj; }
			var lastArgument 	= arguments[arguments.length-1],
				lastIsObject	= typeof lastArgument == 'object',
				mapped			= lastIsObject ? lastArgument : list(),
				mappings		= Array.prototype.slice.call(arguments,0,arguments.length - ( lastIsObject ? 1 : 0 )),
				mapping 		= ( mappings.length == 1 ) ? makeMapping(mappings[0])
						  			: pipe.apply(null,set(mappings).map(makeMapping).get());
			return this.reduce(add(function (obj) {return obj != null;},mapping,true),mapped);
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
			return union.apply(null,[this].concat(arrayFromArguments(arguments)));
		},
		
		intersection: function _intersection () {
			return intersection.apply(null,[this].concat(arrayFromArguments(arguments)));
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
				return ObjectIdentityPredicate(parameter);
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
			else if ( arguments.length == 0 ) {
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
								.reduce(Method('concat'),set())
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

	function set () {
		if ( arguments.length == 1 && arguments[0].jquery ) {
			return new Set(arguments[0]);
		}
		else if ( arguments.length == 1 && arguments[0].callee ) {
			return new Set(arrayFromArguments(arguments[0]));
		}
		else {
			return new Set(arrayFromArguments(arguments));
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
		return set(arguments).reduce(Method('concat'),set());
	}

	function intersection () {
		return set(arguments).map(MembershipPredicate).reduce(Method('filter'),arguments[0].copy());
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
	//															           List
	// ------------------------------------------------------------------------
	
	function TypedSet (constructor) {
		constructor = constructor && constructor.entitytype ? constructor.entitytype.constructor : constructor;
		this.__constructor = this.__constructor || constructor;
		Set.apply(this,null);
		return this;
	}
	
	TypedSet.prototype = extend({
		
		constructor: TypedSet,
		
		add: function () {
			
			var object = arguments[0];
			if ( arguments.length > 1 || object.constructor === Object || ! ( object instanceof Object) ) {
				object = this.__construct.apply(this,arguments);
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

			}

			if ( failed ) {
				throw "Opal: Invalid type in TypedSet.";
			}
			else {
				return Set.prototype.add.call(this,object);
			}

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
			
		}
		
	}, new Set() );

	opal.TypedSet = TypedSet;


	// ------------------------------------------------------------------------
	//															           List
	// ------------------------------------------------------------------------

	function List () {
		var elements = set.apply(null,arguments);
		elements.constraint = function _list (obj) { return true; };
		elements.delegateFor(this);
	}
	
	function list () {
		if ( arguments.length == 1 && arguments[0].jquery ) {
			return new List(arguments[0]);
		}
		else if ( arguments.length == 1 && arguments[0].callee ) {
			return new List(arrayFromArguments(arguments[0]));
		}
		else {
			return new List(arrayFromArguments(arguments));
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
	
	UniqueIndex.prototype = {
		
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
		
	};

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
		return candidate == true;
	}

	function FunctionPredicate (fn) {
		return function _functionpredicate (candidate) {
			return fn(candidate);
		};
	}

	function FunctionValuePredicate(fn,value) {
		return compose(EqualityPredicate(value),fn);
	}

	opal.extend({
		AllPredicate: 			AllPredicate,
		NonePredicate: 			NonePredicate,
		TruePredicate: 			TruePredicate,
		FunctionPredicate: 		FunctionPredicate,
		test: 					FunctionPredicate,
		FunctionValuePredicate: FunctionValuePredicate
	});

	// Object Predicates

	function ObjectIdentityPredicate (object) {
		return FunctionValuePredicate(Identity,object);
	}

	function TypePredicate (type) {
		return FunctionValuePredicate(Type,type);
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
		type: 						TypePredicate,
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

	opal.extend({
		ComparisonPredicate: 			ComparisonPredicate,
		compare: 						ComparisonPredicate,
		EqualityPredicate: 				EqualityPredicate,
		eq: 							EqualityPredicate,
		LessThanPredicate: 				LessThanPredicate,
		lt: 							LessThanPredicate,
		GreaterThanPredicate: 			GreaterThanPredicate,
		gt: 							GreaterThanPredicate,
		LessThanEqualPredicate: 		LessThanEqualPredicate,
		lte: 							LessThanEqualPredicate,
		GreaterThanEqualPredicate: 		GreaterThanEqualPredicate,
		gte: 							GreaterThanEqualPredicate,
		BetweenPredicate: 				BetweenPredicate,
		between: 						BetweenPredicate,
		RegularExpressionPredicate: 	RegularExpressionPredicate,
		regex: 							RegularExpressionPredicate
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
			var predicates = opal.set(arrayFromArguments(arguments));
			return function __conjunctionpredicate (candidate) {
				return predicates.map(ApplyTo(candidate)).reduce(conjunction);
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
		var predicates = set(arguments);
		return FunctionOrdering( function _predicateordering (obj) {
			return -predicates.count(ApplyTo(obj));
		});
	}

	function DescendingOrdering (ordering) {
		return function _descendingordering (a,b) {
			return -ordering(a,b);
		};
	}
	
	function CompositeOrdering () {
	    var orderings = set(arguments);
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
	
	function Prepend (prefix) {
		return function _prepend (string) {
			return prefix+string;
		};
	}
	
	function Append (suffix) {
		return function _append (string) {
			return string+suffix;
		};
	}
	
	function Join (separator) {
		return Method('join',separator);
	}
	
	function Concatenate () {
		var formatters = arrayFromArguments(arguments),
			separator = ' ';
		if ( typeof formatters[formatters.length-1] == 'string' ) {
			separator = formatters.pop();
		}
		return function _concatenate (object) {
			var mapped = [];
			for (var i=0; i<formatters.length; i++) {
				mapped.push(formatters[i](object));
			}
			return mapped.join(separator);
		};
	}
	
	function Replace (find,replace) {
		replace = arguments.length == 2 ? replace
					: pipe.apply(null,arrayFromArguments(arguments).slice(1));
		return Method('replace',find,replace);
	}
	
	function Surround (affix) {
		return compose(Prepend(affix),Append(affix));
	}
	
	function Decimal (places) {
		return Method('toFixed',places);
	}
	
	function Locale () {
		return Method('toLocaleString');
	}
	
	function Percentage () {
		return Append('%');
	}
	
	function Currency (symbol,decimals) {
		return function _currency (number) {
			return compose(	Prepend(number < 0 ? '-' : ''),
							Prepend(symbol),
							Locale(),
							Decimal(decimals===false ? 0 : 2) 		)(Math.abs(number));
		};
	}
	
	function Listing () {
		var formatter, terminal;
		if ( typeof arguments[0] == 'function' ) {
			formatter	= arguments[0];
			terminal	= arguments[1];
		}
		else {
			formatter 	= NoFormat;
			terminal	= arguments[0];
		}
		terminal = terminal || ' and ';
		return function _listing (list) {
			var length = list.count(),
				terminalPosition = length > 1 ? length-1 : -1,
				index=0;
			return list.reduce(function __listing (acc,object) {
				var separator = index == terminalPosition ? terminal : ', ';	
				index++;			
				return acc + (acc ? separator : '') + formatter(object);
			},'');
		};
	}
	
	opal.extend({
		noformat: 	NoFormat,
		prepend: 	Prepend,
		append: 	Append,
		join: 		Join,
		concat: 	Concatenate,
		replace: 	Replace,
		surround: 	Surround,
		decimal: 	Decimal,
		locale: 	Locale(),
		percent: 	Percentage(),
		currency: 	Currency,
		listing: 	Listing
	});


	// ------------------------------------------------------------------------
	// 														  Utility functions
	// ------------------------------------------------------------------------

	function arrayFromArguments (args) {
		return ( args.length == 1 && args[0] instanceof Array ) ? args[0] : Array.prototype.slice.call(args);
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
		
		add: function _add (attributes) {
			return extend(attributes,this);
		},
		
		remove: function _remove () {
			var that = this;
			set(arguments).each(function __remove (key) {
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
		
		set: function _set (key,value) {
			this[key] = value;
			return this;
		}
		
	};
	
	EnhancedObject.prototype._add = EnhancedObject.prototype.add;
	EnhancedObject.prototype._remove = EnhancedObject.prototype.remove;
	EnhancedObject.prototype._defaults = EnhancedObject.prototype._efaults;
	EnhancedObject.prototype._set = EnhancedObject.prototype.set;

	opal.extend({
		arrayFromArguments: 			arrayFromArguments,
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
if ( typeof _ == 'undefined' ) { var _ = OPAL(); }


// ============================================================================
//															 Opal jQuery plugin
// ============================================================================

if ( typeof jQuery != 'undefined' ) {
	jQuery.fn.opal = function () {
		return opal.set(this);
	};
	if ( typeof _$ == 'undefined') {
		_$ = opal.pipe(jQuery,opal.set);
	}
}