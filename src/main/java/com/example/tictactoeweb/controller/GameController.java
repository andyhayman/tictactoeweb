package com.example.tictactoeweb.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.tictactoeweb.model.Game;
import com.example.tictactoeweb.model.GameMode;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {org.springframework.web.bind.annotation.RequestMethod.GET, org.springframework.web.bind.annotation.RequestMethod.POST, org.springframework.web.bind.annotation.RequestMethod.OPTIONS})
public class GameController {
    private Game game = new Game();

    // Health check endpoint
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return response;
    }

    // Diagnostic endpoint
    @GetMapping("/info")
    public Map<String, Object> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "API is running");
        response.put("version", "1.0");
        response.put("endpoints", new String[]{"GET /api/health", "GET /api/info", "GET /api/game/state", "POST /api/game/move", "POST /api/game/reset"});
        return response;
    }

    @GetMapping("/game/state")
    public Game getGameState() {
        return game;
    }

    @PostMapping("/game/move")
    public Game makeMove(@RequestParam int row, @RequestParam int col) {
        game.makeMove(row, col);
        return game;
    }

    @PostMapping("/game/reset")
    public Game resetGame(@RequestParam(required = false) String gameMode) {
        GameMode mode = GameMode.PLAYER_VS_PLAYER;
        
        if (gameMode != null && !gameMode.isEmpty()) {
            try {
                mode = GameMode.valueOf(gameMode.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid game mode, use default
                mode = GameMode.PLAYER_VS_PLAYER;
            }
        }
        
        game = new Game(mode);
        // For COMPUTER_VS_COMPUTER mode, make the first move
        if (mode == GameMode.COMPUTER_VS_COMPUTER) {
            game.startComputerVsComputer();
        }
        return game;
    }
}
