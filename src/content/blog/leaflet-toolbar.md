---
title: 	Designing Leaflet.Toolbar
date: 	Thu Jan  1 17:11:38 EST 2015
state: 	published
---

Leaflet.Toolbar is a new plugin for exposing expressive and intuitive user interactions on Leaflet-powered maps.  Here's where it came from, and why I built it:

I first starting working with Leaflet and Leaflet.draw in June of 2014. Coming from a long travail with the Google Maps API, I quickly fell in love with Leaflet for its open-source codebase, active development community, and beautifully clear code.  But as I developed Leaflet.Illustrate, a plugin for annotating Leaflet maps with text, I became aware of some of the limitations of Leaflet.draw.

Leaflet ships with a full complement of vector layers - circles, rectangles, polygons, and polylines - that can be overlaid on maps. Leaflet.draw is a plugin that enables users to create vector layers by simply drawing on the map. Leaflet.draw is great because it allows application developers to add minimal drawing interactions to any map with just a single line of code:
```javascript
new L.Control.Draw().addTo(map); // create and display a toolbar
```
Leaflet.draw is great for application developers.  I, however, was developing a plugin extending Leaflet.draw, and I found it difficult to display my own actions in a toolbar alongside those from Leaflet.draw.

A discussion with Mathew Lippincott and Jeffrey Warren at the end of the summer helped me to realize another significant limitation of the Leaflet.draw toolbar.  First, Leaflet.draw allowed users to edit the paths / shapes of map annotations, but not any of their other attributes: color, weight, or opacity, for example. These styles are built in to Leaflet (see [path options](http://leafletjs.com/reference.html#path-options)), but there was no way to expose them to users with Leaflet.draw. Matt and Jeff also suggested that it would be more intuitive to allow users to edit map features by displaying a popup-style toolbar directly above the feature in response to a click or mouseover.

>> Add a note here about why this was important to MapKnitter.

Leaflet.Toolbar is an effort to overcome some of these limitations of Leaflet.draw and to facilitate new kinds of map / user interactions.  In particular, Leaflet.Toolbar aims to:
* Decouple the actions exposed by a toolbar from its overall behavior and appearance;
* Enable *both* control-style and popup-style toolbars out of the box;
* Make it easy for library developers to define new kinds of toolbars;
* Be easy for application developers to instantiate;
* Remain interoperable with Leaflet.draw and reduce breaking changes to a minimum.

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

### Overloaded #addTo method

Conceptually, a toolbar is a UI element that allows a user to manipulate a set of objects. Leaflet.Toolbar requires the developer to specify which map objects the toolbar will control. In order to keep the API simple, `L.Toolbar#addTo` is overloaded to add the toolbar to the map, *and* to designate the map objects which the toolbar will control. The arguments of `L.Toolbar#addTo` are passed to each action in turn.  That is, 
```javascript
new L.Popup.Toolbar({
	options: { actions: [EditShape, DeleteShape] }
}).addTo(map, shape);
```
calls `new EditShape(map, shape)` and `new DeleteShape(map, shape)` in turn.

### CSS Styles

### ToolbarActions
* Talk about L.ToolbarAction isn't any use by itself - you have to subclass it.
* Talk about how sub-toolbars - how each toolbar is an instance of L.Toolbar, so that toolbars could (theoretically) be infinitely nested.