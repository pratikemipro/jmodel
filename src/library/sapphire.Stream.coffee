##
## Sapphire JavaScript Library: Stream
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Stream = class Stream
	
		constructor: ->
			@fns = []
		
		add: (args...) ->
			fn args... for fn in @fns
			this
		
		each: Function.From(Function) \
			(fn) -> @fns.push fn
			
		@Of: Function.From(Function) \
			(cons) ->
				ensure = Object.ensure cons
				class extends this
					add: (args...) -> super ensure args...