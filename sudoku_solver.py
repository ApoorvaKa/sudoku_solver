#!/usr/bin/env python3
# Sudoku Solver
# Apoorva Kaushik
# Jerry Aska

import argparse

def read_from_file(filename: str) -> list:
    """File to state extractor

    Args:
        filename (str): A file name as a string

    Returns:
        list[list]: A nested list of a sudoku problem
    """
    res = []
    with open(filename) as file_pointer:
        for _ in range(9):
            res.append((file_pointer.readline().strip()).split())
    return res

def test():
    parser = argparse.ArgumentParser(description='Sudoku Solver')
    parser.add_argument('in_file', nargs='?', help='Input file', default=None)
    cmd = parser.parse_args()
    filename = input("Enter the file name: ") if (not cmd.in_file) else cmd.in_file
    state = read_from_file(filename)
    print('\n'.join([' '.join(entry) for entry in state])) # print nicely

if __name__ == "__main__":
    test()
