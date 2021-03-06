module Main where

import Data.Char (isSpace)
import Data.List (isPrefixOf, intersperse, dropWhile)

main :: IO ()
main = do
    src <- fmap lines $ readFile "Eigenvector.lidr"

    let (_, prose, code) = generateProse (src, [], []) 

    writeFile "Eigenvector.idr" $ (unlines . reverse) code
    writeFile "eigenvectors-in-idris.md" $ (unlines . reverse) prose

-- The literate idris source file contains two types of content: code and prose.
generateProse :: ([String], [String], [String]) 
    -> ([String], [String], [String])
generateProse (original, prose, code) = case original of
    [] -> (original, prose, code) -- base case
    (line : lines) -> 
        if "> --- Code hidden from blog post. ---" `isPrefixOf` line
        then generateHiddenCode (lines, prose, code)
        else if ">" `isPrefixOf` line
             then generateCode (original, "```idris" : prose, code)
             else generateProse (lines, line : prose, code)

trimCode :: String -> String
trimCode line = case line of
    (c1 : (c2 : cs)) -> cs
    (c1 : cs) -> cs
    _ -> line

generateCode :: ([String], [String], [String])
    -> ([String], [String], [String])
generateCode (original, prose, code) = case original of
    [] -> (original, prose, code)
    (line : lines) ->
        if ">" `isPrefixOf` line
        then generateCode (lines, trimCode line : prose, trimCode line : code)
        else generateProse (original, "```" : prose, "\n" : code)

-- Because this code is hidden from the blog post, there's no need to emit a 
-- closing ``` when we're done reading a code block.
generateHiddenCode :: ([String], [String], [String])
    -> ([String], [String], [String])
generateHiddenCode (original, prose, code) = case original of
    [] -> (original, prose, code)
    (line : lines) ->
        if ">" `isPrefixOf` line
        then generateHiddenCode (lines, prose, trimCode line : code)
        else generateProse (original, prose, "\n" : code)

