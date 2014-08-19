<?xml version="1.0" encoding="utf-8"?>
	<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns:atom="http://www.w3.org/2005/Atom" 
		xmlns:media="http://search.yahoo.com/mrss/" 
		xml:lang="en-US">
	<xsl:output method="xml" omit-xml-declaration="yes"/>

	<xsl:param name="num" select="num"/>

	<xsl:template match="/atom:feed">
		<xsl:for-each select="atom:entry[position() &lt;= $num]">
			<xsl:value-of select="./atom:content"/>
		</xsl:for-each>
	</xsl:template>

</xsl:stylesheet>