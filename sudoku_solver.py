#!/usr/bin/env python3
# Sudoku Solver
# Apoorva Kaushik

import argparse
import re
import copy

DOMAIN = [str(i) for i in range(1, 10)]

def print_board(sudoku_board):
    """
    Prints the sudoku board in required format
    """
    print('\n'.join([' '.join(entry) for entry in sudoku_board]))


def is_complete(state: list) -> bool:
    """Checks if the sudoku board is complete

    Parameters:
        state (list): A nested list of a sudoku problem

    Returns:
        bool: True if the board is complete, False otherwise
    """
    for row in state:
        if '0' in row:
            return False
    return True

def degree_heuristic(sudoku_board: list, variables: list) -> tuple:
    """
    Selects the variable with the most constraints

    Parameters:
        sudoku_board (list): A nested list of a sudoku problem
        variables (list): A list of variables

    Returns:
        tuple: A tuple of the row and column of the empty cell
    """
    max_count = -1
    for var in variables:
        count = 0
        for value in DOMAIN:
            if is_consistent(sudoku_board, var[0], var[1], value):
                count += 1
        if count > max_count:
            max_count = count
            max_var = var
    return max_var

def minimum_remaining_value(board: list) -> tuple:
    """Finds the empty cell in a sudoku board with fewest possible values

    Parameters:
        board (list): A nested list of a sudoku problem

    Returns:
        tuple: A tuple of the row and column of the empty cell
    """
    min_count = 10
    variables = []
    for i in range(9):
        for j in range(9):
            if board[i][j] == '0':
                count = 0
                for value in DOMAIN:
                    if is_consistent(board, i, j, value):
                        count += 1
                if count < min_count:
                    min_count = count
                    variables = [(i, j)]
                elif count == min_count:
                    variables.append((i, j))
    return variables

# This is the traditional backtrack selection. Just selects the first empty cell to fill
def select_unassigned_variable(state: list) -> tuple:
    """
    Return the first unasigned variable in the sudoku board
    """
    minimum_variables = minimum_remaining_value(state)
    variable = degree_heuristic(state, minimum_variables)
    print(minimum_variables, variable)
    return variable

def is_consistent(state: list, row: int, col: int, num: int) -> bool:
    """Checks if the given number is consistent with the given row and column

    Parameters:
        state (list): A nested list of a sudoku problem
        row (int): The row index
        col (int): The column index
        num (int): The number to be checked

    Returns:
        bool: True if the number is consistent, False otherwise
    """
    for i in range(9):
        if state[row][i] == num:
            return False
        if state[i][col] == num:
            return False
    row_start = (row // 3) * 3
    col_start = (col // 3) * 3
    for i in range(row_start, row_start + 3):
        for j in range(col_start, col_start + 3):
            if state[i][j] == num:
                return False
    return True

def backtrack(csp, state):
    """
    Backtracking algorithm to solve sudoku
    """
    if is_complete(state):
        return state
    var = select_unassigned_variable(state)
    #for value in order_domain_values(state, var):
    for value in DOMAIN:
        if is_consistent(state, var[0], var[1], value):
            state[var[0]][var[1]] = value
            print("----------------")
            print_board(state)
            if backtrack(csp, state):
                return state
            state[var[0]][var[1]] = '0'
    return None

def read_from_file(filename: str) -> list:
    """
    File to state extractor

    Parameters:
        filename (str): A file name as a string

    Returns:
        list[list]: A nested list of a sudoku problem
    """
    res = []
    with open(filename) as file_pointer:
        for _ in range(9):
            res.append((file_pointer.readline().strip()).split())
    return res

def main():
    ## ArgParse + Regex for input file read and output file write
    parser = argparse.ArgumentParser(description='Sudoku Solver')
    parser.add_argument('in_file', nargs='?', help='Input file', default=None)
    cmd = parser.parse_args()
    filename = input("Enter the file name: ") if (not cmd.in_file) else cmd.in_file
    temp = re.findall(r'\d+', filename)
    res = list(map(int, temp))
    print(res)
    
    ## Read from file and solve the sudoku
    csp = read_from_file(filename)
    print_board(csp)
    state = copy.deepcopy(csp)
    final = backtrack(csp, state)
    print("-----------------")
    # print(final)
    print_board(final)


if __name__ == "__main__":
    main()
