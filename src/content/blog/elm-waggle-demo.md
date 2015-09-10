---
title: 	Thoughts on the Elm language
date: 	Thu Sep 10 12:21:29 PDT 2015
state: 	published
header: <%= assets %>/images/waggle-demo.png
---

[Elm](http://elm-lang.org/) is a [type-inferred](https://en.wikipedia.org/wiki/Type_inference) [functional](https://en.wikipedia.org/wiki/Functional_programming) reactive language for web programming ("reactive" means that the language has built-in primitives for expressing time-varying values - see [FRP](https://en.wikipedia.org/wiki/Functional_reactive_programming)).  I decided to try Elm out on a small project, a web app for displaying incoming data streams from an array of environmental sensors.

I built [a data display](http://justinmanley.github.io/waggle-data-display/) ([code here](https://github.com/justinmanley/waggle-data-display)) which reads measurements from a simple text file accessible via HTTP and produces a simple visualization. In order to show the incoming data in real time, the app must periodically check the HTTP endpoint to gather data and update the displays. These modest requirements turn out to make a great project for testing the maturity and capabilities of Elm, since they introduce a time-varying parameter at the heart of the project, and provide an opportunity to explore Elm's approach to handling [impure functions](https://en.wikipedia.org/wiki/Pure_function#Impure_functions) like HTTP requests.

### Writing a simple web app in Elm

There can be a steep initial learning curve to getting started with Elm. Even a job as simple as sending a periodic HTTP request in Elm introduces a lot of heavy machinery: [signals, tasks, mailboxes](http://elm-lang.org/guide/reactivity), and [ports](http://elm-lang.org/guide/interop). Here's a snippet of code that's responsible for periodically retrieving data for the data display:

First, we declare a mailbox, a destination for unparsed data retrieved via HTTP request.

```elm
rawData : Mailbox String
rawData = Signal.mailbox "sensor-data" 
```

The data we're going to retrieve will end up as a [signal](http://elm-lang.org/guide/reactivity#signals) (time-varying value) associated with the mailbox we just created: `rawData.signal : Signal String`. To turn the raw HTTP response into something we can work with, we parse the response string, timestamp it, and then update the state (`SensorBoard`) with the latest batch of data.

```elm
sensorData : Signal (Time, SensorBoard)
sensorData = Signal.map parse rawData.signal
    |> Time.timestamp 
    |> update
```

So far, so good. The tricky part is getting the data to end up in `rawData.signal`. The function `getSensorData : Task Http.Error ()` is responsible for a single HTTP request. The type signature tells us that `getSensorData` either returns `()` (the [unit value](https://en.wikipedia.org/wiki/Unit_type), indicating success), or an error of type `Http.Error`. If `getSensorData` is successful, then it also updates `rawData.signal` with a new value as a [side effect](https://en.wikipedia.org/wiki/Side_effect_(computer_science)). In order to send multiple HTTP requests to periodically retrieve data, we map `getSensorData` over a signal which updates itself every `Config.updateInterval` seconds, but always has the same value (`Config.sensorDataUrl`). 

Finally, running this impure function requires that we declare it as a `port` at the top level.

```elm
port getData : Signal (Task Http.Error ())
port getData = 
    let ticks : Signal Time
        ticks = Time.every Config.updateInterval

        getSensorData : String -> Task Http.Error ()
        getSensorData url = 
            Http.getString url `andThen` Signal.send rawData.address

    -- Lifting the URL string to a constant signal which updates periodically
    -- allows us to perform the HTTP request task periodically as well. 
    in Signal.map getSensorData
        <| Signal.sampleOn ticks 
        <| Signal.constant Config.sensorDataUrl 
```

It's easy to write a solution to this problem which typechecks and looks plausible, but which only launches a single HTTP request. Getting the solution to work as intended requires thinking about the [signal graph](https://en.wikipedia.org/wiki/Signal-flow_graph) and understanding how tasks work. It's not intuitive (at least for me). It takes a bit of thought to realize that the URL needs to masquerade as a time-varying value in order to launch periodic HTTP requests.

### Successes and challenges

As I became comfortable with Elm's FRP model, the biggest challenges I faced were the result of the relative youth of the language community.

There's a dearth of community libraries, and those which have been released are often in flux as their authors figure out how to express in Elm solutions originally developed in JavaScript or Haskell. The lack of stock solutions to common problems means that simple projects can take much longer than expected because so much must be built from scratch. Even the core libraries sometimes change dramatically (tasks and mailboxes were just introduced with v0.15) - and this means more time updating and refactoring code.

Layout and styling in particular were frustrating at times. There are two main display systems in Elm. The [`Graphics.*` core libraries](http://package.elm-lang.org/packages/elm-lang/core/2.1.0/Graphics-Element) provide a simple layout system built of rectangular components of known width and height. This means that it's not possible to style `Graphics.*` elements with CSS. It *is* possible to use CSS with [`elm-html`](http://package.elm-lang.org/packages/evancz/elm-html/4.0.1), but you give up the ability to get the dimensions of elements from Elm code. Fortunately, there's some good work being done on these issues right now, with [Elm-Css](http://package.elm-lang.org/packages/adam-r-kowalski/Elm-Css/2.0.0) recently released and discussions about [alternative layout / styling systems](https://groups.google.com/forum/#!searchin/elm-discuss/gss/elm-discuss/PtHVHY9Iu1g/sqe4LSBHBwAJ).

It helps that the Elm community is friendly and supportive. When I've been truly stumped, I've gotten quick (and thoughtful) responses from Elm veterans on the [elm-discuss](https://groups.google.com/forum/#!forum/elm-discuss) mailing list. The elm-discuss list is an exciting place to be; there are questions every day from beginners trying out Elm for the first time and discussions (sometimes heated) about language features and infrastructure. Even better, many of the folks involved in those conversations go on to contribute to Elm's community libraries. Since I started working on this project, in March of 2015, the number of [community libraries](http://package.elm-lang.org/packages) has grown tenfold.

It also helps that Elm ships with a suite of amazing tools - the ["Elm Platform"](https://github.com/elm-lang/elm-platform), including the compiler, [REPL](https://github.com/elm-lang/elm-repl), [package manager](https://github.com/elm-lang/elm-package), and the [reactor](https://github.com/elm-lang/elm-reactor), an interactive development tool. These tools make it a pleasure to work in Elm.

But my favorite part about writing Elm, by far, is how maintainable it is. It's amazing to me how easy it was to come back to this project after 2 months away and begin to refactor messy code and add features once again. I love that I can be productive almost immediately when I sit down to revive a long-dormant Elm project. I may forget how the different pieces of my project fit together, but the Elm compiler doesn't forget. This is significant because it adds up to a big boost in productivity for web developers using Elm.

### Final thoughts

Elm is a work in progress. It's frustrating sometimes, because APIs change frequently and there are missing pieces, but also tremendously exciting because the performance, power, and expressiveness of the language are constantly improving.

The Elm community follows a top-down BDFL model, with creator Evan Czaplicki putting in the most hours and reserving the final say on questions of language syntax, features, and implementation. Czaplicki is autocratic and sometimes brusque, but he is also responsive and supportive of active contributors to the language. The scope of Czaplicki's vision has attracted an active community of language maintainers, library developers, and compiler enthusiasts to contribute to the language.

This community is swiftly increasing the number of available Elm libraries. Even more exciting, there are a ton of exciting improvements and features coming (hopefully) with the next compiler release, including tail call optimization, exhaustiveness checking for pattern matches, and dead-code elimination. For me, at least, Elm is not yet an efficient and effective replacement for JavaScript - but of all the frameworks and compile-to-JavaScript languages I've worked with, Elm has the greatest potential.