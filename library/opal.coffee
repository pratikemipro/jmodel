###

	OPAL Javascript Library
	http://code.google.com/p/jmodel/
	
	Copyright (c) 2009-2011 Richard Baker
	Dual licensed under the MIT and GPL licenses

###


define ->


	# Turn on strict mode in modern browsers
	'use strict'

	opal = opal_version: '0.22.0'
	
	# Cross-browser assertions
	assert =
		if window.console?.assert? then (condition,message) -> window.console.assert(condition,message)
		else (condition,message) -> throw "Opal exception: #{message}" unless condition


	###
		Utility functions
	###
	
	Object.extend ?= (target,source) ->
		target[key] = value for key, value of source
		target
	
	type = (object) -> typeof object
	
	delegateTo = (context,methodName) -> (args...) -> context[methodName].apply(context,args)

	Object.extend opal,
		type: type
		assert: assert
		delegateTo: delegateTo
#		copy: copy


	###
		Function
	###
	
	Object.extend Function,
	
		# Basic functions
	
		identity: (x) -> x

		constant: (constant) -> () -> constant
		
		argument: (n) -> (args...) -> args[n]

		map: (mapping) -> (key) -> mapping[key]

		# Function composition

		pipe: (fns...) ->
			switch fns.length
				when 1 then fn
				when 0 then Function.identity
				else fns[0].then Function.pipe fns[1..]...
		
		compose: (fns...) ->
			switch fns.length
				when 1 then fn
				when 0 then Function.identity
				else Function.pipe fns.reverse()...
				
		# Logical functions

		or: (predicates...) ->
			switch predicates.length
				when 1 then predicates[0]
				when 0 then () -> false
				else predicates[0].or Function.or predicates[1..]...

		and: (predicates...) ->
			switch predicates.length
				when 1 then predicates[0]
				when 0 then () -> true
				else predicates[0].and Function.and predicates[1..]...

		not: (predicate) ->
			if typeof predicate == 'function' then predicate.not() else !predicate
			
		# Composite ordering
		
		ordering: Function.or


	###
		Function.prototype
	###
	
	Object.extend Function.prototype,
	
		# Property methods
		
		as: (name) ->
			@displayName = name
			this

		extend: (properties) -> Object.extend this, properties
		
		# Application methods

		bind: (context,args1...) ->
			fn = this
			(args2...) -> fn.apply(context,args1.concat(args2))

		curry: (args1...) ->
			fn = this
			(args2...) -> fn.apply(this,args1.concat(args2))
	
		except: (handler) ->
			fn = this
			(args...) ->
				try fn.apply(this,args)
				catch error
					handler.call(this,error)
					
		memo: () ->
			cache = {}
			fn = this.post (ret,args...) -> cache[args] = ret
			(args...) -> cache[args] ? fn.apply(this,arguments)
		
		delay: Function.prototype.delay ? (duration,args1...) ->
			fn = this
			(args2...) -> setTimeout(fn.curry.apply(fn,args1.concat(args2)),duration ? 1)

		# Mapping methods
		
		map: (mapping) -> this.then Function.map(mapping)
		
		# Composition methods
		
		then: (fn2) ->
			fn1 = this
			(args...) -> fn2.call(this,fn1.apply(this,args))
			
		but: (fn2) ->
			fn1 = this
			(args...) ->
				fn1.apply(this,args)
				fn2.apply(this,args)
		
		# Aspect-like methods
		
		pre: (pre) -> pre.but(this)
		
		post: (post) ->
			fn = this
			(args...) ->
				ret = fn.apply(this,args)
				post.apply(this,[ret].concat(args))
				ret
				
		# Preconditions and postconditions
		
		require: () -> # Implement this
		
		ensure: () -> # Implement this
		
		# Logical methods
		
		and: (fn2) ->
			fn1 = this
			(args...) -> fn1.apply(this,args) && fn2.apply(this,args)
			
		or: (fn2) ->
			fn1 = this
			(args...) -> fn1.apply(this,args) || fn2.apply(this,args)
		
		not: () ->
			fn = this
			(args...) -> !fn.apply(this,args)
			
		# Predicate methods
		
		is: Function.prototype.then
		
		eq: (value) -> this.is (x) -> x == value
		
		neq: (value) -> this.is (x) -> x != value
		
		lt: (value) -> this.is (x) -> x < value
		
		gt: (value) -> this.is (x) -> x > value
		
		lte: (value) -> this.is (x) -> x <= value

		gte: (value) -> this.is (x) -> x >= value

		between: (lower,higher) -> this.is (x) -> lower <= x <= higher

		matches: () -> # Implement this
		
		isnull: () -> # Implement this
		
		isa: () -> # Implement this
		
		hastype: () -> # Implement this
		
		# Ordering methods
		
		asc: () ->
			fn = this
			(a,b) ->
				fna = fn.call(this,a)
				fnb = fn.call(this,b)
				if      fna < fnb then -1
				else if fna > fnb then 1
				else 0
				
		desc: () -> this.asc().then (x) -> -x
		
		# Constructor methods
		
		create: (args...) -> Object.construct(this)(args...)


	###
		Object
	###
	
	Object.extend Object,
	
		# Construction
	
		# NOTE: Test this thoroughly
		construct: (constructor,args1...) ->
			if      constructor == String then String
			else if constructor == Number then Number
			else if constructor == Boolean then Boolean
			else if constructor.nullable? then constructor
			else (args2...) -> new constructor (args1.concat(args2))...
			
		ensure: (constructor,args1) ->
			if constructor == String
				(value) -> String value unless typeof value == 'string'
			else if constructor == Number
				(value) -> Number value unless typeof value == 'number'
			else if constructor == Boolean
				(value) -> Boolean value unless typeof value == 'boolean'
			else if constructor.nullable?
				(args...) ->
					if args.length == 1 and ( args[0] == null or args[0] == undefined ) then null
					else new constructor (args1.concat(args2))...
			else
				(args2...) -> new constructor (args1.concat(args2))... unless object instanceof constructor


