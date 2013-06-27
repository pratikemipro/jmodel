# EventRegistry

		
		window.EventRegistry = class EventRegistry extends Map.To EventType
		
			constructor: (eventtypes=[]) ->
				@add eventtype for eventtype in eventtypes
				
			register: (args...) -> @add args...
			
			create: Function.Returning(-> new EventType) \
				(eventtype) -> (key) -> @add key, eventtype
			
			subscribe: Function.From(Object) (subscriptions) ->
				@get(name).subscribe(subscriber) for own name, subscriber of subscriptions
			
			republish: ->
		
