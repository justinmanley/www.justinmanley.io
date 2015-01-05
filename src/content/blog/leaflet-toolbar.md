---
title: 	Designing Leaflet.Toolbar
date: 	Thu Jan  1 17:11:38 EST 2015
state: 	published
---

Leaflet.Toolbar is a new plugin for exposing expressive and intuitive user interactions on Leaflet-powered maps.  Here's where it came from, and why I built it:

I first starting working with Leaflet and Leaflet.draw in June of 2014. Having previously built WhereWeWalk using the the Google Maps API, I quickly fell in love with Leaflet for its open-source codebase, active development community, and beautifully clear code.  But as I developed Leaflet.Illustrate, a plugin for annotating Leaflet maps with text, I became aware of some of the limitations of Leaflet.draw.

Leaflet ships with a full complement of vector layers - circles, rectangles, polygons, and polylines - that can be overlaid on maps. Leaflet.draw is a plugin that enables users to create vector layers by drawing on the map. Leaflet.draw is great because it allows application developers to add drawing interactions to any map with just a single line of code:
```javascript
new L.Control.Draw().addTo(map); // create and display a toolbar
```
This is great for application developers.  As a plugin developer, however, I found Leaflet.draw difficult to work with. It was straightforward to extend Leaflet.draw's interaction handlers to define new kinds of behaviors, but it wasn't easy to present those actions to the user.

