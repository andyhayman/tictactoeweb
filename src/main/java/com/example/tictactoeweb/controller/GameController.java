package com.example.tictactoeweb.controller;

import com.example.tictactoeweb.model.Game;
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
    public Game resetGame() {
        game = new Game();
        return game;
    }
}
