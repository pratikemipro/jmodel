##
## Opal JavaScript Library: Promise
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Promise = class Promise
		
		[PENDING,FULFILLED,REJECTED] = [0..2]
		
		on_fulfill = []
		on_reject  = []
		
		status = PENDING
		value  = undefined
		reason = undefined
		
		constructor: ->
			@status = PENDING
		
		then: (fulfilled,rejected) ->
			if typeof fulfilled != 'function' then fulfilled = ->
			if typeof rejected != 'function' then rejected = ->
			switch @status
				when PENDING
					on_fullfill.add fulfilled
					on_reject.add rejected
				when FULFILLED
					setTimeout (-> fulfilled @value...), 1
				when REJECTED
					setTimeout (-> rejected @reason), 1

		fulfill: Function.Requiring(-> @status == PENDING) \
			(@value...) ->
				@status = FULFILLED
				fulfilled @value... for fulfilled in @on_fulfill
			
		reject: Function.Requiring(-> @status == PENDING) \
			(@reason) ->
				@status = REJECTED
				rejected @reason for rejected in @on_reject