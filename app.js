const DOMAIN = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const EMPTY = '0';

const SAMPLE_BOARD = [
  ['5', '3', '0', '0', '7', '0', '0', '0', '0'],
  ['6', '0', '0', '1', '9', '5', '0', '0', '0'],
  ['0', '9', '8', '0', '0', '0', '0', '6', '0'],
  ['8', '0', '0', '0', '6', '0', '0', '0', '3'],
  ['4', '0', '0', '8', '0', '3', '0', '0', '1'],
  ['7', '0', '0', '0', '2', '0', '0', '0', '6'],
  ['0', '6', '0', '0', '0', '0', '2', '8', '0'],
  ['0', '0', '0', '4', '1', '9', '0', '0', '5'],
  ['0', '0', '0', '0', '8', '0', '0', '7', '9'],
];

const boardElement = document.getElementById('sudoku-board');
const statusBox = document.getElementById('status');
const sampleBtn = document.getElementById('sample-btn');
const clearBtn = document.getElementById('clear-btn');
const solveBtn = document.getElementById('solve-btn');
const stepBtn = document.getElementById('step-btn');

let boardState = cloneBoard(SAMPLE_BOARD);
let initialPuzzle = cloneBoard(SAMPLE_BOARD);
let solutionSteps = [];
let stepIndex = 0;
let autoTimer = null;
let selectedCell = null;

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function createBoardCell(row, col, value) {
  const input = document.createElement('input');
  const isFixed = initialPuzzle[row][col] !== EMPTY;

  input.type = 'text';
  input.maxLength = 1;
  input.inputMode = 'numeric';
  input.className = 'cell';
  input.dataset.row = String(row);
  input.dataset.col = String(col);

  if (isFixed) {
    input.value = value;
    input.readOnly = true;
    input.classList.add('clue');
  } else {
    input.value = value === EMPTY ? '' : value;
    input.readOnly = false;
    input.classList.add(value === EMPTY ? 'empty' : 'filled');
    input.addEventListener('input', (event) => {
      const nextValue = event.target.value.replace(/[^1-9]/g, '').slice(-1);
      event.target.value = nextValue;
      const r = Number(event.target.dataset.row);
      const c = Number(event.target.dataset.col);
      boardState[r][c] = nextValue || EMPTY;
      selectedCell = { row: r, col: c };
      renderBoard(boardState);
      setStatus('Board updated. Ready to solve.');
    });
  }

  input.addEventListener('focus', () => {
    selectedCell = { row, col };
    renderBoard(boardState);
  });

  return input;
}

function renderBoard(board = boardState) {
  boardElement.innerHTML = '';
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = board[row][col];
      const cell = createBoardCell(row, col, value);

      if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
        cell.classList.add('highlight');
      }

      if (value === EMPTY) {
        cell.value = '';
      }

      boardElement.appendChild(cell);
    }
  }
}

function setStatus(message) {
  statusBox.textContent = message;
}

function isComplete(state) {
  return state.every((row) => row.every((value) => value !== EMPTY));
}

function isConsistent(state, row, col, candidate) {
  for (let i = 0; i < 9; i += 1) {
    if (state[row][i] === candidate && i !== col) return false;
    if (state[i][col] === candidate && i !== row) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (state[r][c] === candidate && !(r === row && c === col)) return false;
    }
  }

  return true;
}

function degreeHeuristic(state, variables) {
  let best = null;
  let maxDegree = -1;

  for (const [row, col] of variables) {
    let degree = 0;

    for (let i = 0; i < 9; i += 1) {
      if (state[row][i] === EMPTY) degree += 1;
      if (state[i][col] === EMPTY) degree += 1;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r += 1) {
      for (let c = boxCol; c < boxCol + 3; c += 1) {
        if (state[r][c] === EMPTY) degree += 1;
      }
    }

    if (degree > maxDegree) {
      maxDegree = degree;
      best = [row, col];
    }
  }

  return best;
}

