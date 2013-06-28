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
			raise: (args...) -> @add Promise.Fulfilled args...
			
			fail: (args...) -> @add Promise.Rejected args...
			
			republish: (eventtype) ->
				@subscribe \
					Function.delegate -> [eventtype,eventtype.raise],
					Function.delegate -> [eventtype,eventtype.fail]
			
