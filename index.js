const Gameboard = (() => {
    const board = Array(9).fill(null);
    
    const createBoard = () => {
        const gameboardDiv = document.getElementById('gameboard');
        gameboardDiv.innerHTML = ''; // Clear existing board
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            gameboardDiv.appendChild(cell);
        }
    };

    const setMark = (index, mark) => {
        if (index < 0 || index >= board.length || board[index] !== null) {
            throw new Error("Invalid move");
        }
        board[index] = mark;
    };

    const resetBoard = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = null;
        }
    };

    const getBoard = () => board.slice();
    
    return { createBoard, setMark, resetBoard, getBoard };
})(); 


const Player = (name, marker) => {
  return { name, marker };
};

const GameController = (() => {
    let currentPlayerIndex = 0;
    let players = [];
    let gameActive = false;

    const initializePlayers = (player1Name = "Player 1", player2Name = "Player 2") => {
        players = [
            Player(player1Name, "X"),
            Player(player2Name, "O")
        ];
        currentPlayerIndex = 0;
        gameActive = true;
    };

    const switchPlayer = () => {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    };

    const getCurrentPlayer = () => players[currentPlayerIndex];

    const makeMove = (index) => {
        if (!gameActive) {
            throw new Error("Game hasn't started yet!");
        }
        
        try {
            Gameboard.setMark(index, getCurrentPlayer().marker);
            if (!checkWin() && !checkDraw()) {
                switchPlayer();
            } else {
                gameActive = false;
            }
        } catch (error) {
            throw error;
        }
    };

    const checkWin = () => {
        const board = Gameboard.getBoard();
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        return winningCombinations.some(combination => 
            combination.every(index => board[index] === getCurrentPlayer().marker)
        );
    };

    const checkDraw = () => {
        return Gameboard.getBoard().every(cell => cell !== null);
    };

    const resetGame = () => {
        Gameboard.resetBoard();
        gameActive = true;
        currentPlayerIndex = 0;
    };

    const isGameActive = () => gameActive;

    return { 
        initializePlayers, 
        makeMove, 
        getCurrentPlayer, 
        resetGame, 
        isGameActive,
        checkWin,
        checkDraw
    };
})();


const DisplayController = (() => {
    const gameContainer = document.getElementById('gameboard');
    let messageDisplay;
    let playerForm;

    const createGameControls = () => {
        // Create player form
        playerForm = document.createElement('div');
        playerForm.id = 'player-form';
        playerForm.innerHTML = `
            <div class="player-inputs">
                <input type="text" id="player1" placeholder="Player 1 name" required>
                <input type="text" id="player2" placeholder="Player 2 name" required>
                <button id="start">Start Game</button>
            </div>
        `;
        document.body.insertBefore(playerForm, gameContainer);

        // Create message display
        messageDisplay = document.createElement('div');
        messageDisplay.id = 'message';
        document.body.insertBefore(messageDisplay, document.getElementById('restartBtn'));
    };

    const updateBoard = () => {
        const board = Gameboard.getBoard();
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = board[index] || '';
        });
    };

    const updateMessage = message => {
        if (messageDisplay) {
            messageDisplay.textContent = message;
        }
    };

    const init = () => {
        createGameControls();
        Gameboard.createBoard();

        // Add event listeners
        document.getElementById('start').addEventListener('click', () => {
            const player1Name = document.getElementById('player1').value.trim() || "Player 1";
            const player2Name = document.getElementById('player2').value.trim() || "Player 2";
            
            GameController.initializePlayers(player1Name, player2Name);
            playerForm.style.display = 'none';
            updateMessage(`${GameController.getCurrentPlayer().name}'s turn`);
        });

        gameContainer.addEventListener('click', (e) => {
            if (!e.target.matches('.cell') || !GameController.isGameActive()) return;
            
            const index = parseInt(e.target.dataset.index);
            try {
                GameController.makeMove(index);
                updateBoard();
                
                if (GameController.checkWin()) {
                    updateMessage(`${GameController.getCurrentPlayer().name} wins!`);
                } else if (GameController.checkDraw()) {
                    updateMessage("It's a draw!");
                } else {
                    updateMessage(`${GameController.getCurrentPlayer().name}'s turn`);
                }
            } catch (error) {
                updateMessage(error.message);
            }
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            GameController.resetGame();
            updateBoard();
            playerForm.style.display = 'block';
            updateMessage('Enter player names to start');
        });

        updateMessage('Enter player names to start');
    };

    return { init };
})();

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    DisplayController.init();
});

