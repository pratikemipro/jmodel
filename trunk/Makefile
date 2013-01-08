RESERVED = "require"
REQUIRE  = "./requirements/require.js"

default:
	@make opal
	@make sapphire

opal:
	coffee --compile --bare --join library/opal2.js src/library/opal.header.coffee src/library/opal.Function.coffee src/library/opal.Object.coffee src/library/opal.Number.coffee src/library/opal.String.coffee

sapphire:
	coffee --compile --bare --join library/sapphire2.js src/library/sapphire.header.coffee  src/library/sapphire.Set.coffee src/library/sapphire.List.coffee src/library/sapphire.Map.coffee