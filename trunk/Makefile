RESERVED = "require"
REQUIRE  = "./requirements/require.js"

default:
	@make opal
	@make opal-test
	@make sapphire

opal:
	coffee --compile --bare --join library/opal2.js src/library/opal.header.coffee src/library/opal.Array.coffee src/library/opal.Object.coffee src/library/opal.Function.coffee src/library/opal.Number.coffee src/library/opal.String.coffee src/library/opal.Nullable.coffee

opal-test:
	coffee --compile --bare --join tests/test-opal2.js src/library/opal-test.header.coffee src/library/opal.Array.test.coffee src/library/opal.Function.test.coffee src/library/opal.Number.test.coffee src/library/opal.Nullable.test.coffee

sapphire:
	coffee --compile --bare --join library/sapphire2.js src/library/sapphire.header.coffee  src/library/sapphire.Set.coffee src/library/sapphire.List.coffee src/library/sapphire.Map.coffee