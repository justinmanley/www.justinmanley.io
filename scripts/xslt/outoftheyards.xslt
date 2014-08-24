<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:atom="http://www.w3.org/2005/Atom" 
	xmlns:thr="http://purl.org/syndication/thread/1.0"
		exclude-result-prefixes="atom thr"	
	xml:lang="en-US">
	
	<xsl:output method="html" omit-xml-declaration="yes"/>

	<xsl:template match="/atom:feed">
		<xsl:apply-templates select="atom:entry"/>
	</xsl:template>

	<xsl:template match="atom:entry">
		<div class="event outoftheyards-event">
			<xsl:apply-templates select="atom:published"/>
			<div class="title">
				<a href="http://outoftheyards.com">justinmanley</a>
				<span> published </span> 
				<a><xsl:value-of select="./atom:title"/></a>				
			</div>
			<xsl:apply-templates select="atom:summary"/>
		</div>
	</xsl:template>

	<xsl:template match="atom:published">
		<div class="time">
			<xsl:value-of select="."/>
		</div>
	</xsl:template>

	<xsl:template match="atom:summary">
		<div class="details">
			<xsl:value-of select="."/>
		</div>		
	</xsl:template>

</xsl:stylesheet>