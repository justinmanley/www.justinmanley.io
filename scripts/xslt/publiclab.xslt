<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xml:lang="en-US">
	<xsl:output method="xml" omit-xml-declaration="yes"/>

	<xsl:template match="/rss/channel">
		<xsl:apply-templates select="./item"/>
	</xsl:template>

	<xsl:template match="item">
		<div class="event publiclab-event">
			<xsl:apply-templates select="./pubDate"/>
			<div class="title">
				<xsl:apply-templates select="./author"/> published 
				<xsl:apply-templates select="./title"/>
				<xsl:apply-templates select="./description"/>
			</div>
		</div>
	</xsl:template>

	<xsl:template match="pubDate">
		<div class="time"><xsl:value-of select="."/></div>
	</xsl:template>

	<xsl:template match="author">
		<a href="http://publiclab.org/profile/justinmanley">
			<xsl:value-of select="."/>
		</a>
	</xsl:template>

	<xsl:template match="title">
		<a href="{../link}">
			<xsl:value-of select="."/>
		</a>
	</xsl:template>

	<xsl:template match="description">
		<div class="message"><xsl:value-of select="."/></div>
	</xsl:template>
</xsl:stylesheet>
