define (require) ->

	$ = require 'jquery'
	require 'jmodel/emerald2'
	
	EventType.fromAjax = (args...) -> new AjaxEventType args...
	
	window.AjaxEventType = class AjaxEventType extends EventType
		
		constructor: (@descriptor={},settings) ->
			
			super()
			
##			@descriptor = Object.copy descriptor
			
			if typeof settings == 'object'
				@descriptor.settings = settings
				
			@descriptor.success = (args...) => @raise.call this, args..., @descriptor...
			
			@descriptor.error = (args...) => @fail.call this, args..., @descriptor...
			
			@descriptor.beforeSend = (xhr,settings) ->
				$.ajaxSettings?.beforeSend? xhr, settings
				if settings.type not in ['GET','POST']
					xhr.setRequestHeader 'X-HTTP-METHOD', settings.type
					settings.type = 'POST'
				
			# Object.extend @descriptor,
			# 	success: (args...) => @raise.call this, args..., @descriptor...
			# 	error: (args...) => @fail.call this, args..., @descriptor...
			# 	beforeSend: (xhr,settings) ->
			# 		$.ajaxSettings?.beforeSend? xhr, settings
			# 		if settings.type not in ['GET','POST']
			# 			xhr.setRequestHeader 'X-HTTP-METHOD', settings.type
			# 			settings.type = 'POST'
			
			@descriptor.immediate ?= true
			@remember = @descriptor.remember ? 1
			
			this.start() if @descriptor.immediate

		start: Function.Chaining (data={}) ->
			@stop() if @descriptor.singleton
			@descriptor.data = Object.extend ( @descriptor.data ? {} ), data
			@__ajax = $.ajax.call null, @descriptor
			
		stop: Function.Chaining -> @__ajax?abort?()