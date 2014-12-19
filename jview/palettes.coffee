define 'jview/palettes', (require) ->
	
	$	= require 'jquery'
	jm	= require 'jmodel/topaz'
	
	require 'jmodel-plugins/jquery.emerald'
	
	class Palettes
	
		constructor: (dl,@parameters,@constructors) ->
			
			@dl = $ dl
			@dt = @dl.children 'dt'
			
			@state = new jm.ObservableObject
				current: Number,
				open: Boolean(false)
				{repeat: true}
			
			@palettes = for className, constructor of @constructors
				dd = @dl.children('dd').filter(className)
				dt = dd.prev('dt')
				new constructor dt, dd, this
			
			@dt.event('click')
				.map( ({target}) => Math.floor $(target).index() / 2 )
				.subscribe (index) =>
					@state.current index
					@state.open (x) -> !x
				
			@state.event('open').subscribe (open) =>
				@dt.each (index,element) =>
					if index != @state.current() then $(element).removeClass 'open' else $(element).toggleClass 'open', open
				
				
	return {
		Palettes: Palettes
	}