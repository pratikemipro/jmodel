###

	OPAL Javascript Library Function module
	http://code.google.com/p/jmodel/
	
	Copyright (c) 2009-2012 Richard Baker
	Dual licensed under the MIT and GPL licenses

###

define ->
	
	###
		Function
	###
	
	# Basic functions
	
	Function.identity = (x) -> x
	
	Function.constant = (constant) -> () -> constant
	
	Function.argument = (n) -> (args...) -> args[n]
	
	Function.map = (mapping) -> (key) -> mapping[key]
	
	# Function composition
	
	Function.pipe = (fn,fns...) ->			
		switch arguments.length
			when 1 then fn
			when 0 then Function.identity
			else fn.then Function.pipe fns...
			
	Function.compose = (fn,fns...) ->
		switch arguments.length
			when 1 then fn
			when 0 then Function.identity
			else Function.pipe [fn].concat(fns...).reverse()...
			
	# Logical functions
	
	Function.or = (predicate,predicates...) ->
		switch arguments.length
			when 1 then predicate
			when 0 then -> false
			else predicate.or Function.or predicates...

	Function.and = (predicate,predicates...) ->
		switch arguments.length
			when 1 then predicate
			when 0 then -> true
			else predicate.and Function.and predicates...

	Function.not = (predicate) ->
		if typeof predicate == 'function' then predicate.not() else not predicate
		
	# Composite ordering
		
	Function.ordering = Function.or
	
	# Comparison functions
	
	Function.eq = (value) -> (x) -> x == value
		
	Function.neq = (value) -> (x) -> x != value
		
	Function.lt = (value) -> (x) -> x < value
		
	Function.gt = (value) -> (x) -> x > value
		
	Function.lte = (value) -> (x) -> x <= value

	Function.gte = (value) -> (x) -> x >= value

	Function.between = (lower,higher) -> (x) -> lower <= x <= higher
	
	
	###
		Function.prototype
	###
	
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
			try fn.apply this,args
			catch error
				handler.call this,error
				
	Function::memo = ->
		cache = {}
		fn = @post (ret,args...) -> cache[args] = ret
		(args...) -> cache[args] ? fn.apply this,arguments
		
	Function::delay ?= (duration=1,args1...) ->
		fn = this
		(args2...) -> setTimeout fn.curry.apply(fn,args1.concat(args2)), duration
		
	# Mapping methods
		
	Function::map = (mapping) -> @then Function.map mapping
	
	# Composition methods
		
	Function::then = (fn2) ->
		fn1 = this
		(args...) -> fn2.call this, fn1.apply(this,args)
			
	Function::but = (fn2) ->
		fn1 = this
		(args...) ->
			fn1.apply this,args
			fn2.apply this,args
	
	# Aspect-like methods
		
	Function::pre = (pre) -> pre.but this
		
	Function::post = (post) ->
		fn = this
		(args...) ->
			ret = fn.apply this,args
			post.apply this,[ret].concat(args)
			ret

	# Preconditions and postconditions
		
	Function::require = (predicates...) ->
		predicate = Function.and predicates...
		@pre (args...) ->
			throw 'Precondition failure' if not predicate.apply this,args
		
	Function::ensure = (predicates...) ->
		predicate = Function.and predicates...
		@post (args...) ->
			throw 'Postcondition failure' if not predicate.apply this,args
			
	# Logical methods
		
	Function::and = (fn2) ->
		fn1 = this
		(args...) -> fn1.apply(this,args) && fn2.apply(this,args)
			
	Function::or = (fn2) ->
		fn1 = this
		(args...) -> fn1.apply(this,args) || fn2.apply(this,args)
		
	Function::not = ->
		fn = this
		(args...) -> not fn.apply this,args
		
	# Predicate methods
		
	Function::is = Function.prototype.then
		
	Function::eq = (value) -> @then Function.eq value
		
	Function::neq = (value) -> @then Function.neq value
		
	Function::lt = (value) -> @then Function.lt value
		
	Function::gt = (value) -> @then Function.gt value
		
	Function::lte = (value) -> @then Function.lte value

	Function::gte = (value) -> @then Function.gte value

	Function::between = (lower,higher) -> @then Function.between lower,higher
	
	Function::matches = (regex) -> @then (x) -> regex.test x
		
	Function::isnull = -> @then Function.eq null
		
	Function::isa = (constructor) -> @then (x) -> x instanceof constructor
		
	Function::hastype = (type) -> @then (x) -> typeof x == type
	
	# Ordering methods
		
	Function::asc = ->
		fn = this
		(a,b) ->
			fna = fn.call this,a
			fnb = fn.call this,b
			return -1 if fna < fnb
			return  1 if fna > fnb
			return  0
				
	Function::desc = -> @asc().then (x) -> -x
	
	# Constructor methods
		
	Function::create = (args...) -> Object.construct(this)(args...)