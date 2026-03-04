document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('resetButton');
    const modeButtons = document.querySelectorAll('.mode-button');
    const errorMessage = document.getElementById('errorMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    let currentMode = 'PLAYER_VS_PLAYER';
    let gameState = null;
    let contextPath = '';

    // Detect context path for Tomcat deployment
    function getContextPath() {
        const path = window.location.pathname;
        console.log('Window location pathname:', path);
        
        // For root deployment (e.g., localhost:8080/), return empty string
        if (path === '/' || path === '') {
            console.log('Root deployment detected');
            return '';
        }
        
        // For subdirectory deployment (e.g., localhost:8080/tictactoeweb/), extract context
        const contextMatch = path.match(/^\/([^\/]+)/);
        if (contextMatch && contextMatch[1] !== 'api') {
            // Make sure we don't extract 'api' as context
            const context = '/' + contextMatch[1];
            console.log('Subdirectory deployment detected:', context);
            return context;
        }
        
        console.log('No context path detected, using root');
        return '';
    }

    contextPath = getContextPath();
    console.log('Context path:', contextPath);

    // Show loading indicator
    function showLoading(visible = true) {
        if (loadingIndicator) {
            loadingIndicator.style.display = visible ? 'block' : 'none';
        }
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Update the game board UI
    function updateBoard(gameState) {
        if (!gameState || !gameState.board) {
            showError('Invalid game state received');
            return;
        }

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
                status.textContent = "🤝 Game Over - It's a Draw!";
            } else {
                status.textContent = `🎉 Game Over - Player ${gameState.winner} Wins!`;
            }
            // Disable cells after game ends
            cells.forEach(cell => cell.style.pointerEvents = 'none');
        } else {
            status.textContent = `Player ${gameState.currentPlayer}'s turn`;
            cells.forEach(cell => cell.style.pointerEvents = 'auto');
        }
    }

    // Make a move
    async function makeMove(row, col) {
        try {
            const url = `${contextPath}/api/game/move?row=${row}&col=${col}`;
            console.log('Move request URL:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Move response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Move response error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            gameState = await response.json();
            updateBoard(gameState);
        } catch (error) {
            console.error('Error making move:', error);
            showError('Failed to make move. Please try again.');
        }
    }

    // Reset the game
    async function resetGame(gameMode = currentMode) {
        try {
            const url = `${contextPath}/api/game/reset` + (gameMode ? `?gameMode=${encodeURIComponent(gameMode)}` : '');
            console.log('Reset request URL:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Reset response status:', response.status);
            console.log('Reset response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Reset response error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            gameState = await response.json();
            console.log('Reset game state:', gameState);
            updateBoard(gameState);
        } catch (error) {
            console.error('Error resetting game:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            showError('Failed to reset game. Please try again.');
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
    async function getGameState(retryCount = 0) {
        try {
            if (retryCount === 0) {
                showLoading(true);
                // First, check if API is accessible
                await checkApiHealth();
            }
            
            const url = `${contextPath}/api/game/state`;
            console.log('Game state request URL:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(10000)
            });
            
            console.log('Game state response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Game state response error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            gameState = await response.json();
            console.log('Game state:', gameState);
            showLoading(false);
            updateBoard(gameState);
        } catch (error) {
            console.error('Error fetching game state:', error);
            console.error('Error message:', error.message);
            
            if (retryCount < 1) {
                console.log('Retrying after 1 second...');
                setTimeout(() => getGameState(retryCount + 1), 1000);
            } else {
                showLoading(false);
                if (error.name === 'AbortError') {
                    showError('Server timeout. Make sure the server is running.');
                } else if (error.message.includes('404')) {
                    showError('API not found. Verify server is running.');
                } else if (error.message.includes('500')) {
                    showError('Server error. Try refreshing the page.');
                } else {
                    showError('Failed to load game. Please refresh the page.');
                }
            }
        }
    }

    // Check if API is accessible
    async function checkApiHealth() {
        try {
            // Try multiple endpoints to find which one works
            const endpoints = [`${contextPath}/api/health`, `${contextPath}/api`, '/api/health', '/api'];
            
            for (const url of endpoints) {
                try {
                    console.log('Testing endpoint:', url);
                    const response = await fetch(url, {
                        headers: {
                            'Accept': 'application/json'
                        },
                        signal: AbortSignal.timeout(3000)
                    });
                    
                    console.log(`Response from ${url}:`, response.status);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('API is accessible at:', url, data);
                        return true;
                    }
                } catch (e) {
                    console.log(`Failed to reach ${url}:`, e.message);
                }
            }
            
            console.warn('No API endpoints are accessible');
            return false;
        } catch (error) {
            console.warn('Health check error:', error.message);
            return false;
        }
    }

    // Add click handlers to cells
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const row = parseInt(cell.getAttribute('data-row'));
            const col = parseInt(cell.getAttribute('data-col'));
            
            // Validate cell is empty
            if (gameState && gameState.board[row][col] === ' ') {
                makeMove(row, col);
            }
        });
    });

    resetButton.addEventListener('click', resetGame);

    // Initialize the game
    getGameState();
});
