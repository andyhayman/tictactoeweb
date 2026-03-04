# Expected Behavior on First Launch

## What SHOULD Happen

### 1. Page Loads
- User visits `http://localhost:8080/tictactoeweb`
- Sees loading spinner that says "Loading game..."

### 2. Browser Console Shows (in order):
```
Window location pathname: /tictactoeweb
Subdirectory deployment detected: /tictactoeweb
Testing endpoint: /tictactoeweb/api/health
Response from /tictactoeweb/api/health: 200
API is accessible at: /tictactoeweb/api/health {status: 'OK', timestamp: 1674063123456}
Game state request URL: /tictactoeweb/api/game/state
Game state response status: 200
Game state: {board: Array(3), currentPlayer: 'X', gameOver: false, winner: null, gameMode: 'PLAYER_VS_PLAYER', computerTurn: false}
```

### 3. Game Loads
- Loading spinner disappears
- Game board appears with empty cells
- "Player X's turn" message shows
- Buttons are clickable

## What's Happening If You See "API not found" Error

### Scenario A: Health Check Fails (404)
**Console shows:**
```
Testing endpoint: /tictactoeweb/api/health
Response from /tictactoeweb/api/health: 404
Failed to reach /tictactoeweb/api/health: ...
Testing endpoint: /tictactoeweb/api
Response from /tictactoeweb/api: 404
...
No API endpoints are accessible
```

**What's wrong:**
- Spring Boot application isn't running, OR
- Application started but GameController wasn't loaded, OR
- Tomcat context path is wrong

**How to fix:**
1. Check Tomcat is running: `ps aux | grep tomcat`
2. Check port 8080 is open: `netstat -tuln | grep 8080`
3. Check Tomcat logs: `cat $TOMCAT_HOME/logs/catalina.out | tail -50`
4. Verify WAR was deployed: `ls -la $TOMCAT_HOME/webapps/`
5. Check startup errors in logs

### Scenario B: Health Check Succeeds, Game State Fails
**Console shows:**
```
Testing endpoint: /tictactoeweb/api/health
Response from /tictactoeweb/api/health: 200
API is accessible at: /tictactoeweb/api/health {...}
Game state request URL: /tictactoeweb/api/game/state
Game state response status: 404
```

**What's wrong:**
- Health endpoint works but game endpoint doesn't
- Something is wrong with the controller routing

**How to fix:**
1. Check GameController is compiled: `unzip -l tictactoeweb-0.0.1-SNAPSHOT.war | grep GameController`
2. Test endpoint directly: `curl http://localhost:8080/tictactoeweb/api/health` and `curl http://localhost:8080/tictactoeweb/api/game/state`
3. Check Tomcat logs for class loading errors

### Scenario C: Server Connection Error
**Console shows:**
```
Testing endpoint: /tictactoeweb/api/health
Failed to reach /tictactoeweb/api/health: Failed to fetch
```

**What's wrong:**
- Network connection issue
- Tomcat isn't listening on port 8080
- Firewall blocking the connection

**How to fix:**
1. Verify port with: `netstat -tuln | grep 8080`
2. Try local connection: `curl localhost:8080/tictactoeweb/`
3. Check firewall rules: `ufw status` or Windows Firewall settings
4. Try different port in Tomcat server.xml

### Scenario D: Wrong Context Path
**You see error but Tomcat should be running**

**Browser console shows:**
```
Window location pathname: /
Root deployment detected
```

**What's wrong:**
- You're visiting root URL instead of `/tictactoeweb/`

**How to fix:**
- Make sure to visit: `http://localhost:8080/tictactoeweb`
- NOT: `http://localhost:8080/` or `http://localhost:8080/tictactoeweb/`

## Quick Verification Steps

### Step 1: Is Tomcat Running?
```bash
# Linux/Mac
ps aux | grep tomcat

# Windows PowerShell
Get-Process java | Where-Object {$_.ProcessName -like "*java*"}
```

Expected output: Shows `catalina.jar` or similar Tomcat process

### Step 2: Is Port 8080 Open?
```bash
# Linux/Mac
netstat -tuln | grep 8080

# Windows PowerShell
netstat -ano | findstr :8080
```

Expected output: Shows `LISTEN` on port 8080

### Step 3: Test API Directly
```bash
# Linux/Mac/Windows (WSL)
curl -v http://localhost:8080/tictactoeweb/api/health

# Windows PowerShell
Invoke-WebRequest http://localhost:8080/tictactoeweb/api/health
```

Expected output:
```json
{
  "status":"OK",
  "timestamp":1674063123456
}
```

### Step 4: Check Application Logs
```bash
# Tomcat logs
tail -f $TOMCAT_HOME/logs/catalina.out

# Look for:
# - "Started TicTacToeWebApplication"
# - "Tomcat started on port(s): 8080"
# - Any "ERROR" messages
```

## Deployment Checklist

Before testing, verify:
- [ ] WAR file built: `target/tictactoeweb-0.0.1-SNAPSHOT.war` exists
- [ ] Tomcat installed: `$TOMCAT_HOME/bin/catalina.sh` exists
- [ ] WAR deployed: `$TOMCAT_HOME/webapps/tictactoeweb.war` exists
- [ ] Tomcat started: `$TOMCAT_HOME/bin/catalina.sh run` executed
- [ ] Port is open: `netstat` shows port 8080 listening
- [ ] Correct URL: `http://localhost:8080/tictactoeweb/` (with trailing slash)
- [ ] Browser cache cleared: Ctrl+Shift+R to hard refresh
- [ ] Java version: `java -version` shows Java 17+

If all checks pass and API still returns 404, check Tomcat logs for the actual error.
