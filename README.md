## Guy's sudoku assistant.

It doesn't tell you the solution or give you hints
but it keeps track of the numbers that you've already
used so you can figure what's left to do.

The coordinate system used by the code is:

```
[ 0  1  2  3  4  5  6  7  8]
[ 9 10 11 12 13 14 15 16 17]
[18 19 20 21 22 23 24 25 26]
[27 28 29 30 31 32 33 34 35]
[36 37 38 39 40 41 42 43 44]
[44 45 46 47 48 49 50 51 52]
[53 54 55 56 57 58 59 60 61]
[62 63 64 65 66 67 68 69 70]
[71 72 73 74 75 76 78 79 90]
```

The assistant keeps track of three sets of lines for you:
boxes, vertical lines and horizontal lines.

Boxes refers to the 9 3x3 boxes that make up the Sudoku board.
So the top left box is:

```
[ 0  1  2]
[ 9 10 11]
[18 19 20]
```

VLines are the nine vertical lines that make up the Sudoku board.
So the first vertical line is:

```
[ 0]
[ 9]
[18]
[27]
[36]
[44]
[53]
[62]
[71]
```

HLines are the nine horizontal lines that make up the Sudoku board.
The the first horizontal line is:

```
[ 0  1  2  3  4  5  6  7  8]
```

If you put two of the same number in one of the lines, you get an alert.

There's an undo button so you can revert the board to an earlier state.

There's also a file uploader so you can load puzzles from elsewhere.
You can upload sudoku001.txt in the project dir, for instance.
The uploader expects the file to consist of nine lines, each line contains
nine numbers (seperating by any non-digit characters)
with 0 being used to denote empty squares.

It's uses http-server to serve up the html.
To get prepare the project, do: ```npm install```.
To run it, do: ```npm start```.
