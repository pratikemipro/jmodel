<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
				xmlns:exsl="http://exslt.org/common"
				extension-element-prefixes="exsl">

	<xsl:output encoding="UTF-8" indent="yes" method="xml" />

	<xsl:template match="article">
		<exsl:document href="web/test.html">
			<html>
				<head>
					<title>Test</title>
				</head>
			</html>
		</exsl:document>
	</xsl:template>
	
</xsl:stylesheet>
