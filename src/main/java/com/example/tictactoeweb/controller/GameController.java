package com.example.tictactoeweb.controller;

import com.example.tictactoeweb.model.Game;
import com.example.tictactoeweb.model.GameMode;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "*")
public class GameController {
    private Game game = new Game();

    @GetMapping("/state")
    public Game getGameState() {
        return game;
    }

    @PostMapping("/move")
    public Game makeMove(@RequestParam int row, @RequestParam int col) {
        game.makeMove(row, col);
        return game;
    }

    @PostMapping("/reset")
    public Game resetGame(@RequestParam(required = false) GameMode gameMode) {
        game = new Game(gameMode != null ? gameMode : GameMode.PLAYER_VS_PLAYER);
        if (gameMode == GameMode.COMPUTER_VS_COMPUTER) {
            game.makeMove(0, 0); // Start the computer vs computer game
        }
        return game;
    }
}
