# Record

		
		window.Record = class Record
		
			@Of: Function.From(Object) (constructors) -> 
			
				record = class extends this
				
					constructor: (data={}) ->
						@_ = {}
						@_[field] = ensure data[field] for own field, ensure of @ensure
					
					ensure: Object.union \
						( Object.from(field,Object.ensure constructor) for own field, constructor of constructors )
				
				for own field of constructors
					do (field) ->
						record.prototype[field] = Function.switch [
							Type(Function) Function.Chaining (fn) ->
								@_[field] = fn.call this, @_[field]
							Type(Value) Function.Chaining (value) ->
								@_[field] = value
							Type() ->
								@_[field]
						]
				
				return record
					
