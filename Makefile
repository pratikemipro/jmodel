RESERVED = "require"
REQUIRE  = "./requirements/require.js"

default:
	@make core

core:
	coffee --compile --bare --require $(REQUIRE) --output library/ src/library/