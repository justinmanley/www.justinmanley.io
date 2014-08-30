---
template: page.hbs
---

<div class="container-fluid">
	<div class="row">
		{{#compose src="<%= feedConfig.dest.feed %>"}}
			<div class="col-md-4 feed">
				{{{@content}}}
			</div>
		{{/compose}}

		{{#compose src="<%= feedConfig.dest.article %>"}}
			<div class="col-md-8 feed">
				{{{@content}}}
			</div>
		{{/compose}}				
	</div>
</div><!-- #feeds -->