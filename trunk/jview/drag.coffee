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
						dataTransfer.setData type, (if /json/.test type then JSON.stringify data else data)
	
	
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
				@element.event('dragenter',preventDefault:true).where(@accept).map(-> true)
			 	@element.event('dragleave',preventDefault:true).where(@accept).map(-> false)
				@element.event('drop',preventDefault:true).map(-> false)
			)
			.subscribe (state) => 
				@element.toggleClass 'over', state
			
			# Update allowed effect
			@element.event('dragover',preventDefault:true)
				.where(@accept)
				.subscribe ({originalEvent:{dataTransfer}}) ->
					dataTransfer.dropEffect = @effect
					false
			
			# Raise drop event
			@element.event('drop',stopPropagation:true)
				.where(@accept)
				.subscribe ({originalEvent:{dataTransfer}}) =>
					@element.removeClass 'over'
					data = new jm.Map()
					@types.each (type) =>
						datum = dataTransfer.getData type 
						@event('drop').raise (if /json/.test type then JSON.parse datum else datum), type
					false
		
		event: (name) -> @events.get name
		
		accept: ({originalEvent:{dataTransfer:{types:[type]}}}) => return true; @types.first Object.eq type
		
	
	##
	## Interface
	##
	
	return {
		Source: Source
		Target: Target
	}