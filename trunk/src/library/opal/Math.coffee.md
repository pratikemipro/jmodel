# Math

		
		Math.plus = (a=0,b=0) -> a + b
		Math.plus.unit = 0
		
		Math.sum = (args...) -> args.reduce Math.plus, 0
	
		Math.times = (a=1,b=1) -> a * b
		Math.times.unit = 1
		
		Math.product = (args...) -> args.reduce Math.times, 1
		
