### Playing with Idris

[Idris](http://www.idris-lang.org/) is a functional programming language with [dependent types](http://en.wikipedia.org/wiki/Dependent_type). This means that types in Idris can depend on values.

I wanted to learn more about Idris, so I wrote a simple program to calculate the first `k` eigenvectors of an `n` by `n` matrix using the [power method](http://en.wikipedia.org/wiki/Power_iteration). I quickly discovered that working with vectors and matrices is a great way to explore the benefits of a dependently typed language.

### Vectors and Matrices in Idris

Vectors can be naturally described in a dependently typed functional language by a type which enriches the type of lists to include a *value* describing the length of the vector. In Idris, vectors have type

```idris
data Vect : Nat -> Type -> Type
   Nil  : Vect Z a
   (::) : a -> Vect n a -> Vect (S n) a 
```

This declaration defines a type constructor `Vect` which takes a natural number and a type as arguments. Note that even this simple type definition requires the typechecker to perform a value-level computation to increment the length of the input vector (`S n`). The `fromList` function for vectors gives an even more striking example:

```idris
fromList : (l : List a) -> Vect (length l) a
``` 

Here, a nontrivial computation - computing the length of the list - is required in order to typecheck the program! Note the way that the input list is given a name in the type annotation (`l : List a`) so that it can be used as an argument to `length`. This is all par for the course in a dependently typed language.

With a type for vectors defined, it's easy to define a matrix as an ordinary function which returns a vector of vectors:

```idris
Matrix : Nat -> Nat -> Type -> Type
Matrix n m a = Vect n (Vect m a)
```

### Computing Eigenvectors Using the Power Method

Here's what using the power method to calculate an eigenvector looks like, in Idris:

```idris
eigenvector : (m : Matrix n n Float)
    -> (precision : Float)
    -> (previousEigenvectors : List (Vect n Float, Float))
    -> (seed : Vect n Float)
    -> (Vect n Float, Float)
```



```idris
eigenvectors : (m : Matrix n n Float) 
    -> (precision : Float) 
    -> (k : Nat) 
    -> { [RND] } Eff (List (Vect n Float, Float))
``` 

TODO:
	* Talk about having to use mapVE instead of replicate - why?
	* Using Debug.Trace (or whatever it is in Idris)
	* Talk about the quality of Idris documentation and tutorials (most by Edwin Brady)
	* Generating a random float? - probably want to edit the code for how I do this - come up with a different algorithm...
	* Check that my code actually works...
	* Effect types - talk about how the effects system is different from Haskell.
		- Perhaps give an example with more than one effect? i.e. what if I also wanted to read something from stdin? (Say, for example, that I wanted to read the matrix from stdin?)
	* How much space should I devote to explaning how the power method works?
	* Talk about implicit variables (values that are bound in the type signature, not as arguments to the function), and how to bring those into scope explicitly.
	* How should I present the code? It's pretty short - should I just embed the whole thing?

Want to focus about what's new and cool about working with dependent types...










