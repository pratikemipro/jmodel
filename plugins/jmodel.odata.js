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
    	            Plural:     $('EntitySet[EntityType$=.'+$(entitytypeData).attr('Name')+']',schemaData).attr('Name'),
    	            PrimaryKey: $('Key PropertyRef',entitytypeData).attr('Name')
    	        });
    	        
    	        $('Property',entitytypeData).each(function (index,propertyData) {
    	            entitytype.addProperty({
    	                Name: $(propertyData).attr('Name'),
    	                Type: $(propertyData).attr('Type'),
    	                Nullable: $(propertyData).attr('Nullable')
    	            });
    	        });
    	        
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

                    if ( $('EntityType[Name='+principalEntityName+'] NavigationProperty[Relationship$=.'+associationName+']',schemaData).length > 0 ) {
                        principalEntity.addRelationship({
                            Name:       $('EntityType[Name='+principalEntityName+'] NavigationProperty[Relationship$=.'+associationName+']',schemaData).attr('Name'),
                            Singular:   dependentEntityName,
                            Plural:     $('EntityType[Name='+principalEntityName+'] NavigationProperty[Relationship$=.'+associationName+']',schemaData).attr('Name'),
                            Type:       'toMany',
                            ToEntity:   dependentEntityName,
                            Field:      $('Dependent PropertyRef',associationData).attr('Name')
                        });
                    }

                    if ( $('EntityType[Name='+dependentEntityName+'] NavigationProperty[Relationship$=.'+associationName+']',schemaData).length > 0 ) {
                        dependentEntity.addRelationship({
                            Name:       $('EntityType[Name='+dependentEntityName+'] NavigationProperty[Relationship$=.'+associationName+']',schemaData).attr('Name'),
                            Type:       'toOne',
                            ToEntity:   principalEntityName,
                            Field:      $('Dependent PropertyRef',associationData).attr('Name')
                        });
                    }
                    
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

};