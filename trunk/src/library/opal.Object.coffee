##
## Opal JavaScript Library: Object
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	# Tests: full
	Object.extend = (target,source) ->
		target[key] = source[key] for own key of source
		target

	# Tests: full
	Object.construct = (constructor,args1...) ->
		if constructor in [Number,String,Boolean] then constructor
		else if constructor == Date then (args2...) ->
			args = Array.concat args1, args2
			switch args.length
				when 1 then new Date args[0]
				when 3 then new Date args[0],args[1],args[2]
				when 7 then new Date args[0],args[1],args[2],args[3],args[4],args[5],args[6]
		else (args2...) ->
			args = Array.concat args1, args2
			new constructor args...

	# Tests: none
	Object.isa = (constructor) ->
		if      constructor == Number  then (obj) -> obj instanceof Number or typeof obj == 'number'
		else if constructor == String  then (obj) -> obj instanceof String or typeof obj == 'string'
		else if constructor == Boolean then (obj) -> obj instanceof Boolean or typeof obj == 'boolean'
		else                                (obj) -> obj instanceof constructor
	
	# Tests: full		
	Object.ensure = (constructor) ->
		isa = Object.isa constructor
		construct = Object.construct arguments...
		(obj) -> if isa obj then obj else construct arguments...
			
	##
	## Bare objects
	##
	
	# Tests: none
	Object.copy = (obj) -> Object.extend {}, obj
	
	# Tests: full
	Object.equal = (a,b) ->
		return false if a == undefined or b == undefined
		equal = true
		equal &&= a[prop] == b[prop] for own prop of a
		equal &&= a[prop] == b[prop] for own prop of b
		return equal
	
	# Tests: full
	Object.remove = (fields...) ->
		(source) ->
			obj = {}
			( obj[key] = value unless key in fields ) for own key, value of source
			return obj
	
	# Tests: full	
	Object.project = (fields...) ->
		(source) ->
			obj = {}
			( obj[key] = value if key in fields ) for own key, value of source
			return obj
	
	# Tests: full	
	Object.rename = (renaming) ->
		(source) ->
			obj = {}
			( obj[ renaming[key] or key ] = value ) for own key, value of source
			return obj
	
	# Tests: full
	Object.union = (first,rest...) ->
		switch arguments.length
			when 1 then first
			when 0 then {}
			else Object.extend Object.copy(first), Object.union rest...
		
	Object.intersection = (objects...) ->
		
	Object.difference = (a,b) ->
		
	Object.join = (predicate) ->
		