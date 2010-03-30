/*
 *	jModel OData Plugin v0.1.1
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *  Requires jQuery
 *
 */

jModel.plugin.context.fromService = function (url, callback) {
	
	var $                   = jQuery,
	    _                   = jModel,
	    applicationContext  = this,
	    schemaContext       = _.contexts('schema');
	
	//
	// Populate schema context from service metadata
	//
	
	$.get(url+'/$metadata',function (csdl) {
	    
	    $('Schema',csdl).each(function (index,schemaData) {
	        
	        var schema = schemaContext.Schema($(schemaData).attr('Namespace'));
	        if ( !schema ) {
	            schema = schemaContext.createSchema({
    	            Namespace: $(schemaData).attr('Namespace')
    	        });
	        }
	        
	        $('EntityType',schemaData).each(function (index,entitytypeData) {
	            
    	        var entitytype = schema.addEntityType({
    	            Name:       $(entitytypeData).attr('Name'),
    	            PrimaryKey: $('Key PropertyRef',entitytypeData).attr('Name')
    	        });
    	        
    	        $('Property',entitytypeData).each(function (index,propertyData) {
    	            entitytype.addProperty({
    	                Name: $(propertyData).attr('Name'),
    	                Type: $(propertyData).attr('Type')
    	            });
    	        });
    	        
 /*   	        $('NavigationProperty',entitytypeData).each(function (index,relationshipData) {
    	            var association = $('Association[Name='+$(relationshipData).attr('Relationship').split('.').pop()+']',schemaData)
    	            entitytype.addRelationship({
    	                Name:       $(relationshipData).attr('Name')
    	                Type:       $
    	                ToEntity:   
    	                Field:      
    	            });
    	        }); */
    	        
    	    });
    	    
    	    $('Association',schemaData).each(function (index,associationData) {
    	        
                var associationName     = $(associationData).attr('Name'),
                    principalRole       = $('Principal',associationData).attr('Role'),
                    dependentRole       = $('Dependent',associationData).attr('Role');
                
                if ( $('Principal',associationData).length === 0 ) {
                    return false; // Many-to-many relationships are not currently supported
                }
                else {
                    
                    var principalEntityName = $('End[Role='+principalRole+']',associationData).attr('Type').split('.').pop(),
                        dependentEntityName = $('End[Role='+dependentRole+']',associationData).attr('Type').split('.').pop(),
                        principalEntity     = schema.EntityType(principalEntityName),
                        dependentEntity     = schema.EntityType(dependentEntityName);

                    principalEntity.addRelationship({
                        Name:       $('EntityType[Name='+principalEntityName+'] NavigationProperty[Relationship$=.'+associationName+']',schemaData).attr('Name'),
                        Type:       'toMany',
                        ToEntity:   dependentEntityName,
                        Field:      $('Principal PropertyRef',associationData).attr('Name')
                    });

                    dependentEntity.addRelationship({
                        Name:       $('EntityType[Name='+dependentEntityName+'] NavigationProperty[Relationship$=.'+associationName+']',schemaData).attr('Name'),
                        Type:       'toOne',
                        ToEntity:   principalEntityName,
                        Field:      $('Dependent PropertyRef',associationData).attr('Name')
                    });
                    
                }
                
    	    });
    	    
	        
	    });
		
/*		$('EntityType:not([BaseType])',csdl).each(function (index,entitytype) {
			registerEntityType(entitytype,_.Base);
		}); */
		
		if ( typeof callback === 'function' ) {
			callback();
		}
		
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
	        };
	    }).get();
	}

};