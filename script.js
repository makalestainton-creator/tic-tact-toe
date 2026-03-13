// DOM references — declared here so they're available as free variables above
const dialogue = document.querySelector(".js-starting-dialogue");
const customNameContainers = document.querySelectorAll(
  ".js-custom-name-container",
);
const playerOneInput = document.getElementById("player-one-name");
const playerTwoInput = document.getElementById("player-two-name");
const checkBoxContainer = document.querySelector(".js-default-players");
const checkBox = document.getElementById("default-choice");
const usernameContainer = document.querySelector(".js-username-container");
const vsComputerInput = document.getElementById("username");

const playerOneStats = document.querySelector(".js-player1");
const playerOneName = playerOneStats.querySelector(".player-one-name");
const playerOneWins = playerOneStats.querySelector(".js-wins");
const playerOneDraws = playerOneStats.querySelector(".js-draws");
const playerOneLosses = playerOneStats.querySelector(".js-losses");

const playerTwoStats = document.querySelector(".js-player2");
const playerTwoName = playerTwoStats.querySelector(".player-two-name");
const playerTwoWins = playerTwoStats.querySelector(".js-wins");
const playerTwoDraws = playerTwoStats.querySelector(".js-draws");
const playerTwoLosses = playerTwoStats.querySelector(".js-losses");

const players = [
  {
    playerName: "Player1",
    token: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
          d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z"
          />
        </svg>
      `,
    score: {
      wins: 0,
      draws: 0,
      losses: 0,
    },
  },
  {
    playerName: "Player2",
    token: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
          d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
          />
        </svg>
      `,
    score: {
      wins: 0,
      draws: 0,
      losses: 0,
    },
  },
];

let activePlayer = players[0];

playerOneName.textContent = players[0].playerName;
playerTwoName.textContent = players[1].playerName;

// ─── GAME STATE ───────────────────────────────────────────────────────────────
// ADDED: tracks mode and difficulty without touching anything else
const gameState = {
  mode: "pvp", // "pvp" | "computer"

  isComputerTurn() {
    return this.mode === "computer" && activePlayer === players[1];
  },
};

const Gameboard = {
  board: [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ],

  domCells: [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ],

  // ADDED: replaces the stub — returns all empty [row, col] pairs
  getEmptyCells() {
    const empty = [];
    this.board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === "") empty.push([r, c]);
      });
    });
    return empty;
  },

  switchPlayer() {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  },

  getActivePlayer() {
    return activePlayer;
  },

  makeMove(row, col) {
    if (this.board[row][col] !== "") {
      return false;
    }
    this.board[row][col] = activePlayer;
    return true;
  },

  checkWinner() {
    const lines = [
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ];

    for (let [[r1, c1], [r2, c2], [r3, c3]] of lines) {
      const a = this.board[r1][c1];
      if (a && a === this.board[r2][c2] && a === this.board[r3][c3]) {
        return {
          player: a,
          cells: [
            [r1, c1],
            [r2, c2],
            [r3, c3],
          ],
        };
      }
    }
    return null;
  },

  checkDraw() {
    return this.board.every((row) => row.every((cell) => cell !== ""));
  },
};

// ─── COMPUTER AI ──────────────────────────────────────────────────────────────
const Computer = {

  pickMove() {
    const empty = Gameboard.getEmptyCells();

    const findWinningMove = (player) => {
      for (const [r, c] of empty) {
        Gameboard.board[r][c] = player;
        const win = Gameboard.checkWinner();
        Gameboard.board[r][c] = "";
        if (win) return [r, c];
      }
      return null;
    };

    // 1. Take the win if available
    const winMove = findWinningMove(players[1]);
    if (winMove) return winMove;

    // 2. Block the human from winning
    const blockMove = findWinningMove(players[0]);
    if (blockMove) return blockMove;

    // 3. Fall back to random
    return empty[Math.floor(Math.random() * empty.length)];
  },
};

