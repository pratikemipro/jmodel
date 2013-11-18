# Function

		
		Function::extend = (properties) -> Object.extend this, properties
		

## Basic functions

		
		Function.identity = (x) -> x
		
		Function.constant = (constant) -> () -> constant
		
		Function.arguments = (args...) -> args
		
		Function.argument = (n) -> (args...) -> args[n]
		
		Function.map = (mapping) -> (key) -> mapping[key]
		
		Function.overload = (variants=[]) ->
			fn = (args...) ->
				for variant in variants
					return variant.apply(this,args) if variant.matches args...
				return undefined
			fn.extend extend: (variants2=[]) ->
				Function.overload [variants2...,variants...]
				
		Function.match = (variants=[]) -> (value) ->
			for variant in variants
				return variant.apply(value,value) if variant.matches value
			return undefined
		

## Function composition

		
		Function::then = (fn2) ->
			throw 'Precondition failure' unless typeof fn2 == 'function'
			fn1 = this
			(first,rest...) ->
				context = if this != window then this ? first else first
				val1 = fn1.call context, first, rest...
				fn2.call val1, val1 
		
		Function::but = (fn2) ->
			throw 'Precondition failure' unless typeof fn2 == 'function'
			fn1 = this
			(args...) ->
				fn1.apply this, args
				fn2.apply this, args
		
		Function.pipe = (fn,fns...) ->
			throw 'Precondition failure' unless typeof fn in ['function','undefined']
			switch arguments.length
				when 1 then fn
				when 0 then Function.identity
				else fn.then Function.pipe fns...
		
		Function.compose = (fn,fns...) ->
			throw 'Precondition failure' unless typeof fn in ['function','undefined']
			switch arguments.length
				when 1 then fn
				when 0 then Function.identity
				else Function.pipe [arguments...].reverse()...
	

## Aspect-like methods

		
		Function::pre = (pre) ->
			throw 'Precondition failure' unless typeof pre == 'function'
			pre.but this
		
		Function::post = (post) ->
			throw 'Precondition failure' unless typeof post == 'function'
			fn = this
			(args...) ->
				ret = fn.apply this, args
				post.call this, ret, args...
				ret
		

## Preconditions and postconditions

		
		Function::matches = -> true
		
		Function::require = (predicate,message='Precondition failure') ->
			@pre (args...) ->
				throw message+': '+args.toString() unless predicate.apply this, args
		
		Function::ensure = (predicate,message='Postcondition failure') ->
			@post (args...) ->
				throw message+': '+args.toString() unless predicate.apply this, args
		

## Typed functions

		
		Function.hastypes = (types...) ->
			predicate = Array.hastypes types...
			(args...) -> predicate args
		
		Function::Requiring = (predicate,message) ->
			@then (fn) ->
				fn2 = fn.require predicate, message
				fn2.matches = predicate
				return fn2
		
		Function.Requiring = (predicate,message) ->
			(fn) ->
				fn2 = fn.require predicate, message
				fn2.matches = predicate
				return fn2
		
		Function::Ensuring = (predicate,message) ->
			@then (fn) -> fn.ensure predicate, message
		
		Function.Ensuring = (predicate,message) ->
			(fn) -> fn.ensure predicate, message
		
		Function::From = (types...) ->
			@Requiring Function.hastypes(types...), 'Incorrect source type. Arguments are'
		
		Function.From = (types...) ->
			Function.Requiring Function.hastypes(types...), 'Incorrect source type. Arguments are'
		
		Function::To = (type) ->
			@Ensuring Object.isa(type), 'Incorrect target type. Returned value is'
		
		Function.To = (type) ->
			Function.Ensuring Object.isa(type), 'Incorrect target type. Returned value is'
		
		Function.Of = (constructor) ->
			ensure = Object.ensure constructor
			(fn) -> (args...) -> fn.call this, ensure args...
		
		window.Predicate = Function.To Boolean
		

## Argument manipulation

		
		Function.Defaults = (defaults={}) -> (fn) -> (object) -> fn.call this, Object.union(defaults,object)
		
		Function::Defaults = (defaults={}) -> 
			fn1 = this
			(fn) -> (object) -> fn1.call(this,fn).call this, Object.union(defaults,object)
			
		Function::defaults = (defaults={}) ->
			fn = this
			fn2 = (object) -> 
				if this.constructor == fn2
					new fn Object.union(defaults,object)
				else
					fn.call this, Object.union(defaults,object) 
		

