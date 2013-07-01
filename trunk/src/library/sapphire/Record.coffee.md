# Record

		
		window.Record = class Record
		
			@Of: Function.From(Object) (constructors) ->
				class extends this
					constructor: ->