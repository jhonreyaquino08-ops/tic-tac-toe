const cells = document.querySelectorAll(".cell");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const modeCpu = document.getElementById("modeCpu");
const modeFriend = document.getElementById("modeFriend");
const scoreEls = {
  X: document.getElementById("scoreX"),
  O: document.getElementById("scoreO"),
  D: document.getElementById("scoreD"),
};

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let board, current, gameOver, vsCpu = true;
const scores = { X: 0, O: 0, D: 0 };

function newGame() {
  board = Array(9).fill("");
  current = "X";
  gameOver = false;
  cells.forEach((c) => {
    c.textContent = "";
    c.disabled = false;
    c.className = "cell";
  });
  statusEl.textContent = "Turn ni X";
}

function findWinner(b) {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a], line };
  }
  return null;
}

function place(i) {
  board[i] = current;
  cells[i].textContent = current;
  cells[i].classList.add(current.toLowerCase());
  cells[i].disabled = true;

  const win = findWinner(board);
  if (win) {
    win.line.forEach((n) => cells[n].classList.add("win"));
    statusEl.textContent = `Panalo si ${win.player}! 🎉`;
    scores[win.player]++;
    return endGame();
  }
  if (board.every(Boolean)) {
    statusEl.textContent = "Tabla! 🤝";
    scores.D++;
    return endGame();
  }

  current = current === "X" ? "O" : "X";
  statusEl.textContent = `Turn ni ${current}`;

  if (vsCpu && current === "O") {
    cells.forEach((c) => (c.disabled = true));
    setTimeout(cpuMove, 450);
  }
}

function endGame() {
  gameOver = true;
  cells.forEach((c) => (c.disabled = true));
  for (const k in scores) scoreEls[k].textContent = scores[k];
}

// Simple AI: manalo > harangin ang panalo ni X > gitna > kanto > kahit ano
function cpuMove() {
  if (gameOver) return;
  const empty = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);

  const tryWin = (player) => {
    for (const i of empty) {
      const copy = [...board];
      copy[i] = player;
      if (findWinner(copy)) return i;
    }
    return null;
  };

  let move = tryWin("O");
  if (move === null) move = tryWin("X");
  if (move === null && empty.includes(4)) move = 4;
  if (move === null) {
    const corners = [0, 2, 6, 8].filter((i) => empty.includes(i));
    if (corners.length) move = corners[Math.floor(Math.random() * corners.length)];
  }
  if (move === null) move = empty[Math.floor(Math.random() * empty.length)];

  // i-enable ulit ang mga bakanteng cell bago maglagay
  empty.forEach((i) => (cells[i].disabled = false));
  place(move);
  if (!gameOver) empty.forEach((i) => { if (!board[i]) cells[i].disabled = false; });
}

cells.forEach((c) =>
  c.addEventListener("click", () => {
    if (gameOver) return;
    place(Number(c.dataset.i));
  })
);

function setMode(cpu) {
  vsCpu = cpu;
  modeCpu.classList.toggle("active", cpu);
  modeFriend.classList.toggle("active", !cpu);
  newGame();
}

modeCpu.addEventListener("click", () => setMode(true));
modeFriend.addEventListener("click", () => setMode(false));
restartBtn.addEventListener("click", newGame);

newGame();