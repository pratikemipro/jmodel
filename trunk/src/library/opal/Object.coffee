##
## Opal JavaScript Library: Object
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	# Tests: full
	Object.extend = Function.From(Object,Object).To(Object) \
		(target,source) ->
			target[key] = source[key] for own key of source
			target

	# Tests: full
	Object.construct = (constructor,args1...) -> switch
		when constructor in [Number,String,Boolean] then constructor
		when constructor == Date then (args2...) ->
			args = Array.concat args1, args2
			switch args.length
				when 1 then new Date args[0]
				when 3 then new Date args[0],args[1],args[2]
				when 7 then new Date args[0],args[1],args[2],args[3],args[4],args[5],args[6]
		else (args2...) ->
			args = Array.concat args1, args2
			new constructor args...
	
	# Tests: none
	Object.valid = (constructor) ->
		switch constructor
			when Number then (number) -> Object.isa(Number)(number) and not isNan number
			when Date then (date) -> Object.isa(Date)(date) and date.toString() != 'Invalid Date'
			else Object.isa(constructor)
	
	# Tests: full		
	Object.ensure = (constructor) ->
		isa = Object.isa constructor
		construct = Object.construct arguments...
		(obj) -> if isa obj then obj else construct arguments...

	# Tests: none
	Object.copy = (obj) -> Object.extend {}, obj
	
	# Tests: none
	Object.type = (obj) -> typeof obj
	
	# Tests: none
	Object.eq = (value) -> (object) -> object == value
	
	# Tests: full
	Object.keys ?= Function.From(Object).To(Array) \
		(object) -> key for own key of object
		
	##
	## Accessors
	##
	
	# Tests: full
	Object.property = (property,value) ->
		switch arguments.length
			when 1 then (obj) -> obj[property]
			when 2 then (obj) ->
				throw 'Undefined property' unless obj[property]
				obj[property] = value
				obj
	
	# Tests: full			
	Object.method = (method,args1...) ->
		(obj,args2...) ->
			throw 'Undefined method' unless obj[method]
			obj[method] (Array.concat args1, args2)...
	
	# Tests: full		
	Object.resolve = (name,args1...) ->
		(obj,args2...) ->
			return undefined unless obj[name]
			if typeof obj[name] == 'function'
				Object.method(name,(Array.concat args1, args2)...) obj
			else
				Object.property(name,(Array.concat args1, args2)...) obj
				
	Object.path = (path=[],separator='.') ->
		return Object.path path.split(separator) if typeof path == 'string'
		[first,rest...] = path
		switch path.length
			when 0 then Function.constant undefined
			when 1 then Object.resolve first
			else Object.resolve(first).then Object.path rest
	
	##
	## Existential test
	##
			
	# Tests: none
	Object.has = (args...) -> Object.resolve.apply(null,args).then(Boolean);