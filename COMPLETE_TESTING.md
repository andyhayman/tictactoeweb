# Complete Testing Instructions for "API not found" Error

## What This Means
When you see "API not found. Verify server is running" on first launch, it means:
- The browser loaded the HTML page ✓
- The JavaScript ran and tried to call `/api/game/state` ✗
- The server either:
  - Isn't running
  - Isn't listening on the right port
  - Doesn't have the GameController loaded
  - Has the context path set incorrectly

## Complete Diagnostic Steps

### STEP 1: Verify Tomcat is Actually Running

**For Linux/Mac/WSL:**
```bash
ps aux | grep tomcat
# Should show something like:
# /usr/lib/jvm/java-17.../bin/java ... catalina.jar ...
```

**For Windows (PowerShell):**
```powershell
Get-Process java | Where-Object { $_.ProcessName -like "*java*" }
# Should show java.exe with TomcatEmbedded or catalina in the command
```

**If nothing shows:**
- ❌ Tomcat is NOT running
- 🔧 Start Tomcat with: `$TOMCAT_HOME/bin/catalina.sh run`
- ⏳ Wait 10-15 seconds for startup
- 🔄 Then refresh browser

### STEP 2: Verify Port 8080 is Listening

**For Linux/Mac/WSL:**
```bash
netstat -tuln | grep 8080
# Should show:
# tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN

# Or try:
ss -tuln | grep 8080
```

**For Windows (PowerShell):**
```powershell
netstat -ano | findstr :8080
# Should show:
# TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING    [PID]

# Or try:
Get-NetTCPConnection -LocalPort 8080
```

**If nothing shows:**
- ❌ Port 8080 is NOT listening
- 🔧 Options:
  - Make sure Tomcat actually started
  - Check Tomcat logs for startup errors
  - Try different port (change in server.xml)
  - Check firewall blocking port 8080

### STEP 3: Open Browser DevTools and Check Console

**Open DevTools:**
- Press `F12` on keyboard
- Click "Console" tab at top
- You should see yellow/blue logs

**Look for these logs (in order):**

1. **Should see** (means page loaded):
   ```
   Window location pathname: /tictactoeweb
   ```

2. **Should see** (means context detected):
   ```
   Subdirectory deployment detected: /tictactoeweb
   ```

3. **Should see** (means health check attempted):
   ```
   Testing endpoint: /tictactoeweb/api/health
   ```

4. **Should see** (GOOD - means API works):
   ```
   Response from /tictactoeweb/api/health: 200
   API is accessible at: /tictactoeweb/api/health {status: 'OK', timestamp: ...}
   ```

   **OR should see** (BAD - means API not found):
   ```
   Response from /tictactoeweb/api/health: 404
   Failed to reach /tictactoeweb/api/health: ...
   ```

### STEP 4: Check Network Tab

**Open DevTools Network Tab:**
- Press `F12`
- Click "Network" tab
- Refresh page
- Look for red X'd requests

**Check these requests:**
1. `index.html` - Should be 200 OK (green)
2. `styles.css` - Should be 200 OK (green)
3. `script.js` - Should be 200 OK (green)
4. `api/health` - Should be 200 OK (green) or 404 (red)
5. `api/game/state` - Should be 200 OK (green) or 404 (red)

**If you see 404 on api requests:**
- Click the failed request
- Click "Response" tab
- You'll see HTML error page explaining what's wrong

### STEP 5: Test API Directly (No Browser Cache)

**Open a NEW browser tab** (important - clears cache)

**Test 1: Just HTML root**
```
http://localhost:8080/tictactoeweb/
```
Expected: See Tic Tac Toe page

**Test 2: Health endpoint**
```
http://localhost:8080/tictactoeweb/api/health
```
Expected: See JSON response:
```json
{"status":"OK","timestamp":1674063123456}
```

**Test 3: Info endpoint**
```
http://localhost:8080/tictactoeweb/api/info
```
Expected: See list of endpoints

**Test 4: Game state endpoint**
```
http://localhost:8080/tictactoeweb/api/game/state
```
Expected: See JSON with board, player, etc.

**If you see 404 on ANY of these:**
- The Spring Boot application hasn't loaded the GameController
- Check Tomcat logs (see Step 6)

### STEP 6: Check Tomcat Logs

**Find log file:**
```bash
# Tomcat installation
ls -la $TOMCAT_HOME/logs/
# Should show: catalina.out, catalina.2026-01-18.log, etc.
```

**View startup logs:**
```bash
# Show last 100 lines
tail -100 $TOMCAT_HOME/logs/catalina.out

# Or follow in real-time while starting:
tail -f $TOMCAT_HOME/logs/catalina.out
# [in another terminal]
$TOMCAT_HOME/bin/catalina.sh run
```