const gamePlay = {
  restartGame() {
    this.newRound;
    players[0].score.wins = 0;
    players[0].score.draws = 0;
    players[0].score.losses = 0;

    players[1].score.wins = 0;
    players[1].score.draws = 0;
    players[1].score.losses = 0;
    display.renderScore();
  },

  newRound() {
    Gameboard.board.forEach((row, rowIndex) => {
      row.forEach((_, cellIndex) => {
        Gameboard.board[rowIndex][cellIndex] = "";
      });
    });
    activePlayer = players[0];
  },
};

const display = {
  displayStartUpDialogue() {
    document.querySelector(".js-overlay").classList.add("overlay-active");
    dialogue.classList.add("active");
    setTimeout(() => {
      dialogue.querySelector(".js-before").classList.add("animation-before");
      dialogue.querySelector(".js-after").classList.add("animation-after");
    }, 100);
  },

  closeDialogue() {
    document.querySelector(".js-overlay").classList.remove("overlay-active");
    dialogue.classList.remove("active");
  },

  renderScore() {
    playerOneWins.textContent = `${players[0].score.wins}`;
    playerOneDraws.textContent = `${players[0].score.draws}`;
    playerOneLosses.textContent = `${players[0].score.losses}`;

    playerTwoWins.textContent = `${players[1].score.wins}`;
    playerTwoDraws.textContent = `${players[1].score.draws}`;
    playerTwoLosses.textContent = `${players[1].score.losses}`;
  },

  // ADDED: prevents clicks while computer is thinking
  lockBoard(locked) {
    document.querySelector(".js-cell-container").style.pointerEvents =
      locked ? "none" : "";
  },

  // ADDED: shared end-of-turn logic used by both human click and computer move
  handleTurnEnd() {
    const result = Gameboard.checkWinner();

    if (result) {
      const popup = document.querySelector(".win-popup");
      popup.querySelector("h2").textContent =
        `${result.player.playerName} Wins!`;
      popup.classList.remove("hidden");
      setTimeout(() => popup.classList.add("hidden"), 3000);

      result.cells.forEach(([r, c]) => {
        Gameboard.domCells[r][c].classList.add("winning-cell");
      });

      players.forEach((player) => {
        if (player.playerName === result.player.playerName) {
          player.score.wins++;
        } else {
          player.score.losses++;
        }
      });
      display.renderScore();

      setTimeout(() => {
        gamePlay.newRound();
        display.renderBoard();
      }, 1500);
      return;
    }

    if (Gameboard.checkDraw()) {
      const popup = document.querySelector(".win-popup");
      popup.querySelector("h2").textContent = "It's a draw!";
      popup.classList.remove("hidden");
      setTimeout(() => popup.classList.add("hidden"), 3000);

      players.forEach((player) => { player.score.draws++; });
      display.renderScore();

      setTimeout(() => {
        gamePlay.newRound();
        display.renderBoard();
      }, 1500);
      return;
    }

    // Switch player and update turn indicator
    Gameboard.switchPlayer();
    document.querySelector(".turn").textContent =
      `${Gameboard.getActivePlayer().playerName}'s turn`;

    // ADDED: if it's now the computer's turn, trigger it after a short delay
    if (gameState.isComputerTurn()) {
      this.lockBoard(true);
      setTimeout(() => this.runComputerTurn(), 500);
    }
  },

  // ADDED: executes the computer's chosen move and renders it
  runComputerTurn() {
    const [row, col] = Computer.pickMove();
    Gameboard.makeMove(row, col);

    const cell = Gameboard.domCells[row][col];
    cell.innerHTML = players[1].token;
    cell.firstElementChild.classList.add("svg-visible");

    this.lockBoard(false);
    this.handleTurnEnd();
  },

  renderBoard() {
    const cellContainer = document.querySelector(".js-cell-container");
    cellContainer.innerHTML = "";

    Gameboard.board.forEach((row, rowIndex) => {
      row.forEach((_, cellIndex) => {
        const cell = document.createElement("div");
        cell.setAttribute("class", "cell");
        cellContainer.appendChild(cell);

        Gameboard.domCells[rowIndex][cellIndex] = cell;

        cell.addEventListener("click", () => {
          // ADDED: ignore clicks when it's the computer's turn
          if (gameState.isComputerTurn()) return;
          if (!Gameboard.makeMove(rowIndex, cellIndex)) return;

          const activePlayer = Gameboard.getActivePlayer();
          cell.innerHTML = activePlayer.token;
          const svg = cell.firstElementChild;
          svg.classList.add("svg-visible");

          // ADDED: delegate to handleTurnEnd instead of inline logic
          display.handleTurnEnd();
        });
      });
    });

    document.querySelector(".turn").textContent =
      `${activePlayer.playerName}'s turn`;
  },
};

