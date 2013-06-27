# Stream

		
		window.Stream = class Stream
	
			constructor: ->
				@fns = []
			
			add: Function.Chaining (args...) -> fn args... for fn in @fns
			
			each: Function.From(Function) \
				(fn) -> @fns.push fn
			
			derive: Function.From(Function).Returning(-> new @constructor() ) \
				(child) -> (fn) -> @each fn.bind child
			

# Typed streams

			
			@Of: Function.From(Function) (constructor) ->
				class extends this
					add: Function.Of(constructor) this::add
					

## Derived streams

			
			where: Function.From(Function).To(Stream) \
				(predicate) -> @derive (args...) ->
					@add args... if predicate args...
			
			take: Function.From(Number).To(Stream) \
				(number) -> @where -> number-- > 0
			
			drop: Function.From(Number).To(Stream) \
				(number) -> @where -> --number < 0
			
			transition: Function.To(Stream) \
				-> do (last=undefined) =>
					@where (x) -> last != x and ( ( last = x ) or true )
					
			control: Function.From(Stream).To(Stream) \
				(control) -> do (active=true) =>
					control.each (state) -> active = state
					@where -> active
					
