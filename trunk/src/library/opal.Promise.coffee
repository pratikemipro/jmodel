##
## Opal JavaScript Library: Promise
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Promise = class Promise
		
		[PENDING,FULFILLED,REJECTED] = [1..3]
		
		delay = (fn) -> setTimeout fn, 1
		
		fulfil = (promise,fulfilled,value) ->
			delay -> promise.fulfil fulfilled value...
			
		reject = (promise,rejected,reason) ->
			delay -> promise.reject rejected reason
			
		constructor: ->
			
			@status = PENDING
			@value  = undefined
			@reason = undefined
		
			@waiting = []
		
		then: (fulfilled,rejected) ->
			
			if typeof fulfilled != 'function' then fulfilled = ->
			if typeof rejected != 'function' then rejected = ->
			
			promise = new Promise()
				
			switch @status
				when PENDING
					@waiting.push
						promise: promise
						fulfilled: fulfilled
						rejected: rejected
				when FULFILLED
					fulfil promise, fulfilled, @value
				when REJECTED
					reject promise, rejected, @reason
					
			return promise

		# Tests: full
		fulfil: Function.Requiring(-> @status == PENDING) \
			(@value...) ->
				@status = FULFILLED
				for {promise,fulfilled} in @waiting
					fulfil promise, fulfilled, @value
		
		# Tests: full	
		reject: Function.Requiring(-> @status == PENDING) \
			(@reason) ->
				@status = REJECTED
				for {promise,rejected} in @waiting
					reject promise, rejected, @reason
				
		@Of: (cons) ->
			ensure = Object.ensure cons
			class extends this
				fulfil: (args...) -> super ensure args...