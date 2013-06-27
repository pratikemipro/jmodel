# Number

		
		Number.valid = (value) -> Object.isa(Number)(value) and not isNaN value
	

## Restrictions

		
		Number.LessThan = Function.From(Number).To(Function) (max) ->
			@valid = Function.lt max
			@Where @valid, "Invalid Value: <value> is not less than #{max}"
			
		Number.GreaterThan = Function.From(Number).To(Function) (min) ->
			@valid = Function.gt min
			@Where @valid, "Invalid Value: <value> is not greater than #{min}"
	
		Number.Between = Function.From(Number,Number).To(Function) (min,max) ->
			@valid = Function.between min, max
			@Where @valid, "Invalid Value: <value> is not between #{min} and #{max}"
	
		is_integer = (value) -> value == Math.round(value)
	
		window.Integer = Number.Where is_integer, "Invalid Value: <value> is not an integer"
		window.Integer.valid = Object.isa(Number).and is_integer
	
		Number.Positive = Number.GreaterThan 0
		Number.Negative = Number.LessThan 0
		
