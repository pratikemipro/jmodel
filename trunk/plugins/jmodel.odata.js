/*
 *	jModel OData Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *  Requires jQuery
 *
 */

var metadata;

jModel.plugin.context.fromService = function (url) {
	
	var $       = jQuery,
	    _       = jModel,
	    context = this;
	
	$.get(url+'/$metadata',function (csdl) {
	    
	    metadata = csdl;
		
		$('EntityType:not([BaseType])',csdl).each(function (index,entitytype) {
			registerEntityType(entitytype,_.Base);
		});
		
		function registerEntityType (entitytype,parentConstructor,parentName) {

    	    var name = entityTypeName(entitytype),
    	        entityConstructor = parentConstructor.extend({
        		    has:        fields(entitytype),
        		    hasOne:     relationships(entitytype,csdl,'Dependent'),
        		    hasMany:    relationships(entitytype,csdl,'Principal')
        		}),
        		entityOptions = {
        		    primaryKey: primaryKey(entitytype,csdl)
        		};
        		
        	if ( parentName ) {
        	    entityOptions.parent = parentName;
        	}

    		context.register(name,entityConstructor,entityOptions);
    		
    		$('EntityType[BaseType$=.'+name+']',csdl).each(function (index,entitytype) {
    		    registerEntityType(entitytype,entityConstructor,name);
    		});

    	}
		
	},'xml');
	
	return this;
	
	function entityTypeName (entitytype) {
	    return $(entitytype).attr('Name');
	}
	
	function primaryKey (entitytype,csdl) {
	    while ( $('Key',entitytype).length === 0  ) {
	        entitytype = $('EntityType[Name='+$(entitytype).attr('BaseType').split('.').pop()+']',csdl);
	    }
	    return $('Key PropertyRef',entitytype).attr('Name');
	}
	
	function fields (entitytype) {
		return $('Property',entitytype).map(function (index,property) {
			return {
				accessor: $(property).attr('Name'),
				defaultValue: $(property).attr('Type') == 'Edm.String' ? '' : 0
			};
		}).get();
	}
	
	function relationships (entitytype,csdl,reltype) {
	    return $('Association:has('+reltype+'[Role='+$(entitytype).attr('Name')+'])',csdl).map(function () {
	        return {
	            accessor:   $('NavigationProperty[Relationship$=.'+$(this).attr('Name')+']',entitytype).attr('Name'),
	            prototype:  $(reltype == 'Principal' ? 'Dependent' : 'Principal',this).attr('Role'),
	            field:      $(reltype+' PropertyRef',this).attr('Name')
	        }
	    }).get();
	}

};