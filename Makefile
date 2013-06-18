default:
	@make opal
	@make opal-doc
	@make sapphire
	@make emerald
	@make library-test
	@make jview

opal:
	coffee --compile --bare --map --join library/opal2.js \
		src/library/opal.header.coffee \
		src/library/opal.Array.coffee \
		src/library/opal.Function.coffee \
		src/library/opal.Object.coffee \
		src/library/opal.BareObject.coffee \
		src/library/opal.Number.coffee \
		src/library/opal.String.coffee \
		src/library/opal.Boolean.coffee \
		src/library/opal.Math.coffee \
		src/library/opal.Nullable.coffee \
		src/library/opal.Maybe.coffee \
		src/library/opal.Promise.coffee

opal-doc:
	saxon -strip:all -xsl:documentation/documentation.xsl -s:src/library/opal.Function.doc.xml -o:documentation/web/opal/Function.html

sapphire:
	coffee --compile --bare --map --join library/sapphire2.js \
		src/library/sapphire.header.coffee \
		src/library/sapphire.Set.coffee \
		src/library/sapphire.List.coffee \
		src/library/sapphire.Map.coffee \
		src/library/sapphire.Stream.coffee
		
emerald:
	coffee --compile --bare --map --join library/emerald2.js \
		src/library/emerald.header.coffee \
		src/library/emerald.Subscriber.coffee \
		src/library/emerald.EventType.coffee

library-test:
	coffee --compile --bare --map --join tests/test-library.js \
		src/library/test.header.coffee \
		src/library/opal.Array.test.coffee \
		src/library/opal.Function.test.coffee \
		src/library/opal.Object.test.coffee \
		src/library/opal.BareObject.test.coffee \
		src/library/opal.Number.test.coffee \
		src/library/opal.Boolean.test.coffee \
		src/library/opal.Math.test.coffee \
		src/library/opal.Nullable.test.coffee \
		src/library/opal.Maybe.test.coffee \
		src/library/opal.Promise.test.coffee \
		src/library/sapphire.Set.test.coffee \
		src/library/sapphire.List.test.coffee \
		src/library/sapphire.Map.test.coffee \
		src/library/sapphire.Stream.test.coffee \
		src/library/emerald.Subscriber.test.coffee \
		src/library/emerald.EventType.test.coffee
		
jview:
	coffee --compile --bare --map view/cards.coffee