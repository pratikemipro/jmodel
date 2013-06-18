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
	# Docs: full
	Function.identity = (x) -> x
	
	# Tests: full
	# Docs: full
	Function.constant = (constant) -> () -> constant
	
	# Tests: none
	# Docs: partial
	Function.arguments = (args...) -> args
	
	# Tests: full
	# Docs: partial
	Function.argument = (n) -> (args...) -> args[n]
	
	# Tests: full
	# Docs: partial
	Function.map = (mapping) -> (key) -> mapping[key]
	
	##
	## Return value manipulation
	##
	
	# Tests: none
	# Docs: none
	Function.Constant = (constant) ->
		(fn) -> (args...) -> fn.apply(this,args); constant
	
	# Tests: none
	# Docs: none
	Function.Override = Function.Constant false
	
	# Tests: none
	# Docs: none
	Function.Chaining = (fn) -> (args...) -> fn.apply(this,args); this
	
	##
	## Function composition
	##
	
	# Tests: full
	Function::then = (fn2) ->
		throw 'Precondition failure' unless typeof fn2 == 'function'
		fn1 = this
		(args...) -> fn2.call this, fn1.apply(this,args)
	
	# Tests: full
	Function::but = (fn2) ->
		throw 'Precondition failure' unless typeof fn2 == 'function'
		fn1 = this
		(args...) ->
			fn1.apply this, args
			fn2.apply this, args
	
	# Tests: full
	Function.pipe = (fn,fns...) ->
		throw 'Precondition failure' unless typeof fn in ['function','undefined']
		switch arguments.length
			when 1 then fn
			when 0 then Function.identity
			else fn.then Function.pipe fns...
			
	# Tests: full
	Function.compose = (fn,fns...) ->
		throw 'Precondition failure' unless typeof fn in ['function','undefined']
		switch arguments.length
			when 1 then fn
			when 0 then Function.identity
			else Function.pipe (Array.concat arguments...).reverse()...
	
	##
	## Aspect-like methods
	##
	
	# Tests: full
	Function::pre = (pre) ->
		throw 'Precondition failure' unless typeof pre == 'function'
		pre.but this
	
	# Tests: full	
	Function::post = (post) ->
		throw 'Precondition failure' unless typeof post == 'function'
		fn = this
		(args...) ->
			ret = fn.apply this, args
			post.apply this, [ret].concat(args)
			ret

	##
	## Preconditions and postconditions
	##
	
	# Tests: full
	Function::require = (predicate,message='Precondition failure') ->
		@pre (args...) ->
			throw message+': '+args.toString() unless predicate.apply this, args
	
	# Tests: full
	Function::ensure = (predicate,message='Postcondition failure') ->
		@post (args...) ->
			throw message+': '+args.toString() unless predicate.apply this, args

	##
	## Typed functions
	##
	
	# Tests: none
	Function.hastypes = (types...) ->
		predicate = Array.hastypes types...
		(args...) -> predicate args
	
	# Tests: none
	Function::Requiring = (predicate,message) ->
		@then (fn) -> fn.require predicate, message
	
	# Tests: partial
	Function.Requiring = (predicate,message) ->
		(fn) -> fn.require predicate, message
	
	# Tests: none	
	Function::Ensuring = (predicate,message) ->
		@then (fn) -> fn.ensure predicate, message
	
	# Tests: none
	Function.Ensuring = (predicate,message) ->
		(fn) -> fn.ensure predicate, message

	# Tests: partial
	Function::From = (types...) ->
		@Requiring Function.hastypes(types...), 'Incorrect source type. Arguments are'

	# Tests: full
	Function.From = (types...) ->
		Function.Requiring Function.hastypes(types...), 'Incorrect source type. Arguments are'

	# Tests: partial
	Function::To = (type) ->
		@Ensuring Object.isa(type), 'Incorrect target type. Returned value is'

	# Tests: full
	Function.To = (type) ->
		Function.Ensuring Object.isa(type), 'Incorrect target type. Returned value is'
	
	# Tests: full
	Function.Returning = (val) ->
		(fn) -> (args...) ->
			ret = val.call(this)
			fn.call(this,ret).apply(this,args)
			return ret
	
	# Tests: full		
	Function::Returning = (val) ->
		Function.Returning(val).then(this)
	
	# Tests: none
	window.Predicate = Function.To Boolean
	
	##		
	## Logical functions
	##
	
	# Tests: full
	Function::and = Function.From(Function) \
		(predicate2) ->
			predicate1 = this
			Predicate (args...) ->
				predicate1.apply(this,args) and predicate2.apply(this,args)
			
	# Tests: full
	Function::or = Function.From(Function) \
		(predicate2) ->
			predicate1 = this
			Predicate (args...) ->
				predicate1.apply(this,args) or predicate2.apply(this,args)
	
	# Tests: full
	Function::not = ->
		predicate = this
		Predicate (args...) -> not predicate.apply this, args
	
	# Tests: full
	Function.and = Function.From([Function]).To(Function) \
		(predicate,predicates...) ->
			switch arguments.length
				when 1 then predicate
				when 0 then -> true
				else predicate.and Function.and predicates...
	
	# Tests: full
	Function.or = Function.From([Function]).To(Function) \
		(predicate,predicates...) ->
			switch arguments.length
				when 1 then predicate
				when 0 then -> false
				else predicate.or Function.or predicates...

	# Tests: full
	Function.not = (predicate) ->
		if typeof predicate == 'function' then predicate.not() else not predicate
	
	##
	## Delegation
	##

	# Tests: none
	Function.delegate = (fn) ->
		(args...) -> 
			[context,method] = fn.call(this)
			method.apply context, args
	
	
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
	
	##
	## Property methods
	##
	
	# Tests: full
	Function::as = (name) ->
		@displayName = name
		this
	
	# Tests: full
	Function::extend = (properties) -> Object.extend this, properties
	
	##
	## Application methods
	##
	
	# Tests: full
	Function::bind = (context,args1...) ->
		fn = this
		(args2...) -> fn.apply context, Array.concat(args1,args2)
	
	# Tests: full
	Function::curry = (args1...) ->
		fn = this
		(args2...) -> fn.apply this, Array.concat(args1,args2)
	
	# Tests: full
	Function::except = (handler) ->
		fn = this
		(args...) ->
			try fn.apply this, args
			catch error
				handler.call this, error
	
	# Tests: full			
	Function::memo = ->
		cache = {}
		fn = @post (ret,args...) -> cache[args] = ret
		(args...) -> cache[args] ? fn.apply this, arguments
	
	# Tests: none
	Function::delay ?= (duration=1,args1...) ->
		fn = this
		(args2...) -> setTimeout fn.curry.apply(fn,Array.concat(args1,args2)), duration
	
	##	
	## Mapping methods
	##
	
	# Tests: full	
	Function::map = (mapping) -> @then Function.map mapping

	##
	## Predicate methods
	##
		
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
		
	Function::hastype = (type) -> @then Object.type.eq type
	
	##
	## Ordering methods
	##
		
	Function::asc = ->
		fn = this
		(a,b) ->
			fna = fn.call this, a
			fnb = fn.call this, b
			return -1 if fna < fnb
			return  1 if fna > fnb
			return  0
				
	Function::desc = -> @asc().then (x) -> -x
	
	##
	## Constructor methods
	##
		
	Function::create = (args...) -> Object.construct(this)(args...)
	
	##
	## Restricted types
	##
	
	# NOTE: Make this work with objects other than strings and numbers
	
	Function::Where = (predicate,message='Invalid value') ->
		restricted = @post (value) ->
			throw message.replace('<value>',value) unless predicate value
		restricted.base = @base or this
		restricted.__predicate = predicate
		restricted[property] = value for property, value of restricted.base
		return restricted