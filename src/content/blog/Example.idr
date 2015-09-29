-- Have to compile with idris -p effects
-- in order to use the Effect.Random module.

import Data.Matrix
import Effects
import Effect.Random
import Effect.StdIO
import Effect.System
import Debug.Trace

import Eigenvector

||| The matrix
||| [ 1 2 ]
||| [ 2 1 ]
simpleMatrix : Matrix 2 2 Float
simpleMatrix = [[1,2], [2, 1]]

simpleVect : Vect 2 Float
simpleVect = [3,4]

testMatrix : Matrix 3 3 Float
testMatrix = [[1,2,3], [2,4,1], [3,1,5]]

testVect : Vect 3 Float
testVect = [0.2, 0.3, 0.4]

basic : List (Vect 3 Float)
basic = [[1,0,0], [0,1,0]]

test : Vect 3 Float
test = Foldable.foldr orthogonalize [4,5,6] basic

-- This is the issue - the "random" elements of the vector aren't distinct.
--test2 : Vect 2 Float
--test2 = Foldable.foldr orthogonalize [0.62, 0.62] [[0.707107, 0.707107]]

--main : { [RND] } Eff (List (Vect 2 Float, Float))
--main = eigenvector simpleMatrix 0.01 [] simpleVect
--main = do
--	e <- eigenvectors simpleMatrix 0.01 1
--	return $ trace (show e) e

showEigs : Eff () [STDIO, RND]
showEigs = do
	eigs <- eigenvectors testMatrix 0.01 2
	putStrLn $ show eigs

main : IO ()
main = run showEigs

{-
rndTest : (n : Nat) ->  { [RND] } Eff (Vect n Float)
rndTest n = do
	r <- rndFloat 100
	return $ replicate n r

game : { [SYSTEM, RND, STDIO] } Eff ()
game = do 	
	srand (cast !Effect.System.time)
	r <- rndFloat 100 
	putStrLn (show r)

main : IO ()
main = run game
-}
