<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet	version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<xsl:output method="xhtml" indent="yes" omit-xml-declaration="yes" encoding="utf-8" media-type="text/html"/>
	
	<xsl:template match="module">
		<xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html>&#xa;</xsl:text>
		<html>
			<head>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
				<title>Opal</title>
				<base href="../../"/>
				<link rel="stylesheet" href="stylesheets/reset.css"/>
				<link rel="stylesheet" href="stylesheets/jmodel.css"/>
			</head>
			<body>
				<article>
					<h1><xsl:value-of select="name"/></h1>
					<xsl:apply-templates select="functions"/>
				</article>
			</body>
		</html>
	</xsl:template>
	
	<xsl:template match="functions">
		<section>
			<h1><xsl:value-of select="name"/></h1>
			<dl>
				<xsl:apply-templates select="function"/>
			</dl>
		</section>
	</xsl:template>
	
	<xsl:template match="function">
        <dt>
			<xsl:apply-templates select="object"/>
            <xsl:value-of select="name"/>
			<xsl:apply-templates select="arguments"/>
		    <xsl:apply-templates select="return"/>
        </dt>
		<xsl:apply-templates select="description"/>
		<xsl:apply-templates select="examples"/>
	</xsl:template>
	
	<xsl:template match="function/object">
		<span class="base"><xsl:value-of select="."/></span>
	</xsl:template>
	
	<xsl:template match="arguments">
        <ul class="arguments {if (@unbounded='true') then 'unbounded' else ''}">
	        <xsl:apply-templates select="argument"/>
	    </ul>
	</xsl:template>
	
	<xsl:template match="argument">
		<li>
			<xsl:if test="@optional"><xsl:attribute name="class">optional</xsl:attribute></xsl:if>
			<xsl:value-of select="."/>
		</li>
	</xsl:template>
	
	<xsl:template match="function/return">
		<span class="return"><xsl:value-of select="."/></span>
	</xsl:template>
	
	<xsl:template match="function/description">
		 <dd><xsl:apply-templates select="node()"/></dd>
	</xsl:template>
	
	<xsl:template match="function/examples">
		<dd class="example">
			<xsl:apply-templates select="example"/>
		</dd>
	</xsl:template>
	
	<xsl:template match="function/examples/example">
		<p>
			<xsl:apply-templates select="input|output"/>
		</p>
	</xsl:template>
	
	<xsl:template match="input">
		<code><xsl:value-of select="."/></code>
	</xsl:template>
	
	<xsl:template match="output">
		<span class="output"><code><xsl:value-of select="."/></code></span>
	</xsl:template>
	
    <xsl:template match="*">
        <xsl:element name="{local-name()}">
            <xsl:apply-templates select="@*|node()"/>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="@*">
        <xsl:attribute name="{local-name()}">
            <xsl:value-of select="."/>
        </xsl:attribute>
    </xsl:template>
	
</xsl:stylesheet>