		window.EventType = class EventType extends Stream.Of Promise
		
			constructor: ->
			
				super()
			
				@subscribers = new (Set.Of Subscriber)
			
				@each (promise) =>
					@subscribers.each ({notify,fail}) ->
						promise.then notify, fail
						
			derive: Function.From(Function).Returning(-> new @constructor() ) \
				(child) -> (fn) -> @each (promise) -> promise.then fn.bind child
		
			# Tests: full
			subscribe: Function.delegate -> [ @subscribers, @subscribers.add ]
			
			# Tests: partial
			raise: (args...) -> @add Promise.Fulfilled args...
			
			fail: (args...) -> @add Promise.Rejected args...
			
			republish: (eventtype) ->
				@subscribe \
					Function.delegate -> [eventtype,eventtype.raise],
					Function.delegate -> [eventtype,eventtype.fail]
					
			@Of: Function.Cache.From(Function) (constructor) ->
				type = Promise.Of constructor
				class extends this
					add: Function.Of(type) this::add
					raise: (args...) -> @add type.Fulfilled args...
					fail:  (args...) -> @add type.Rejected args...
			
