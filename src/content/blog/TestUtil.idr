module TestUtil

should : Show a => (a -> a -> Bool) -> a -> a -> IO ()
should pred actual expected =
  if pred actual expected
  then putStrLn "Test succeeded."
  else do
    putStrLn "Test failed."
    putStrLn $ "    Expected value: " ++ show expected ++ "." 
    putStrLn $ "    Actual value: " ++ show actual ++ "."

