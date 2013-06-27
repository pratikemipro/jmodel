		window.EventType = class EventType extends Stream.Of Promise
		
			constructor: ->
			
				super()
			
				@subscribers = new (Set.Of Subscriber)
			
				@each (promise) =>
					@subscribers.each ({notify,fail}) ->
						promise.then notify, fail
		
			# Tests: full
			subscribe: Function.delegate -> [ @subscribers, @subscribers.add ]
			
			# Tests: partial
			raise: Function.delegate -> [ this, @add ]
			
			fail: (args...) ->
				promise = new Promise()
				@add promise
				promise.reject args...