A discussion with Mathew Lippincott and Jeffrey Warren at the end of the summer helped me to realize another significant limitation of the Leaflet.draw toolbar.  First, Leaflet.draw allowed users to edit the paths / shapes of map annotations, but not their style (color, weight, opacity, etc). Support for styling map features is built in to Leaflet (see [path options](http://leafletjs.com/reference.html#path-options)), but there was no way to expose this to users with Leaflet.draw.

It was particularly important to Matt, Jeff, and I that users be able to edit these visual attributes of map features. Matt found that digital mapping interfaces up to this point were not as expressive as analog maps, and so, in order to communicate the purpose of maps, users would screeenshot images of digital maps and then draw on them using Powerpoint or even pen and paper. We wanted to bring the full expressiveness of analog mapping into the browser so that MapKnitter users could communicate clearly the purpose and message of their maps.

Matt and Jeff also suggested that it would be more intuitive to allow users to edit map features by displaying a popup-style toolbar directly above the feature in response to a click or mouseover.

Leaflet.Toolbar is an effort to overcome some of these limitations of Leaflet.draw and to facilitate new kinds of map / user interactions.  In particular, Leaflet.Toolbar aims to:
* Decouple the actions exposed by a toolbar from its overall behavior and appearance;
* Enable *both* control-style and popup-style toolbars out of the box;
* Make it easy for library developers to define new kinds of toolbars;
* Be easy for application developers to instantiate;
* Remain interoperable with Leaflet.draw.

Here's a look at how Leaflet.Toolbar works and some of the decisions that went in to the making.

### Toolbar actions

The biggest challenge in designing Leaflet.Toolbar was deciding how to represent the actions that a toolbar would expose. Leaflet.draw handled this like so:
```javascript
L.DrawToolbar = L.Toolbar.extend({
	...
	getModeHandlers: function(map) {
		return [
			...
			{
				enabled: this.options.polyline,
				handler: new L.Draw.Polyline(map, this.options.polyline),
				title: L.drawLocal.draw.toolbar.buttons.polyline
			},
			...
		];
	}
	...
});
```

This pattern was a solution to the problem that each of the toolbar actions - `L.Draw.Polyline`, `L.Draw.Rectangle`, etc. - takes the map as its first argument. Since the map is usually instantiated by the application developer, this meant that the toolbar couldn't be defined directly as an array of toolbar actions:

```javascript
[
	new L.Draw.Polyline(map, polylineOptions),
	new L.Draw.Polygon(map, polygonOptions),
	...
]
```

I fiddled around for a long time with similar patterns.  I was frustrated with the verbosity and indirectness of this pattern. The difficulty was to enable plugin developers to specify a set of default actions for a toolbar, while still allowing application developers to customize the behavior of those actions by specifying options. The solution, which I finally arrived at in late December, involved a clever use of Leaflet's classical inheritance system.

In Leaflet.Toolbar 0.1.0, actions are defined as an array of *constructors*.  This means that the toolbar for Leaflet.draw can be defined simply as:

```javascript
L.DrawToolbar = L.Toolbar.Control.extend({
	options: {
        actions: [
        	L.Draw.Polyline,
        	L.Draw.Polygon,
        	L.Draw.Rectangle,
        	L.Draw.Circle,
        	L.Draw.Marker
        ]
    }
});
```
This was direct and concise. What's more, this new pattern made it easy for application developers to customize the behavior of an action at toolbar instantiation by extending the action to create an anonymous class:

```javascript
var polylineOptions = { color: '#db1d0f', weight: 3 };

new L.DrawToolbar({
	actions: [
		L.Draw.Polyline.extend({ options: polylineOptions }),
		...
	]
})
```

Perfect! (To check out the code that makes this work, see `L.Toolbar#_getActionConstructor`.)

### Overloaded #addTo method and _getActionConstructor

Conceptually, a toolbar is an interface that allows a user to manipulate state. Leaflet.Toolbar allows the developer to specify which map objects the toolbar will control. In order to keep the API simple, `L.Toolbar#addTo` is overloaded to add the toolbar to the map, *and* to designate the map objects which the toolbar will control. The arguments of `L.Toolbar#addTo` are passed to each action in turn.  That is, 
```javascript
new L.Popup.Toolbar({
	options: { actions: [EditShape, DeleteShape] }
}).addTo(map, shape);
```
calls `new EditShape(map, shape)` and `new DeleteShape(map, shape)` in turn.

The magic that makes this work (which didn't come to me until late December) is all contained in `L.Toolbar#_getActionConstructor`. Variadic functions are easy to construct in JavaScript using `Function.prototype.apply`, but this technique doesn't work with constructors.  To treat the toolbar action constructors generically, without regard for their arity, `Toolbar#_getActionConstructor` creates an anonymous class extending each toolbar action to initialize the toolbar action with the appropriate arguments: 
```javascript
_getActionConstructor: function(Action) {
    ...
	return Action.extend({
	    initialize: function() {
	    	Action.prototype.initialize.apply(this, args);
	    },
	    ...
	});	
}
```
This trick uses Leaflet's built-in classical inheritance system to create pseudo variadic constructors in JavaScript.

### Secondary toolbars

I thought I was done developing Leaflet.Toolbar after about a month of tinkering with it in my spare time. To confirm, I looked back at Leaflet.draw and noticed that each action in the toolbar, once triggered, provided a menu of secondary options related to the action at hand; for example, users drawing a polygon or polyline are given the option to cancel drawing, or to delete just the last point. No problem, I thought. I'll just add that in - it'll take a couple of days.

![Primary and secondary toolbar actions](assets/images/toolbar-actions.png)

Wrong. My design at the time had no way of accomodating these secondary actions. It took me the next few months, still working in my spare time, to reorganize the code to accomodate these secondary actions.

The menu of secondary actions, I realized, was kind of like a toolbar.  Why not just make it an instance of `L.Toolbar`? This was the solution I settled on: the `subToolbar` option of each toolbar action points to an instance of `L.Toolbar` containing the appropriate secondary actions.

This system of nested toolbars made for efficient code reuse, but meant that the CSS styles had to be seriously modified. Toolbars in `Leaflet.Toolbar` are automatically given a `leaflet-toolbar-n` class, where `n` is the 0-based level of the toolbar in the nested toolbar hierarchy. This allows for styles to be applied easily across all toolbars and menus at the same hierarchical level. One drawback of this method is that styles have to be tightly scoped to avoid inadvertently styling containing toolbars (for example: `leaflet-toolbar-0 > li > .leaflet-toolbar-icon {...}`) - but hey, you can't win them all!

### Musings

The toughest part of this project, hands down, was dealing with the constraints of an existing API.  Developing Leaflet.Toolbar was different from other libraries that I've written because, with Leaflet.Toolbar, I was proposing to take over functionality from Leaflet.draw, rather than extending it; I wanted to inroduce a new dependency into the stack that would handle existing functionality. Working on a project with this degree of interdependence between the parts was new for me, and it was difficult. There were times when I felt that my ideas for Leaflet.Toolbar couldn't possibly be accomodated by Leaflet.draw's API, and I dreamed about drastic rewrites of Leaflet.draw that might mesh more neatly with my toolbars. Thank god I didn't follow through on those dreams! I did make some small changes to Leaflet.draw, such as modifying each drawing handler to inherit from `L.ToolbarAction` rather than `L.Handler`, but for the most part, I left it as-is.

While it was sometimes frustrating, Leaflet.draw was also an enormous help to me in developing Leaflet.Toolbar. I used [@jacobtoye](https://github.com/jacobtoye)'s excellent control-style toolbar as the inspiration and the spec for Leaflet.Toolbar, and I was constantly tabbing back to Leaflet.draw to check the functionality of the Leaflet.draw toolbars. I worked on porting the Leaflet.draw toolbar interface over to `Leaflet.Toolbar` as I was developing `Leaflet.Toolbar`, which helped maintain a tight feedback loop and informed the features I was building in to Leaflet.Toolbar. If anything made my job difficult, it was that [@jacobtoye](https://github.com/jacobtoye) and the Leaflet.draw set the bar so high!

### What's next

If you're a Leaflet developer, I'd love to hear your thoughts! Let me know what you think in the comments on [issue #324 in Leaflet.draw](https://github.com/Leaflet/Leaflet.draw/issues/324), or [open a new issue on Leaflet.Toolbar](https://github.com/manleyjster/Leaflet.Toolbar/issues).
