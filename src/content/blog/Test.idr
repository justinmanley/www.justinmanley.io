module Test

import Data.Vect
import Data.Matrix
import Data.Matrix.Algebraic
import Effects
import Effect.Random
import Effect.System

import Eigenvector

import TestUtil

shouldBeWithin : Double 
  -> Vect n Double 
  -> Vect n Double -> IO ()
shouldBeWithin precision = 
  should (\actual, expected => (norm $ actual <-> expected) < precision)

shouldBeCloseTo : (Neg a, Num a, Ord a, Show a) => a -> a -> a -> IO ()
shouldBeCloseTo precision = should $ (\actual, expected => 
  (actual - expected < precision) || (expected - actual < precision))

normalizeYieldsUnitVector : IO ()
normalizeYieldsUnitVector = describe "'normalize' should yield a unit vector" 
  $ (shouldBeCloseTo 0.0001) (norm $ normalize [1, 1]) 1

orthogonalizeYieldsOrthogonalVectors : IO ()
orthogonalizeYieldsOrthogonalVectors = describe "'orthogonalize'"
  $ (shouldBeCloseTo 0.0001) (result <:> w) 0
  where
    v : Vect 2 Double
    v = [1, 1]

    w : Vect 2 Double
    w = [1, -1]

    result : Vect 2 Double
    result = orthogonalize v w

singleRealEigenvector : IO ()
singleRealEigenvector = describe "'eigenvectors' is correct for a real matrix" 
  $ (shouldBeWithin precision) actual expected
  where
    matrix : Matrix 3 3 Double
    matrix =
      [ [1, 2, 3]
      , [2, 4, 1] 
      , [3, 1, 5]
      ]

    precision : Double
    precision = 0.01

    actual : Vect 3 Double
    actual = eigenvector matrix precision [1,1,1] []

    -- From WolframAlpha
    expected : Vect 3 Double
    expected = normalize [0.649679, 0.640561, 1]

allRealEigenvectors : IO ()
allRealEigenvectors = describe "all real eigenvectors" $  
  do
    actual <- run $ eigenvectors matrix precision
    traverse_ (uncurry $ shouldBeWithin precision) (zip actual expected)
  where
    matrix : Matrix 3 3 Double
    matrix =
      [ [1, 2, 3]
      , [2, 4, 1] 
      , [3, 1, 5]
      ]

    precision : Double
    precision = 0.0001

    -- Expected eigenvectors copied from WolframAlpha.
    -- It's ok to normalize them, because eigenvectors multiplied by a scalar
    -- remain eigenvectors - but why is it necessary?
    expected : List (Vect 3 Double)
    expected = map normalize 
      [ [0.649679, 0.640561, 1]
      , map negate [-0.0277091, -1.53303, 1]
      , map negate [-2.22197, 0.692466, 1]
      ]

