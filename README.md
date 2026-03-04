# 🎮 Tic Tac Toe Web Application

A modern, interactive Tic Tac Toe web game built with Spring Boot and a responsive HTML5/JavaScript frontend. Play against another player, the computer, or watch the computer play itself!

## 🚀 Features

- **Three Game Modes**:
  - 👥 Player vs Player (local multiplayer)
  - 🤖 Player vs Computer (AI opponent)
  - ⚙️ Computer vs Computer (watch AI play)

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **Real-time Game State**: Live updates via REST API
- **Error Handling**: Graceful error messages and validation
- **Production Ready**: Configured for deployment

## 🛠️ Technical Stack

- **Backend**: Spring Boot 3.1.2, Java 17
- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Server**: Embedded Tomcat
- **Build**: Maven

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🏃 Running Locally

### Development Mode

```bash
# Clone the repository
git clone <repository-url>
cd tictactoeweb

# Build the application
./mvnw clean package

# Run the application
./mvnw spring-boot:run

# Access the application at http://localhost:8080
```

### Running the JAR

```bash
# Build the application
./mvnw clean package

# Run the JAR file
java -jar target/tictactoeweb-0.0.1-SNAPSHOT.jar

# Access the application at http://localhost:8080
```

## 🌐 Deployment

### Docker Deployment

Create a `Dockerfile` in the project root:

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/tictactoeweb-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:

```bash
docker build -t tictactoeweb .
docker run -p 8080:8080 tictactoeweb
```

### Systemd Service

Use the provided `tictactoeweb.service` file to run as a Linux service:

```bash
sudo cp tictactoeweb.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tictactoeweb
sudo systemctl start tictactoeweb
```

### Nginx Reverse Proxy

Use the provided `nginx-config.conf` to proxy requests:

```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/tictactoeweb
sudo ln -s /etc/nginx/sites-available/tictactoeweb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📁 Project Structure

```
tictactoeweb/
├── src/
│   └── main/
│       ├── java/com/example/tictactoeweb/
│       │   ├── TicTacToeWebApplication.java    # Spring Boot entry point
│       │   ├── controller/
│       │   │   └── GameController.java         # REST API endpoints
│       │   └── model/
│       │       ├── Game.java                   # Game logic
│       │       └── GameMode.java               # Enum for game modes
│       └── resources/
│           ├── static/
│           │   ├── index.html                  # Web UI
│           │   ├── script.js                   # Frontend logic
│           │   └── styles.css                  # Styling
│           ├── application.properties          # Development config
│           └── application-prod.properties     # Production config
├── pom.xml                                     # Maven configuration
├── mvnw / mvnw.cmd                             # Maven wrapper
├── nginx-config.conf                           # Nginx configuration
└── tictactoeweb.service                        # Systemd service file
```

## 🔌 API Endpoints

### GET `/api/game/state`
Returns the current game state.

**Response:**
```json
{
  "board": [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' ']
  ],
  "currentPlayer": "X",
  "gameOver": false,
  "winner": null,
  "gameMode": "PLAYER_VS_PLAYER"
}
```

### POST `/api/game/move`
Makes a move at the specified row and column.

**Parameters:**
- `row` (int, 0-2): Row index
- `col` (int, 0-2): Column index

**Response:** Updated game state

### POST `/api/game/reset`
Resets the game.

**Parameters:**
- `gameMode` (string, optional): Game mode (PLAYER_VS_PLAYER, PLAYER_VS_COMPUTER, COMPUTER_VS_COMPUTER)

**Response:** New game state

## 🎮 How to Play

1. **Select a Game Mode**: Choose between Player vs Player, Player vs Computer, or Computer vs Computer
2. **Make Moves**: Click on an empty cell to place your mark
3. **Win**: Get three marks in a row (horizontally, vertically, or diagonally)
4. **New Game**: Click "New Game" to reset and play again

## 🧠 Game Logic

- **Player vs Player**: Two players alternate turns
- **Player vs Computer**: You are X, computer is O (uses basic AI)
- **Computer vs Computer**: Both players are AI (demonstrates automation)

## 📝 Configuration

### Development Settings
Edit `src/main/resources/application.properties`:
```properties
server.port=8080
logging.level.root=INFO
```

### Production Settings
Edit `src/main/resources/application-prod.properties`:
```properties
server.port=8080
logging.level.root=WARN
```

Run with production profile:
```bash
java -jar target/tictactoeweb-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 🐛 Troubleshooting

**Port Already in Use:**
```bash
# Change the port in application.properties
server.port=9090
```

**Build Failures:**
```bash
# Clean and rebuild
./mvnw clean install
```

**CORS Issues:**
The API is configured with CORS enabled for development. Adjust in `GameController.java` if needed.

## 🚀 Performance Tips

- Game state is stored in memory (single instance per server)
- For production with multiple instances, consider adding a database
- Static assets are served directly by Spring Boot
- Compression is enabled in production configuration

## 📄 License

MIT License - Feel free to use and modify

## 👤 Author

Created as a modern web application demonstration.

---

**Ready to play?** Visit http://localhost:8080 and enjoy! 🎯
