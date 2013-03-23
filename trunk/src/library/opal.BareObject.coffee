##
## Opal JavaScript Library: Bare Objects
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##
	
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
		