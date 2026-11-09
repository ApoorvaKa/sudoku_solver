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

const SAMPLE_BOARDS = [
  SAMPLE_BOARD,
  [
    ['0', '0', '0', '5', '6', '0', '7', '0', '4'],
    ['6', '8', '0', '0', '7', '0', '0', '9', '0'],
    ['4', '9', '0', '0', '0', '1', '2', '0', '0'],
    ['8', '5', '0', '4', '0', '0', '0', '1', '0'],
    ['0', '0', '1', '6', '0', '5', '9', '0', '0'],
    ['0', '2', '0', '0', '0', '3', '0', '5', '8'],
    ['0', '0', '9', '3', '0', '0', '0', '7', '1'],
    ['0', '1', '0', '0', '2', '0', '0', '3', '6'],
    ['7', '0', '3', '0', '4', '8', '0', '0', '0'],
  ],
];

const boardElement = document.getElementById('sudoku-board');
const statusBox = document.getElementById('status');
const traceList = document.getElementById('dfs-trace');
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
let activePath = [];

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

function renderBoard(board = boardState, stateMap = {}) {
  boardElement.innerHTML = '';
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = board[row][col];
      const cell = createBoardCell(row, col, value);
      const key = `${row}-${col}`;

      if (activePath.some((entry) => entry.row === row && entry.col === col)) {
        cell.classList.add('path');
      }

      if (stateMap[key]) {
        cell.classList.add(stateMap[key]);
      }

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

function renderTrace(entries) {
  traceList.innerHTML = '';
  entries.slice(-10).forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = entry.message;
    item.classList.add(entry.state || 'guess');
    traceList.appendChild(item);
  });
}

function formatTracePath(pathEntries) {
  if (!pathEntries.length) {
    return 'Start';
  }

  return pathEntries.map(({ row, col, value }) => `R${row + 1}C${col + 1}=${value}`).join(' -> ');
}

function refreshTraceDisplay() {
  const visibleTrace = solutionSteps
    .slice(0, Math.max(0, stepIndex))
    .map((step) => ({
      message: step.trace,
      state: step.state || 'guess',
    }))
    .filter((entry) => entry.message);
  renderTrace(visibleTrace);
}

function boardHasConflicts(board) {
  for (let row = 0; row < 9; row += 1) {
    const seen = {};
    for (let col = 0; col < 9; col += 1) {
      const value = board[row][col];
      if (value === EMPTY) continue;
      if (seen[value]) return true;
      seen[value] = true;
    }
  }

  for (let col = 0; col < 9; col += 1) {
    const seen = {};
    for (let row = 0; row < 9; row += 1) {
      const value = board[row][col];
      if (value === EMPTY) continue;
      if (seen[value]) return true;
      seen[value] = true;
    }
  }

  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = {};
      for (let row = boxRow; row < boxRow + 3; row += 1) {
        for (let col = boxCol; col < boxCol + 3; col += 1) {
          const value = board[row][col];
          if (value === EMPTY) continue;
          if (seen[value]) return true;
          seen[value] = true;
        }
      }
    }
  }

  return false;
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
  const pathEntries = [];

  function buildStateMap(entries, overrideState) {
    const stateMap = {};
    entries.forEach(({ row, col }) => {
      stateMap[`${row}-${col}`] = overrideState;
    });
    return stateMap;
  }

  function search(currentBoard) {
    if (isComplete(currentBoard)) {
      const solvedStateMap = {};
      currentBoard.forEach((rowData, row) => {
        rowData.forEach((value, col) => {
          if (value !== EMPTY) {
            solvedStateMap[`${row}-${col}`] = 'solved';
          }
        });
      });
      steps.push({
        board: cloneBoard(currentBoard),
        selectedCell: null,
        path: pathEntries.map((entry) => ({ row: entry.row, col: entry.col })),
        cellStates: solvedStateMap,
        trace: 'Solved: board complete',
        state: 'solved',
        message: 'Solved! The board is complete.',
      });
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
      pathEntries.push({ row, col, value });
      const guessStateMap = buildStateMap(pathEntries, 'guess');
      selectedCell = { row, col };
      steps.push({
        board: cloneBoard(currentBoard),
        selectedCell: { row, col },
        path: pathEntries.map((entry) => ({ row: entry.row, col: entry.col })),
        cellStates: guessStateMap,
        trace: `DFS path: ${formatTracePath(pathEntries)}`,
        state: 'guess',
        message: `Trying ${value} in row ${row + 1}, column ${col + 1}.`,
      });

      if (search(currentBoard)) {
        return true;
      }

      const invalidMap = buildStateMap(pathEntries, 'invalid');
      steps.push({
        board: cloneBoard(currentBoard),
        selectedCell: { row, col },
        path: pathEntries.map((entry) => ({ row: entry.row, col: entry.col })),
        cellStates: invalidMap,
        trace: `Invalid branch: ${formatTracePath(pathEntries)}`,
        state: 'invalid',
        message: `Value ${value} failed for row ${row + 1}, column ${col + 1}.`,
      });

      pathEntries.pop();
      currentBoard[row][col] = EMPTY;
      const backtrackMap = buildStateMap(pathEntries, 'backtrack');
      selectedCell = { row, col };
      steps.push({
        board: cloneBoard(currentBoard),
        selectedCell: { row, col },
        path: pathEntries.map((entry) => ({ row: entry.row, col: entry.col })),
        cellStates: backtrackMap,
        trace: `Backtrack: ${formatTracePath(pathEntries)}`,
        state: 'backtrack',
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
      renderBoard(boardState, {});
      refreshTraceDisplay();
      const lastStep = solutionSteps[solutionSteps.length - 1];
      if (lastStep && lastStep.state === 'invalid') {
        setStatus('No valid solution exists for this board.');
      } else {
        setStatus('Solved! The board is complete.');
      }
      return;
    }

    const step = solutionSteps[stepIndex];
    boardState = cloneBoard(step.board);
    selectedCell = step.selectedCell || selectedCell;
    activePath = step.path || [];
    renderBoard(boardState, step.cellStates || {});
    setStatus(step.message);
    stepIndex += 1;
    refreshTraceDisplay();
  }, 120);
}

