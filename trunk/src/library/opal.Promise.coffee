##
## Opal JavaScript Library: Promise
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Promise = class Promise
		
		[PENDING,FULFILLED,REJECTED] = [1..3]
		
		constructor: ->
			
			@status = PENDING
			@value  = undefined
			@reason = undefined
		
			@on_fulfil = []
			@on_reject = []
		
		then: (fulfilled,rejected) ->
			
			if typeof fulfilled != 'function' then fulfilled = ->
			if typeof rejected != 'function' then rejected = ->
			
			delay = (fn) -> setTimeout fn, 1
				
			switch @status
				when PENDING
					@on_fulfil.push fulfilled
					@on_reject.push rejected
				when FULFILLED
					promise = new Promise()
					delay => promise.fulfil fulfilled @value...
					return promise
				when REJECTED
					promise = new Promise()
					delay => promise.reject rejected @reason
					return promise

		fulfil: Function.Requiring(-> @status == PENDING) \
			(@value...) ->
				@status = FULFILLED
				@then fulfilled, undefined for fulfilled in @on_fulfil
			
		reject: Function.Requiring(-> @status == PENDING) \
			(@reason) ->
				@status = REJECTED
				@then undefined, rejected for rejected in @on_reject
				
		@Of: (cons) ->
			ensure = Object.ensure cons
			class extends this
				fulfil: (args...) -> super ensure args...