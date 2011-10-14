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

	// Non-strict section
	for ( var i in opal ) {
		eval('var '+i+' = opal.'+i);
	}
	
	return (function () {
		
		// Turn on strict mode for main section of library
		'use strict';

		var _ 	   = Object.extend(opal,{sapphire_version:'0.12.0'}),
			_slice = Array.prototype.slice;
			
		function _replace  (a,b) { return b; };


		// ------------------------------------------------------------------------
		//																		Map
		// ------------------------------------------------------------------------

		// Tests: full
		function Map (rep,combine) {
			this.__rep__ = rep || {};
			this.combine = combine || _replace;
		}

		Map.extend({
			
			// Tests: full
			To: function (constructor) {
				return TypedMap.curry(constructor).extend({
					prototype: TypedMap.prototype
				});
			}.memo()
			
		});

		Map.prototype = {

			// Tests: full
			get: function (key) {
				return this.__rep__[key];
			},

			// Tests: full
			add: function (x) {
				return    arguments.length === 1 && x instanceof Array ? this.addArray(x)
						: arguments.length === 1 && x instanceof Object ? this.addMappings(x)
						: this.add2.apply(this,arguments);
			},

			// Tests: full
			addMappings: function (mappings) {
				for ( var key in mappings ) {
					this.add2(key,mappings[key]);
				}
				return this;
			},
			
			// Tests: full
			addArray: function (keys) {
				for (var i=0; i<keys.length; i++) {
					this.add2(keys[i]);
				}
				return this;
			},

			// Tests: full
			add2: function (key,value) {
				var current =  this.__rep__[key];
				this.__rep__[key] = current ? this.combine(current,value) : value;
			},

			// Tests: none
			remove: function (key) {
				delete this.__rep__[key];
				return this;
			},
			
			// Tests: none
			each: function () {
				var callback = pipe.apply(null,arguments);
				for ( var i in this.__rep__ ) {
					if ( this.__rep__.hasOwnProperty(i) ) {
						callback.call(this,i,this.__rep__[i]);
					}
				}
				return this;
			}

		};

		// Tests: none
		function TypedMap (constructor,rep,combine) {
			this.ensure = ensure(constructor);
			Map.call(this,null,combine);
			var repMap = new Map(rep),
				that = this;
			repMap.each(function (key,value) {
				that.add2(key,value);
			});
		}

		TypedMap.prototype = Object.extend(new Map(), {
			
			// Tests: none
			add2: function (key,value) {
				return Map.prototype.add2.call(this,key,this.ensure.apply(this,_slice.call(arguments,1)));
			},
			
			// Tests: none
			create: function (key,value) {
				Map.prototype.add2.call(this,key,this.ensure.apply(this,_slice.call(arguments,1)));
				return this.get(key);
			}
			
		});

		
		Object.extend(_, {
			Map: Map,
			TypedMap: TypedMap
		});

		
		// ------------------------------------------------------------------------
		//																		Set
		// ------------------------------------------------------------------------

		// Tests: full
		function Set (members) {

			this.__rep__ = members || [];

			this.length		= this.__rep__.length;
			this.__index	= false;
			this.added		= null;

		}
		
		Set.extend({
			
			// Tests: none
			Of: function (constructor) {
				return TypedSet.curry(constructor).extend({
					prototype: TypedSet.prototype
				});
			}.memo(),
			
			// Tests: full
			from: function () {
				return Set.fromArray(_slice.call(arguments));
			},

			// Tests: full
			fromArray: function (arr) {
				return new Set(arr);
			},

			// Tests: full
			fromArguments: function (args) {
				return Set.fromArray(_slice.call(args));
			},

			// Tests: none
			fromJQuery: function (jq) {
				return Set.fromArray(jq.get()).map(jQuery).reduce(add(),new Set());
			},

			// Tests: none
			fromGenerator: function (fn) {
				var next, items = [];
				while ( typeof( next = fn() ) !== 'undefined' ) {
					items.push(next);
				}
				return Set.fromArray(items);
			},
			
			// Tests: none
			union: function () {
				return Set.fromArguments(arguments).reduce(bymethod('concat'), new Set());
			},

			// Tests: none
			intersection: function () {
				return Set.fromArguments(arguments).map(MembershipPredicate).reduce(bymethod('filter'),arguments[0].copy());
			},

			// Tests: none
			difference: function (first,second) {
				return first.filter( not(MembershipPredicate(second)) );
			}
			
		});
	
		Set.prototype = {
		
			__constructor: Set,
		
			//
			// Mutators
			//
		
			// Tests: full
			add: function (object) {
				this.added = undefined;
				if ( this.constraint(object) ) {	
					this.__rep__.push(object);
					this.length++;
					if ( this.__index ) {
						this.__index.add(object);
					}
					this.added = object;
				}
				return this;
			},
		
			// Tests: full
			remove: function (predicate) {
				var partition = this.partition(this.predicate(predicate));
				this.__rep__ = partition[false] ? partition[false].get() : [];
				this.length = this.__rep__.length;
				if ( this.__index && partition[true]) {
					partition[true].reduce(bymethod('remove'),this.__index);
				}
				return partition[true] || new this.__constructor();
			},
		
			// Tests: full
			sort: function () {
				this.__rep__.sort(this.ordering.apply(null,arguments));
				return this;
			},
		
			// Tests: full
			concat: function (second) {
				return second && second.reduce ? second.reduce(bymethod('add'),this) : this;
			},
		
			//
			// Pure methods
			//
		
			// Tests: none
			constraint: function (obj) {
				return typeof obj !== 'undefined' && !this.member(obj);
			},
		
			// Tests: none
			head: function () {
				return this.__rep__[0];
			},
		
			// Tests: none
			tail: function () {
				return this.__constructor.fromArray(this.__rep__.slice(1));
			},
		
			// Tests: none
			reverse: function () {
				return this.__constructor.fromArray(this.__rep__.slice().reverse());
			},
		
			// Tests: none
			get: function (key) {
				return    arguments.length === 0 ? this.__rep__
						: key === ':first' ? this.first()
						: key === ':last' ? this.last()
						: this.__index ? this.__index.get(key)
						: typeof key === 'number' ? this.__rep__[key]
						: this.first(key);
			},
		
			// Tests: full
			count: function (predicate) {
				return arguments.length === 0 ? this.length : this.reduce(count(predicate));
			},
		
			// Tests: none
			first: function (predicate) {
				return    this.length === 0 ? undefined
						: typeof predicate !== 'undefined' ? (
							this.predicate(predicate)(this.head()) ? this.head() : this.tail().first(predicate) 
						)
						: this.head();
			},
		
			// Tests: none
			last: function (predicate) {
				return    this.length === 0 ? false
						: typeof predicate !== 'undefined' ? this.reverse().first(predicate)
						: this.get(this.length-1);
			},
		
			// Tests: none
			member: Array.prototype.indexOf ? function (object) {
				return    this.__index ? this.__index.member(object)
						: this.__rep__.indexOf(object) > -1;
			} : function (object) {
				return    this.__index ? this.__index.member(object)
						: typeof this.first(is(object)) !== 'undefined';
			},
		
			// Tests: none
			select : function (selector) {
				return selector ? this.get(selector) : this;
			},
		
			// Tests: none
			when : function (predicate,callback) {
				if ( this.predicate(predicate)(this) ) {
					callback.call(this,this);
				}
				return this;
			},
		
			// Tests: partial
			// NOTE: Test setting of this
			// NOTE: Test passing of index
			// NOTE: Test explicit definition
			each: Array.prototype.forEach ? function () {
				this.__rep__.forEach(pipe.apply(null,arguments),this);
				return this;
			} : function () {
				var callback = pipe.apply(null,arguments);
				for ( var i=0, rep=this.__rep__; i<rep.length; i++) {
					callback.call(this,rep[i],i);
				}
				return this;
			},
		
			// Tests: none
			partition: function (fn) {
				var constructor = this.__constructor;
				return this.reduce(function (acc,object) {
					var key = fn(object);
					acc[key] = ( acc[key] || new constructor() ).add(object);
					return acc;
				}, {});
			},
		
			// Tests: none
			filter: Array.prototype.filter ? function (predicate) {
				return    typeof predicate === 'undefined' ? this
						: this.__constructor.fromArray(this.__rep__.filter(this.predicate(predicate)));
			} : function (predicate) {
				if ( typeof predicate === 'undefined' ) { return this; }
				var set = [];
				for ( var i=0, rep=this.__rep__; i<rep.length; i++ ) {
					var item = rep[i];
					if ( predicate(item) ) { set.push(item); }
				}
				return this.__constructor.fromArray(set);
			},
		
			// Tests: full
			map: Array.prototype.map ? function () {
				return List.fromArray(this.__rep__.map(pipe.apply(null,arguments)));
			} : function () {
				var mapping = pipe.apply(null,arguments);
				var list = [];
				for ( var i=0, rep=this.__rep__; i<rep.length; i++ ) {
					list.push(mapping.call(null,rep[i]));
				}
				return List.fromArray(list);
			},
		
			// Tests: full
			reduce: Array.prototype.reduce ? function (fn,acc) {
				return this.__rep__.reduce(fn,arguments.length > 1 ? acc : fn.unit);
			} : function (fn,acc) {
				acc = arguments.length > 1 ? acc : fn.unit;
				for ( var i=0, rep=this.__rep__; i<rep.length; i++ ) {
					acc = fn(acc,rep[i]);
				}
				return acc;
			},
		
			// Tests: none
			copy: function () {
				return this.__constructor.fromArray(this.__rep__.slice(0));
			},
		
			// Tests: none
			index: function (key) {
				this.__index = new UniqueIndex(this,key);
				return this;
			},
		
			// Tests: none
			union: function () {
				return Set.union.apply(null,[this].concat(_slice.call(arguments)));
			},
		
			// Tests: none
			intersection: function () {
				return Set.intersection.apply(null,[this].concat(_slice.call(arguments)));
			},
		
			// Tests: none
			difference: function (set) {
				return Set.difference(this,set);
			},
		
			// Tests: none
			predicate: function (parameter) {
				return	  parameter === ':empty' ? empty
						: parameter instanceof RegExp ? regex(parameter)
						: typeof parameter === 'function' ? parameter
						: typeof parameter === 'string' && parameter.charAt(0) === ':' ? extend({unique:true},is(this.get(parameter)))
						: ( typeof parameter === 'object' && parameter !== null ) || typeof parameter === 'string' || typeof parameter === 'number' ? is(parameter).extend({unique:true})
						: AllPredicate;
			},
		
			// Tests: none
			ordering: function () {
				return    arguments.length > 1 ? Function.ordering.apply(null,arguments)
						: arguments[0] instanceof Array ? Function.ordering.apply(null,arguments[0])
						: arguments.length === 0 ? Function.identity.asc()
						: arguments[0];
			},
		
			// Tests: none
			aggregate: function (combiner,acc) {
				acc = acc || null;
				return function __aggregate () {
					var extractor = ( arguments.length > 1 ) ? pipe.apply(null,arguments) : arguments[0];
					return this.map(extractor || identity).reduce(combiner,acc);
				};
			},
		
			// Tests: none
			mean: function () {
				var stat = this.aggregate(parallel(plus,count()),{sum:0,count:0}).apply(this,arguments);
				return stat.sum/stat.count;
			},
		
			// Tests: none
			format: function (formatter) {
				return formatter(this);
			},
		
			// Tests: none
			join: function (separator) {
				return this.__rep__.join(separator);
			},
		
			// Tests: none
			zip: function (set2,zipper) {
				return zip(this,set2,zipper);
			},
		
			// Tests: none
			jQuery: function () {
				return jQuery( this
								.map(function (obj) { return obj.jquery ? obj.get() : obj; })
									.reduce(bymethod('concat'), new this.__constructor())
										.get() );
			},
		
			// Tests: none
			delegateFor: function (host) {
				for (var i in this) {
					if ( /*this.hasOwnProperty(i) &&*/ !host[i] ) {
						host[i] = this[i];
					}
				}
				return this;
			}
		
		};
		
		Set.prototype.where = Set.prototype.filter;
		
		// Tests: none
		Set.prototype.max = Set.prototype.aggregate(max);
		Set.prototype.min = Set.prototype.aggregate(min);
		Set.prototype.sum = Set.prototype.aggregate(plus);
		Set.prototype.range = Set.prototype.aggregate(parallel(min,max),{min:null,max:null});

		_.Set = Set;
	
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
	
		// Tests: none
		function zip (first,second,zipper) {
			first = ! (first instanceof Set || first instanceof List) ? list(first) : first;
			second = second.shift ? second : second.get();
			zipper = typeof zipper == 'string' ? method(zipper) : zipper;
			return first.map(function (obj) {
				return zipper(obj,second.shift());
			});
		}

		Object.extend(_,{
			zip: zip
		});



		// ------------------------------------------------------------------------
		//															       TypedSet
		// ------------------------------------------------------------------------
	
		// Tests: none
		function TypedSet (constructor) {
			this.ensure = ensure(constructor);
			this.valid  = valid(constructor);
			Set.apply(this,[]);
			Set.fromArray(_slice.call(arguments,1)).reduce(bymethod('add'),this);
			return this;
		}
	
		TypedSet.prototype = Object.extend(new Set(), {
		
			// Tests: none
			add: function () {
				return Set.prototype.add.call(this,this.ensure.apply(this,arguments));
			},
		
			// Tests: none
			create: function () {
				this.add.apply(this,arguments);
				return this.added;
			}
		
		} );

		_.TypedSet = TypedSet;


		// ------------------------------------------------------------------------
		//															           List
		// ------------------------------------------------------------------------

		// Tests: none
		function List () {
			Set.apply(this,arguments);
		}
	
		List.prototype					= new Set();
		List.prototype.constraint		= AllPredicate;
		List.prototype.__constructor	= List;
	
		// Tests: none
		List.from = function () {
			return List.fromArray(_slice.call(arguments));
		};
	
		// Tests: none
		List.fromArray = function (arr) {
			return new List(arr);
		};
	
		// Tests: none
		List.fromArguments = function (args) {
			return List.fromArray(_slice.call(args));
		};
	
		// Tests: none
		List.fromJQuery = function (jq) {
			return List.fromArray(jq.get()).map(jQuery,new List());
		};
	
		// Tests: none
		List.fromGenerator = function (fn) {
			var next, items = [];
			while ( typeof( next = fn() ) !== 'undefined' ) {
				items.push(next);
			}
			return List.fromArray(items);
		};
	
		// Tests: none
		function list () {
			return    arguments.length === 1 && arguments[0].jquery ? List.fromJQuery(arguments[0])
					: arguments.length === 1 && arguments[0].callee ? List.fromArguments(arguments[0])
					: arguments.length === 1 && arguments[0] instanceof Array ? List.fromArray(arguments[0])
					: List.fromArguments(arguments);
		}

		Object.extend(_,{
			List: List,
			list: list
		});


		// ------------------------------------------------------------------------
		//															   Unique Index
		// ------------------------------------------------------------------------

		// Tests: none
		function UniqueIndex (set,key) {

			this.set		= set;
			this.key		= typeof key === 'function' ? key : resolve(key);
			this.__delegate	= copy({},true);
		
			this.build();

		}
	
		UniqueIndex.prototype = Object.extend(copy({}),{
		
			__constructor: UniqueIndex,
	
			// Tests: none
			build: function () {
				this.set.reduce(bymethod('add'),this);
			},

			// Tests: none
			add: function (object) {
				this.__delegate[this.key(object)] = object;
				return this;
			},

			// Tests: none
			remove: function (object) {
				delete this.__delegate[this.key(object)];
				return this; 
			},
			
			// Tests: none
			removeKey: function (key) {
				delete this.__delegate[key];
				return this;
			},

			// Tests: none
			get: function (keyval) {
				return this.__delegate[keyval];
			},
			
			// Tests: none
			member: function (object) {
				return this.__delegate.hasOwnProperty(this.key(object));
			}
		
		} );

		Object.extend(_,{
			UniqueIndex: UniqueIndex
		});


		// ------------------------------------------------------------------------
		// 																 Predicates
		// ------------------------------------------------------------------------

		var predicate =  (new Set()).predicate;
		_.predicate = predicate;

		// Membership
	
		// Tests: none
		function MembershipPredicate (set) {
			return function (candidate) {
				return set.member(candidate);
			};
		}

		_.MembershipPredicate	= MembershipPredicate;
		_.member 				= MembershipPredicate;

		// Set predicates

		// Tests: none
		function CardinalityPredicate (predicate) {
			predicate = (typeof predicate == 'function') ? predicate : eq(predicate);
			return method('count').is(predicate);
		}
	
		// Tests: none
		var empty = CardinalityPredicate(0);

		// Tests: none
		function SetPredicate (conjunction) {
			return function () {
				var predicate = and.apply(null,arguments);
				return function  (candidate) {
					return set(candidate).map(predicate).reduce(conjunction);
				};
			};
		}

		// Tests: none
		var all  = SetPredicate(and),
			some = SetPredicate(or),
			none = SetPredicate(Object.extend(function (a,b) { return a && !b; },{unit:true}));

		Object.extend(_,{
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

		// Tests: none
		function PredicateOrdering () {
			var predicates = Set.fromArguments(arguments);
			return function (obj) {
				return -predicates.count(applyto(obj));
			}.asc();
		}

		Object.extend(_,{
			PredicateOrdering: 	PredicateOrdering,
			score: 				PredicateOrdering
		});
	
	
		// ------------------------------------------------------------------------
		// 														 		 Formatters
		// ------------------------------------------------------------------------
	
		// Tests: none
		function NoFormat (object) { return object; }
	
		Object.extend({
			noformat: 	NoFormat
		});
	
	
		_.plugin = {
			set: Set.prototype,
			typedset: TypedSet.prototype
		};
	
	
		return _;
		
	})();
	
});