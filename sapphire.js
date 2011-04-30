/*
 *	Sapphire Javascript Library
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires opal.js
 *
 */

define(['jmodel/opal'], function (opal) {

	//
	// Import OPAL
	//

	for ( var i in opal ) {
		eval('var '+i+' = opal.'+i);
	}

	var _ 	   = extend({sapphire_version:'0.11.1'},opal),
		_slice = Array.prototype.slice;
	
	// ------------------------------------------------------------------------
	//																		Set
	// ------------------------------------------------------------------------

	// Tests: full
	function Set () {

		this.__members = _slice.call(arguments);

		this.length		= this.__members.length;
		this.__index	= false;
		this.added		= null;

	}
	
	Set.prototype = {
		
		constructor: Set,
		
		//
		// Mutators
		//
		
		// Tests: partial
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
		
		// Tests: partial
		remove: function _remove (predicate) {
			var partition = this.partition(this.predicate(predicate));
			this.__members = partition[false] ? partition[false].get() : [];
			this.length = this.__members.length;
			if ( this.__index ) {
				partition[true].reduce(method('remove'),this.__index);
			}
			return partition[true] || new this.constructor();
		},
		
		// Tests: full
		sort: function _sort () {
			this.__members.sort(this.ordering.apply(null,arguments));
			return this;
		},
		
		// Tests: none
		concat : function _concat (second) {
			return second && second.reduce ? second.reduce(method('add'),this) : this;
		},
		
		//
		// Pure methods
		//
		
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
					: typeof this.first(is(object)) !== 'undefined'
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
			function makeCallback (obj) { return ( typeof obj === 'string' ) ? method(obj) : obj; }
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
			function makeMapping (obj) { return ( typeof obj == 'string' ) ? resolve(obj) : obj; }
			var args    = _slice.call(arguments),
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
			return union.apply(null,[this].concat(_slice.call(arguments)));
		},
		
		intersection: function _intersection () {
			return intersection.apply(null,[this].concat(_slice.call(arguments)));
		},
		
		difference: function _difference (set) {
			return difference(this,set);
		},
		
		predicate: function _predicate (parameter) {
			return	  parameter === ':empty' ? empty
					: parameter instanceof RegExp ? regex(parameter)
					: typeof parameter === 'function' ? parameter
					: typeof parameter === 'string' && parameter.charAt(0) === ':' ? extend({unique:true},is(this.get(parameter)))
					: ( typeof parameter === 'object' && parameter !== null ) || typeof parameter === 'string' || typeof parameter === 'number' ? extend({unique:true},is(parameter))
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
				return this.map(extractor || identity).reduce(combiner,acc);
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
			return this.reduce(method('add'), new TypedSet(cons));
		},
		
		jQuery: function _jQuery () {
			return jQuery( this
							.map(function __jQuery (obj) { return obj.jquery ? obj.get() : obj; })
								.reduce(method('concat'), new this.constructor())
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

	_.Set = Set;
	
	Set.from = function () {
		return Set.fromArray(_slice.call(arguments));
	};
	
	// Tests: full
	Set.fromArray = function (arr) {
		assert(arr instanceof Array, 'List.fromArray parameter is not an array');
		var set = new Set();
		Set.apply(set,arr);
		return set;
	};
	
	// Tests: full
	Set.fromArguments = function (args) {
		assert(typeof args.callee !== 'undefined', 'List.fromArguments parameter is not an argument object');
		return Set.fromArray(_slice.call(args));
	};
	
	// Tests: none
	Set.fromJQuery = function (jq) {
		assert(typeof jq.jquery !== 'undefined', 'List.fromJQuery parameter is not a jQuery object');
		return Set.fromArray(jq.get()).map(jQuery,new Set());
	};
	
	// Tests: none
	Set.fromGenerator = function (fn) {
		var next, items = [];
		while ( typeof( next = fn() ) !== 'undefined' ) {
			items.push(next);
		}
		return Set.fromArray(items);
	};
	
	// Tests: none
	_.range = function (lower, higher) {
		return function () {
			return lower <= higher ? lower++ : undefined;
		};
	};

	// Tests: partial
	function set () {
		return    arguments.length === 1 && arguments[0] instanceof Set ? arguments[0]
				: arguments.length === 1 && arguments[0] && arguments[0].jquery ? Set.fromJQuery(arguments[0])
				: arguments.length === 1 && arguments[0] && arguments[0].callee ? Set.fromArguments(arguments[0])
				: arguments.length === 1 && arguments[0] instanceof Array ? Set.fromArray(arguments[0]) 
				: Set.fromArguments(arguments);
	}
	_.set = set;

	//
	// Set operations
	//
	
	function zip (first,second,zipper) {
		first = ! (first instanceof Set || first instanceof List) ? list(first) : first;
		second = second.shift ? second : second.get();
		zipper = typeof zipper == 'string' ? method(zipper) : zipper;
		return first.map(function _zip (obj) {
			return zipper(obj,second.shift());
		});
	}

	function union () {
		return Set.fromArguments(arguments).reduce(method('concat'),new Set());
	}

	function intersection () {
		return Set.fromArguments(arguments).map(MembershipPredicate).reduce(method('filter'),arguments[0].copy());
	}

	function difference (first,second) {
		return first.filter( Not(MembershipPredicate(second)) );
	}

	_.extend({
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
		Set.fromArray(_slice.call(arguments,1)).reduce(method('add'),this);
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

	_.TypedSet = TypedSet;
	
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
		return List.fromArray(_slice.call(arguments));
	};
	
	List.fromArray = function (arr) {
		assert(arr instanceof Array, 'List.fromArray parameter is not an array');
		var list = new List();
		List.apply(list,arr);
		return list;
	};
	
	List.fromArguments = function (args) {
		assert(typeof args.callee !== 'undefined', 'List.fromArguments parameter is not an argument object');
		return List.fromArray(_slice.call(args));
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

	_.extend({
		List: List,
		list: list
	});


	// ------------------------------------------------------------------------
	//															   Unique Index
	// ------------------------------------------------------------------------

	function UniqueIndex (set,key) {

		this.set		= set;
		this.key		= typeof key === 'function' ? key : resolve(key);
		this.__delegate	= copy({});
		
		this.build();

	}
	
	UniqueIndex.prototype = extend({
		
		constructor: UniqueIndex,
	
		build: function _build () {
			this.set.reduce(method('add'),this);
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

	_.extend({
		UniqueIndex: UniqueIndex
	});


	// ------------------------------------------------------------------------
	// 																 Predicates
	// ------------------------------------------------------------------------

	var predicate =  (new Set()).predicate;
	_.predicate = predicate;

	// Membership
	
	function MembershipPredicate (set) {
		return function _membershippredicate (candidate) {
			return set.member(candidate);
		};
	}

	_.MembershipPredicate	= MembershipPredicate;
	_.member 				= MembershipPredicate;

	// Set predicates

	function CardinalityPredicate (predicate) {
		predicate = (typeof predicate == 'function') ? predicate : eq(predicate);
		return method('count').is(predicate);
	}
	
	var empty = CardinalityPredicate(0);

	function SetPredicate (conjunction) {
		return function _setpredicate () {
			var predicate = and.apply(null,arguments);
			return function __setpredicate (candidate) {
				return set(candidate).map(predicate).reduce(conjunction);
			};
		};
	}

	var all  = SetPredicate(and),
		some = SetPredicate(or),
		none = SetPredicate(extend({unit:true}, function (a,b) { return a && !b; } ));

	_.extend({
		empty: 					empty,
		all: 					all,
		some: 					some,
		none: 					none,
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

	var ValueOrdering = FunctionOrdering(identity);

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
	

	_.extend({
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
	
	_.extend({
		noformat: 	NoFormat
	});
	
	
	_.plugin = {
		set: Set.prototype,
		typedset: TypedSet.prototype
	};
	
	
	return _;
	
});