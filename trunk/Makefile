default:
	@make opal
	@make opal-test
	@make sapphire
	@make jview

opal:
	coffee --compile --bare --map --join library/opal2.js \
		src/library/opal.header.coffee \
		src/library/opal.Array.coffee \
		src/library/opal.Object.coffee \
		src/library/opal.Function.coffee \
		src/library/opal.BareObject.coffee \
		src/library/opal.Number.coffee \
		src/library/opal.String.coffee \
		src/library/opal.Nullable.coffee \
		src/library/opal.Promise.coffee

opal-test:
	coffee --compile --bare --map --join tests/test-opal2.js \
		src/library/opal-test.header.coffee \
		src/library/opal.Array.test.coffee \
		src/library/opal.Object.test.coffee \
		src/library/opal.Function.test.coffee \
		src/library/opal.BareObject.test.coffee \
		src/library/opal.Number.test.coffee \
		src/library/opal.Nullable.test.coffee \
		src/library/opal.Promise.test.coffee

sapphire:
	coffee --compile --bare --map --join library/sapphire2.js \
		src/library/sapphire.header.coffee \
		src/library/sapphire.Set.coffee \
		src/library/sapphire.List.coffee \
		src/library/sapphire.Map.coffee
		
jview:
	coffee --compile --bare --map jview/