const customUsers = {
  controlInputs() {
    playerOneInput.addEventListener("focus", () => {
      this.disableInput(checkBoxContainer);
      this.disableInput(usernameContainer);
    });

    playerTwoInput.addEventListener("focus", () => {
      this.disableInput(checkBoxContainer);
      this.disableInput(usernameContainer);
    });

    checkBox.addEventListener("focus", () => {
      this.disableInput(usernameContainer);
      customNameContainers.forEach((container) => this.disableInput(container));
    });

    vsComputerInput.addEventListener("focus", () => {
      customNameContainers.forEach((container) => this.disableInput(container));
      this.disableInput(checkBoxContainer);
    });
  },

  disableInput(input) {
    input.classList.add("disabled");
  },

  enableInput(input) {
    input.classList.remove("disabled");
  },

  clearInputs(input) {
    input.value = "";
  },

  // FIX: read input values at click time, not at object creation time
  renamePlayers() {
    const p1 = playerOneInput.value.trim();
    const p2 = playerTwoInput.value.trim();

    if (p1) players[0].playerName = p1;
    if (p2) players[1].playerName = p2;
    playerOneName.textContent = p1;
    playerTwoName.textContent = p2;
  },
};

customUsers.controlInputs();

// FIX: call both on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  display.displayStartUpDialogue();
  display.renderBoard();
  display.renderScore();
});

document.querySelector(".js-proceed").addEventListener("click", () => {
  if (
    (playerOneInput.value && !playerTwoInput.value) ||
    (!playerOneInput.value && playerTwoInput.value)
  ) {
    alert("Please add a second player");
    return;
  }

  if (
    !playerOneInput.value &&
    !playerTwoInput.value &&
    checkBox.checked === false &&
    !vsComputerInput.value
  ) {
    alert("Please choose an option to proceed");
    return;
  }

  if (checkBox.checked === true) {
    display.closeDialogue();
    return;
  }
  display.closeDialogue();
  customUsers.renamePlayers();
  document.querySelector(".turn").textContent =
    `${activePlayer.playerName}'s turn`;
});

document.querySelector(".restart-button").addEventListener("click", () => {
  gamePlay.restartGame();
  display.renderBoard();
});

// ─── MODE & DIFFICULTY BUTTONS ────────────────────────────────────────────────
// ADDED: wire up the existing mode/difficulty buttons in the UI

function switchMode(mode) {
  gameState.mode = mode;

  // Sync active state on all mode buttons across mode-bar and game-mode panel
  document.querySelectorAll(".mode-bar .mode, .game-mode .mode").forEach(btn => {
    const btnMode = btn.textContent.trim() === "Two Players" ? "pvp" : "computer";
    btn.classList.toggle("active", btnMode === mode);
  });

  // Rename player2 to "Computer" or restore their typed name
  if (mode === "computer") {
    players[1].playerName = "Computer";
  } else {
    const typed = playerTwoInput.value.trim();
    players[1].playerName = typed || "Player2";
  }

  playerTwoName.textContent = players[1].playerName;
  gamePlay.newRound();
  display.renderBoard();
}

document.querySelectorAll(".mode-bar .mode, .game-mode .mode").forEach(btn => {
  btn.addEventListener("click", () => {
    const mode = btn.textContent.trim() === "Two Players" ? "pvp" : "computer";
    switchMode(mode);
  });
});