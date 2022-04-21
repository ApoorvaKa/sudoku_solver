# Sudoku Solver
# Apoorva Kaushik
# Jerry Aska


def get_board(filename):
    with open(filename, 'r') as file:
        board = []
        for line in file:
            row = line.strip().split()
            board.append(row)
    return board

def main():

    board = get_board("sudoku_random.txt")
    for line in board:
        print(line)

main()