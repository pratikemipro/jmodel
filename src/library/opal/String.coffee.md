# String


		
		String.concat = Function.From([String]).To(String) \
			(first='',rest...) -> first.concat rest...
		
		String.concat.unit = ''

## Restrictions

		String.In = Function.From([String]).To(Function) (strings...) ->
			@Where \
				(str) -> str in strings,
				"Invalid String: \"<value>\" is not in {#{( '\"'+string+'\"' for string in strings ).join(',')}}"
				
		String.Matching = Function.From(RegExp).To(Function) (regex) ->
			@Where \
				(str) -> regex.test str,
				"Invalid String: \"<value>\" does not match #{regex.toString()}"
				
