/*
 *	OPAL Javascript Library v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

// ============================================================================
//									 Object Predicate and Action Library (OPAL)
// ============================================================================

function OPAL () {

	var opal = {};

	function extend (object,target) {
		target = target || this;
		for ( var i in object ) {
			target[i] = object[i];
		}
		return target;
	}
	opal.extend = extend;

	function compose () {
		var fns = arguments;
		return function (x) {
			for (var i=fns.length-1;i>=0;i--) {
				x = fns[i](x);
			}
			return x;
		};
	}

	function pipe () {
		return compose.apply(null,arrayFromArguments(arguments).reverse());
	}
	
	function apply (fn) {
		return fn.apply(null);
	}

	function ApplyTo () {
		var args = arguments;
		return function (fn) {
			return fn.apply(null,args);
		};
	}

	function Identity (object) {
		return object;
	}

	function Type (object) {
		return typeof object;
	}

	function Property (property) {
		return function (object) {
			return object[property];
		};
	}

	function Method () {
		var name = arguments[0],
			args1 = arrayFromArguments(arguments).slice(1),
			method = function (object) {
				if ( ! ( object[name] && typeof object[name] == 'function' ) ) {
					return false;
				}
				var args = args1.concat(arrayFromArguments(arguments).slice(1));
				return args ? object[name].apply(object,args) : object[name].apply(object);
			};
		method.apply = method;
		return method;
	}

	function PropertyPath (path,separator) {
		function resolve (object,pieces) {
			var piece	= pieces.shift(),
				deref	= ( typeof object[piece] == 'function' ) ? Method(piece) : Property(piece);
			return ( pieces.length === 0 ) ? deref(object) : resolve(deref(object),pieces);
		}
		return function (object) {
			try {
				return resolve(object,path.split(separator||'.'));
			}
			catch (error) {
				return false;
			}
		};
	}

	function PropertySet (paths,separator) {
		paths = ( paths instanceof Set ) ? paths : new Set(paths);
		paths = paths.map(function (path) { return PropertyPath(path,separator); });
		return function (object) {
			return paths.map(ApplyTo(object));
		};
	}

	opal.extend({
		apply: apply,
		ApplyTo: ApplyTo,
		applyto: ApplyTo,
		compose: compose,
		pipe: pipe,
		Identity: Identity,
		Type: Type,
		Property: Property,
		Method: Method,
		PropertyPath: PropertyPath,
		PropertySet: PropertySet
	});


	var plus = extend({unit:0},function (a,b) {
		return a+b;
	});

	var times = extend({unit:1},function times (a,b) {
		return a*b;
	});

	opal.extend({
		plus: plus,
		times: times
	});


	// ------------------------------------------------------------------------
	//																		Set
	// ------------------------------------------------------------------------

	function Set (objects) {

		var members = objects || [],
			index = false;

		this.constraint = AllPredicate();

		this.add = function (object,success,failure) {
			if ( this.constraint(object) && !this.member(object) ) {	
				members.push(object);
				if ( index ) {
					index.add(object);
				}
				if (success && typeof success=='function') {
					apply(success);
				}
			}
			else {
				if (failure && typeof failure=='function') {
					apply(failure);
				}	
			}
			return this;
		};
		
		this.concat = function (second) {
			return second && second.reduce ? second.reduce(Method('add'),this) : this;
		}
		
		this.member = function (object) {
			if ( members.indexOf ) {
				return members.indexOf(object) > -1;
			}	
			else { // Oh, how we hate IE
				for( var i=0; i<members.length; i++ ) {
					if ( members[i] === object ) {
						return true
					}
				}
				return false;
			}
		};

		this.get = function (key) {
			if ( arguments.length == 0 ) {
				return members;
			}
			else if ( key == ':first' ) {
				return this.first();
			}
			else if (index) {
				return index.get(key);
			}
			else {
				var obj = this.filter(key);
				return obj.each ? obj.first() : obj;
			}
		};

		this.count = function (predicate) {
			return predicate ?
			 			this.filter(predicate).count()
						: members.length;
		};

		this.first = function () {
			return members.length > 0 ? members[0] : false;
		};

		this.select = function (selector) {
			return selector == ':first' ? this.first() : this;
		};

		this.each = function (callback) {
			callback = ( typeof callback == 'string' ) ? Method(callback) : callback;
			for (var index in members) {
				callback.apply(members[index],[index,members[index]]);
			}
			return this;
		};

		this.when = function (predicate,callback) {
			if ( this.predicate(predicate)(this) ) {
				callback.call(this,this);
			}
		};

		this.partition = function (predicate,passName,failName) {

			predicate = this.predicate(predicate);

			var partition	= {},
				pass		= [],
				fail		= [];

			this.each(function (index,object) {
				(predicate(object) ? pass : fail).push(object);
			});

			partition[passName||'pass'] = new Set(pass);
			partition[failName||'fail'] = new Set(fail);

			return partition;

		};

		this.filter = function () {

			var predicate, selector;

			if ( arguments.length === 0 ) {
				return this;
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'string' && arguments[0].charAt(0) == ':' ) {
				predicate 	= AllPredicate();
				selector	= arguments[0];
			}
			else {
				predicate	= this.predicate(arguments[0]);
				selector	= arguments[1];
			}

			if ( predicate && predicate.unique ) {
				selector = ':first';
			}

			return this.partition(predicate).pass.select(selector);			

		};

		this.remove = function (predicate) {
			var partition = this.partition(predicate,'remove','keep');
			members = [];
			partition.keep.each(function (index,object) {
				members.push(object);
			});
			if ( index ) {
				partition.remove.each(function (i,object) {
					index.remove(object);
				});
			}
			return partition.remove; 
		};

		this.map = function (mapping,mapped) {
			mapping	= ( typeof mapping == 'string' ) ? Method(mapping) : mapping;
			mapped	= mapped || new Set();
			this.each(function (index,object) {
				mapped.add(mapping(object));
			});
			return mapped;
		};

		this.reduce = function (fn,acc) {
			acc = arguments.length > 1 ? acc : fn.unit;
			this.each(function (index,object) {
				acc = fn(acc,object,index);
			});
			return acc;
		};

		this.copy = function () {
			return new Set(members.slice());
		};

		this.sort = function (ordering) {
			if ( ordering ) {
				members.sort(ordering);
			}	
		};

		this.join = function (separator) {
			return members.join(separator);
		};

		this.union = function () {
			return union.apply(null,[this].concat(arrayFromArguments(arguments)));
		};

		this.intersection = function () {
			return intersection.apply(null,[this].concat(arrayFromArguments(arguments)));
		};

		this.difference = function (set) {
			return difference(this,set);
		};


		this.predicate = function (parameter) {
			if ( parameter === null ) {
				return AllPredicate();
			}
			if ( parameter == ':empty' ) {
				return EmptySetPredicate;
			}
			else if ( typeof parameter == 'function' ) {
				return parameter;
			}
			else if ( typeof parameter == 'object' ) {
				return ObjectIdentityPredicate(parameter);
			}
			return AllPredicate();
		};

		this.ordering = function () {
			if ( arguments.length > 1 ) {
				return CompositeOrdering.apply(null,arguments);
			}
			else if ( arguments[0] instanceof Array ) {
				return CompositeOrdering(arguments[0]);
			}
			return arguments[0];
		};

		this.index = function (key) {
			index = new UniqueIndex(this,key);
		};

		this.format = function (formatter) {
			return formatter(this);
		};

		this.delegateFor = function (host) {
			for (var i in this) {
				if ( !host[i] ) {
					host[i] = this[i];
				}
			}
		};

	}

	opal.Set = Set;

	function set () {
		return ( arguments.length == 1 && arguments[0].callee ) ? new Set(arrayFromArguments(arguments[0]))
					: new Set(arrayFromArguments(arguments));
	}
	opal.set = set;

	//
	// Set operations
	//

	function union () {
		return set(arguments).reduce(Method('concat'),set());
	}

	function intersection () {
		var intersection = new Set();
		arguments[0].each(function (index,object) {
			intersection.add(object);
		});
		for (var i=1; i<arguments.length; i++) {
			intersection = intersection.filter(MembershipPredicate(arguments[i]));
		}
		return intersection;
	}

	function difference (first,second) {
		return first.filter( Not(MembershipPredicate(second)) );
	}

	opal.extend({
		union: 			union,
		intersection: 	intersection,
		difference: 	difference
	});


	// ------------------------------------------------------------------------
	//															   Unique Index
	// ------------------------------------------------------------------------

	function UniqueIndex (set,key) {

		var index = {};

		this.build = function () {
			var that = this;
			set.each(function (i,object) {
				that.add(object);
			});
		};

		this.add = function (object) {
			index[key(object)] = object;
		};

		this.remove = function (object) {
			delete index[key(object)];
		};

		this.get = function (keyval) {
			return index[keyval];
		};

		this.build();

	}

	opal.extend({
		UniqueIndex: UniqueIndex
	});


	// ------------------------------------------------------------------------
	// 																 Predicates
	// ------------------------------------------------------------------------

	opal.predicate = (new Set()).predicate;

	//
	// First-order predicates
	//

	// Generic

	function AllPredicate () {
		return function (candidate) {
			return true;
		};
	}

	function NonePredicate () {
		return function (candidate) {
			return false;
		};
	}

	function TruePredicate (candidate) {
		return candidate == true;
	}

	function FunctionPredicate (fn) {
		return function (candidate) {
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
		return function (candidate) {
			return candidate instanceof constructor;
		};
	}

	function PropertyPredicate (path,predicate) {
		predicate = ( typeof predicate != 'function' ) ? EqualityPredicate(predicate) : predicate;
		return compose(predicate,PropertyPath(path));
	}

	function PropertySetPredicate (paths,predicate) {
		predicate = ( typeof predicate != 'function' ) ? EqualityPredicate(predicate) : predicate;
		return function (candidate) {
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

	function eq  (a,b) { return a==b; }
	function lt  (a,b) { return a<b; }
	function gt  (a,b) { return a>b; }
	function lte (a,b) { return a<=b; }
	function gte (a,b) { return a>=b; }

	function ComparisonPredicate (operator) {
		return function (value) {
			return function (candidate) {
				return operator(candidate,value);
			}
		}
	}
	
	var EqualityPredicate         = ComparisonPredicate(eq),
		LessThanPredicate         = ComparisonPredicate(lt),
		GreaterThanPredicate      = ComparisonPredicate(gt),
		LessThanEqualPredicate    = ComparisonPredicate(lte),
		GreaterThanEqualPredicate = ComparisonPredicate(gte);

	function BetweenPredicate (lower,higher) {
		return function (candidate) {
			return lower <= candidate && candidate <= higher;
		};
	}

	function RegularExpressionPredicate (regex) {
		return function (candidate) {
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
		return function (candidate) {
			return set.member(candidate);
		};
	}

	opal.MembershipPredicate	= MembershipPredicate;
	opal.member 				= MembershipPredicate;


	//
	// Logical connectives
	//
	
	var or  = extend({unit:false}, function (a,b) { return a || b; } ),
		nor = extend({unit:false}, function (a,b) { return !( a || b ); } ),
		and = extend({unit:true},  function (a,b) { return a && b; } ); 

	function ConjunctionPredicate (conjunction) {
		return function () {
			var predicates = opal.set(arrayFromArguments(arguments));
			return function (candidate) {
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


	//
	// Higher-order predicates
	//

	// Set predicates

	function CardinalityPredicate (predicate) {
		predicate = (typeof predicate == 'function') ? predicate : EqualityPredicate(predicate);
		return compose(predicate,Method('count'));
	}
	
	var EmptySetPredicate = CardinalityPredicate(0);

	function SetPredicate (conjunction) {
		return function () {
			var predicate = And.apply(null,arguments);
			return function (candidate) {
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
		return function (a,b) {
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
		return FunctionOrdering( function (obj) {
			return -predicates.count(ApplyTo(obj));
		});
	}

	function DescendingOrdering (ordering) {
		return function (a,b) {
			return -ordering(a,b);
		};
	}

	function CompositeOrdering () {
		var orderings = arrayFromArguments(arguments);
		return function (a,b) {
			for (var i=0; i<orderings.length; i++) {
				var value = orderings[i](a,b);
				if ( value !== 0 ) {
					return value;
				}
			}
			return 0;
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
	// 														  Utility functions
	// ------------------------------------------------------------------------

	function arrayFromArguments (args) {
		return ( args.length == 1 && args[0] instanceof Array ) ? args[0] : Array.prototype.slice.call(args);
	}
	
	function copy (obj) {
		return extend(obj,{
			add: function (attributes) {
				return extend(attributes,this);
			},
			remove: function () {
				var that = this;
				set(arrayFromArguments(arguments)).each(function (index,key) {
					delete that[key];
				});
				return this;
			}
		});
	}

	opal.extend({
		arrayFromArguments: 			arrayFromArguments,
		copy: 							copy
	});


	return opal;

}