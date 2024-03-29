# JMPromise

		
		window.JMPromise = class JMPromise
		
			[PENDING,FULFILLED,REJECTED] = [1..3]
		
			delay = (fn) -> setTimeout fn, 0
		
			chain = (promise,fn,value) -> delay ->
				try
					ret = fn.call value[0], value...
					promise.fulfil ret
				catch reason
					promise.reject reason
			
			constructor: (args...) ->
			
				@status = PENDING
				@value  = undefined
				@reason = undefined
		
				@waiting = []
			
				@fulfil args... if args.length > 0
		
			then: (fulfilled,rejected) ->
			
				promise = new @constructor()
			
				if typeof fulfilled != 'function' then fulfilled = Function.arguments
				if typeof rejected != 'function' then rejected = Function.identity
				
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
			

# Pre-resolved JMPromises

			
			@Fulfilled: Function.Returning(-> new this ) \
				(promise) -> (args...) -> promise.fulfil args...
				
			@Rejected: Function.Returning(-> new this ) \
				(promise) -> (args...) -> promise.reject args...
			

# Typed JMPromises

				
			@Of: Function.Cache.From(Function).To(Function) (constructor) ->
				class extends this
					fulfil: Function.Of(constructor) this::fulfil
			

# JMPromise combinators

				
			@conjoin: Function.From([JMPromise]).Returning(-> new this) \
				(conjunction) -> (promises...) ->
					
					completed = ->
						if promises.none( -> @status == PENDING )
							conjunction.fulfil promises.map( ({value:[ret]}) -> ret)...
					
					promises.each (promise) -> @then completed, completed
						
					
			
			@disjoin: Function.From([JMPromise]).Returning(-> new this ) \
				(disjunction) -> (promises...) ->
					[fulfil,reject] = Function.delegates -> [ disjunction, disjunction.fulfil, disjunction.reject ]
					promises.each -> @then fulfil, reject
							
