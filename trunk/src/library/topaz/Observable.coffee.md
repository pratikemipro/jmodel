# Observable

		
		window.Observable = Observable = (constructor) -> throw "Cannot make observable from #{constructor}"
		

## Observable Set

		
		window.Observable = Observable = do (Observable) -> (constructor) ->
		
			if constructor == Set or constructor.isa Set
			
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
						
			else Observable constructor
									

## Observable List

		
		window.Observable = Observable = do (Observable) -> (constructor) ->

			if constructor == List or constructor.isa List
			
				class extends constructor
				
					constructor: (args...) ->
						@events = new EventRegistry ['add','change']
						@event = Function.delegate -> [@events,@events.get]
						super
						
					add: this::add.post (list,item) ->
						@event('add').raise(item)
						
			else Observable constructor
						

## Observable Map

		
		window.Observable = Observable = do (Observable) -> (constructor) ->
		
			if constructor == Map or constructor.isa Map
			
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
							
			else Observable constructor
			
