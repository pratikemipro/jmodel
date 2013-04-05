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
		
		chain = (promise,fn,value) -> delay ->
			try
				ret = fn value...
				promise.fulfil ret
			catch reason
				promise.reject reason
			
		constructor: ->
			
			@status = PENDING
			@value  = undefined
			@reason = undefined
		
			@waiting = []
		
		then: (fulfilled,rejected) ->
			
			promise = new Promise()
			
			if typeof fulfilled != 'function' then fulfilled = (value...) -> value
			if typeof rejected != 'function' then rejected = (reason) -> reason
				
			switch @status
				when PENDING
					@waiting.push
						promise: promise
						fulfilled: fulfilled
						rejected: rejected
				when FULFILLED
					chain promise, fulfilled, @value
				when REJECTED
					chain promise, rejected, [@reason]
					
			return promise

		# Tests: full
		fulfil: Function.Requiring(-> @status == PENDING) \
			(@value...) ->
				@status = FULFILLED
				for {promise,fulfilled} in @waiting
					chain promise, fulfilled, @value
		
		# Tests: full	
		reject: Function.Requiring(-> @status == PENDING) \
			(@reason) ->
				@status = REJECTED
				for {promise,rejected} in @waiting
					chain promise, rejected, [@reason]
				
		@Of: (cons) ->
			ensure = Object.ensure cons
			class extends this
				fulfil: (args...) -> super ensure args...