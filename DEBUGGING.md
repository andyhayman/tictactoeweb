# Tic Tac Toe Web Application - Deployment & Debugging Guide

## Quick Deployment

### For Standalone JAR (Embedded Tomcat):
```bash
java -jar target/tictactoeweb-0.0.1-SNAPSHOT.jar
```
Then visit: **http://localhost:8080**

### For External Tomcat (WAR file):
```bash
cp target/tictactoeweb-0.0.1-SNAPSHOT.war $TOMCAT_HOME/webapps/tictactoeweb.war
cd $TOMCAT_HOME/bin
./catalina.sh run  # or startup.sh for background
```
Then visit: **http://localhost:8080/tictactoeweb**

## Debugging "API not found" Error

If you see "API not found. Verify server is running" on first launch:

### Step 1: Check Server is Running
Open browser console (F12) and check for logs showing:
- ✅ `Window location pathname: /...`
- ✅ `Testing endpoint: ...` (multiple URLs tested)
- ✅ `Response from /api/health: 200` or `Response from /api: 200`

### Step 2: Test API Endpoints Directly

**A) Test Health Check:**
```
GET http://localhost:8080/api/health
```
Expected response:
```json
{
  "status": "OK",
  "timestamp": 1674063123456
}
```

**B) Test Info Endpoint:**
```
GET http://localhost:8080/api/info
```
Expected response:
```json
{
  "status": "API is running",
  "version": "1.0",
  "endpoints": ["GET /api/health", "GET /api/info", "GET /api/game/state", "POST /api/game/move", "POST /api/game/reset"]
}
```

**C) Test Game State:**
```
GET http://localhost:8080/api/game/state
```
Expected response:
```json
{
  "board": [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]],
  "currentPlayer": "X",
  "gameOver": false,
  "winner": null,
  "gameMode": "PLAYER_VS_PLAYER",
  "computerTurn": false
}
```

### Step 3: Browser Console Debugging

Press **F12** → **Console** tab and watch for these logs:

#### On Page Load:
```
Window location pathname: /  (or /tictactoeweb for Tomcat)
Detected context path: 
Testing endpoint: /api/health
Response from /api/health: 200
API is accessible at: /api/health {status: 'OK', timestamp: 1674063123456}
Game state request URL: /api/game/state
Game state response status: 200
Game state: {board: [...], currentPlayer: 'X', ...}
```

#### If Error Occurs:
```
Testing endpoint: /api/health
Response from /api/health: 404  ← PROBLEM: API not found
Failed to reach /api/health: ...
Testing endpoint: /api
Response from /api: 404
...
No API endpoints are accessible  ← This is the issue
```

### Step 4: Common Issues & Solutions

**Issue: All endpoints return 404**
- ✅ Make sure Java application is actually running
- ✅ Check the port (default: 8080)
- ✅ For Tomcat deployment, verify context path is correct (/tictactoeweb)
- ✅ Check server logs for errors

**Issue: Only /api returns 404, but /api/health works**
- This is normal - /api is just the base path, not an actual endpoint

**Issue: POST endpoints fail but GET works**
- Check CORS headers in response
- Browser console Network tab should show CORS errors

**Issue: Game state returns but board doesn't render**
- Check if JavaScript console shows any errors in `updateBoard()` function
- Verify response format matches expected structure

## Server Logs

To see detailed server logs while running, look for messages like:

```
INFO: Starting TicTacToeWebApplication v0.0.1-SNAPSHOT
INFO: Tomcat initialized with port(s): 8080
INFO: Started TicTacToeWebApplication in X.XXX seconds
```

If you see errors, the full error message will help identify the issue.

## API Endpoints Reference

All endpoints accept and return JSON, and have CORS enabled.

| Method | Endpoint | Params | Response |
|--------|----------|--------|----------|
| GET | /api/health | none | `{"status":"OK", "timestamp":...}` |
| GET | /api/info | none | List of available endpoints |
| GET | /api/game/state | none | Current game state object |
| POST | /api/game/move | row, col | Updated game state |
| POST | /api/game/reset | gameMode* | New game state |

*gameMode: `PLAYER_VS_PLAYER` (default), `PLAYER_VS_COMPUTER`, or `COMPUTER_VS_COMPUTER`

## Database Structure (In-Memory)

The application stores game state in memory - no database needed. Game state includes:
- 3x3 board (char array)
- Current player (X or O)
- Game mode (PvP, PvC, CvC)
- Win/lose/draw status

Game resets to new instance on `/api/game/reset` call.
