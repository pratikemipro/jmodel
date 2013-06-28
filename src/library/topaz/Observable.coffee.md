# Observable

		
		window.Observable = Observable = (constructor) -> switch
		

## Observable Set

			
			when constructor == Set or constructor.inherits Set
			
				class extends constructor
				
					constructor: (args...) ->
						events = new EventRegistry ['add','remove','replace','change']
						@event = Function.delegate -> [events,events.get]
						super
						
					add: ->
						length = @length
						super
						@event('add').raise @[length] if length != @length
						return this
						
					remove: this::remove.post (removed) ->
						@event('remove').raise(item) for item in removed by -1
									
