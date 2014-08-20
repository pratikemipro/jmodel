# Nullable

		
		window.Nullable = Function.Cache.From(Function) (constructor) ->
			construct = Object.construct constructor
			(x) ->
				if arguments.length == 1 and x == null then null
				else construct arguments...
				
