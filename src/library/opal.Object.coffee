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