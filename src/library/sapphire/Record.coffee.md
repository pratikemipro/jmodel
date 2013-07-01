# Record

		
		window.Record = class Record
		
			@Of: Function.From(Object) (constructors) -> 
			
				record = class extends this
				
					constructor: (data={}) ->
						@_ = {}
						@_[field] = ensure data[field] for own field, ensure of @ensure
						
				ensure = {}
				for own field, constructor of constructors
					ensure[field] = Object.ensure constructor
	 			
	 			record.prototype.ensure = ensure
				
				for own field of constructors		
					do (field) -> record.prototype[field] = -> @_[field] 
				
				return record
					