function minimumRemainingValue(state) {
  let minCount = 10;
  const variables = [];

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (state[row][col] !== EMPTY) continue;

      let count = 0;
      for (const value of DOMAIN) {
        if (isConsistent(state, row, col, value)) count += 1;
      }

      if (count < minCount) {
        minCount = count;
        variables.length = 0;
        variables.push([row, col]);
      } else if (count === minCount) {
        variables.push([row, col]);
      }
    }
  }

  return variables;
}

function selectUnassignedVariable(state) {
  const candidates = minimumRemainingValue(state);
  return degreeHeuristic(state, candidates);
}

function generateSolutionSteps(startingBoard) {
  const board = cloneBoard(startingBoard);
  const steps = [];

  function search(currentBoard) {
    if (isComplete(currentBoard)) {
      return true;
    }

    const target = selectUnassignedVariable(currentBoard);
    if (!target) {
      return false;
    }

    const [row, col] = target;

    for (const value of DOMAIN) {
      if (!isConsistent(currentBoard, row, col, value)) continue;

      currentBoard[row][col] = value;
      selectedCell = { row, col };
      steps.push({
        board: cloneBoard(currentBoard),
        selectedCell: { row, col },
        message: `Trying ${value} in row ${row + 1}, column ${col + 1}.`,
      });

      if (search(currentBoard)) {
        return true;
      }

      currentBoard[row][col] = EMPTY;
      selectedCell = { row, col };
      steps.push({
        board: cloneBoard(currentBoard),
        selectedCell: { row, col },
        message: `Backtracking from row ${row + 1}, column ${col + 1}.`,
      });
    }

    return false;
  }

  const solved = search(board);
  return { solved, steps };
}

function startAnimation() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  if (stepIndex >= solutionSteps.length) {
    stepIndex = 0;
  }

  autoTimer = setInterval(() => {
    if (stepIndex >= solutionSteps.length) {
      clearInterval(autoTimer);
      autoTimer = null;
      selectedCell = null;
      renderBoard(boardState);
      setStatus('Solved! The board is complete.');
      return;
    }

    const step = solutionSteps[stepIndex];
    boardState = cloneBoard(step.board);
    selectedCell = step.selectedCell || selectedCell;
    renderBoard(boardState);
    setStatus(step.message);
    stepIndex += 1;
  }, 120);
}

function solveBoard() {
  const currentBoard = cloneBoard(boardState);
  const result = generateSolutionSteps(currentBoard);

  if (!result.solved) {
    setStatus('No valid solution exists for this board.');
    return;
  }

  solutionSteps = result.steps;
  stepIndex = 0;
  startAnimation();
}

function stepBoard() {
  if (!solutionSteps.length) {
    const result = generateSolutionSteps(cloneBoard(boardState));
    if (!result.solved) {
      setStatus('No valid solution exists for this board.');
      return;
    }
    solutionSteps = result.steps;
    stepIndex = 0;
  }

  if (stepIndex >= solutionSteps.length) {
    setStatus('Solved! The board is complete.');
    return;
  }

  const step = solutionSteps[stepIndex];
  boardState = cloneBoard(step.board);
  selectedCell = step.selectedCell || selectedCell;
  renderBoard(boardState);
  setStatus(step.message);
  stepIndex += 1;
}

function loadSamplePuzzle() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  boardState = cloneBoard(SAMPLE_BOARD);
  initialPuzzle = cloneBoard(SAMPLE_BOARD);
  solutionSteps = [];
  stepIndex = 0;
  selectedCell = null;
  renderBoard(boardState);
  setStatus('Sample puzzle loaded.');
}

function clearBoard() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  boardState = Array.from({ length: 9 }, () => Array(9).fill(EMPTY));
  initialPuzzle = cloneBoard(boardState);
  solutionSteps = [];
  stepIndex = 0;
  selectedCell = null;
  renderBoard(boardState);
  setStatus('Board cleared. Start entering your puzzle.');
}

sampleBtn.addEventListener('click', loadSamplePuzzle);
clearBtn.addEventListener('click', clearBoard);
solveBtn.addEventListener('click', solveBoard);
stepBtn.addEventListener('click', stepBoard);

renderBoard(boardState);
setStatus('Ready to solve.');