function solveBoard() {
  const currentBoard = cloneBoard(boardState);

  if (boardHasConflicts(currentBoard)) {
    setStatus('This board has conflicting clues. Fix the duplicates before solving.');
    return;
  }

  const result = generateSolutionSteps(currentBoard);

  if (!result.steps.length) {
    setStatus('No valid solution exists for this board.');
    return;
  }

  solutionSteps = result.steps;
  stepIndex = 0;
  refreshTraceDisplay();
  startAnimation();
}

function stepBoard() {
  if (!solutionSteps.length) {
    if (boardHasConflicts(boardState)) {
      setStatus('This board has conflicting clues. Fix the duplicates before solving.');
      return;
    }

    const result = generateSolutionSteps(cloneBoard(boardState));
    if (!result.steps.length) {
      setStatus('No valid solution exists for this board.');
      return;
    }
    solutionSteps = result.steps;
    stepIndex = 0;
  }

  if (stepIndex >= solutionSteps.length) {
    const lastStep = solutionSteps[solutionSteps.length - 1];
    setStatus(lastStep && lastStep.state === 'invalid' ? 'No valid solution exists for this board.' : 'Solved! The board is complete.');
    refreshTraceDisplay();
    return;
  }

  const step = solutionSteps[stepIndex];
  boardState = cloneBoard(step.board);
  selectedCell = step.selectedCell || selectedCell;
  activePath = step.path || [];
  renderBoard(boardState, step.cellStates || {});
  setStatus(step.message);
  stepIndex += 1;
  refreshTraceDisplay();
}

function loadSamplePuzzle() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  const board = SAMPLE_BOARDS[Math.floor(Math.random() * SAMPLE_BOARDS.length)];
  boardState = cloneBoard(board);
  initialPuzzle = cloneBoard(board);
  solutionSteps = [];
  stepIndex = 0;
  selectedCell = null;
  activePath = [];
  renderBoard(boardState, {});
  renderTrace([]);
  setStatus('Random sample puzzle loaded.');
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
  activePath = [];
  renderBoard(boardState, {});
  renderTrace([]);
  setStatus('Board cleared. Start entering your puzzle.');
}

sampleBtn.addEventListener('click', loadSamplePuzzle);
clearBtn.addEventListener('click', clearBoard);
solveBtn.addEventListener('click', solveBoard);
stepBtn.addEventListener('click', stepBoard);

renderBoard(boardState, {});
renderTrace([]);
setStatus('Ready to solve.');
