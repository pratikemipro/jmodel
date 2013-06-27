# Number

		
		Number.valid = (value) -> Object.isa(Number)(value) and not isNaN value
	

## Restrictions

		
		Number.In = Function.From([Number]).To(Function) (numbers...) ->
			@Where \
				(number) -> number in numbers,
				"Invalid Number: \"<value>\" is not in {#{(number for number in numbers ).join(',')}}"
		
		Number.LessThan = Function.From(Number).To(Function) (max) ->
			@Where Function.lt(max), "Invalid Value: <value> is not less than #{max}"
			
		Number.GreaterThan = Function.From(Number).To(Function) (min) ->
			@Where Function.gt(min), "Invalid Value: <value> is not greater than #{min}"
	
		Number.Between = Function.From(Number,Number).To(Function) (min,max) ->
			@Where Function.between(min,max), "Invalid Value: <value> is not between #{min} and #{max}"
	
		is_integer = (value) -> value == Math.round(value)
	
		window.Integer = Number.Where is_integer, "Invalid Value: <value> is not an integer"
	
		Number.Positive = Number.GreaterThan 0
		Number.Negative = Number.LessThan 0
		
