module Test

import Data.Vect
import Data.Matrix
import Data.Matrix.Algebraic
import Effects
import Effect.Random

import Data.Complex

import Eigenvector

import TestUtil

shouldBeWithin : Double 
  -> Vect n (Complex Double) 
  -> Vect n (Complex Double) -> IO ()
shouldBeWithin precision = 
  should (\actual, expected => (norm $ actual <-> expected) < precision)

shouldBeCloseTo : (Neg a, Num a, Ord a, Show a) => a -> a -> a -> IO ()
shouldBeCloseTo precision = should $ (\actual, expected => 
  (actual - expected < precision) || (expected - actual < precision))


normalizeYieldsUnitVector : IO ()
normalizeYieldsUnitVector = do
    (shouldBeCloseTo 0.0001) (norm $ normalize v) 1
  where
    v : Vect 2 (Complex Double)
    v = map (fromReal) [1, 1]
  
realEigenvectors : IO ()
realEigenvectors =
  do
    actual <- run $ eigenvectors matrix precision 1
    traverse_ (uncurry $ shouldBeWithin precision) (zip actual expected)
    traverse_ (putStrLn . show . eigenvalue matrix) actual    
  where 
    matrix : Matrix 3 3 (Complex Double)
    matrix = map (map fromReal)
      [ [1, 2, 3]
      , [2, 4, 1] 
      , [3, 1, 5]
      ]

    precision : Double
    precision = 0.01

    expected : List (Vect 3 (Complex Double))
    expected = map (map fromReal) 
      [ [0.649679, 0.640561, 1]
--      , [-0.0277091, -1.53303, 1]
--      , [-2.22197, 0.692466, 1]
      ]

-- Power method will not converge on a 2*2 rotation matrix because
-- all of the eigenvalues of a rotation matrix have the same magnitude
-- (they all lie on the unit circle in the complex plane).
-- Therefore this test will not terminate.
rotationMatrixEigenvectors : IO ()
rotationMatrixEigenvectors = do
    actual <- run $ eigenvectors matrix 0.01 2
    traverse_ (uncurry $ shouldBeWithin 0.01) (zip actual expected)
  where
    theta : Double
    theta = pi * 0.25

    matrix : Matrix 2 2 (Complex Double)
    matrix = map (map fromReal) 
      [ [ cos theta, sin theta ]
      , [ -(sin theta), cos theta ] 
      ]

    expected : List (Vect 2 (Complex Double))
    expected = 
      [ [ 1 :+ 0, 0 :+ 1 ]
      , [ 1 :+ 0, 0 :+ -1 ]
      ]
