		String.In = (strings...) ->
			@Where \
				(str) -> str in strings,
				"Invalid String: \"<value>\" is not in {#{( '\"'+string+'\"' for string in strings ).join(',')}}"

		String.Matching = (regex) ->
			@Where \
				(str) -> regex.test str,
				"Invalid String: \"<value>\" does not match #{regex.toString()}"