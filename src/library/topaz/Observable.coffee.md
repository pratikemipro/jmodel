# Observable

		
		window.Observable = Observable = (constructor) -> switch
		

## Observable Set

			
			when constructor == Set or constructor.inherits Set
			
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
									

## Observable List

			
			when constructor == List or constructor.inherits List
			
				class extends constructor
				
					constructor: (args...) ->
						@events = new EventRegistry ['add','change']
						@event = Function.delegate -> [@events,@events.get]
						super
						
					add: this::add.post (list,item) ->
						@event('add').raise(item)
						

## Observable Map

			
			when constructor == Map or constructor.inherits Map
			
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
