# Observable

		
		window.Observable = Observable = Function.overload [
		
			Function.From(Value) (constructor) -> throw new Error "Cannot make observable from #{constructor}" 
		
		]
		

## Observable Set

		
		window.Observable = window.Observable.extend [
		
			Function.From(Constructor.Inheriting Set) (constructor) ->
			
				class extends constructor
			
					constructor: (args...) ->
						@events = new EventRegistry ['add','remove','change']
						@event = Function.delegate -> [@events,@events.get]
						super
					
					add: ->
						length = @length
						super
						@event('add').raise @[length] if length != @length
						return this
					
					remove: this::remove.post (removed) ->
						@event('remove').raise(item) for item in removed by -1
		
		]
									

## Observable List

		
		window.Observable = window.Observable.extend [
		
			Function.From(Constructor.Inheriting List) (constructor) ->
			
				class extends constructor
			
					constructor: (args...) ->
						@events = new EventRegistry ['add','change']
						@event = Function.delegate -> [@events,@events.get]
						super
					
					add: this::add.post (list,item) ->
						@event('add').raise(item)
		
		]
						

## Observable Map

		
		window.Observable = window.Observable.extend [
		
			Function.From(Constructor.Inheriting Map) (constructor) ->
			
				class extends constructor
			
					constructor: (args...) ->
						@events = new EventRegistry ['add','remove','change']
						@event = Function.delegate -> [@events,@events.get]
						super
					
					add: this::add.extend [			
						Function.From(Scalar,Value) Function.Chaining (key,value) ->
							value = @ensure value
							@_[key] = value
							@event('add').raise(key,value)
					]
				
					remove: Function.Chaining (key) ->
						if @_[key]?
							delete @_[key]
							@event('remove').raise(key)
		
		]
			
