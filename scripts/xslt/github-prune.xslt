<?xml version="1.0" encoding="utf-8"?>
	<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns:atom="http://www.w3.org/2005/Atom" 
		xmlns:media="http://search.yahoo.com/mrss/" 
		xml:lang="en-US">
	<xsl:output method="xml"/>

	<xsl:param name="predicate" select="predicate"/>

	<xsl:template match="@*|node()[not(self::atom:entry)]">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="atom:entry">
		<xsl:if test="contains($predicate, substring-before(substring-after(substring-after(./atom:id, ':'), ':'), 'Event/'))">
			<xsl:copy>
				<xsl:apply-templates select="@*|node()"/>
			</xsl:copy>			
		</xsl:if>
	</xsl:template>

</xsl:stylesheet>