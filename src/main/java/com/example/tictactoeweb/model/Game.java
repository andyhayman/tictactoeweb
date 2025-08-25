package com.example.tictactoeweb.model;

public class Game {
    private char[][] board;
    private char currentPlayer;
    private boolean gameOver;
    private String winner;
    private GameMode gameMode;
    private boolean isComputerTurn;

    public Game() {
        this(GameMode.PLAYER_VS_PLAYER);
    }

    public Game(GameMode gameMode) {
        board = new char[3][3];
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                board[i][j] = ' ';
            }
        }
        currentPlayer = 'X';
        gameOver = false;
        winner = null;
        this.gameMode = gameMode;
        this.isComputerTurn = gameMode == GameMode.COMPUTER_VS_COMPUTER;
    }

    public boolean makeMove(int row, int col) {
        if (gameOver || (isComputerTurn && gameMode != GameMode.PLAYER_VS_PLAYER)) {
            return false;
        }

        if (row < 0 || row >= 3 || col < 0 || col >= 3 || board[row][col] != ' ') {
            return false;
        }

        board[row][col] = currentPlayer;
        
        if (checkWin()) {
            gameOver = true;
            winner = String.valueOf(currentPlayer);
        } else if (isBoardFull()) {
            gameOver = true;
            winner = "Draw";
        } else {
            switchPlayer();
            if (!gameOver && (gameMode == GameMode.COMPUTER_VS_COMPUTER || 
                (gameMode == GameMode.PLAYER_VS_COMPUTER && isComputerTurn))) {
                makeComputerMove();
            }
        }
        
        return true;
    }

    private void switchPlayer() {
        currentPlayer = (currentPlayer == 'X') ? 'O' : 'X';
        if (gameMode == GameMode.PLAYER_VS_COMPUTER) {
            isComputerTurn = !isComputerTurn;
        }
    }

    private void makeComputerMove() {
        // Simple computer strategy: find first empty cell
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (board[i][j] == ' ') {
                    makeMove(i, j);
                    return;
                }
            }
        }
    }

    private boolean checkWin() {
        // Check rows
        for (int i = 0; i < 3; i++) {
            if (board[i][0] != ' ' && board[i][0] == board[i][1] && board[i][1] == board[i][2]) {
                return true;
            }
        }

        // Check columns
        for (int j = 0; j < 3; j++) {
            if (board[0][j] != ' ' && board[0][j] == board[1][j] && board[1][j] == board[2][j]) {
                return true;
            }
        }

        // Check diagonals
        if (board[0][0] != ' ' && board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
            return true;
        }
        if (board[0][2] != ' ' && board[0][2] == board[1][1] && board[1][1] == board[2][0]) {
            return true;
        }

        return false;
    }

    private boolean isBoardFull() {
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (board[i][j] == ' ') {
                    return false;
                }
            }
        }
        return true;
    }

    // Getters
    public char[][] getBoard() {
        return board;
    }

    public char getCurrentPlayer() {
        return currentPlayer;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public String getWinner() {
        return winner;
    }
}
