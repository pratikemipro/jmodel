###

	OPAL Javascript Library
	http://code.google.com/p/jmodel/
	
	Copyright (c) 2009-2012 Richard Baker
	Dual licensed under the MIT and GPL licenses

###


define ['cs!jmodel/opal.Function'], ->


	# Turn on strict mode in modern browsers
	'use strict'

	opal = opal_version: '0.22.0'
	
	# Cross-browser assertions
	assert =
		if window.console?.assert? then (condition,message) -> window.console.assert(condition,message)
		else (condition,message) -> throw "Opal exception: #{message}" unless condition


	###
		Utility functions
	###
	
	Object.extend ?= (target,source) ->
		target[key] = value for key, value of source
		target
	
	type = (object) -> typeof object
	
	delegateTo = (context,methodName) -> (args...) -> context[methodName].apply(context,args)

	Object.extend opal,
		type: type
		assert: assert
		delegateTo: delegateTo
#		copy: copy
	

	###
		Object
	###
	
	Object.extend Object,
	
		# Construction
	
		# NOTE: Test this thoroughly
		construct: (constructor,args1...) ->
			if      constructor == String then String
			else if constructor == Number then Number
			else if constructor == Boolean then Boolean
			else if constructor.nullable? then constructor
			else (args2...) -> new constructor (args1.concat(args2))...
			
		ensure: (constructor,args1) ->
			if constructor == String
				(value) -> String value unless typeof value == 'string'
			else if constructor == Number
				(value) -> Number value unless typeof value == 'number'
			else if constructor == Boolean
				(value) -> Boolean value unless typeof value == 'boolean'
			else if constructor.nullable?
				(args...) ->
					if args.length == 1 and ( args[0] == null or args[0] == undefined ) then null
					else new constructor (args1.concat(args2))...
			else
				(args2...) -> new constructor (args1.concat(args2))... unless object instanceof constructor


	opal.eq = (n) -> (x) -> n == x

	return opal