---
title: Playing with Idris
---

> module Eigenvector

> import Data.Matrix
> import Data.Matrix.Algebraic
> import Effects
> import Effect.Random

> import Debug.Error

> %hide Prelude.Stream.foldr

### Motivation (Why is Idris cool?)

[Idris](http://www.idris-lang.org/) is a functional programming language with [dependent types](http://en.wikipedia.org/wiki/Dependent_type). This means that types in Idris can depend on values. The advantage of this is that it makes the type system much more expressive, so that the compiler can formally verify more of the logic of the program.

This literate program explores Idris, a pure functional programming language with dependent types, through a program for approximating the eigenvectors of a matrix using the [power method](https://en.wikipedia.org/wiki/Power_iteration).

We'll start with a couple of simple helper functions for [normalizing](https://en.wikipedia.org/wiki/Unit_vector) and [orthogonalizing](https://en.wikipedia.org/wiki/Orthogonalization) vectors:

> norm : Vect n Double -> Double
> norm v = sqrt (v <:> v)

> normalize : Vect n Double -> Vect n Double
> normalize v = (1 / norm v) <#> v

> ||| Orthogonalize v to w.
> orthogonalize : Vect n Double -> Vect n Double -> Vect n Double
> orthogonalize w v = v <-> ((v <:> w) <#> w)

> Eigenvalue : Type
> Eigenvalue = Double

> ||| Calculate the eigenvalue corresponding to a given eigenvector.
> eigenvalue : Matrix n n Double -> Vect n Double -> Eigenvalue
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

> ||| Generate a random float between 0 and 1.
> ||| See [TODO: File a bug report and add link]
> rndDouble : Integer -> EffM m Double [RND] (\result => [RND])
> -- rndDouble : Integer -> Eff Double [RND]
> rndDouble max = do
> 	rnd <- rndInt 0 max
> 	return (fromInteger rnd / fromInteger max)

There's a catch in what I've described so far - the power method needs an initial seed vector to jumpstart the iterative process of approximation. Typically, the algorithm is seeded with a random vector. This means that the power method is an [effectful](TODO: link) computation.

Handling effectful computations has typically been challenging for functional languages based on the lambda calculus which aspire to [purity](TODO: link). Haskell 

> ||| Calculate the first k eigenvectors of a matrix using the power method.
> eigenvectors : Matrix n n Double
> 	-> Double
> 	-> Nat
> 	-> Eff (List (Vect n Double)) [RND]
> eigenvectors {n} matrix precision k =
> 	-- Internal procedure which calls itself recursively 
>   -- to generate the k eigenvectors.
>   -- Can't do a straightforward map (mapE) because the computation for each
>   -- eigenvector involves the previously computed eigenvectors.
>   -- seedVectors : List (Vect n Double)
>   do
>       seedVectors <- mapE (mapVE rndDouble) 
>           $ List.replicate k (Vect.replicate n (cast $ 1 / precision))
>   
>       return $ foldr eigenvectors' [] seedVectors 
>   where
>       eigenvectors' seed prevEigs = 
>           eigenvector matrix precision seed prevEigs :: prevEigs
