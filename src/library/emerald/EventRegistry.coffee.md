# EventRegistry

		
		window.EventRegistry = class EventRegistry extends Map.To EventType
		
			constructor: (eventtypes=[]) ->
				super eventtypes
				
			register: (args...) -> @add args...
			
			create: Function.Returning(-> new EventType) \
				(eventtype) -> (key) -> @add key, eventtype
			
			subscribe: Function.From(Object) (subscriptions) ->
				@get(name).subscribe(subscriber) for own name, subscriber of subscriptions
			
			republish: Function.From(Object) (publications) ->
				@get(name).republished(eventtype) for own name, eventtype of publications
		
