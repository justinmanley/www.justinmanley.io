---
title: Playing with Idris
---

> --- Code hidden from blog post. ---
> module Eigenvector
> 
> import Data.Matrix
> import Data.Matrix.Algebraic
> import Effects
> import Effect.Random
> import Effect.System
> 
> import Debug.Error

### Motivation (Why is Idris cool?)

[Idris](http://www.idris-lang.org/) is a functional programming language with [dependent types](http://en.wikipedia.org/wiki/Dependent_type). This means that types in Idris can depend on values. The advantage of this is that it makes the type system much more expressive, so that the compiler can formally verify more of the logic of the program.

This [literate program](TODO: link) explores Idris, a pure functional programming language with dependent types, through a program for approximating the eigenvectors of a matrix using the [power method](https://en.wikipedia.org/wiki/Power_iteration).

We'll start with a couple of simple helper functions for [normalizing](https://en.wikipedia.org/wiki/Unit_vector) and [orthogonalizing](https://en.wikipedia.org/wiki/Orthogonalization) vectors:

> norm : Vect n Double -> Double
> norm v = sqrt (v <:> v)
>
> normalize : Vect n Double -> Vect n Double
> normalize v = (1 / norm v) <#> v
>
> ||| Orthogonalize v to w.
> orthogonalize : Vect n Double -> Vect n Double -> Vect n Double
> orthogonalize w v = v <-> ((v <:> w) <#> w)

> --- Code hidden from blog post. ---
> ||| Calculate the eigenvalue corresponding to a given eigenvector.
> eigenvalue : Matrix n n Double -> Vect n Double -> Double 
> eigenvalue matrix eigenvector = eigenvector <:> matrix </> eigenvector

[dotProduct]: https://github.com/idris-lang/Idris-dev/blob/ccf6c405fb99faeb2677101f0a8e766dc2bc8969/libs/contrib/Data/Matrix/Algebraic.idr#L58

[scalarProduct]: https://github.com/idris-lang/Idris-dev/blob/ccf6c405fb99faeb2677101f0a8e766dc2bc8969/libs/contrib/Control/Algebra/VectorSpace.idr#L21

[vectorAddition]: https://github.com/idris-lang/Idris-dev/blob/ccf6c405fb99faeb2677101f0a8e766dc2bc8969/libs/prelude/Prelude/Algebra.idr#L18

[vectorSubtraction]: https://github.com/idris-lang/Idris-dev/blob/ccf6c405fb99faeb2677101f0a8e766dc2bc8969/libs/contrib/Control/Algebra.idr#L21

[matrixRowVectorProduct]: https://github.com/idris-lang/Idris-dev/blob/master/libs/contrib/Data/Matrix/Algebraic.idr#L78 

So far, so good. The looks (pretty much) like the analogous Haskell code. The infix operators [`<:>`](dotProduct), [`<#>`](scalarProduct), [`<+>`](vectorAddition), [`<->`](vectorSubtraction), and [`</>`](matrixRowVectorProduct) (below) come from the definitions of various algebraic structures - group, ring, vector space. 

### The Power Method

With these utility functions out of the way, we're ready to implement the power method. The heavy lifting is done by a function which takes a matrix, a "seed" eigenvector, and a list of previously computed eigenvectors and approximates the next eigenvector to the desired precision:

> ||| Estimate a single eigenvector to the expected precision, given
> ||| a list of previously calculated eigenvectors.
> eigenvector : Matrix n n Double
> 	-> Double
> 	-> Vect n Double
> 	-> List (Vect n Double)
> 	-> Vect n Double

The power method is iterative. Each iteration, we start with a "seed" eigenvector, our best approximation of the eigenvector we're interested in. Then, we generate a new approximation by multiplying our matrix by the "seed" vector and normalizing the product, which is a vector of the same length.

We define the error of each iteration to be the distance between our original approximation (the "seed") and the new approximation. If the error is less than our desired precision, we stop; otherwise, we repeat the process with our new "seed".

The result of this process will converge (under a few [conditions](TOOD: link)) to the "first" eigenvector - an eigenvector corresponding to the eigenvalue of greatest magnitude. In order to approximate successive eigenvectors, we first orthogonalize the "seed" to each of the previously computed eigenvectors in turn.

> eigenvector {n} matrix precision seed previousEigenvectors = 
> 	if err < precision
> 	then result
> 	else eigenvector matrix precision result previousEigenvectors where
> 		-- Orthogonalize the vector to each previously computed eigenvector.
> 		tmp : Vect n Double
> 		tmp = foldr orthogonalize seed previousEigenvectors
>
>       -- </> is matrix multiplication by a row vector.
> 		result : Vect n Double
> 		result = normalize $ matrix </> tmp
>
> 		err : Double
> 		err = case compare (eigenvalue matrix result) 0 of
> 			GT => norm (tmp <-> result)
> 			EQ => error "Error margin is undefined when the eigenvalue is 0."
> 			LT => norm (tmp <+> result)

Note that we want the `tmp` and `result` vectors to be the same size as the "seed" vector, but the size of the seed vector is only carried in its type, which means that it's not automatically brought into the scope of the function body.  This is a problem unique to a dependent type system, and Idris solves it with a notion of [implicit arguments](TODO: link). The size of the seed vector is explicitly brought into scope using curly braces (`{n}`), which allows `n` to be used in the type signatures of `result` and `tmp`.

### Effects and Randomness

> --- Code hidden from blog post. ---
> ||| Generate a random float between 0 and 1.
> ||| See [TODO: File a bug report and add link]
> rndDouble : Integer -> EffM m Double [RND] (\result => [RND])
> -- rndDouble : Integer -> Eff Double [RND]
> rndDouble max = do
> 	rnd <- rndInt 0 max
> 	return (fromInteger rnd / fromInteger max)

There's a catch in what I've described so far - the power method needs an initial seed vector to jumpstart the iterative process of approximation. The choice of seed vector is important: if the seed vector is orthogonal to the eigenvector we're trying to compute, then the iterative process will not converge. In practice, this is addressed by initializing the power method with a random seed vector, so that the probability of non-convergence is infinitesimal. 

Constructing random vectors requires a source of random numbers from the operating system and introduces side-effects into our previously-[pure](TODO: link) program. Handling side-effects has traditionally been a challenge for functional languages which aspire to purity. The Idris [effects](TODO: link) package offers a unique approach to handling effectful computations which is made possible by Idris' dependent type system.

Simple effects in Idris are parameterized by the return value of the effectful computation and the particular side-effects used in the computation. Specifically, a *list* of side-effects (i.e. a value) is included in the effect type. This guarantees a high degree of type-safety for effectful computations, since the compiler can ensure that only side-effects present in the type of the computation are used. At the same time, it's easy for users to combine side-effects, without worrying about the order in which those effects are applied  (goodbye and good riddance, [monad transformers](TODO: link)!). In practice, the compiler seems to have trouble correctly resolving effect types, but hey - [Edwin Brady](TODO: link) [told you](TODO: link) this is an experimental language!

The full Effects machinary is much more complicated and flexible than the simplified picture I've given here; there's an excellent [tutorial on effects in Idris](TODO: link) that explains effects in greater detail.

> --- Code hidden from blog post. ---
> ||| map using a function which depends on the previously-mapped values.
> ||| like a combination of map and fold in which the state is the values 
> ||| which have already been mapped.
> mapRemember : (a -> List b -> b) -> List a -> List b -> List b 
> mapRemember f values state = case values of
>   []        => reverse state
>   (x :: xs) => mapRemember f xs (f x state :: state)

Our `eigenvectors` function uses two side-effects: `RND`, to generate random numbers, and `SYSTEM`, to seed the random number generator with the system time. Both side-effects are reflected in the return type of the function. (The `!` in front of `time` unwraps the effectful value of `time` so that it can be used by `srand`). Notice again that the size of the matrix is captured via an implicit argument to `eigenvectors`.

> ||| Calculate the eigenvectors of a matrix using the power method.
> eigenvectors : Matrix n n Double 
>   -> Double 
>   -> Eff (List (Vect n Double)) [RND, SYSTEM]
> eigenvectors {n} matrix precision = do
>    srand !time
>   
>    -- The functions given as arguments to higher-order effectful functions
>    -- (mapE, mapVE) must be syntactically applied directly to their arguments.>    -- This is a bug (see TODO: link).
>    seedVectors <- mapE (\vs => mapVE (\x => rndDouble x) vs)
>      $ List.replicate n (Vect.replicate n (cast $ 1 / precision))
>   
>    return $ mapRemember (eigenvector matrix precision) seedVectors []

And that's it! Pick your favorite matrix and give this program a try! The full code from this blog post is available [on GitHub](TODO: link). And if you think Idris is cool, there's an [active mailing list](TODO: link) and [a bunch of great tutorials](TODO: link) on the Idris website.

