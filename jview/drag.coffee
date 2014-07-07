define (require) ->

	$  = require 'jquery'
	jm = require 'jmodel/emerald'
	
	require 'jmodel-plugins/jquery.emerald'
	
	
	##
	## Source
	##
	
	class Source 
		
		constructor: (element,extractors) ->
			
			@element    = $ element
			@extractors = new jm.List.fromArray extractors
			
			@element
				.attr('draggable',true)
				.event('dragstart').subscribe ({originalEvent:{dataTransfer},target}) =>
					dataTransfer.dropEffect = 'none'
					@extractors.each (extractor) =>
						[type,data] = extractor $ target
						dataTransfer.setData type, (if /json/.test type then JSON.stringify(data) else data)
	
	
	##
	## Target
	##
		
	class Target 
		
		constructor: ({element,types,@effect}) ->
	
			@element = $ element
			@types  = new jm.List.fromArray types
			@events = new jm.EventRegistry 'drop'
			
			# Highlight drag target
			jm.disjoin(
				@element.event('dragenter',preventDefault:true).where( ({originalEvent:{dataTransfer}}) => @accept dataTransfer ).map(-> true)
			 	@element.event('dragleave',preventDefault:true).where( ({originalEvent:{dataTransfer}}) => @accept dataTransfer ).map(-> false)
				@element.event('drop',preventDefault:true).map(-> false)
			)
			.subscribe (state) => 
				@element.toggleClass 'over', state
			
			# Update allowed effect
			@element.event('dragover',preventDefault:true)
				.map ({originalEvent:{dataTransfer}}) -> dataTransfer
				.where (transfer) => @accept transfer
				.subscribe (transfer) =>
					transfer.dropEffect = @effect
					false
			
			# Raise drop event
			@element.event('drop',stopPropagation:true)
				.map ({originalEvent:{dataTransfer}}) -> dataTransfer
				.subscribe (transfer) =>
					@element.removeClass 'over'
					@types.each (type) =>
						datum = transfer.getData type
						if datum != ''
							@event('drop').raise (if /json/.test type then JSON.parse(datum) else datum), type
					false
		
		event: (name) -> @events.get name
		
		accept: (transfer) ->
			@types.exists (type) -> type in transfer.types
		
	
	##
	## Interface
	##
	
	return {
		Source: Source
		Target: Target
	}