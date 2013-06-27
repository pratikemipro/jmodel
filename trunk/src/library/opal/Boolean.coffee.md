# Boolean

		
		Boolean.True = -> true
		Boolean.True.valid = Object.isa(Boolean).and (value) -> value
		
		Boolean.False = -> false
		Boolean.False.valid = Object.isa(Boolean).and (value) -> not value
		
	