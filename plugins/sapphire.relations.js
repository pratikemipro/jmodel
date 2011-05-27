/*
 *	Sapphire Relations Plugin v0.3.0
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
			this.signature = this.keys.toString();
			var that = this;
			this.constraint = function (object) {
				return Object.keys(object).toString() === that.signature && !this.member(object);
			};
		};
		
		Relation.create = function (keys,members) {
			return set(members).reduce(add(), new Relation(keys));
		};
		
		Relation.compatible = function () {
			return Set.fromArguments(arguments).map(property('signature')).reduce(add(),new Set()).length <= 1;
		};

		function raise (operation) {
			return function () {
				return Relation.compatible.apply(null,arguments) ? Relation.create(first.keys,operation.apply(null,arguments)) : undefined;
			};
		}

		Relation.union			= raise(Set.union);
		Relation.intersection	= raise(Set.intersection);
		Relation.difference		= raise(Set.difference);
		
		Relation.join = function () {
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
				return this.map(JSON.stringify).first(eq(JSON.stringify(object))) !== undefined;
			},
		
			project: function () {
				var keys = _slice.call(arguments);
				return Relation.create(keys,this.__rep__.map(project.apply(null,keys)));
			},
			
			where: function (predicate) {
				return Relation.create(this.keys,this.__rep__.filter(this.predicate(predicate)));
			},
			
			join: function (field,relation) { return Relation.join(field)(this,relation); },
			
			union: function (relation) { return Relation.union(this,relation); },
			
			intersection: function (relation) { return Relation.intersection(this,relation); },
			
			difference: function (relation) { return Relation.difference(this,relation); }
			
		}, new TypedSet(Object));
		
		function match (field) {
			return function (a,b) { return a[field] === b[field]; };
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