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
		
		# Tests: full
		add: Function.Chaining (args...) -> fn args... for fn in @fns
		
		# Tests: full
		each: Function.From(Function) \
			(fn) -> @fns.push fn
			
		derive: Function.Returning(-> new @constructor() ) \
			(child) -> (fn) -> @each fn.bind child
		
		# Tests: full	
		where: Function.From(Function).To(Stream) \
			(predicate) -> @derive (args...) ->
				@add args... if predicate args...
		
		# Tests: full
		take: Function.From(Number).To(Stream) \
			(number) -> @where -> number-- > 0
		
		# Tests: full
		drop: Function.From(Number).To(Stream) \
			(number) -> @where -> --number < 0
			
		# Tests: full
		transition: Function.To(Stream) \
			-> do (last=undefined) =>
				@where (x) -> last != x and ( ( last = x ) or true )
				
		# Tests: full	
		@Of: Function.From(Function) \
			(cons) ->
				ensure = Object.ensure cons
				class extends this
					add: (args...) -> super ensure args...