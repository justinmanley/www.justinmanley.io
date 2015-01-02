It's clear to me that `scripts/feeds` needs a major overhaul.

The code doesn't fit the conceptual model (a hub for inputs and outputs) and it's hard to test and to extend.

One option is to port it to Haskell or another language with a decent type system. Any language that it goes to would have to have robust libraries for the following:
* XML parsing and traversal (with XPath support)
	* [hxt]() and [tagsoup](https://github.com/ndmitchell/tagsoup)
* Markdown-to-HTML conversion
	* [markdown](https://github.com/snoyberg/markdown)
* HTML or XML builder (if XML builder, must be able to handle HTML)
	* [blaze](https://github.com/jaspervdj/blaze-html)
* Twitter API
	* [twitter-conduit](https://github.com/himura/twitter-conduit)
* HTTP requests
	* [Network.HTTP](http://hackage.haskell.org/package/HTTP-4000.0.9/docs/Network-HTTP.html)
	* not stable
* YAML parsing
	* [Data.Yaml](https://hackage.haskell.org/package/yaml-0.8.1/docs/Data-Yaml.html)

Also hlint.

Maybe next steps are to figure out what the types are going to be - how all of the libraries in use will interoperate.


