# 🎮 Tic Tac Toe Web App - Quick Reference

## 🚀 Getting Started (30 seconds)

```bash
cd c:\Users\Andy\Documents\GitHub\tictactoeweb
.\mvnw spring-boot:run
# Open http://localhost:8080
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/main/java/.../GameController.java` | REST API endpoints |
| `src/main/java/.../Game.java` | Game logic |
| `src/main/resources/static/index.html` | Web interface |
| `src/main/resources/static/script.js` | Frontend logic |
| `src/main/resources/static/styles.css` | Styling |
| `application.properties` | Dev configuration |
| `application-prod.properties` | Production config |
| `Dockerfile` | Container definition |
| `docker-compose.yml` | Docker setup |
| `README.md` | Full documentation |
| `DEPLOYMENT.md` | Deployment guide |

## 🎮 Game Modes

1. **Player vs Player** - Two humans on same device
2. **Player vs Computer** - Play against AI
3. **Computer vs Computer** - Watch AI play itself

## 🔌 API Endpoints

```
GET  /api/game/state        - Get current game state
POST /api/game/move         - Make a move (row, col)
POST /api/game/reset        - Reset game (gameMode optional)
```

## 🐳 Docker Commands

```bash
# Build and run with Docker Compose
docker-compose up -d

# Build manually
docker build -t tictactoeweb .

# Run container
docker run -p 8080:8080 tictactoeweb

# Stop container
docker-compose down
```

## 🔨 Build Commands

```bash
# Build JAR
.\mvnw clean package

# Run tests
.\mvnw test

# Run application
.\mvnw spring-boot:run

# Run with production profile
java -jar target/*.jar --spring.profiles.active=prod
```

## 🔧 Configuration

**Development** (`application.properties`):
- Port: 8080
- Logging: DEBUG
- Error details: Shown

**Production** (`application-prod.properties`):
- Port: 8080
- Logging: WARN
- Compression: Enabled
- Error details: Hidden

## 🌐 Deployment Options

- **Local**: `.\mvnw spring-boot:run`
- **JAR**: `java -jar app.jar`
- **Docker**: `docker-compose up -d`
- **Linux**: Systemd service (see DEPLOYMENT.md)
- **Cloud**: AWS, Azure, GCP, Heroku (see DEPLOYMENT.md)

## ✅ Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Modern UI with gradients and animations
- ✅ Real-time game state updates
- ✅ Error handling and validation
- ✅ CORS enabled
- ✅ Health check endpoints
- ✅ Production-ready configuration
- ✅ Docker support
- ✅ Comprehensive documentation

## 📊 Project Structure

```
tictactoeweb/
├── src/main/
│   ├── java/com/example/tictactoeweb/
│   │   ├── controller/
│   │   └── model/
│   └── resources/
│       ├── static/
│       └── *.properties
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── README.md
├── DEPLOYMENT.md
└── .gitignore
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | Change `server.port` in properties |
| Build fails | Run `.\mvnw clean install` |
| Not responding | Check `http://localhost:8080/api/game/state` |
| CORS error | Check `@CrossOrigin` in GameController |

## 📝 Development Tips

1. **Hot Reload**: Save files while running with DevTools
2. **Debug Logging**: Set `logging.level.com.example.tictactoeweb=DEBUG`
3. **API Testing**: Use curl or Postman with `/api/game/*` endpoints
4. **Docker Testing**: Use `docker-compose up -d` for quick testing

## 🎯 Next Steps

1. ✅ Run locally: `.\mvnw spring-boot:run`
2. ✅ Test gameplay with different modes
3. ✅ Review DEPLOYMENT.md for production
4. ✅ Configure for your deployment platform
5. ✅ Deploy and enjoy!

## 📚 Documentation

- **README.md** - Full documentation and features
- **DEPLOYMENT.md** - Detailed deployment guide
- **UPDATE_SUMMARY.md** - Summary of all changes
- **QUICK_REFERENCE.md** - This file

## 🆘 Getting Help

1. Check logs: `docker-compose logs -f`
2. Review error messages in UI
3. Test API: `curl http://localhost:8080/api/game/state`
4. Check configuration files
5. Review deployment guide

## 🎉 Quick Test

```bash
# 1. Run the app
.\mvnw spring-boot:run

# 2. In another terminal, test the API
curl http://localhost:8080/api/game/state

# 3. Open browser
# http://localhost:8080

# 4. Play the game!
```

---

**Status**: ✅ Ready for Production  
**Version**: 1.0.0  
**Last Updated**: 2026-01-18
