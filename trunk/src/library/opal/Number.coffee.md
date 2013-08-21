# Number

		
		Number.valid = (value) -> Object.isa(Number)(value) and not isNaN value
		
		Number::equals = Function.From(Number) (x) -> Number(this) == Number(x)
		
		Number::plus= Function.From(Number) (x) -> this + x
		
		Number::minus = Function.From(Number) (x) -> this - x
		
		Number::times = Function.From(Number) (x) -> this * x
		
		Number::div =  Function.From(Number) (x) -> this / x
		
		Number::mod =  Function.From(Number)  (x) -> this % x
		
	

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
		
		Number.Integer = Number.Where ( (value) -> value == Math.round value ), "Invalid Value: <value> is not an integer"
	
		Number.Positive = Number.GreaterThan 0
		Number.Negative = Number.LessThan 0
		
		Number.Odd  = Number.Integer.Where ( (number) -> number % 2 == 1 ), "Invalid Value: <value> is not odd"
		Number.Even = Number.Integer.Where ( (number) -> number % 2 == 0 ), "Invalid Value: <value> is not even"
		
