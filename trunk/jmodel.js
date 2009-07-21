/*
 *	jModel Javascript Library v0.3.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

// =========================================================================
// 												Domain binding jQuery plugin
// =========================================================================

// NOTE: Make it possible to publish to a method not just a key?
// NOTE: Make publishing work for domain member subscriptions
jQuery.fn.publish = function (publication) {
	
	if ( publication.selector && publication.member.bindings ) {
		
		this.each(function (index,element) {
			for (var selector in publication.member.bindings) {
				jQuery(selector,element).each(function (index,object) {
					publication.target.subscribe({
						source: publication.target,
						predicate: publication.predicate,
						selector: publication.selector,
						initialise: publication.initialise,
						description: publication.description || 'domain collection publication',			
						member: {
							target: jQuery(object),
							key: publication.member.bindings[selector],
							change: function (key,object) {
								return function (target) {
									jQuery(object).bind('change',function (event) {
										target.set(key,jQuery(event.target).val());
									});
								};
							}(publication.member.bindings[selector],object),
							initialise: publication.initialise,
							description: publication.description || 'domain collection member subscription'
						}
					});
				});
			}
		});
		
		return this;
		
	}
	else if ( publication.selector ) {
	
		var that=this;
		
		publication.target.subscribe({
			source: publication.target,
			predicate: publication.predicate,
			selector: publication.selector,
			initialise: publication.initialise,
			description: publication.description || 'domain collection publication',			
			member: {
				target: that,
				key: publication.key,
				change: function (target) {
					that.bind('change',function (event) {
						target.set(publication.member.key,jQuery(event.target).val());
					});
				},
				initialise: publication.initialise,
				description: publication.description || 'domain collection member subscription'
			}
		});
		
		return this;
		
	}
	else if ( publication.bindings ) {
		
		for (var selector in publication.bindings) {
			jQuery(selector,this).each(function (index,object) {
				jQuery(object).bind('change',function (key) {
					return function (event) {
						publication.target.set(key,jQuery(event.target).val());
					};
				}(publication.bindings[selector]));
			});
		}
		return this;
		
	}
	else {
		
		return this.change ? this.change(function (event) {
			publication.target.set(publication.key,jQuery(event.target).val());
		}) :
		this;
		
	}
	
};

jQuery.fn.subscribe = function (subscription) {
	
	if ( subscription.key && !subscription.selector ) { // Basic subscription
		
		return this.each(function (index,element) {
			subscription.key = subscription.key instanceof Array ? subscription.key : [subscription.key];
			jQuery.each(subscription.key,function (index,key) {
				subscription.source.subscribe({
					application: true,
					source: subscription.source,
					target: jQuery(element),
					key: key,
					change: subscription.change,
					removed: subscription.remove,
					initialise: subscription.initialise,
					description: subscription.description || 'application subscription'
				});
			});
		});
		
	}
	else if ( subscription.bindings ) { // Multiple subscription through selector/key mapping
		
		return this.each(function (index,element) {
			for (var selector in subscription.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe({
						application: true,
						source: subscription.source,
						target: jQuery(object),
						key: subscription.bindings[selector],
						initialise: subscription.initialise,
						description: subscription.description || 'application subscription'
					});
				});
			}
		});
		
	}
	else if ( ( subscription.predicate || subscription.selector ) && subscription.member.bindings ) { // Subscription to members of collection with bindings

		return this.each(function (index,element) {
			for (var selector in subscription.member.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe({
						application: true,
						source: subscription.source,
						predicate: subscription.predicate,
						selector: subscription.selector,
						initialise: subscription.initialise,
						description: subscription.description || 'application subscription',
						member: {
							application: true,
							target: jQuery(object),
							key: subscription.member.bindings[selector],
							change: subscription.member.change,
							initialise: subscription.member.initialise,
							description: subscription.member.description || 'application subscription'
						}
					});
				});
			}
		});

	} 
	else if ( subscription.predicate || subscription.selector ) { // Subscription to members of collection

		return this.each(function (index,element) {
			subscription.source.subscribe({
				application: true,
				source: subscription.source,
				predicate: subscription.predicate,
				selector: subscription.selector,
				initialise: subscription.initialise,
				description: subscription.description || 'application subscription',
				member: {
					application: true,
					target: jQuery(element),
					key: subscription.member.key,
					change: subscription.member.change,
					initialise: subscription.member.initialise,
					description: subscription.member.description || 'application subscription'
				}
			});
		});
		
	}
	else { // Subscription to collection
		
		return this.each(function (index,element) {
			subscription.source.subscribe({
				application: true,
				source: subscription.source,
				target: jQuery(element),
				add: subscription.add,
				remove: subscription.remove,
				change: subscription.change,
				sort: subscription.sort,
				initialise: subscription.initialise,
				description: subscription.description || 'application subscription'
			});
		});
		
	}

};

jQuery.fn.pubsub = function (pubsub) {
	// NOTE: Should rewrite publication here rather than using this shortcut
	pubsub.source = pubsub.object;
	pubsub.target = pubsub.object;
	return this.subscribe(pubsub).publish(pubsub);
};

jQuery.fn.permute = function (permutation) {

	if ( this.length != permutation.length ) {
		return false;
	}
	
	var copies = [], placeholders = [], i;
	for(i=0; i<this.length; i++) {
		copies[i] 		= this.get(i);
		placeholders[i] = document.createComment('');
		copies[i].parentNode.replaceChild(placeholders[i],copies[i]);
	}
	
	for(i=0; i<copies.length; i++) {
		placeholders[i].parentNode.replaceChild(copies[permutation[i]],placeholders[i]);
	}
	
	return this;
	
};

jQuery.fn.view = function (options) {
	this.each(function (index,element) {
		var view = new options.constructor(element,options);
	});
	return this;
};

jQuery.fn.views = function (views) {
	for (var selector in views) {
		jQuery(selector,this).view(views[selector]);
	}
	return this;
};


// ============================================================================
//									 Object Predicate and Action Library (OPAL)
// ============================================================================


function OPAL () {
	
	var opal = {};
	
	opal.extend = function (object) {
		for ( var i in object ) {
			if ( !this[i] ) {
				this[i] = object[i];
			}
		}
	};
	
	// ------------------------------------------------------------------------
	//																		Set
	// ------------------------------------------------------------------------

	function Set (objects) {
		
		if ( objects && ! objects instanceof Array ) {
			throw 'Invalid arguments for Set constructor';
		}
		
		var members = objects || [];
		
		this.constraint = AllPredicate();
		
		this.add = function (object) {
			if ( !this.constraint(object) ) {
				throw 'Membership constraint violation';
			}
			else if ( members.indexOf && members.indexOf(object) == -1 ) {
				members.push(object);
				return true;
			}
			else if ( !members.indexOf ) { // Oh, how we hate IE
				var found = false;
				for( var i=0; i<members.length; i++ ) {
					if ( members[i] === object ) {
						found = true;
						break;
					}
				}
				if ( !found ) {
					members.push(object);
					return true;
				}
			}
			return false;
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
			var index;
			if ( typeof callback == 'string' ) {
				for(index in members) {
					members[index][callback].call(members[index],index,members[index]);
				}
			}
			else {
				for(index in members) {
					callback.call(members[index],index,members[index]);
				}
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
			var partition = {};
			var pass = partition[passName||'pass'] = new Set();
			var fail = partition[failName||'fail'] = new Set();
			
			this.each(function (index,object) {
				if ( predicate(object) ) {
					pass.add(object);
				}
				else {
					fail.add(object);
				}
			});

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
			return partition.remove; 
		};
		
		this.map = function (mapping,mapped) {
			mapped = mapped || new Set();
			this.each(function (index,object) {
				mapped.add(mapping.call(object,object));
			});
			return mapped;
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
			return union.apply(null,argumentsArray.apply(this,arguments));
		};
		
		this.intersection = function () {
			return intersection.apply(null,argumentsArray.apply(this,arguments));
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
		
		this.delegateFor = function (host) {
			for (var i in this) {
				if ( !host[i] ) {
					host[i] = this[i];
				}
			}
		};
		
	}
	
	opal.Set = Set;
	
	opal.set = function() {
		if ( arguments[0] instanceof Set ) {
			return arguments[0];
		}
		if ( arguments[0] instanceof Array ) {
			return new Set(arguments[0]);
		}
		else {
			var objects = [];
			for (var i=0; i<arguments.length; i++) {
				objects.push(arguments[i]);
			}
			return new Set(objects);
		}
	};
	
	//
	// Set operations
	//
	
	function union () {
		var union = new Set();
		for (var i=0; i<arguments.length; i++ ) {
			var set = arguments[i];
			set.each(function (index,object) {
				union.add(object);
			});
		}
		return union;
	};
	
	function intersection () {
		var intersection = new Set();
		arguments[0].each(function (index,object) {
			intersection.add(object);
		});
		for (var i=1; i<arguments.length; i++ ) {
			intersection = intersection.filter(MembershipPredicate(arguments[i]));
		}
		return intersection;
	};
	
	function difference (first,second) {
		return first.filter( Not(MembershipPredicate(second)) );
	};
	
	opal.extend({
		union: 			union,
		intersection: 	intersection,
		difference: 	difference
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
	
	opal.extend({
		AllPredicate: 		AllPredicate,
		NonePredicate: 		NonePredicate,
		TruePredicate: 		TruePredicate,
		FunctionPredicate: 	FunctionPredicate
	});
	
	// Object Predicates
	
	function ObjectIdentityPredicate (object) {
		return function (candidate) {
			return candidate == object;
		};
	}
	
	function TypePredicate (type) {
		return function (candidate) {
			return typeof candidate === type;
		};
	}

	function InstancePredicate (constructor) {
		// NOTE: Put this next line into jModel
		constructor = constructor.entitytype ? constructor.entitytype.constructor : constructor;
		return function (candidate) {
			return candidate instanceof constructor;
		};
	}
	
	function PropertyPredicate (property,value) {
		return function (candidate) {
			return candidate[property] == value;
		};
	}
	
	opal.extend({
		ObjectIdentityPredicate: 	ObjectIdentityPredicate,
		TypePredicate: 				TypePredicate,
		InstancePredicate: 			InstancePredicate,
		PropertyPredicate: 			PropertyPredicate
	});
	
	// Value comparisons
	
	function EqualityPredicate (value) {
		return function (candidate) {
			return candidate == value;
		};
	}
	
	function LessThanPredicate (value) {
		return function (candidate) {
			return candidate < value;
		};
	}
	
	function GreaterThanPredicate (value) {
		return function (candidate) {
			return candidate > value;
		};
	}
	
	function LessThanEqualPredicate (value) {
		return function (candidate) {
			return candidate <= value;
		};
	}
	
	function GreaterThanEqualPredicate (value) {
		return function (candidate) {
			return candidate >= value;
		};
	}
	
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
		EqualityPredicate: 				EqualityPredicate,
		LessThanPredicate: 				LessThanPredicate,
		GreaterThanPredicate: 			GreaterThanPredicate,
		LessThanEqualPredicate: 		LessThanEqualPredicate,
		GreaterThanEqualPredicate: 		GreaterThanEqualPredicate,
		BetweenPredicate: 				BetweenPredicate,
		RegularExpressionPredicate: 	RegularExpressionPredicate
	});
	
	
	// Membership
	
	function MembershipPredicate (set) {		
		set = opal.set(set);
		return function (candidate) {
			return Not(EmptySetPredicate)(set.filter(ObjectIdentityPredicate(candidate)));
		};
	};
	
	opal.MembershipPredicate = MembershipPredicate;
	
	
	//
	// Logical connectives
	//
	
	function Or () {
		var predicates = opal.set(arrayFromArguments(arguments));
		return function (candidate) {
			return Not(EmptySetPredicate)(predicates.filter(function (predicate) { return predicate(candidate); }));
		};
	};
	
	function And () {
		var predicates = opal.set(arrayFromArguments(arguments));
		return function (candidate) {
			return EmptySetPredicate(predicates.filter(function (predicate) { return !predicate(candidate); } ));
		};
	};
	
	function Not (predicate) {
		return function (candidate) {
			return !predicate(candidate);
		};
	};
	
	opal.extend({
		Or:  Or,
		And: And,
		Not: Not
	});

	
	//
	// Higher-order predicates
	//
	
	// Set predicates
	
	function EmptySetPredicate (set) {
		return set ? set.count() === 0 : true;
	}
	
	function AllSetPredicate () {
		var predicate = And.apply(null,arguments);
		return function (set) {
			return set.filter ?
				EmptySetPredicate(set.filter(Not(predicate)))
				: predicate(set);
		};
	}
	
	function SomeSetPredicate () {
		var predicate = And.apply(null,arguments);
		return function (set) {
			return set.filter ?
				Not(EmptySetPredicate)(set.filter(predicate))
				: predicate(set);
		};
	}
	
	function NoneSetPredicate () {
		var predicate = And.apply(null,arguments);
		return function (set) {
			return set.filter ?
				_.empty(set.filter(predicate))
				: !predicate(set);
		};
	}
	
	opal.extend({
		EmptySetPredicate: 	EmptySetPredicate,
		AllSetPredicate: 	AllSetPredicate,
		SomeSetPredicate: 	SomeSetPredicate,
		NoneSetPredicate: 	NoneSetPredicate
	});
	
	
	
	// ------------------------------------------------------------------------
	//														   		  Orderings
	// ------------------------------------------------------------------------
	
	var makeOrdering = (new Set()).ordering;
	
	function FunctionOrdering (fn) {
		return function (a,b) {
			if ( fn(a) < fn(b) ) {
				return -1;
			}
			else if ( fn(a) > fn(b) ) {
				return 1;
			}
			return 0;
		};
	};
	
	var ValueOrdering = FunctionOrdering( function (obj) {return obj;} );
	
	function PredicateOrdering () {
		var predicates = opal.set(arrayFromArguments(arguments));
		return FunctionOrdering( function (obj) {
			return -predicates.count(function (pred) {return pred(obj);} );
		});
	};
	
	function DescendingOrdering (ordering) {
		return function (a,b) {
			return -ordering(a,b);
		};
	};
	
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
	};
	
	opal.extend({
		FunctionOrdering: 	FunctionOrdering,
		ValueOrdering: 		ValueOrdering,
		PredicateOrdering: 	PredicateOrdering,
		DescendingOrdering: DescendingOrdering,
		CompositeOrdering: 	CompositeOrdering
	});
	
	
	// ------------------------------------------------------------------------
	// 														  Utility functions
	// ------------------------------------------------------------------------
	
	// NOTE: fix this ugliness
	
	function arrayFromArguments (args) {
		if ( args[0] instanceof Array ) {
			return args[0];
		}
		else {
			var args2 = [];
			for (var i=0; i<args.length;i++) {
				args2.push(args[i]);
			}
			return args2;
		}
	};
	
	function argumentsArray() {
		var args = [this];
		for (var i=0; i<arguments.length; i++) {
			args.push(arguments[i]);
		}
		return args;
	}

	opal.extend({
		arrayFromArguments: arrayFromArguments,
		argumentsArray: 	argumentsArray
	});

	
	return opal;
	
}



// ============================================================================
//														 	Domain Object Model
// ============================================================================

var jModel = function () {

	//
	// Import OPAL
	//

	var opal = OPAL();
	for ( var i in opal ) {
		eval('var '+i+' = opal.'+i);
	}

	//
	// Define local variables
	//

	var external		= function (predicate) { return all.filter.apply(all,arguments); },
		_				= external,
		entities		= {},
		notifications	= new NotificationQueue();
	
	external.extend = opal.extend;
		
	//
	// External interface to OPAL
	//
	
	external.extend({
		
		/* Set */
		set: 		opal.set,
		
		/* Predicates */
		predicate: 	predicate,
		
		is: 		ObjectIdentityPredicate,
		istrue: 	TruePredicate,
		
		test: 		FunctionPredicate,
		type: 		TypePredicate,
		isa: 		InstancePredicate,
		property: 	PropertyPredicate,
		
		member: 	MembershipPredicate,
		
		or: 		Or,
		and: 		And,
		not: 		Not,
		
		empty: 		EmptySetPredicate,
		nonempty: 	Not(EmptySetPredicate),
		
		all: 		function () {
						if ( arguments.length === 0 ) {
							return AllPredicate();
						}
						else {
							return AllSetPredicate.apply(null,arguments);
						}
					},
		
		some: 		SomeSetPredicate,
		none: 		NoneSetPredicate,
		
		/* Orderings */
		
		func: 		FunctionOrdering,
		value: 		ValueOrdering,
		score: 		PredicateOrdering,
		desc: 		DescendingOrdering,
		composite: 	CompositeOrdering
		
	});
	
				
	// ------------------------------------------------------------------------
	//																	Logging
	// ------------------------------------------------------------------------
	
	function Logger (flags) {
		
		var active = false;
		
		function log (type, message) {
				
			var console = window.console;
			
			if ( type == 'startgroup' ) {
				if ( console && console.group ) {
					console.group(message);
				}
				else if ( console && console.log ) {
					console.log(message);
				}
			}
			else if ( type == 'endgroup' ) {
				if ( console && console.groupEnd ) {
					console.groupEnd();
				}
			}
			else {
				switch (type) {	
					case 'error': 	if (console && console.error) {console.error(message); break;}
					case 'warning': if (console && console.warn)  {console.warn(message);  break;}
					case 'debug': 	if (console && console.debug) {console.debug(message); break;}
					case 'info': 	if (console && console.info)  {console.debug(message); break;}
					default: 		if (console && console.log)   {console.log(message);   break;}	
				}
			}
			
		}
				
		function enabled (path) {
			if ( !path ) {
				return false;
			}
			var pieces = path.split('/'),
				property = flags;
			for ( var i=0; i<pieces.length; i++ ) {
				if ( typeof property.all == 'boolean' && property.all ) {
					return true;
				}
				property = property[pieces[i]];
				if ( !property ) {
					return false;
				}
				else if ( property && typeof property == 'boolean' ) {
					return property;
				}
			}
			return false;
		}
				
		function setFlag (path,value) {
			var pieces = path.split('/'),
				property = flags;
			for (var i=0; i<pieces.length-1; i++) {
				if ( typeof property[pieces[i]] == 'object' ) {
					property = property[pieces[i]];
				}
				else if ( typeof property[pieces[i]] == 'undefined' ) {
					property[pieces[i]] = {all:false};
					property = property[pieces[i]];
				}
			}
			property[pieces[pieces.length-1]] = value;
		}		
		
		var externalActive = {
			startGroup: function (title) { log('startgroup',title); 	return externalActive; },
			endGroup: 	function () { log('endgroup'); 					return externalActive; },
			error: 		function (message) { log('error',message); 		return externalActive; },
			warning: 	function (message) { log('warning',message);	return externalActive; },
			debug: 		function (message) { log('debug',message); 		return externalActive; },
			info: 		function (message) { log('info',message); 		return externalActive; }
		};
		
		var externalInactive = {
			startGroup: function () { return externalInactive; },
			endGroup: 	function () { return externalInactive; },
			error: 		function () { return externalInactive; },
			warning: 	function () { return externalInactive; },
			debug: 		function () { return externalInactive; },
			info: 		function () { return externalInactive; }
		};
		
		var external = function (condition) {	
			if ( arguments.length === 0 || ( active && enabled(condition) ) ) {
				return externalActive;
			}
			else {
				return externalInactive;
			}
		};
		
		external.enable = function (flag) {
			setFlag(flag,true);
			active = true;
			return this;
		};

		external.disable = function (flag) {
			setFlag(flag,false);
			return this;
		};
		
		return external;
			
	}
	
	var log = external.log = Logger({
		
		all: false,
		application: {
			all: false
		},
		domainobject: {
			all: false,
			create: false,
			set: false
		},
		domainobjectcollection: {
			all: false,
			create: false,
			add: false
		},
		subscriptions: {
			all: false,
			subscribe: false,
			notify: false
		},
		notifications: {
			all: false,
			send: false
		},
		json: {
			all: false,
			thaw: false
		}
		
	});
	
	
	
	// ------------------------------------------------------------------------
	//															 Set operations
	// ------------------------------------------------------------------------
	
	function makeCollection (set) {
		return ( set instanceof Set || set instanceof DomainObjectCollection ) ? set : set();
	};
	
	external.union = function() {
		var union = new Set();
		for (var i=0; i<arguments.length; i++ ) {
			var collection = makeCollection(arguments[i]);
			collection.each(function (index,object) {
				union.add(object);
			});
		}
		if ( arguments[0] instanceof Set ) {
			return union;
		}
		else {
			return new DomainObjectCollection({
				objects: union,
				description:'union'
			});
		}
	};
	
	external.intersection = function() {
		var intersection = new Set();
		makeCollection(arguments[0]).each(function (index,object) {
			intersection.add(object);
		});
		for (var i=1; i<arguments.length; i++ ) {
			intersection = intersection.filter(MembershipPredicate(arguments[i]));
		}
		if ( arguments[0] instanceof Set ) {
			return intersection;
		}
		else {
			return new DomainObjectCollection({
				objects: intersection,
				description:'intersection'
			});
		}
	};
	
	external.difference = function(first,second) {
		return makeCollection(first).filter( Not(MembershipPredicate(second)) );
	};

	
	
	// ------------------------------------------------------------------------
	// 																 Prototypes
	// ------------------------------------------------------------------------
	
	var all = new DomainObjectCollection();
	
	function EntityType (name,constructor,options) {

		options  		= options || {};
		
		this.options	= options;
		
		this.constructor = constructor;

		this.objects = new	DomainObjectCollection({
								base: 			all,
								predicate: 		InstancePredicate(constructor),
								ordering: 		options.ordering,
								description: 	name
							});
							
		this.deleted = new DeletedObjectsCollection(this.objects);

		this.name	= name;


		this.object = function (criterion) {
			var objects = this.objects.filter.apply(this.objects,arguments);
			return ( objects instanceof DomainObjectCollection ) ? objects.first() : objects;
		};


		this.create = function (data) {
			
			log('domainobject/create').startGroup('Creating a new '+name);

			data = (typeof data == 'object') ? data : {};

			var newObject = new constructor();
			DomainObject.call(newObject,entities[name]);

			var primaryKey	= newObject.primaryKey;

			data[primaryKey] = data[primaryKey] || generateID();
			newObject.domain.init(data);
			all.add(newObject);

			log('domainobject/create').endGroup();

			return newObject;

		};


		function generateID() {			
			return -(all.count()+1);
		}
		

	};

	
	external.prototype = {
		
		register: function (name,constructor,options) {

			entities[name] = new EntityType(name,constructor,options);

			var names = [name].concat( options.synonyms || [] );

			// NOTE: Make this handle synonyms more gracefully
			for ( var i in names ) {
				var synonym 										= names[i];
				entities[synonym]									= entities[name];
				external[synonym] 									= delegateTo(entities[name],'object');
				external[synonym].entitytype						= entities[name];
				external[synonym].extend							= delegateTo(entities[name].constructor,'extend');
				external['create'+synonym]							= delegateTo(entities[name],'create');
				external[options.plural || synonym+'s']				= delegateTo(entities[name].objects,'filter');
				external['deleted'+(options.plural || synonym+'s')]	= delegateTo(entities[name].deleted,'filter');
			}

			return external.prototype;

		}
		
	};


	
	// ------------------------------------------------------------------------
	//																	Context
	// ------------------------------------------------------------------------
	
	external.context = {
	
		reset: 	function () {
					all.remove(AllPredicate(),true);
					return external.context;
				},
				
		checkpoint: function () {
						for ( var entityName in entities ) {
							entities[entityName].objects.each(function (index,object) {
								object.domain.dirty = false;
							});
							entities[entityName].deleted.remove(AllPredicate(),true);
						}
						return external.context;
					}, 
				
		debug: 	function (showSubscribers) {
					var contents = '';
					for ( var entityName in entities ) {
						contents += entityName+': ['+entities[entityName].objects.debug(showSubscribers)
									+' '+entities[entityName].deleted.debug(false)+'] ';
					}
					return contents;
				}
		
	};
	
	
	
	// ------------------------------------------------------------------------
	//															  Notifications
	// ------------------------------------------------------------------------
	
	function NotificationQueue () {
		
		var	notifications 	= new Set(),
			active			= true,
			filter			= AllPredicate();
			
		notifications.delegateFor(this);
		
		this.send = function (notification) {
			if ( !filter(notification) ) {
				return this;
			}
			else if ( active || !notification.subscription.application ) {
				notification.receive();
			}
			else {
				log('notifications/send').debug('Adding a notification to the queue');
				notifications.add(notification);
			}
			return this;
		};
		
		this.suspend = function () {
			active = false;
			return this;
		};
		
		this.resume = function () {
			active = true;
			notifications.each('receive');
			this.flush();
			return this;
		};
		
		this.flush = function (predicate) {
			notifications.remove(predicate);
			return this;
		};
		
		this.setFilter = function (predicate) {
			filter = predicate;
			return this;
		};
		
	};
	
	external.notifications = {
		
		suspend: 	function () {
						notifications.suspend();
						return external.notifications;
					},
					
		resume: 	function () {
						notifications.resume();
						return external.notifications;
					},
					
		flush: 		function (predicate) {
						notifications.flush(predicate);
						return external.notifications;
					},
					
		push: 		function () {
						for(var prototypeName in entities) {
							entities[prototypeName].objects.each(function (index,object) {
								object.domain.push();
							});
						}
						return external.notifications;
					},
					
		setFilter: 	function (predicate) {
						notifications.setFilter(predicate);
						return external.notifications;
					}
	
	};
	
	
	//
	// Notification types
	//
	
	function ContentNotification (subscription,event,subscriber) {
		this.subscription = subscription;
		this.receive = function () {
			log('notifications/send').debug('Receiving a content notification for '+subscription.key+': '+subscription.description);
			subscription.target.html(subscription.source.get(subscription.key));
		};	
	};
	
	function ValueNotification (subscription,event,subscriber) {
		this.subscription = subscription;
		this.receive = function () {
			log('notifications/send').debug('Receiving a value notification for '+subscription.key+': '+subscription.description);
			subscription.target.val(subscription.source.get(subscription.key));
		};
	};
	
	function MethodNotification (subscription,event,subscriber) {
		this.subscription = subscription;
		this.receive = function () {
			log('notifications/send').debug('Receiving an object method notification'+': '+subscription.description);
			subscription.method.call(subscription.target,subscription.source);
		};	
	};
	
	function EventNotification (subscription,event,subscriber) {
		this.subscription = subscription;
		this.receive = function () {
			log('notifications/send').debug('Receiving an event notification'+': '+subscription.description);
			subscription.target.trigger(jQuery.Event(subscription.event),subscription.source);
		};
	};
	
	// NOTE: Should implement separate RemovalMethodNotification and RemovalEventNotification objects
	function RemovalNotification (subscription,event,subscriber) {
		this.subscription = subscription;
		this.receive = function () {
			log('notifications/send').debug('Receiving a removal notification'+': '+subscription.description);
			subscription.removed.call(subscription.target,subscription.source);
		};
	};
	
	function CollectionMethodNotification (subscription,event,subscriber) {
		this.subscription = subscription;
		this.receive = function () {
			if (subscription[event.method] && event.permutation) {
				log('notifications/send').debug('Receiving a sort notification');
				subscription[event.method].call(subscription.target,event.permutation);
			}
			else if (subscription[event.method] && typeof subscription[event.method] == 'function' ) {
				log('notifications/send').debug('Receiving a collection method notification'+': '+subscription.description);
				subscription[event.method].call(subscription.target,subscription.source,event.object);
			}
		};
	};
	
	function CollectionEventNotification (subscription,event,subscriber) {
		this.subscription = subscription;
		this.receive = function () {
			// NOTE: Implement this
		};
	};
	
	// NOTE: Make this work with bindings
	function CollectionMemberNotification (subscription,event,subscriber) {
		this.subscription = subscription;
		this.receive = function () {
			log('notifications/send').debug('Receiving a collection member notification');
			subscription.member.key = ( subscription.member.key instanceof Array ) ?
												subscription.member.key
												: [subscription.member.key];
			for (var i in subscription.member.key) {
				
				event.object.subscribe({
					application: subscription.application,
					source: event.object,
					target: subscription.member.target,
					key: subscription.member.key[i],
					change: subscription.member.change,
					initialise: subscription.member.initialise,
					description: 'collection member subscription for key '+subscription.member.key[i]
				});
			}
		};
	};
	
	
	//
	// Subscription list
	//
	// This contains a list of subscription objects, each of which produces
	// notification objects when required and adds them to the notification
	// queue.
	//
	
	function SubscriptionList (notifications) {
		
		var subscribers = new Set();
		subscribers.delegateFor(this);
		
		this.add = function (subscriber) {
			if ( subscribers.add(subscriber) ) {
				log('subscriptions/subscribe').debug('added subscriber: '+subscriber.description);
			}
		};
		
		this.notify = function (event) {
			var needNotification = subscribers.filter(function (subscriber) {return subscriber.matches(event);});
			if ( _.nonempty(needNotification) ) {
				log('subscriptions/notify').startGroup('Notifying subscribers of '+event.description);
				needNotification.each(function (index,subscriber) {
					notifications.send(subscriber.notification(event));
				});
				log('subscriptions/notify').endGroup();
			}
		};
		
		this.debug = function () {
			return _.nonempty(subscribers) ? '{'+subscribers.count()+' subscribers}' : '';
		};
		
	};
	
	
	function Subscriber (subscription) {
		
		this.target 		= subscription.target;
		this.description 	= subscription.description;
		
		this.enable = function () {
			this.enabled = true;
			return this;
		};
		
		this.disable = function () {
			this.enabled = false;
			return this;
		};
		
	}
	
	
	function CollectionSubscriber (subscription) {
		
		this.enabled = true;
		
		Subscriber.call(this,subscription);
	
		// NOTE: Implement filters here
		this.matches = function (event) {
			if ( !this.enabled ) {
				return false;
			}
			else if ( !subscription.filter ) {
				return true;
			}
			else {
				return subscription.filter(event);
			}
		};
	
		this.notification = function (event) {
			return new subscription.type(subscription,event,this);
		};
		
		this.debug = function () {
			log().startGroup('Subscriber');
			log().debug(subscription.description);
			log().endGroup();
		};
		
	};
	
	
	function ObjectSubscriber (subscription) {
		
		this.enabled = true;

		Subscriber.call(this,subscription);

		this.matches = function (event) {
			if ( !this.enabled ) {
				return false;
			}
			else {
				return ( event.removed && subscription.removed ) || ( event.key == subscription.key );
			}
		};
		
		this.notification = function (event) {
			return new subscription.type(subscription,event,this);
		};
		
		this.debug = function () {
			log().startGroup('Subscriber');
			log().debug(subscription.description);
			log().endGroup();
		};
		
	};
	
	
	
	// ------------------------------------------------------------------------
	// 												   Domain Object Collection
	// ------------------------------------------------------------------------
	
	function DomainObjectCollection (specification) {
		
		
		specification = specification || {};
		
		log('domainobjectcollection/create').startGroup('Creating a DomainObjectCollection: '+specification.description);
		
		var objects	= ( specification.objects && specification.objects instanceof Set ) ? specification.objects : new Set(specification.objects);
		objects.delegateFor(this);
		
		var subscribers		= new SubscriptionList(notifications);
		this.subscribers	= delegateTo(subscribers,'filter');
		
		
		this.add = function (object) {
			if ( objects.add(object) ) {
				subscribers.notify({method:'add',object:object,description:'object addition'});
				object.subscribe({
					target: this,
					key: ':any',
					change: function (object) {
						sorted = false;
						subscribers.notify({
							method:'change',
							object:object,
							description:'object change'
						}); 
					},
					description: 'object change for '+specification.description+' collection change'
				});
				sorted = false;
			}
			return this;
		};


		this.first = function () {
			if ( !sorted ) { this.sort(); }
			return objects.first();
		};
		
		
		// NOTE: Make this work on base collections
		this.remove = function (predicate,fromHere) {
			if ( fromHere ) {
				objects.remove(predicate).each(function (index,object) {
					object.removed();
					subscribers.notify({method:'remove',object:object,description:'object removal'});
				});
			}
			else {
				all.remove(predicate,true);
			}
		
		};
		
		
		this.by = function () {			
			return new DomainObjectCollection({
				objects: objects.copy(),
				ordering: this.ordering.apply(null,arguments),
				description:'ordered '+specification.description
			});	
		};
		
		
		this.sort = function () {

			if (arguments.length > 0) {
				specification.ordering = this.ordering.apply(null,arguments);
			}

			// Remember old order
			objects.each(function (index) {
				this.domain.tags.position = index;
			});

			// Sort
			objects.sort(specification.ordering);

			// Find permutation
			var permutation = [];
			objects.each(function (index) {
				permutation[index] = this.domain.tags.position;
				delete this.domain.tags.position;
			});

			// Find whether permutation is not identity permutation
			var permuted = false;
			for(var i=0; i<permutation.length; i++) {
				if ( permutation[i] != i ) {
					permuted = true;
					break;
				}
			}

			// Notify subscribers
			if ( permuted ) {
				subscribers.notify({method:'sort',permutation:permutation,description:'collection sort'});
			}

			sorted = true;

			return this;

		};
		
		
		this.each = function (callback) {
			if ( !sorted ) { this.sort(); }
			objects.each(callback);
			return this;
		};
		
		
		this.select = function (selector) {
			if ( selector == ':first' ) {
				return this.first();
			}
			else {
				return this;
			}
		};
		
		
		this.filter = function () {

			if ( arguments.length === 0 ) {
				return this;
			}
			
			var filtered = objects.filter.apply(this,arguments);
			
			if ( filtered instanceof Set ) {
				return new DomainObjectCollection({
					objects: filtered,
					description:'filtered '+specification.description
				});
			}
			else {
				return filtered;
			} 
			
		};
		
		
		this.debug = function (showSubscribers) {
			var contents = objects.map(function (object) {return object.primaryKeyValue();}).join(' ');
			if ( showSubscribers ) {
				contents += ' '+subscribers.debug()+' ';
			}
			return contents;
		};
		
		
		this.subscribe = function (subscription) {
			
			log('subscriptions/subscribe').startGroup('Subscribing: '+subscription.description);

			if ( subscription.predicate || subscription.selector ) {
				log('subscriptions/subscribe').debug('Creating a collection member subscription: '+subscription.description);
				subscription.type	= 	CollectionMemberNotification;
				subscription.filter = 	function (collection) {
											return function (event) {
												return collection.filter(subscription.predicate).select(subscription.selector) === event.object
														&& ( event.method == 'add' || event.method == 'initialise' ); // NOTE: Fix this
											};
										}(this);							
			}
			else if ( ( typeof subscription.add == 'string' ) && ( typeof subscription.remove == 'string' ) ) {
				log('subscriptions/subscribe').debug('Creating a collection event subscription: '+subscription.description);
				subscription.type	= CollectionEventNotification;
			}
			else {
				log('subscriptions/subscribe').debug('Creating a collection method subscription: '+subscription.description);
				subscription.type	= CollectionMethodNotification; 
			}
			
			var subscriber = new CollectionSubscriber(subscription);
			subscribers.add(subscriber);
			
			if ( subscription.initialise ) {
				log('subscriptions/subscribe').startGroup('initialising subscription');
				this.each(function (index,object) {
					var event = {method:'initialise',object:object,description:'initialisation'};
					if ( subscriber.matches(event) ) {
						notifications.send(subscriber.notification(event));
					}
				});
				log('subscriptions/subscribe').endGroup();
			}
			
			log('subscriptions/subscribe').endGroup();
			
			return subscriber;	
			
		};
		
		this.predicate = function (parameter) {
			if ( parameter == ':empty' ) {
				return EmptySetPredicate;
			}
			else if ( typeof parameter == 'function' ) {
				return parameter;
			}
			else if ( parameter && parameter.domain ) {
				return ObjectIdentityPredicate(parameter);
			}
			else if ( typeof parameter == 'object' && parameter !== null ) {
				return ExamplePredicate(parameter);
			} 
			else if ( typeof parameter == 'number' ) {
				return IdentityPredicate(parameter);
			}
			return AllPredicate();
		};
		
		function ordering () {
			if ( arguments.length > 1 ) {
				for ( var i=0; i<arguments.length; i++ ) {
					arguments[i] = ordering(arguments[i]);
				}
				return CompositeOrdering.apply(null,arguments);
			}
			else if ( arguments[0] instanceof Array ) {
				for ( var i=0; i<arguments[0].length; i++ ) {
					arguments[0][i] = ordering(arguments[0][i]);
				}
				return CompositeOrdering(arguments[0]);
			}
			else if ( typeof arguments[0] == 'function' ) {
				return arguments[0];
			}
			else {
				var pieces = arguments[0].split(' ');
				if ( pieces.length === 1 || pieces[1].toLowerCase() != 'desc' ) {
					return FieldOrdering(pieces[0]);
				}
				else {
					return DescendingOrdering(FieldOrdering(pieces[0]));
				}
			}
		}
		
		this.ordering = ordering;
		
		
		if ( specification.ordering ) {
			specification.ordering = this.ordering(specification.ordering);
		}

		var sorted = false;
		
		this.length = objects.count;
		
		
		// Initial sort
		if ( specification.ordering ) {
			this.sort();
			sorted = true;
		}
		
		
		// This collection is a materialised view over a base collection
		if ( specification.base ) {
			var view = new View(specification.base,this,specification.predicate);
		}
		else if ( specification.base ) {
			throw 'Error: Invalid base collection type';
		}
		
		log('domainobjectcollection/create').endGroup();
		
		
	};
	
	external.collection = function() {
		if ( typeof arguments[0] == 'array' ) {
			return new DomainObjectCollection({objects:arguments[0],description:'set'});
		}
		else {
			var objects = [];
			for (var i=0; i<arguments.length; i++) {
				objects.push(arguments[i]);
			}
			return new DomainObjectCollection({objects:objects,description:'set'});
		}
	};
	
	function DeletedObjectsCollection (collection) {
		
		var deleted = new DomainObjectCollection({description:'deleted'});
		
		deleted.debug = function () {
			return this.map(function (object) {return '('+object.primaryKeyValue()+')';}).join(' ');
		};
		
		collection.subscribe({
			source: 		collection,
			target: 		deleted,
			remove: 		collectionRemove,
			description: 	'deleted object collection'
		});
		
		function collectionRemove(collection,object) {
			deleted.add(object);
		}
		
		return deleted;
		
	};
	
	
	function View (parent,child,predicate) {
		
		parent.subscribe({
			source: 		parent,
			target: 		child,
			add: 			parentAdd,
			remove: 		parentRemove,
			change: 		parentChange,
			description: 	'view'
		});
		
		// NOTE: this is ugly, and really should be done by subscription initialisation
		parent
			.filter(predicate)
				.each(function (index,object) {
					child.add(object);
				});
		
		function parentAdd(collection,object) {
			if ( predicate(object) ) {
				child.add(object);
			}
		};
		
		function parentRemove(collection,object) {
			child.remove(object,true);
		};
		
		function parentChange(collection,object) {
			// Object sometimes null here
			if ( predicate(object) ) {
				child.add(object);
			}
			else {
				child.remove(object,true);
			}
		};
		
	};
	
	
	
	// ------------------------------------------------------------------------
	//														   Domain Orderings
	// ------------------------------------------------------------------------
	
	var makeOrdering = (new DomainObjectCollection()).ordering;
	

	function FieldOrdering (fieldName) {
		return FunctionOrdering( function (obj) {return obj.get(fieldName);} );
	};
	
	
	function FieldPathOrdering (fieldpath) {	
		return FunctionOrdering( function (obj) {
			var property, value;
			for (var i=0; i<path.length; i++) {
				value = obj.get(path[i]);
				if ( !(typeof value == 'object') ) {
					return value;
				}
				else {
					obj = value instanceof DomainObjectCollection ? value.first() : value;
				}
			}
			return 0;
		});	
	};
	
	
	external.extend({
		ordering: 	makeOrdering,
		field: 		FieldOrdering,
		path: 		FieldPathOrdering
	});
	
	
	// ------------------------------------------------------------------------
	// 														  Domain Predicates
	// ------------------------------------------------------------------------
	
	external.predicate = (new DomainObjectCollection()).predicate;
	
	//
	// Field predicates
	//
	
	function FieldPredicate (field,predicate) {
		return function (candidate) {
			return predicate(candidate.get(field));
		};
	}
	
	function Eq (value,field) {
		return field ?
			FieldPredicate(field,EqualityPredicate(value))
			: EqualityPredicate(value);
	};
	
	function Lt (value,field) {
		return field ?
			FieldPredicate(field,LessThanPredicate(value))
			: LessThanPredicate(value);
	};
	
	function Gt (value,field) {
		return field ?
			FieldPredicate(field,GreaterThanPredicate(value))
			: GreaterThanPredicate(value);
	};
	
	function LtE (value,field) {
		return field ?
			FieldPredicate(field,LessThanEqualPredicate(value))
			: LessThanEqualPredicate(value);
	};
	
	function GtE (value,field) {
		return field ?
			FieldPredicate(field,GreaterThanEqualPredicate(value))
			: GreaterThanEqualPredicate(value);
	};
	
	function Between (lower,higher,field) {
		return field ?
			FieldPredicate(field,BetweenPredicate(lower,higher))
			: BetweenPredicate(lower,higher);
	}
	
	function RegEx (regex,field) {
		return field ?
			FieldPredicate(field,RegularExpressionPredicate(regex))
			: RegularExpressionPredicate(regex);
	};
	
	external.extend({
		
		eq: 		Eq,
		lt: 		Lt,
		gt: 		Gt,
		lte: 		LtE,
		gte: 		GtE,
		between: 	Between,
		regex: 		RegEx
					
	});

	// Primary Key Identity
	
	var IdentityPredicate = external.id = function (id) {
		return function (candidate) {
			return candidate.primaryKeyValue() == id;
		};		
	};

	// Example
	
	var ExamplePredicate = external.example = function (example) {
		
		var predicates = [];
		
		for( var key in example ) {
			if ( example[key] instanceof RegExp ) {
				predicates.push(FieldPredicate(key,RegularExpressionPredicate(example[key])));
			}
			else if ( typeof example[key] == 'function' ) {
				predicates.push(FieldPredicate(key,example[key]));
			}
			else if ( typeof example[key] == 'object' ) {
				predicates.push(FieldPredicate(key,SomeSetPredicate(ExamplePredicate(example[key]))));
			} 
			else {
				predicates.push(FieldPredicate(key,EqualityPredicate(example[key])));
			}
		}
		
		return And(predicates);

	};
	
	// Relationship
	
	var RelationshipPredicate = external.related = function (parent,field) {
		return FieldPredicate(field,Eq(parent.primaryKeyValue()));
	};
	
	// Membership
	
	function MembershipPredicate (collection) {		
		collection = makeCollection(collection);
		return function (candidate) {
			return Not(EmptySetPredicate)(collection.filter(ObjectIdentityPredicate(candidate)));
		};
	};
	
	external.member = MembershipPredicate;
	
	// Modification state
	
	var ModifiedPredicate = function () {
		return function (candidate) {
			return candidate.domain.dirty;
		};
	};	
	
	external.dirty = ModifiedPredicate();
		
	
	
	// ------------------------------------------------------------------------
	// 														Domain Object mixin
	// ------------------------------------------------------------------------
	
	function DomainObject (entitytype) {
		
		
		var data 			= {},
			subscribers 	= new SubscriptionList(notifications),
			relationships	= new RelationshipList();
			
		
		this.subscribers	= delegateTo(subscribers, 'filter');
		this.relationships	= delegateTo(relationships,'filter');
			
		
		this.get = function () {
		
			if ( arguments[0] == ':all' ) {
				return data;
			}
			else if ( !(arguments[0] instanceof Array) ) { // Just a key
				if ( data[arguments[0]] ) {
					return data[arguments[0]];
				}
				else {
					if ( _.nonempty(relationships.filter(arguments[0])) ) {
						return relationships.filter(arguments[0]).get();
					}
				}
			}
			else { // Array of keys
				var keys = arguments[0];
				var values = {};
				for ( var key in keys ) {
					values[keys[key]] = this.get(keys[key]);
				}
				return values;
			}
	
		};
		
		
		this.set = function () {
			
			var key;

			if ( arguments.length == 2 || arguments.length == 3 ) {  // Arguments are key and value
				key = arguments[0];
				var value = arguments[1];
				log('domainobject/set').debug('Setting '+key+' to "'+value+'"');
				data[key] = value;
				subscribers.notify({key:key,description:'field value change: '+key});
				if ( arguments.length == 2 || arguments[2] ) {
					subscribers.notify({key:':any',description:'field value change: any'});
				}
			}
			else if ( arguments.length == 1 && typeof arguments[0] == 'object' ) { // Argument is an object containing mappings
				log('domainobject/set').startGroup('Setting fields');
				var mappings = arguments[0];
				for ( key in mappings ) {
					this.set(key,mappings[key],false);
				}
				subscribers.notify({key:':any',description:'field value change: any'});
				log('domainobject/set').endGroup();
			}

			this.domain.dirty = true;

			return this;
	
		};
		
		
		this.removed = function (collection) {
			subscribers.notify({removed:true,description:'object removal'});
		};
		
		
		this.subscribe = function (subscription) {

			subscription.source = this;

			if ( subscription.removed ) {
				subscription.type		= RemovalNotification;
			}
			else if ( subscription.change && typeof subscription.change == 'string' ) {
				subscription.type		= EventNotification;
				subscription.event		= subscription.change;
			}
			else if ( subscription.change && typeof subscription.change == 'function' ) {
				subscription.type		= MethodNotification;
				subscription.method		= subscription.change;
			}
			else if ( subscription.target.is('input:input,input:checkbox,input:hidden,select') ) {
				subscription.type = ValueNotification;
			}
			else {
				subscription.type = ContentNotification;
			}

			var subscriber = new ObjectSubscriber(subscription);

			subscribers.add(subscriber);

			if ( subscription.initialise ) {
				notifications.send(subscriber.notification({key:subscription.key}));
			}

			return subscriber;

		};
		
		
		this.primaryKeyValue = function () {
			return this.get(this.primaryKey);
		};
		
		
		this.matches = function (predicate) {
			return predicate(this);
		};
		
		
		this.domain = function () {
			
			var that = this;
			
			function reifyFields () {

				for ( var i in that.fields ) {

					var field = that.fields[i];

					that.set(field.accessor,field.defaultValue);

					that[field.accessor] = 	function (field) {
						 						return function () {
													return this.get(field);
												};
											}(field.accessor);

					that['set'+field.accessor]	=	function (field) {
														return function (value) {
															return this.set(field,value);
														};
													}(field.accessor); 

				}

			};
			
			function reifyRelationships() {

				that.hasOne			= that.hasOne || [];
				that.hasMany		= that.hasMany || [];

				var i, descriptor, relationship;

				for ( i in that.hasOne ) {
					descriptor = that.hasOne[i];
					relationship 							= new OneToOneRelationship(that,descriptor);
					relationships.add(relationship);
					that[descriptor.accessor]				= delegateTo(relationship,'get');
					that['add'+descriptor.accessor]			= delegateTo(relationship,'add');
				}

				for ( i in that.hasMany ) {
					descriptor = that.hasMany[i];
					relationship											= new OneToManyRelationship(that,descriptor);
					relationships.add(relationship);
					that[(descriptor.plural || descriptor.accessor+'s')] 	= delegateTo(relationship,'get');
					that['add'+descriptor.accessor]							= delegateTo(relationship,'add');
					that['remove'+descriptor.accessor]						= delegateTo(relationship,'remove');
					that['debug'+descriptor.accessor]						= delegateTo(relationship,'debug');
				}

			};
			
			return {
				
				dirty: false,
				
				tags: {},
				
				init: function (initialData) {
					reifyFields();
					that.set(initialData); // Must do this before reifying relationships or else initial population of children fails
					reifyRelationships();
					return that.domain.clean();
				},
				
				clean: function () {
					that.domain.dirty = false;
					return that;
				},
						
				push: function () {
					for (var i in data) {
						subscribers.notify({key:i,description:'field value'});
					}
				},
						
				debug: function (showSubscribers) {
					var fields = '';
					for ( var i in data ) {
						fields += i + ':'+data[i]+' ';
					}
					if ( showSubscribers ) {
						fields += ' '+subscribers.debug()+' ';
					} 
					return fields;
				}
				
			};
			
		}.call(this);
		

	};
	
	
	
	// ------------------------------------------------------------------------
	// 															  Relationships
	// ------------------------------------------------------------------------
	
	function RelationshipList () {
		
		var relationships = new Set();
		relationships.delegateFor(this);
		
		this.constraint = Or( InstancePredicate(OneToOneRelationship), InstancePredicate(OneToManyRelationship) );
		
		this.predicate = function (parameter) {
			if ( ( typeof parameter == 'string' ) && parameter.charAt(0) != ':' ) {
				var predicate = PropertyPredicate('name',parameter);
				predicate.unique = true;
				return predicate;
			}
			else {
				return relationships.predicate(parameter);
			}
		};
		
	}
	
	function OneToOneRelationship (parent,relationship) {
		
		this.accessor	= relationship.accessor;
		this.name		= relationship.accessor;
		
		this.get = function (create) {
			var child = entities[relationship.prototype].object(parent.get(relationship.field));
			if ( child ) {
				return child;
			}
			else if ( create ) {
				return this.add();
			}
		};
		
		this.add = function (data) {

			var newObject = entities[relationship.prototype].create( data || {} );
			
			parent.set(relationship.field, newObject.primaryKeyValue());
			
			return newObject;
			
		};
		
	};
	
	external.OneToOneRelationship = OneToOneRelationship;
	
	
	function OneToManyRelationship (parent,relationship) {

		relationship.direction	= 'reverse';
		this.enabled 			= relationship.enabled;
		this.accessor			= relationship.accessor;
		this.name				= relationship.plural || relationship.accessor+'s';

		var example = {};
		example[relationship.field] = parent.primaryKeyValue();

		var children			= new DomainObjectCollection({
											base: 	     entities[relationship.prototype].objects,
											predicate: 	 RelationshipPredicate(parent,relationship.field),
											description: 'children by relationship '+relationship.accessor
										});
		
		// Deletions might cascade								
/*		if ( relationship.cascade ) {
			parent.subscribe({
				removed: 	function () {
								children.each(function (index,child) {
									entities[relationship.prototype].objects.remove(child);
								});
							}
			});
		} */
		
		// Relationship might specify subscription to children							
		if ( relationship.subscription ) {
			var subscription = copyObject(relationship.subscription);
			subscription.application = true;
			subscription.source = children;
			subscription.target = parent;
			subscription.description = subscription.description || 'subscription by relationship '+relationship.accessor;
			this.subscription = children.subscribe(subscription);
		}
		
		this.get = function () {
			return children.filter.apply(children,arguments);
		};
		
		// NOTE: Should this work with arrays of objects too?
		this.add = function (data) {
			
			data = data || {};
			data[relationship.field] = parent.primaryKeyValue();
			return entities[relationship.prototype].create(data);
			
		};
		
		this.remove = function (id) {
			
			entities[relationship.prototype].objects.remove(id);
			return this;
			
		};
		
		this.debug = function () {
			log().startGroup('Relationship: '+relationship.accessor);
			log().debug('Object: '+parent.domain.debug());
			if ( relationship.subscription ) {
				log().debug('Subscription target: '+subscription.target.domain.debug());
			}
			log().endGroup();
		};
		
	};
	
	external.OneToManyRelationship = OneToManyRelationship;
	
	
	// ------------------------------------------------------------------------
	// 																	   JSON
	// ------------------------------------------------------------------------
	
	external.json = function () {
		
		
		function makeObject (key,data,parent) {
			
			log('json/thaw').startGroup('thawing a '+key);
			
			var partitionedData = partitionObject(data,TypePredicate('object'),'children','fields');
			
			var object;
			if ( parent && parent.relationships && _.nonempty(parent.relationships(PropertyPredicate('accessor',key))) ) {
				log('json/thaw').debug('adding object to relationship');
				object = parent.relationships(PropertyPredicate('accessor',key)).first().add(partitionedData.fields);
			}
			else {
				if ( entities[key] ) {
					log('json/thaw').debug('creating free object');
					object = entities[key].create(partitionedData.fields);
				}
			}
			
			for ( var childKey in partitionedData.children ) {
				var childData = partitionedData.children[childKey];
				childData = ( childData instanceof Array ) ? childData : [childData];
				for ( var i=0; i<childData.length; i++) {
					makeObject(childKey,childData[i],object||parent);
				}
			}
			
			log('json/thaw').endGroup();

		}
		
		
		return {
			
			thaw: 	function (data,options) {
						log('json/thaw').startGroup('thawing JSON');
						options = options || {};
						data = ( data instanceof Array ) ? data : [data];
						for ( var i in data ) {
							for ( var key in data[i] ) {
								makeObject(key,data[i][key],options.parent);
							}
						}
						log('json/thaw').endGroup();
						return external.json;
					}
			
		};
		
		
	}();
	
	
	
	// ------------------------------------------------------------------------
	//													  Inheritance utilities
	// ------------------------------------------------------------------------

	//
	// This is provided as a very lightweight system for implementing inheritance
	// in Javascript. It's possible to use jModel with more elaborate schemes too
	//


	// Slight modification of John Resig's code inspired by base2 and Prototype
	external.Base = (function(){

		var	initializing	= false,
			fnTest 			= /xyz/.test(function(){xyz;}) ? (/\b_super\b/) : (/.*/);

		// The base Base implementation (does nothing)
		var Base = function(){};

		// Create a new Base that inherits from this class
		Base.extend = function(prop) {

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
			function Base() {
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

	
	
	// ------------------------------------------------------------------------
	//															      Utilities
	// ------------------------------------------------------------------------
	
	function copyArray (original) {
		copy = [];
		for (var i in original) {
			copy[i] = original[i];
		}
		return copy;
	}
	
	function copyObject (original) {
		copy = {};
		for (var i in original) {
			if ( typeof original[i] == 'object' ) {
				copy[i] = copyObject(original[i]);
			}
			else {
				copy[i] = original[i];
			}
		}
		return copy;
	}
	
	function partitionArray (array,predicate,passName,failName) {
		return partition( array, predicate, passName, failName, Array, function (destination,index,object) {
			destination.push(object);
		});
	}
	
	function partitionObject (object,predicate,passName,failName) {
		return partition( object, predicate, passName, failName, Object, function (destination,index,object) {
			destination[index] = object;
		});
	}
	
	function partition (source,predicate,passName,failName,constructor,add) {
		var partition = {};
		var pass = partition[passName||'pass'] = new constructor();
		var fail = partition[failName||'fail'] = new constructor();
		for (var i in source) {
			var candidate = source[i];
			if ( predicate(candidate) ) {
				add(pass,i,candidate);
			}
			else {
				add(fail,i,candidate);
			}
		}
		return partition;
	}
	
	function delegateTo(context,methodName) {
		return function () {
			return context[methodName].apply(context,arguments);
		}
	}
	
	
	
	// ------------------------------------------------------------------------
	// 																	Fluency 
	// ------------------------------------------------------------------------
	
	external.log.prototoype		= external.prototype;
	external.log.context		= external.context;
	external.log.notifications	= external.notifications;
	external.log.json			= external.json;
	
	external.prototype.context			= external.context;
	external.prototype.notifications	= external.notifications;
	external.prototype.json				= external.json;
	external.prototype.log				= external.log;
	
	external.context.prototype			= external.prototype;
	external.context.notifications		= external.notifications;
	external.context.json				= external.json;
	external.context.log				= external.log;
	
	external.notifications.prototype	= external.prototype;
	external.notifications.context		= external.context;
	external.notifications.json			= external.json;
	external.notifications.log			= external.log;
	
	external.json.prototype				= external.prototype;
	external.json.context				= external.context;
	external.json.notifications			= external.notifications;
	external.json.log					= external.log;
	
	return external;
	
}();

if (!_) {
	var _=jModel;
}