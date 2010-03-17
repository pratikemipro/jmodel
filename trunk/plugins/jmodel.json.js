/*
 *	jModel JSON Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

jModel.json = function () {

	var _ = jModel;

	function makeObject (key,data,parent,context) {

//		log('json/thaw').startGroup('thawing '+key);

		var partitionedData = partitionObject(data,_.TypePredicate('object'),'children','fields');

		var object;
		if ( parent && parent.relationships && parent.relationships(key) ) {
//			log('json/thaw').debug('adding object to relationship');
			object = parent.relationships(key).add(partitionedData.fields);
		}
		else {
			if ( context.entities.get(key) ) {
//				log('json/thaw').debug('creating free object');
				object = context.entities.get(key).create(partitionedData.fields);
			}
			else {
//				log('json/thaw').debug('unknown entity type: '+key);
			}
		}

		for ( var childKey in partitionedData.children ) {
		    if ( childKey != '__metadata' && childKey != '__deferred' ) {
		        var childData = partitionedData.children[childKey];
   				childData = ( childData instanceof Array ) ? childData : [childData];
   				for ( var i=0; i<childData.length; i++) {
   				    if ( !(childData[i] && childData[i].__deferred) ) {
   				        makeObject(childKey,childData[i],object||parent,context);
   				    }
   				}
		    }
		} 

//		log('json/thaw').endGroup();

	}
	
	
	function partitionObject (object,predicate,passName,failName) {
		return partition( object, predicate, passName, failName, Object, function (destination,index,object) {
			destination[index] = object;
		});
	}
	
	
	function partition (source,predicate,passName,failName,constructor,add) {
		var partition = {};
		var pass = partition[passName||'pass'] = new constructor();
		var fail = partition[failName||'fail'] = new constructor();
		for (var i in source) {
			var candidate = source[i];
			if ( predicate(candidate) ) {
				add(pass,i,candidate);
			}
			else {
				add(fail,i,candidate);
			}
		}
		return partition;
	}


	return {

		thaw: 	function _thaw (context,data,options,baseType) {
					options = options || {};
				//	data = ( data instanceof Array ) ? data : [data];
					for ( var i in data ) {
						for ( var key in data[i] ) {
							makeObject(baseType || key,data[i][key],options.parent,context);
						}
					}
					return _.json;
				}

	};


}();