document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('resetButton');
    const modeButtons = document.querySelectorAll('.mode-button');
    let currentMode = 'PLAYER_VS_PLAYER';

    // Update the game board UI
    function updateBoard(gameState) {
        const board = gameState.board;
        cells.forEach(cell => {
            const row = cell.getAttribute('data-row');
            const col = cell.getAttribute('data-col');
            const value = board[row][col];
            cell.textContent = value === ' ' ? '' : value;
            cell.classList.remove('x-mark', 'o-mark');
            if (value === 'X') {
                cell.classList.add('x-mark');
            } else if (value === 'O') {
                cell.classList.add('o-mark');
            }
        });

        if (gameState.gameOver) {
            if (gameState.winner === 'Draw') {
                status.textContent = "Game Over - It's a Draw!";
            } else {
                status.textContent = `Game Over - Player ${gameState.winner} Wins!`;
            }
        } else {
            status.textContent = `Player ${gameState.currentPlayer}'s turn`;
        }
    }

    // Make a move
    async function makeMove(row, col) {
        try {
            const response = await fetch(`/api/game/move?row=${row}&col=${col}`, {
                method: 'POST'
            });
            const gameState = await response.json();
            updateBoard(gameState);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Reset the game
    async function resetGame(gameMode = currentMode) {
        try {
            const response = await fetch('/api/game/reset' + (gameMode ? `?gameMode=${encodeURIComponent(gameMode)}` : ''), {
                method: 'POST'
            });
            const gameState = await response.json();
            updateBoard(gameState);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Set up mode buttons
    modeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            modeButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            const modeMap = {
                'pvp': 'PLAYER_VS_PLAYER',
                'pvc': 'PLAYER_VS_COMPUTER',
                'cvc': 'COMPUTER_VS_COMPUTER'
            };
            
            currentMode = modeMap[button.id];
            resetGame(currentMode);
        });
    });

    // Get initial game state
    async function getGameState() {
        try {
            const response = await fetch('/api/game/state');
            const gameState = await response.json();
            updateBoard(gameState);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Add click handlers
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const row = cell.getAttribute('data-row');
            const col = cell.getAttribute('data-col');
            makeMove(row, col);
        });
    });

    resetButton.addEventListener('click', resetGame);

    // Initialize the game
    getGameState();
});
