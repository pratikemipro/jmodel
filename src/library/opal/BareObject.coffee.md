# BareObject

		
		Object.from = Function.From(Value,Value).Returning(-> new Object) \
			(obj) -> (key,value) -> obj[key] = value
		
		Object.equal = Predicate.From(Object,Object) \
			(a,b) ->
				equal = true
				equal &&= a[prop] == b[prop] for own prop of a
				equal &&= a[prop] == b[prop] for own prop of b
				return equal
		
		Object.remove = Function.From([String]) \
			(fields...) -> Function.From(Object).Returning(-> new Object) \
				(obj) -> (source) ->
					( obj[key] = value unless key in fields ) for own key, value of source
		
		Object.project = Function.From([String]) \
			(fields...) -> Function.From(Object).Returning(-> new Object) \
				(obj) -> (source) ->
					( obj[key] = value if key in fields ) for own key, value of source
		
		Object.rename = Function.From(Object) \
			(renaming) -> Function.From(Object).Returning(-> new Object) \
				(obj) -> (source) ->
					( obj[ renaming[key] or key ] = value ) for own key, value of source
		
		Object.union = Function.switch [
		
			Type(Array) Function.Returning(-> new Object) \
				(union) -> (objects) ->
					union[key] = value for own key, value of object for object in objects
				
			Type([Object]) (objects...) -> Object.union objects
			
		]
		
		Object.intersection = Function.switch [
		
			Type(Array) Function.Returning(-> new Object) \
				(intersection) -> ([first,rest...]) ->
					intersection[key] = value for own key, value of first when \
						[true].concat( key in Object.keys(object) for object in rest ).reduce (a,b) -> a and b
						
			Type([Object]) (objects...) -> Object.intersection objects
			
		
		]
		
		Object.difference = Function.From(Object,Object).Returning(-> new Object) \
			(difference) -> (first,second) ->
				difference[key] = value for own key, value of first when not second[key]?
		
		Object.join = Function.From(Function) \
			(predicate) -> Function.From([Object]) \
				(objects...) -> Object.union objects... if predicate objects...
				
