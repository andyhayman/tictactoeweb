document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('resetButton');

    // Update the game board UI
    function updateBoard(gameState) {
        const board = gameState.board;
        cells.forEach(cell => {
            const row = cell.getAttribute('data-row');
            const col = cell.getAttribute('data-col');
            cell.textContent = board[row][col] === ' ' ? '' : board[row][col];
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
    async function resetGame() {
        try {
            const response = await fetch('/api/game/reset', {
                method: 'POST'
            });
            const gameState = await response.json();
            updateBoard(gameState);
        } catch (error) {
            console.error('Error:', error);
        }
    }

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
