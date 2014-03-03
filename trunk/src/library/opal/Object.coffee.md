# Object

		
		Object.extend = Function.From(Object,Object).To(Object) \
			(target,source) ->
				target[key] = source[key] for own key of source
				target
		
		Object.construct = Function.From(Function,[Value]) (constructor,args1...) -> switch
	
			when constructor in [Number,String,Boolean] then constructor
		
			when constructor == Date then (args2...) ->
				args = [args1...,args2...]
				switch args.length
					when 1 then new Date args[0]
					when 3 then new Date args[0],args[1],args[2]
					when 7 then new Date args[0],args[1],args[2],args[3],args[4],args[5],args[6]
				
			else (args2...) ->
				new constructor [args1...,args2...]...
		
		Object.valid = (constructor) ->
			switch constructor
				when Number then (number) -> Object.isa(Number)(number) and not isNan number
				when Date then (date) -> Object.isa(Date)(date) and date.toString() != 'Invalid Date'
				else Object.isa(constructor)
		
		Object.ensure = (constructor) ->
			isa = Object.isa constructor
			construct = Object.construct arguments...
			(obj) -> if isa obj then obj else construct arguments...
		
		Object.copy = (obj) -> Object.extend {}, obj
		
		Object.type = (obj) -> typeof obj
		
		Object.eq = (value) -> (object) -> object == value
		
		Object.keys ?= Function.From(Object).To(Array) \
			(object) -> key for own key of object
		
		Object.has = Function.From(Scalar) (key) ->
			Function.From(Object).To(Boolean) \
				(object) -> key in Object.keys(object)
		

## Accessors

		
		Object.property = Function.overload [
		
			Function.From(String,Value) (property,value) ->
				Function.Requiring( Object.has(property), 'Undefined property' ) \
					(obj) ->
						obj[property] = value
						obj
					
			Function.From(String) (property) ->
				(obj) -> obj[property]
		
		]
		
		Object.method = Function.overload [	
	
			Function.From(String,[Value]) (method,args1...) ->
				(obj,args2...) ->
					throw new Error('Undefined method') unless obj[method]
					obj[method] [args1...,args2...]...
	
			Function.From(Function,[Value]) (fn,args1...) ->
				(obj,args2...) ->
					fn.call obj, args1..., args2...
	
		]
		
		Object.resolve = (name,args1...) ->
			(obj,args2...) ->
				return undefined unless obj[name]
				if typeof obj[name] == 'function'
					Object.method(name,[args1...,args2...]...) obj
				else
					Object.property(name,[args1...,args2...]...) obj
				
		Object.path = (path=[],separator='.') ->
			return Object.path path.split(separator) if typeof path == 'string'
			[first,rest...] = path
			switch path.length
				when 0 then Function.constant undefined
				when 1 then Object.resolve first
				else Object.resolve(first).then Object.path rest
	

## Typed objects

		
		Object.Of = Function.From(Constructor) (constructor) ->
			test = Object.isa constructor
			fn = ->
			fn.valid = (obj) ->	Array.reduce(Boolean.and) ( test value for own key, value of obj )
			return fn
			
			