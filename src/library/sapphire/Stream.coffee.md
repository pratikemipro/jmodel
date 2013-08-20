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

			
			map: Function.From(Function).To(Stream) \
				(fn) -> @derive (args...) -> @add fn args...
			
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
					control.each Function.Of(Boolean) (state) -> active = state
					@where -> active
					
			between: Function.From(Stream,Stream).To(Stream) \
				(start,stop) ->
					@control Stream.disjoin \
						start.map(Boolean.True),
						stop.map(Boolean.False)
						
			accumulate: Function.From(Function,Maybe Value).To(Stream) \
				(reduction,initial=reduction.unit) -> do (acc=initial) =>
					@derive (args...) ->
						@add acc = reduction.apply this, [acc,args...]
						

## Stream combinators

			
			@disjoin: Function.From([Stream]).Returning(-> new Stream) \
				(disjunction) -> (streams...) ->
					for stream in streams
						stream.each (args...) -> disjunction.add args...
					