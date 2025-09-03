function createTicTacToeGame() {
  /* 
  A controller for handling player turns
  1 - for player X
  0 - for player O
  */
  const PlayerController = (function (
    playerOneName = "Player One",
    playerTwoName = "Player Two"
  ) {
    const players = [
      {
        name: playerOneName,
        token: "X",
      },
      {
        name: playerTwoName,
        token: "O",
      },
    ];

    let activePlayer = players[0];

    const reset = () => {
      activePlayer = players[0];
    };

    const changePlayer = () => {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getCurrentPlayer = () => activePlayer;

    return { changePlayer, getCurrentPlayer, reset };
  })();

  const Gameboard = (function () {
    const rows = 3;
    const columns = 3;
    const board = [];

    const createTile = () => {
      let tileState = "";

      const setState = (player) => {
        tileState = player;
      };

      const getState = () => tileState;

      return {
        setState,
        getState,
      };
    };

    const reset = () => {
      board.splice(0);

      for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
          board[i].push(createTile());
        }
      }
    };

    const placeToken = (row, column) => {
      const tokenToPlace = PlayerController.getCurrentPlayer().token;

      board[row][column].setState(tokenToPlace);
    };

    const getBoard = () => board;

    reset();

    return { placeToken, getBoard, reset };
  })();

  const GameController = (function () {
    let turnCounter = 0;

    const reset = () => {
      turnCounter = 0;
    };

    const makeTurn = (row, column) => {
      const player = PlayerController.getCurrentPlayer();
      const affectedTileToken = Gameboard.getBoard()[row][column].getState();

      if (affectedTileToken === "") {
        console.log(
          `Placing ${player.name}'s token (${player.token}) onto the (${row}, ${column}) tile...`
        );
        Gameboard.placeToken(row, column);
        return true;
      } else {
        console.log(
          `The (${row}, ${column}) tile is already taken by token ${affectedTileToken}`
        );
        return false;
      }
    };

    const checkForWin = () => {
      const board = Gameboard.getBoard();

      // Tile combinations that result in a win
      // if all are occupied by the same player
      let combs = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

      for (const comb of combs) {
        const tokens = comb.map((index) =>
          board[Math.floor(index / 3)][index % 3].getState()
        );

        if (tokens.every((token) => token === tokens[0] && token !== ""))
          return true;
      }

      return false;
    };

    // Returns
    // -1 - if the current position or the position after performing the move is a tie
    // 0 - if the game continues
    // 1 - if the current position or the position after performing the move is a win for some player
    const playRound = (row, column) => {
      if (turnCounter > 8) {
        console.log(
          `The gameboard is filled, but no player met the winning condition. It's a tie!`
        );
        return -1;
      } else if (checkForWin()) {
        const winningPlayer = PlayerController.getCurrentPlayer();
        console.log(
          `The game is won by player ${winningPlayer.name} (token ${winningPlayer.token})!`
        );
        return 1;
      }
      // Play another round
      else if (makeTurn(row, column)) {
        turnCounter++;

        const player = PlayerController.getCurrentPlayer();
        if (checkForWin()) {
          console.log(
            `The player ${player.name} has won the game, delivering a final move with ${player.token}!`
          );
          return 1;
        } else if (turnCounter > 8) {
          return -1;
        } else {
          PlayerController.changePlayer();
          return 0;
        }
      }
    };

    return { playRound, reset };
  })();

  const reset = () => {
    Gameboard.reset();
    PlayerController.reset();
    GameController.reset();
  };

  return {
    getBoard: Gameboard.getBoard,
    getCurrentPlayer: PlayerController.getCurrentPlayer,
    playRound: GameController.playRound,
    reset,
  };
}

const ScreenController = (function (doc) {
  const game = createTicTacToeGame();
  const playerDiv = doc.querySelector("#player");
  const boardDiv = doc.querySelector("#board");
  const resetBtn = doc.querySelector("#reset");
  let gameState = 0; // See playRound in GameController

  const createTileButton = (token, row, column) => {
    const tileButton = doc.createElement("button");
    tileButton.classList.add("tile");
    if (token === "X") {
      tileButton.classList.add("cross");
    } else if (token === "O") {
      tileButton.classList.add("nought");
    } else {
      tileButton.classList.add("empty");
    }
    tileButton.dataset.row = row;
    tileButton.dataset.column = column;

    return tileButton;
  };

  const updateScreen = () => {
    // Empty the board container
    boardDiv.textContent = "";

    const board = game.getBoard();
    const currentPlayer = game.getCurrentPlayer();

    switch (gameState) {
      case -1: // Tie
        playerDiv.textContent = `It's a tie!`;
        break;
      case 0:
        playerDiv.textContent = `${currentPlayer.name}'s turn to place ${currentPlayer.token}`;
        break;
      case 1:
        playerDiv.textContent = `${currentPlayer.name} has won the game (playing ${currentPlayer.token})!`;
        break;
    }

    board.forEach((row, rowIndex) => {
      row.forEach((tile, tileIndex) => {
        boardDiv.appendChild(
          createTileButton(tile.getState(), rowIndex, tileIndex)
        );
      });
    });
  };

  function clickBoardHandler(e) {
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;
    if (!selectedColumn || !selectedRow) {
      return;
    }

    gameState = game.playRound(selectedRow, selectedColumn);
    updateScreen();
  }

  function clickResetBtnHandler(e) {
    game.reset();
    gameState = 0;
    updateScreen();
  }

  boardDiv.addEventListener("click", clickBoardHandler);
  resetBtn.addEventListener("click", clickResetBtnHandler);
  updateScreen();
})(document);
