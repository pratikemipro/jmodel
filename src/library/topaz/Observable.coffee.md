# Observable

		
		window.Observable = Observable = (constructor) -> switch
		
			when constructor == Set or constructor.inherits Set
			
				class extends constructor
				
					constructor: (args...) ->
						super
						@events = new EventRegistry ['add','remove','replace','change']
						# @event = Function.delegate -> [@events,@events.get]
						
					add: ->
						length = @length
						super
						@event('add').raise @[@length] if length != @length
						
