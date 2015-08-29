### Writing a Simple App In Elm

Elm is a strongly typed, type-inferred functional language for web programming. I have enjoyed using Haskell and functional languages in the ML family, so I decided to try Elm out on a small project, a web app for displaying incoming data streams from an array of environmental sensors.

### The app

This data display app receives data from HTTP endpoint.

### Successes

* Supportive community
* It's amazingly easy to come back to the project after 1 or 2 months away and jump straight in to refactoring and adding new features. This is unquestinably because of the compiler.
* Amazing tooling:
	- elm package install
	- elm reactor

How does it compare to writing programs in JavaScript?

 ### Challenges

 What were the challenges?
* Firing multiple HTTP requests - it's not intuitive - it requires understanding how Signals get wired together.
* Definitely layout challenges - Catch 22 w/
* Styling is cumbersome - either way of styling seems to require compromises
* It's buggy / unsightly and not yet feature-complete.
* Lack of infrastructure.

### Conclusion

Thoughts about the community
* The language is definitely a work-in-progress.
* BDFL model - Evan makes decisions impacting the community and all existing codebases which seem arbitrary from the outside.
* Dead-code elimination would be huge! I've been doing a lot of refactoring as I figure out how Elm works, and I end up with dead code spread across many modules. This would be another huge win over JavaScript frameworks.