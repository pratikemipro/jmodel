BareObject
===
		
		Object.equal = Predicate.From(Object,Object) \
			(a,b) ->
				equal = true
				equal &&= a[prop] == b[prop] for own prop of a
				equal &&= a[prop] == b[prop] for own prop of b
				return equal
		
		Object.remove = Function.From([String]) \
			(fields...) -> Function.From(Object).To(Object) \
				(source) ->
					obj = {}
					( obj[key] = value unless key in fields ) for own key, value of source
					return obj
		
		Object.project = Function.From([String]) \
			(fields...) -> Function.From(Object).To(Object) \
				(source) ->
					obj = {}
					( obj[key] = value if key in fields ) for own key, value of source
					return obj
		
		Object.rename = Function.From(Object) \
			(renaming) -> Function.From(Object).To(Object) \
				(source) ->
					obj = {}
					( obj[ renaming[key] or key ] = value ) for own key, value of source
					return obj
		
		Object.union = Function.From([Object]).Returning(-> new Object) \
			(union) -> (objects...) ->
				union[key] = value for own key, value of object for object in objects
		
		Object.intersection = Function.From([Object]).Returning(-> new Object) \
			(intersection) -> (first={},rest...) ->
				intersection[key] = value for own key, value of first when \
					[true].concat( key in Object.keys(object) for object in rest ).reduce (a,b) -> a and b
		
		Object.difference = Function.From(Object,Object).To(Object) \
			(a,b) -> Object.remove(Object.keys(b)...) Object.copy a
		
		Object.join = Function.From(Function) \
			(predicate) -> Function.From([Object]) \
				(objects...) -> Object.union objects... if predicate objects...
				
