# Artificial Intelligence Sudoku Solver

```
Apoorva Kaushik
April 20, 2022
CS 4613 Project 2
```
---
## Running the solver
1. Download sudoku_solver.py
2. Place the sudoku_solver.py file in the same directory as formatted input files that will be solved.
3. Open your shell to the directory where the sudoku_solver.py file and input files are located.
4. Run the following command in the terminal:
    ```
    python3 sudoku_solver.py <input_file_name>
    ```
    Alternatively, you can run the following command in the terminal:
    ```
    python3 sudoku_solver.py
    ``` 
    After doing so you will need to type in the name of the file when prompted to do so.

5. Files containing the solved sudoku will be created in the same directory as the sudoku_solver.py file as follows:
    ```
    Output#.txt
    ```
**Note:** The input file should be named Input`#`.txt where `#` is the number of the input file. This will produce a correlated output file named Output`#`.txt.

## Outputs
---
Output1.txt
```
1 3 2 5 6 9 7 8 4
6 8 5 2 7 4 1 9 3
4 9 7 8 3 1 2 6 5
8 5 6 4 9 2 3 1 7
3 7 1 6 8 5 9 4 2
9 2 4 7 1 3 6 5 8
2 4 9 3 5 6 8 7 1
5 1 8 9 2 7 4 3 6
7 6 3 1 4 8 5 2 9
```

---
Output2.txt
```
4 5 3 6 7 8 9 1 2
2 8 1 5 3 9 7 6 4
9 6 7 4 1 2 3 5 8
3 7 5 1 6 4 2 8 9
6 9 4 2 8 3 5 7 1
1 2 8 7 9 5 6 4 3
8 3 6 9 5 1 4 2 7
5 4 9 8 2 7 1 3 6
7 1 2 3 4 6 8 9 5
```
---
Output3.txt
```
5 7 6 3 4 1 9 2 8
8 2 1 9 6 5 7 4 3
9 4 3 8 7 2 5 6 1
1 6 8 4 5 7 3 9 2
2 9 7 1 3 8 6 5 4
4 3 5 2 9 6 1 8 7
3 5 2 7 8 9 4 1 6
6 1 4 5 2 3 8 7 9
7 8 9 6 1 4 2 3 5
```

## Source Code
---