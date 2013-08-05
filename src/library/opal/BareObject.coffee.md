# BareObject

		
		Object.from = Function.From(Scalar,Value).Returning(-> new Object) \
			(obj) -> (key,value) -> obj[key] = value
		
		Object.equal = Predicate.From(Object,Object) \
			(a,b) ->
				equal = true
				equal &&= a[prop] == b[prop] for own prop of a
				equal &&= a[prop] == b[prop] for own prop of b
				return equal
		
		Object.remove = Function.From([Scalar]) \
			(fields...) -> Function.From(Object).Returning(-> new Object) \
				(obj) -> (source) ->
					( obj[key] = value unless key in fields ) for own key, value of source
		
		Object.project = Function.From([Scalar]) \
			(fields...) -> Function.From(Object).Returning(-> new Object) \
				(obj) -> (source) ->
					( obj[key] = value if key in fields ) for own key, value of source
		
		Object.rename = Function.From(Object) \
			(renaming) -> Function.From(Object).Returning(-> new Object) \
				(obj) -> (source) ->
					( obj[ renaming[key] or key ] = value ) for own key, value of source
		
		Object.union = Function.overload [
		
			Function.From(Array).Returning(-> new Object) \
				(union) -> (objects) ->
					union[key] = value for own key, value of object for object in objects
				
			Function.From([Object]) (objects...) -> Object.union objects
			
		]
		
		Object.intersection = Function.overload [
		
			Function.From(Array).Returning(-> new Object) \
				(intersection) -> ([first,rest...]) ->
					intersection[key] = value for own key, value of first when rest.all Object.has(key)
						
			Function.From([Object]) (objects...) -> Object.intersection objects
			
		
		]
		
		Object.difference = Function.From(Object,Object).Returning(-> new Object) \
			(difference) -> (first,second) ->
				difference[key] = value for own key, value of first when not second[key]?
		
		Object.join = Function.From(Function) \
			(predicate) -> Function.From([Object]) \
				(objects...) -> Object.union objects... if predicate objects...
				

# Object with defaults

		
		Object.WithDefaults = (defaults) -> (object) -> Object.union defaults, object
		