## Return value manipulation

		
		Function.Returning = (val) ->
			(fn) -> (args...) ->
				ret = val.call(this)
				fn.call(this,ret).apply(this,args)
				return ret
		
		Function::Returning = (val) ->
			Function.Returning(val).then(this)
	
		Function.Constant = (constant) -> (fn) -> fn.but -> constant
		
		Function.Chaining = Function.From(Function) (fn) -> fn.but -> this
		
		Function::Chaining = Function.From(Function) (fn) -> @(fn).but -> this
		

## Logical functions
	
		
		Function::and = Function.From(Function) \
			(predicate2) ->
				predicate1 = this
				Predicate (args...) ->
					predicate1.apply(this,args) and predicate2.apply(this,args)
		
		Function::or = Function.From(Function) \
			(predicate2) ->
				predicate1 = this
				Predicate (args...) ->
					predicate1.apply(this,args) or predicate2.apply(this,args)
		
		Function::not = ->
			predicate = this
			Predicate (args...) -> not predicate.apply this, args
		
		Function.and = Function.From([Function]).To(Function) \
			(predicate,predicates...) ->
				switch arguments.length
					when 1 then predicate
					when 0 then -> true
					else predicate.and Function.and predicates...
		
		Function.or = Function.From([Function]).To(Function) \
			(predicate,predicates...) ->
				switch arguments.length
					when 1 then predicate
					when 0 then -> false
					else predicate.or Function.or predicates...
		
		Function.not = (predicate) ->
			if typeof predicate == 'function' then predicate.not() else not predicate
	

## Delegation

		
		Function.delegate = (fn) ->
			(args...) -> 
				[context,method] = fn.call(this)
				method.apply context, args
				
		Function.delegates = (fn) ->
			for index in [0..9]
				do (index) -> (args...) ->
					[context,fns...] = fn.call(this)
					fns[index].apply context, args
	

## Composite ordering

		
		Function.ordering = Function.or
	

## Predicates

		
		Function.eq  = (value) -> Predicate (x) -> x == value
		Function::eq = (value) -> @then Function.eq value
		
		Function.neq  = (value) -> Predicate (x) -> x != value
		Function::neq = (value) -> @then Function.neq value
		
		Function.lt  = (value) -> Predicate (x) -> x < value
		Function::lt = (value) -> @then Function.lt value
		
		Function.gt  = (value) -> Predicate (x) -> x > value
		Function::gt = (value) -> @then Function.gt value
		
		Function.lte  = (value) -> Predicate (x) -> x <= value
		Function::lte = (value) -> @then Function.lte value
		
		Function.gte  = (value) -> Predicate (x) -> x >= value
		Function::gte = (value) -> @then Function.gte value
		
		Function.between = ( Function.Requiring (lower,higher) -> lower < higher ) (lower,higher) ->
			Predicate (x) -> lower <= x <= higher
		
		Function::between = (lower,higher) -> @then Function.between lower,higher
		
		Function::is = Function::then
		
		Function::matches = (regex) -> @then Predicate (x) -> regex.test x
		
		Function::isnull = -> @then Function.eq null
		
		Function::isa = (constructor) -> @then Predicate (x) -> x instanceof constructor
		
		Function::hastype = (type) -> @then Object.type.eq type
		
		Function::isa = (constructor) -> this == constructor or @prototype instanceof constructor
	

## Application methods

		
		Function::bind = (context,args1...) ->
			fn = this
			(args2...) -> fn.call context, args1..., args2...
		
		Function::curry = (args1...) ->
			fn = this
			(args2...) -> fn.call this, args1..., args2...
		
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
			(args2...) -> setTimeout fn.curry.call(fn,args1...,args2...), duration
	

## Mapping methods

			
		Function::map = (mapping) -> @then Function.map mapping
	

## Ordering methods

		
		Function::asc = ->
			fn = this
			(a,b) ->
				fna = fn.call this, a
				fnb = fn.call this, b
				return -1 if fna < fnb
				return  1 if fna > fnb
				return  0
				
		Function::desc = -> @asc().then (x) -> -x
	

## Constructor methods

		
		Function::create = (args...) -> Object.construct(this)(args...)
	

## Restricted types

		
		# NOTE: Make this work with objects other than strings and numbers
		Function::Where = (predicate,message='Invalid value') ->
			restricted = @post (value) -> throw message.replace('<value>',value) unless predicate.call value, value
			restricted.base = @base or this
			restricted[property] = value for property, value of restricted.base
			restricted.valid = (value) -> Object.isa(restricted.base)(value) and predicate.call value, value
			return restricted
		
		window.Constructor = Constructor = Function
			
		Constructor.Inheriting = (parent) ->
			fn1 = (constructor) ->
			fn1.valid = (constructor) -> constructor.isa parent
			return fn1
			 
			
			
