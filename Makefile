default:
	@make opal
	@make sapphire
	@make emerald
	@make topaz
	@make library-test
	@make jview

opal:
	coffee --compile --bare --map --join library/opal2.js \
		src/library/opal/header.coffee.md \
		src/library/opal/Array.coffee.md \
		src/library/opal/Function.coffee.md \
		src/library/opal/Object.coffee.md \
		src/library/opal/BareObject.coffee.md \
		src/library/opal/Number.coffee.md \
		src/library/opal/String.coffee.md \
		src/library/opal/Boolean.coffee.md \
		src/library/opal/Math.coffee.md \
		src/library/opal/Nullable.coffee.md \
		src/library/opal/Maybe.coffee.md \
		src/library/opal/Promise.coffee.md
	docco -o documentation/web/src/opal src/library/opal/*.coffee.md

sapphire:
	coffee --compile --bare --map --join library/sapphire2.js \
		src/library/sapphire/header.coffee.md \
		src/library/sapphire/Set.coffee.md \
		src/library/sapphire/List.coffee.md \
		src/library/sapphire/Map.coffee.md \
		src/library/sapphire/Stream.coffee.md
	docco -o documentation/web/src/sapphire src/library/sapphire/*.coffee.md
		
emerald:
	coffee --compile --bare --map --join library/emerald2.js \
		src/library/emerald/header.coffee.md \
		src/library/emerald/Event.coffee.md \
		src/library/emerald/Subscriber.coffee.md \
		src/library/emerald/EventType.coffee.md \
		src/library/emerald/EventRegistry.coffee.md
	docco -o documentation/web/src/emerald src/library/emerald/*.coffee.md
	
topaz:
	coffee --compile --bare --map --join library/topaz2.js \
		src/library/topaz/header.coffee.md
	docco -o documentation/web/src/topaz src/library/topaz/*.coffee.md

library-test:
	coffee --compile --bare --map --join tests/test-library.js \
		src/library/test.header.coffee \
		src/library/opal/Array.test.coffee \
		src/library/opal/Function.test.coffee \
		src/library/opal/Object.test.coffee \
		src/library/opal/BareObject.test.coffee \
		src/library/opal/Number.test.coffee \
		src/library/opal/Boolean.test.coffee \
		src/library/opal/Math.test.coffee \
		src/library/opal/Nullable.test.coffee \
		src/library/opal/Maybe.test.coffee \
		src/library/opal/Promise.test.coffee \
		src/library/sapphire/Set.test.coffee \
		src/library/sapphire/List.test.coffee \
		src/library/sapphire/Map.test.coffee \
		src/library/sapphire/Stream.test.coffee \
		src/library/emerald/Event.test.coffee \
		src/library/emerald/Subscriber.test.coffee \
		src/library/emerald/EventType.test.coffee \
		src/library/emerald/EventRegistry.test.coffee
		
library-doc:
	@make opal-doc
	@make sapphire-doc
	@make emerald-doc
	@make topaz-doc

opal-doc:
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/Array.doc.xml -o:documentation/web/api/opal/Array.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/Function.doc.xml -o:documentation/web/api/opal/Function.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/Object.doc.xml -o:documentation/web/api/opal/Object.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/BareObject.doc.xml -o:documentation/web/api/opal/BareObject.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/Number.doc.xml -o:documentation/web/api/opal/Number.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/String.doc.xml -o:documentation/web/api/opal/String.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/Boolean.doc.xml -o:documentation/web/api/opal/Boolean.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/Math.doc.xml -o:documentation/web/api/opal/Math.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/Nullable.doc.xml -o:documentation/web/api/opal/Nullable.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/Maybe.doc.xml -o:documentation/web/api/opal/Maybe.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal/Promise.doc.xml -o:documentation/web/api/opal/Promise.html
	
sapphire-doc:
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/sapphire/Set.doc.xml -o:documentation/web/api/sapphire/Set.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/sapphire/List.doc.xml -o:documentation/web/api/sapphire/List.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/sapphire/Map.doc.xml -o:documentation/web/api/sapphire/Map.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/sapphire/Stream.doc.xml -o:documentation/web/api/sapphire/Stream.html
	
emerald-doc:
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/emerald/Event.doc.xml -o:documentation/web/api/emerald/Event.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/emerald/EventType.doc.xml -o:documentation/web/api/emerald/EventType.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/emerald/Subscriber.doc.xml -o:documentation/web/api/emerald/Subscriber.html
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/emerald/EventRegistry.doc.xml -o:documentation/web/api/emerald/EventRegistry.html

topaz-doc:
		
jview:
	coffee --compile --bare --map view/cards.coffee