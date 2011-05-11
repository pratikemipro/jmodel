/*
 *	Sapphire Relatins Plugin v0.2.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jmodel/sapphire'], function (sapphire) {
	
	//
	// Import Sapphire
	//

	// Non-strict section
	for ( var i in sapphire ) {
		eval('var '+i+' = sapphire.'+i);
	}
	
	return (function () {
		
		// Turn on strict mode for main section
		'use strict';
		
		var _slice = Array.prototype.slice;
		
		function Relation (keys) {
			TypedSet.call(this,Object);
			this.keys = keys instanceof Array ? keys : _slice.call(null,arguments);
			this.constraint = function (object) {
				return Object.keys(object).toString() === this.keys.toString() && !this.member(object);
			};
		};
		
		Relation.create = function (keys,members) {
			return set(members).reduce(_.add(), new Relation(keys));
		};

		Relation.union = function (first,second) {
			return    first.keys.toString() !== second.keys.toString() ? undefined
					: Relation.create(first.keys,Set.union(first,second));
		};

		Relation.intersection = function (first,second) {
			return 	  first.keys.toString() !== second.keys.toString() ? undefined
					: Relation.create(first.keys,Set.intersection(first,second));
		};
		
		Relation.difference = function (first,second) {
			return first.keys.toString() !== second.keys.toString() ? undefined
					: Relation.create(first.keys,Set.difference(first,second));
		};
		
		Relation.join = function (field) {
			var predicate = join.apply(null,arguments); 
			return function (first,second) {
				var keys = Set.union(Set.fromArray(first.keys),Set.fromArray(second.keys)).get(),
					members = [];
				first.each(function (a) {
					second.each(function (b) {
						if ( predicate(a,b) ) {
							members.push(extend(b,copy(a,true)));
						}
					});
				});
				return Relation.create(keys,members);
			};
		};

		Relation.prototype = extend({
		
			member: function (object) {
				var json = JSON.stringify(object);
				return this.first(function (candidate) {
					return JSON.stringify(candidate) === json; }
				) !== undefined;
			},
		
			project: function () {
				var keys = _slice.call(arguments);
					projector = project.apply(null,keys);
				return Relation.create(keys,this.__members.map(projector));
			},
			
			where: function (predicate) {
				return    typeof predicate === 'undefined' ? this
						: Relation.create(this.keys,this.__members.filter(this.predicate(predicate)));
			}
			
		}, new TypedSet(Object));
		
		function match (field) {
			return function (a,b) {
				return a[field] === b[field];
			};
		}
		
		function join (field) {
			return    arguments.length === 1 ? match(field)
					: match(field).and(join.apply(null,_slice(arguments,1)));
		}
		
		sapphire.extend({
			Relation: Relation
		});
		
	})();
	
});