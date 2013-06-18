##
## Opal JavaScript Library: Bare Objects
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##
	
	# Tests: full
	Object.equal = Predicate.From(Object,Object) \
		(a,b) ->
			equal = true
			equal &&= a[prop] == b[prop] for own prop of a
			equal &&= a[prop] == b[prop] for own prop of b
			return equal
	
	# Tests: full
	Object.remove = Function.From([String]) \
		(fields...) -> Function.From(Object).To(Object) \
			(source) ->
				obj = {}
				( obj[key] = value unless key in fields ) for own key, value of source
				return obj
	
	# Tests: full	
	Object.project = Function.From([String]) \
		(fields...) -> Function.From(Object).To(Object) \
			(source) ->
				obj = {}
				( obj[key] = value if key in fields ) for own key, value of source
				return obj
	
	# Tests: full	
	Object.rename = Function.From(Object) \
		(renaming) -> Function.From(Object).To(Object) \
			(source) ->
				obj = {}
				( obj[ renaming[key] or key ] = value ) for own key, value of source
				return obj
	
	# Tests: full
	Object.union = Function.From([Object]).To(Object) \
		(first,rest...) ->
			switch arguments.length
				when 1 then first
				when 0 then {}
				else Object.extend Object.copy(first), Object.union rest...
	
	# Tests: full	
	Object.intersection = Function.From([Object]).To(Object) \
		(first,rest...) ->
			switch arguments.length
				when 1 then first
				when 0 then {}
				else Object.project(Object.keys(Object.intersection rest...)...) first
	
	# Tests: full	
	Object.difference = Function.From(Object,Object).To(Object) \
		(a,b) -> Object.remove(Object.keys(b)...) a
		
	Object.join = Function.From(Function) \
		(predicate) -> Function.From([Object]) \
			(objects...) -> Object.union objects... if predicate objects...