RESERVED = "require"
REQUIRE  = "./requirements/require.js"

default:
	@make sapphire

sapphire:
	coffee --compile --bare --join library/sapphire2.js src/library/sapphire.header.coffee  src/library/sapphire.Set.coffee src/library/sapphire.List.coffee src/library/sapphire.Map.coffee