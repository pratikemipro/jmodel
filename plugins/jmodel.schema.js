/*
 *	jModel Schema Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

 (function () {

 	var _ 		= jModel,
 		plugin	= _.plugin;

 	var schemaContext = _.contexts.create('schema');
 	
 	
 	schemaContext.register('Schema', _.Base.extend({

        has:    [	
                    {	accessor: 'Namespace',		defaultValue: ''	}
                ],
       	
       	hasMany: [  
       	            {	accessor:       'EntityType',
       			        prototype:      'EntityType',
       			        relativeKey:    'Name'  	}
       			]

    }), {
    	primaryKey: 'Namespace',
    	generateKeys: false,
    	base: true
    });
    
    schemaContext.register('EntityType', _.Base.extend({

        has:    [  
                    {	accessor: 'Name',		defaultValue: ''	    },
                    {   accessor: 'Plural',     defaultValue: undefined },
                    {   accessor: 'PrimaryKey', defaultValue: ''        }
                ],
                
        hasOne:     [
                        {   accessor: 'BaseType',
                            prototype: 'EntityType' }
                    ],
                
        hasMany:    [
                        {   accessor:       'Property',
                            plural:         'Properties',
                            prototype:      'Property',
                            relativeKey:    'Name'          },
                            
                        {   accessor:       'Relationship',
                            prototype:      'Relationship',
                            relativeKey:    'Name'          },
                            
                        {   accessor:       'DerivedType',
                            prototype:      'EntityType',
                            relativeKey:    'Name'          }
                    ]

    }), {
        nameField: 'Name',
        relativeKey: 'Name',
    	generateKeys: false,
    	base: true
    });
    
    schemaContext.register('Property', _.Base.extend({

        has:    [  
                    {	accessor: 'Name',		defaultValue: ''	        },
                    {   accessor: 'Type',       defaultValue: 'Edm.Int32'   },
                    {   accessor: 'Nullable',   defaultValue: true          }
                ]

    }), {
        plural: 'Properties',
        nameField: 'Name',
        relativeKey: 'Name',
    	generateKeys: false,
    	base: true
    });
 	
 	schemaContext.register('Relationship', _.Base.extend({

        has:    [  
                    {	accessor: 'Name',		defaultValue: ''	        },
                    {   accessor: 'Singular',   defaultValue: undefined     },
                    {   accessor: 'Plural',     defaultValue: undefined     },
                    {   accessor: 'Type',       defaultValue: 'toMany'      },
                    {   accessor: 'ToEntity',   defaultValue: ''            },
                    {   accessor: 'Field',      defaultValue: ''            }
                ]

    }), {
        nameField: 'Name',
        relativeKey: 'Name',
    	generateKeys: false,
    	base: true
    });
    
    
    schemaContext.Schemas().event('add').map('object').subscribe(function (schema) {
        schema.EntityTypes().event('add').map('object').subscribe(function (entityType) {
            entityType.DerivedTypes().event('add').map('object').subscribe(function (derivedType) {
                derivedType.addBaseType(entityType);
                schema.addEntityType(derivedType);
            });
        });
    });
    
    
    plugin.context.withSchema = function (namespace) {
        
        var applicationContext  = this,
            schema = schemaContext.createSchema({
                Namespace: namespace
            });
        
        schema.EntityTypes().event('add').map('object').subscribe(function (entitytype) {
    	    var cons = entitytype.BaseType() ? applicationContext.entities.get(entitytype.BaseType().Name()).constructor : _.Base;
    	    applicationContext.register(
    	        entitytype.Name(),
    	        cons.extend({ has:[], hasOne:[], hasMany:[] }),
    	        {
    	            plural: entitytype.Plural(),
    	            primaryKey: entitytype.PrimaryKey(),
    	            parent: entitytype.BaseType() ? entitytype.BaseType().Name() : null
    	        }
    	    );
    	});

    	applicationContext.entities.event('add').map('object').subscribe(function (entitytype) {
    	    
    	    schema.EntityTypes(entitytype.name).Properties().event('add').map('object').subscribe(function (property) {
    	        entitytype.addProperty({
    	            accessor: property.Name()
    	        });
    	    });

    	    schema.EntityTypes(entitytype.name).Relationships().event('add').map('object').subscribe(function (relationship) { 
    	        
    	        var specification = {
    	                accessor: relationship.Name(),
    	                singular: relationship.Singular(),
    	                plural: relationship.Plural(),
                		prototype: relationship.ToEntity(),
                		field: relationship.Field()
    	            };
    	        
    	        if ( relationship.Type() === 'toOne' ) {
    	            entitytype.addOneToOneRelationship(specification);
    	        }
    	        else {
    	            entitytype.addOneToManyRelationship(specification);
    	        }
    	        
    	    });

    	});
    	
    	return this;
        
    };
    
    
    plugin.entitytype.addProperty = function (specification) {
        this.constructor.prototype.has.push(specification);
    };
    
    plugin.entitytype.addOneToOneRelationship = function (specification) {
        this.constructor.prototype.hasOne.push(specification);
    };
    
    plugin.entitytype.addOneToManyRelationship = function (specification) {
        this.constructor.prototype.hasMany.push(specification);
    };
  	
 	
     plugin.entitytype.pushOneToManyRelationship = function (accessor) {

        var relationships = this.constructor.prototype.hasMany,
            context = this.context,
            entitytype = this;

        var foundIndex = relationshipIndex(accessor,relationships);
        if ( foundIndex ) {
            var specification = relationships[foundIndex];
            return {
                to: function (entityTypeName,relationshipName) {
                    var targetEntity = context.entity(entityTypeName);
              //      removeRelationship(specification.accessor,targetEntity.options.parent);
                    if ( relationshipName ) {
                        specification.accessor = relationshipName;
                    }
                    targetEntity.constructor.prototype.hasMany.push(specification);
                    return entitytype;
                }
            };
        } else {
            return false;
        }

        function relationshipIndex (accessor,relationships) {
            for ( index in relationships ) {
                if ( relationships[index].accessor === accessor ) {
                    foundIndex = index;
                    break;
                }
            }
            return foundIndex;
        }

        function removeRelationship (accessor,entityName) {
            while ( entityName ) {
                var entity = context.entity(entityName),
                    relationships = entity.constructor.prototype.hasMany;
                relationships.splice(relationshipIndex(accessor,relationships),1);
                entityName = entity.options.parent;
            }

        }

    };
 		
})();