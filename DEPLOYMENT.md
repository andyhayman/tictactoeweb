# 🚀 Tic Tac Toe Web App - Deployment Guide

This guide covers various ways to deploy your Tic Tac Toe web application to production.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Linux Server Deployment](#linux-server-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Local Development

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Quick Start

```bash
# Clone and build
git clone <your-repo-url>
cd tictactoeweb
./mvnw spring-boot:run

# Access at http://localhost:8080
```

### Hot Reload Development
The application includes Spring DevTools for hot reload:
```bash
./mvnw spring-boot:run
# Save file changes - application auto-reloads!
```

---

## Build Options

### Build JAR (Default - Standalone)
```bash
./mvnw clean package
# Creates: target/tictactoeweb-0.0.1-SNAPSHOT.jar
# Run with: java -jar target/*.jar
```

### Build WAR (Tomcat/Traditional Server Deployment)
```bash
./mvnw clean package
# Creates: target/tictactoeweb-0.0.1-SNAPSHOT.war
# Deploy to: $TOMCAT_HOME/webapps/
```

---

## Docker Deployment

### Build Docker Image

```bash
# Build image
docker build -t tictactoeweb:latest .

# Run container
docker run -p 8080:8080 tictactoeweb:latest
```

### Docker Compose (Easiest)

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Push to Docker Registry

```bash
# Tag for Docker Hub
docker tag tictactoeweb:latest your-username/tictactoeweb:latest

# Login to Docker Hub
docker login

# Push image
docker push your-username/tictactoeweb:latest
```

---

## Linux Server Deployment

### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Java 17 installed
- Nginx (optional, for reverse proxy)

### Tomcat Deployment (Recommended for Traditional Servers)

#### Prerequisites
- Apache Tomcat 9.0+ or 10.0+
- Java 17 installed

#### Deployment Steps

```bash
# 1. Build the WAR file
./mvnw clean package
# Creates: target/tictactoeweb-0.0.1-SNAPSHOT.war

# 2. Copy WAR to Tomcat
scp target/tictactoeweb-0.0.1-SNAPSHOT.war user@server:/path/to/tomcat/webapps/

# 3. Optionally rename for cleaner URL
ssh user@server
cd /path/to/tomcat/webapps/
mv tictactoeweb-0.0.1-SNAPSHOT.war tictactoeweb.war

# 4. Start/restart Tomcat
/path/to/tomcat/bin/startup.sh

# 5. Access application
# If deployed as tictactoeweb.war: http://yourserver:8080/tictactoeweb
# If deployed as ROOT.war: http://yourserver:8080
```

#### Access from Root Context

To deploy at root (/) instead of /tictactoeweb:

```bash
# Stop Tomcat
/path/to/tomcat/bin/shutdown.sh

# Remove existing ROOT application
rm -rf /path/to/tomcat/webapps/ROOT
rm /path/to/tomcat/webapps/ROOT.war

# Copy WAR as ROOT
cp tictactoeweb-0.0.1-SNAPSHOT.war /path/to/tomcat/webapps/ROOT.war

# Start Tomcat
/path/to/tomcat/bin/startup.sh

# Access at http://yourserver:8080
```

#### Tomcat Configuration (Optional)

For production, update `$TOMCAT_HOME/conf/server.xml`:

```xml
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443"
           compression="on"
           compressionMinSize="1024"
           compressableMimeType="text/html,text/xml,text/plain,text/css,text/javascript,application/json" />
```

#### View Tomcat Logs

```bash
# Real-time logs
tail -f /path/to/tomcat/logs/catalina.out

# Application logs
cat /path/to/tomcat/logs/localhost.*.log
```

### Option 1: Direct JAR Execution

```bash
# Copy JAR to server
scp target/tictactoeweb-0.0.1-SNAPSHOT.jar user@server:/opt/tictactoeweb/

# Connect to server
ssh user@server

# Create directory
sudo mkdir -p /opt/tictactoeweb
sudo chown $USER:$USER /opt/tictactoeweb

# Run the application
java -jar /opt/tictactoeweb/tictactoeweb-0.0.1-SNAPSHOT.jar \
    --spring.profiles.active=prod \
    --server.port=8080
```

### Option 2: Systemd Service

Use the provided `tictactoeweb.service` file:

```bash
# Copy service file
sudo cp tictactoeweb.service /etc/systemd/system/

# Edit the ExecStart path in the service file if needed
sudo nano /etc/systemd/system/tictactoeweb.service

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable tictactoeweb
sudo systemctl start tictactoeweb

# Check status
sudo systemctl status tictactoeweb

# View logs
sudo journalctl -u tictactoeweb -f
```

### Option 3: Nginx Reverse Proxy

Use the provided `nginx-config.conf`:

```bash
# Copy nginx config
sudo cp nginx-config.conf /etc/nginx/sites-available/tictactoeweb

# Enable the site
sudo ln -s /etc/nginx/sites-available/tictactoeweb /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

**Nginx Config Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Cloud Deployment

### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p java-17 tictactoeweb

# Create environment
eb create production-env

# Deploy
eb deploy

# View logs
eb logs
```

### Azure App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name tictactoeweb-rg --location eastus

# Create app service plan
az appservice plan create \
    --name tictactoeweb-plan \
    --resource-group tictactoeweb-rg \
    --sku B1 --is-linux

# Create web app
az webapp create \
    --resource-group tictactoeweb-rg \
    --plan tictactoeweb-plan \
    --name tictactoeweb-app \
    --runtime "java|17|Tomcat 10"

# Deploy
az webapp up --resource-group tictactoeweb-rg \
    --name tictactoeweb-app \
    --plan tictactoeweb-plan
```

### Google Cloud Run

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/tictactoeweb

# Deploy
gcloud run deploy tictactoeweb \
    --image gcr.io/YOUR_PROJECT_ID/tictactoeweb \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

### Heroku

```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## Monitoring & Troubleshooting

### Health Check Endpoint

The application includes a health endpoint:

```bash
curl http://localhost:8080/api/game/state
```

### View Application Logs

**Local:**
```bash
./mvnw spring-boot:run 2>&1 | tee app.log
```

**Systemd:**
```bash
sudo journalctl -u tictactoeweb -n 100 -f
```

**Docker:**
```bash
docker-compose logs -f tictactoeweb
```

### Common Issues

**Port Already in Use:**
```bash
# Change port in application.properties
server.port=9090
```

**Out of Memory:**
```bash
# Increase heap size
java -Xmx512m -jar tictactoeweb-0.0.1-SNAPSHOT.jar
```

**CORS Errors:**
Check `GameController.java` and update `@CrossOrigin` if needed:
```java
@CrossOrigin(origins = "https://yourdomain.com")
```

### Performance Monitoring

Add these to `application-prod.properties`:

```properties
# Enable actuator endpoints for monitoring
management.endpoints.web.exposure.include=health,metrics,info
management.endpoint.health.show-details=when-authorized
```

Access metrics at: `http://localhost:8080/actuator/metrics`

---

## SSL/TLS Configuration

To enable HTTPS, add to `application-prod.properties`:

```properties
server.ssl.key-store=/path/to/keystore.p12
server.ssl.key-store-password=your-password
server.ssl.key-store-type=PKCS12
server.port=8443
```

Or with Let's Encrypt via Nginx:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Backup & Recovery

### Backup Data

```bash
# Backup application directory
tar -czf tictactoeweb-backup.tar.gz /opt/tictactoeweb/

# Store in cloud
aws s3 cp tictactoeweb-backup.tar.gz s3://your-bucket/
```

### Database Backup (if added later)

```bash
# PostgreSQL example
pg_dump -U user database > backup.sql
```

---

## Update Deployment

```bash
# Build new version
./mvnw clean package

# Stop current service
sudo systemctl stop tictactoeweb

# Backup current JAR
sudo mv /opt/tictactoeweb/app.jar /opt/tictactoeweb/app.jar.bak

# Copy new JAR
sudo cp target/tictactoeweb-0.0.1-SNAPSHOT.jar /opt/tictactoeweb/app.jar

# Start service
sudo systemctl start tictactoeweb

# Verify
sudo systemctl status tictactoeweb
```

---

## Need Help?

- Check logs: Application logs contain detailed error information
- Health endpoint: `/api/game/state` returns current app state
- GitHub Issues: Report bugs and request features
- Documentation: See README.md for complete documentation

---

**Happy deploying! 🚀**
