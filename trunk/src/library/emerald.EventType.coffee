##
## Emerald JavaScript Library: EventType
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.EventType = class EventType extends Stream.Of Promise
		
		constructor: ->
			
			super()
			
			@subscribers = new (Set.Of Subscriber)
			
			@each (promise) =>
	 			@subscribers.each (subscriber) ->
					promise.then subscriber.notify, subscriber.fail
		
		# Tests: full
		subscribe: (args...) -> @subscribers.add args...
			
		raise: (args...) -> @add args...
			
		fail: (args...) ->
			promise = new Promise()
			@add promise
			promise.reject args...
			