**What to look for:**

✅ Good signs:
```
INFO: Starting TicTacToeWebApplication v0.0.1-SNAPSHOT
INFO: Initializing Spring embedded WebApplicationContext
INFO: Root WebApplicationContext initialized
INFO: Tomcat started on port(s): 8080
INFO: Started TicTacToeWebApplication
```

❌ Bad signs:
```
ERROR: [Any ERROR line is bad - read the full message]
ClassNotFoundException: com.example.tictactoeweb.controller.GameController
Failed to instantiate GameController
Cannot find configuration class
```

### STEP 7: Verify WAR File Contents

**Check WAR has all needed files:**
```bash
cd /path/to/tictactoeweb

# Check GameController is in WAR
unzip -l target/tictactoeweb-0.0.1-SNAPSHOT.war | grep GameController
# Should show: WEB-INF/classes/com/example/tictactoeweb/controller/GameController.class

# Check HTML is in WAR
unzip -l target/tictactoeweb-0.0.1-SNAPSHOT.war | grep index.html
# Should show: index.html and WEB-INF/classes/static/index.html

# Check script is in WAR
unzip -l target/tictactoeweb-0.0.1-SNAPSHOT.war | grep script.js
# Should show: script.js and WEB-INF/classes/static/script.js
```

## Troubleshooting Decision Tree

```
Start here → Application shows "Loading game..."
    ↓
What happens next?

1) ✅ Game board appears
   → SUCCESS! Application is working.

2) ❌ Shows "API not found. Verify server is running"
   ↓
   Was server started recently?
   ├─ No → Start Tomcat and wait 15 seconds, then refresh
   ├─ Yes → Go to STEP 2 above (check port 8080 open)
   
3) ❌ Shows "Server timeout..."
   ↓
   Is port 8080 responding?
   ├─ No → Start Tomcat
   ├─ Yes → WAR might not be deployed, check Step 7

4) ❌ Shows "Failed to load game..."
   ↓
   → Check browser console (F12)
   → Check Tomcat logs
   → Something is crashing on backend

5) ⚪ Shows "Loading game..." forever
   ↓
   → JavaScript isn't getting response
   → Check Network tab (F12)
   → Is request being sent? Is it timing out?
   → Check firewall on port 8080
```

## Quick Fix Checklist

If you have API not found error, try these in order:

- [ ] **Restart Tomcat**
  ```bash
  $TOMCAT_HOME/bin/shutdown.sh
  sleep 5
  $TOMCAT_HOME/bin/startup.sh
  sleep 10
  # Refresh browser
  ```

- [ ] **Hard refresh browser**
  ```
  Ctrl+Shift+R (Windows/Linux)
  Cmd+Shift+R (Mac)
  ```

- [ ] **Clear browser cache**
  - F12 → Application → Clear Storage → Clear All

- [ ] **Try private/incognito window**
  - Ctrl+Shift+N (Chrome/Edge)
  - Cmd+Shift+N (Mac Chrome)
  - Ctrl+Shift+P (Firefox)

- [ ] **Verify URL is exactly**
  ```
  http://localhost:8080/tictactoeweb
  ```
  (with slash at end, NOT without)

- [ ] **Check if root deployment works**
  ```
  1. Rename WAR: tictactoeweb.war → ROOT.war
  2. Restart Tomcat
  3. Visit: http://localhost:8080/
  ```

- [ ] **Build fresh WAR**
  ```bash
  cd /path/to/project
  ./mvnw clean package
  # Copy new WAR to Tomcat
  ```

- [ ] **Check Java version**
  ```bash
  java -version
  # Should be Java 17 or higher
  ```

## Still Not Working?

Collect this information and share it:

1. **Browser Console Output** (F12 → Console)
   - Copy all text that appears
   - Screenshot if needed

2. **Network Tab Failures** (F12 → Network)
   - Which requests failed (404)?
   - Click on each and show Response tab

3. **Tomcat Logs**
   - Last 50 lines of: `$TOMCAT_HOME/logs/catalina.out`
   - Any ERROR lines?

4. **Server Status**
   - Output of: `netstat -tuln | grep 8080` (Linux) or `netstat -ano | findstr :8080` (Windows)
   - Output of: `ps aux | grep java` (Linux) or `Get-Process java` (Windows)

5. **File Structure**
   - Output of: `ls -la $TOMCAT_HOME/webapps/` or `dir %TOMCAT_HOME%\webapps\`
   - Is `tictactoeweb.war` or `tictactoeweb` folder there?

6. **URL you're visiting**
   - Exactly what URL shows in address bar?
   - Did you add/remove any path segments?

With this information, the exact cause can be identified!
