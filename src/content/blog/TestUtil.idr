module TestUtil

describe : String -> IO () -> IO ()
describe info runTest = do
  putStr $ info ++ ": "
  runTest

should : Show a => (a -> a -> Bool) -> a -> a -> IO ()
should pred actual expected =
  if pred actual expected
  then putStrLn "Succeeded."
  else do
    putStrLn " Failed."
    putStrLn $ "    Expected value: " ++ show expected ++ "." 
    putStrLn $ "    Actual value: " ++ show actual ++ "."

