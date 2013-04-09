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
			
		derive: Function.From(Function).To(Stream) \
			(fn) ->
				child = new this.constructor()
				@each fn.bind child
				return child
			
		where: Function.From(Function).To(Stream) \
			(predicate) -> @derive (args...) ->
				@add args... if predicate args...
		
		take: Function.From(Number).To(Stream) \
			(number) -> @derive (args...) ->
				@add args... if number-- > 0
		
		drop: Function.From(Number).To(Stream) \
			(number) -> @derive (args...) ->
				@add args... if --number < 0
			
		@Of: Function.From(Function) \
			(cons) ->
				ensure = Object.ensure cons
				class extends this
					add: (args...) -> super ensure args...