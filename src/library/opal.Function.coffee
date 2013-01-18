##
## Opal JavaScript Library: Function
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	##
	## Basic functions
	##
	
	# Tests: full
	Function.identity = (x) -> x
	
	# Tests: full
	Function.constant = (constant) -> () -> constant
	
	# Tests: full
	Function.argument = (n) -> (args...) -> args[n]
	
	# Tests: full
	Function.map = (mapping) -> (key) -> mapping[key]
	
	##
	## Function composition
	##
	
	# Tests: full
	Function::then = (fn2) ->
		fn1 = this
		(args...) -> fn2.call this, fn1.apply(this,args)
	
	# Tests: full
	Function::but = (fn2) ->
		fn1 = this
		(args...) ->
			fn1.apply this, args
			fn2.apply this, args
	
	# Tests: full
	Function.pipe = (fn,fns...) ->			
		switch arguments.length
			when 1 then fn
			when 0 then Function.identity
			else fn.then Function.pipe fns...
			
	# Tests: full
	Function.compose = (fn,fns...) ->
		switch arguments.length
			when 1 then fn
			when 0 then Function.identity
			else Function.pipe (Array.concat arguments...).reverse()...
	
	##		
	## Logical functions
	##
	
	# Tests: full
	Function::and = (fn2) ->
		fn1 = this
		Predicate (args...) -> fn1.apply(this,args) and fn2.apply(this,args)
			
	# Tests: full
	Function::or = (fn2) ->
		fn1 = this
		Predicate (args...) -> fn1.apply(this,args) or fn2.apply(this,args)
	
	# Tests: full
	Function::not = ->
		fn = this
		Predicate (args...) -> not fn.apply this, args
	
	# Tests: full
	Function.and = (predicate,predicates...) ->
		switch arguments.length
			when 1 then predicate
			when 0 then -> true
			else predicate.and Function.and predicates...
	
	# Tests: full
	Function.or = (predicate,predicates...) ->
		switch arguments.length
			when 1 then predicate
			when 0 then -> false
			else predicate.or Function.or predicates...

	# Tests: full
	Function.not = (predicate) ->
		if typeof predicate == 'function' then predicate.not() else not predicate
	
	
	##
	## Aspect-like methods
	##
	
	# Tests: full
	Function::pre = (pre) -> pre.but this
	
	# Tests: full	
	Function::post = (post) ->
		fn = this
		(args...) ->
			ret = fn.apply this, args
			post.apply this, [ret].concat(args)
			ret

	##
	## Preconditions and postconditions
	##
	
	# Tests: full
	Function::require = (predicates...) ->
		predicate = Function.and predicates...
		@pre (args...) ->
			throw 'Precondition failure' unless predicate.apply this, args
	
	# Tests: full
	Function::ensure = (predicates...) ->
		predicate = Function.and predicates...
		@post (args...) ->
			throw 'Postcondition failure' unless predicate.apply this, args

	##
	## Typed functions
	##
	
	# Tests: none
	Function.hastypes = (types...) ->
		predicate = Function.and (Function.argument(n).then(Object.isa type) for type, n in types)...
		(args...) -> predicate args...
	
	# Tests: none
	Function::Requiring = (predicates...) ->
		@then (fn) -> fn.require predicates...
	
	# Tests: none
	Function.Requiring = (predicates...) ->
		(fn) -> fn.require predicates...
	
	# Tests: none	
	Function::Ensuring = (predicates...) ->
		@then (fn) -> fn.ensure predicates...
	
	# Tests: none
	Function.Ensuring = (predicates...) ->
		(fn) -> fn.ensure predicates...

	# Tests: partial
	Function::From = (types...) ->
		@Requiring Function.hastypes types...

	# Tests: full
	Function.From = (types...) ->
		Function.Requiring Function.hastypes types...

	# Tests: partial
	Function::To = (type) ->
		@Ensuring Object.isa type

	# Tests: full
	Function.To = (type) ->
		Function.Ensuring Object.isa type
	
	# Tests: none
	window.Predicate = Function.To Boolean
	
	##	
	## Composite ordering
	##
		
	Function.ordering = Function.or
	
	##
	## Comparison functions
	##
	
	# Tests: full
	Function.eq = (value) -> Predicate (x) -> x == value
	
	# Tests: full
	Function.neq = (value) -> Predicate (x) -> x != value
	
	# Tests: full
	Function.lt = (value) -> Predicate (x) -> x < value
	
	# Tests: full
	Function.gt = (value) -> Predicate (x) -> x > value
	
	# Tests: full
	Function.lte = (value) -> Predicate (x) -> x <= value

	# Tests: full
	Function.gte = (value) -> Predicate (x) -> x >= value

	# Tests: full
	Function.between = ( Function.Requiring (lower,higher) -> lower <= higher ) (lower,higher) ->
		Predicate (x) -> lower <= x <= higher
	
	# Property methods
	
	Function::as = (name) ->
		@displayName = name
		this
	
#	Function::extend = (properties) -> Object.extend this, properties
	
	# Application methods
	
	Function::bind = (context,args1...) ->
		fn = this
		(args2...) -> fn.apply context, args1.concat(args2)
	
	Function::curry = (args1...) ->
		fn = this
		(args2...) -> fn.apply this, args1.concat(args2)
	
	Function::except = (handler) ->
		fn = this
		(args...) ->
			try fn.apply this, args
			catch error
				handler.call this, error
				
	Function::memo = ->
		cache = {}
		fn = @post (ret,args...) -> cache[args] = ret
		(args...) -> cache[args] ? fn.apply this, arguments
		
	Function::delay ?= (duration=1,args1...) ->
		fn = this
		(args2...) -> setTimeout fn.curry.apply(fn,args1.concat(args2)), duration
		
	# Mapping methods
		
	Function::map = (mapping) -> @then Function.map mapping

	# Predicate methods
		
	Function::is = Function::then
		
	Function::eq = (value) -> @then Function.eq value
		
	Function::neq = (value) -> @then Function.neq value
		
	Function::lt = (value) -> @then Function.lt value
		
	Function::gt = (value) -> @then Function.gt value
		
	Function::lte = (value) -> @then Function.lte value

	Function::gte = (value) -> @then Function.gte value

	Function::between = (lower,higher) -> @then Function.between lower,higher
	
	Function::matches = (regex) -> @then Predicate (x) -> regex.test x
		
	Function::isnull = -> @then Function.eq null
		
	Function::isa = (constructor) -> @then Predicate (x) -> x instanceof constructor
		
	Function::hastype = (type) -> @then Predicate (x) -> typeof x == type
	
	# Ordering methods
		
	Function::asc = ->
		fn = this
		(a,b) ->
			fna = fn.call this, a
			fnb = fn.call this, b
			return -1 if fna < fnb
			return  1 if fna > fnb
			return  0
				
	Function::desc = -> @asc().then (x) -> -x
	
	# Constructor methods
		
	Function::create = (args...) -> Object.construct(this)(args...)
	
	# Restricted types
	# NOTE: Make this work with objects other than strings and numbers
	
	Function::Where = (predicate,message='Invalid value') ->
		restricted = this.post (value) ->
			throw message.replace('<value>',value) unless predicate value
		restricted.base = this.base or this
		restricted.__predicate = predicate
		restricted[property] = value for property, value of restricted.base
		return restricted