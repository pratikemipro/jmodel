# Boolean

		
		Boolean.True = -> true
		Boolean.True.valid = Object.isa(Boolean).and (value) -> value
		
		Boolean.False = -> false
		Boolean.False.valid = Object.isa(Boolean).and (value) -> not value
		
		Boolean.and = (a,b) -> a and b
		Boolean.and.unit = true
		
		Boolean.or = (a,b) -> a or b
		Boolean.or.unit = false
		
		Boolean.xor = (a,b) -> (a and not b) or (b and not a)
		
		Boolean.not = (a) -> not a
		
