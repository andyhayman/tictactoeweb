# 🚀 Tomcat Deployment Guide

This guide explains how to deploy the Tic Tac Toe application to Apache Tomcat.

## Overview

The application is now built as both:
- **JAR** - Standalone with embedded Tomcat (default)
- **WAR** - For deployment on external Tomcat server

## Build WAR File

```bash
./mvnw clean package
# Output: target/tictactoeweb-0.0.1-SNAPSHOT.war
```

The WAR file is production-ready and can be deployed directly to Tomcat.

## Installation

### Prerequisites
- Apache Tomcat 9.0+ or 10.0+
- Java 17 or higher
- 512MB RAM minimum
- 100MB disk space

### Download Tomcat

```bash
# Download Tomcat
wget https://archive.apache.org/dist/tomcat/tomcat-10/v10.1.0/bin/apache-tomcat-10.1.0.tar.gz

# Extract
tar -xzf apache-tomcat-10.1.0.tar.gz
mv apache-tomcat-10.1.0 /opt/tomcat

# Set permissions
sudo chown -R tomcat:tomcat /opt/tomcat
chmod +x /opt/tomcat/bin/*.sh
```

## Deployment Methods

### Method 1: Copy WAR to webapps (Easiest)

```bash
# Build WAR
./mvnw clean package

# Copy to Tomcat
cp target/tictactoeweb-0.0.1-SNAPSHOT.war /opt/tomcat/webapps/

# Rename for cleaner URL (optional)
cd /opt/tomcat/webapps/
mv tictactoeweb-0.0.1-SNAPSHOT.war tictactoeweb.war

# Tomcat auto-deploys - should be running and accessible within seconds
# Access: http://localhost:8080/tictactoeweb
```

### Method 2: Deploy as ROOT Application

Deploy at the root URL (http://localhost:8080/):

```bash
# Stop Tomcat
/opt/tomcat/bin/shutdown.sh
sleep 5

# Remove default ROOT
rm -rf /opt/tomcat/webapps/ROOT
rm /opt/tomcat/webapps/ROOT.war

# Deploy as ROOT
cp target/tictactoeweb-0.0.1-SNAPSHOT.war /opt/tomcat/webapps/ROOT.war

# Start Tomcat
/opt/tomcat/bin/startup.sh

# Access: http://localhost:8080
```

### Method 3: Use Tomcat Manager (GUI)

```bash
# 1. Access Tomcat Manager at: http://localhost:8080/manager
# 2. Login with your manager credentials (if configured)
# 3. Scroll to "Deploy" section
# 4. Choose WAR file or specify WAR URL
# 5. Click "Deploy"
# 6. Application appears in the list
```

## Post-Deployment

### Verify Deployment

```bash
# Check if running
curl http://localhost:8080/tictactoeweb/api/game/state

# Should return JSON:
# {"board":[[" "," "," "],...], "currentPlayer":"X", ...}
```

### View Logs

```bash
# Real-time logs
tail -f /opt/tomcat/logs/catalina.out

# Application-specific logs
cat /opt/tomcat/logs/localhost.*.log

# Find errors
grep ERROR /opt/tomcat/logs/catalina.out
```

### Access Application

```
http://your-server:8080/tictactoeweb
```

Or if deployed as ROOT:
```
http://your-server:8080
```

## Configuration

### server.xml Tuning

Edit `/opt/tomcat/conf/server.xml`:

```xml
<!-- HTTP Connector with compression -->
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443"
           compression="on"
           compressionMinSize="1024"
           compressableMimeType="text/html,text/xml,text/plain,text/css,text/javascript,application/json"
           URIEncoding="UTF-8" />
```

### context.xml Settings

Create/edit `/opt/tomcat/conf/Catalina/localhost/tictactoeweb.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Context path="/tictactoeweb"
         docBase="tictactoeweb"
         reloadable="false"
         sessionCookieSecure="true"
         sessionCookieHttpOnly="true">
</Context>
```

### Session Configuration

For persistent sessions, edit the Context:

```xml
<Manager pathname="SESSIONS.ser" />
```

## Tomcat as Systemd Service

### Create Service File

```bash
sudo nano /etc/systemd/system/tomcat.service
```

```ini
[Unit]
Description=Apache Tomcat
After=syslog.target network-online.target remote-fs.target nss-lookup.target
Wants=network-online.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk"
Environment="CATALINA_HOME=/opt/tomcat"
Environment="CATALINA_BASE=/opt/tomcat"
Environment="CATALINA_PID=/opt/tomcat/temp/tomcat.pid"
Environment="CATALINA_OPTS=-Xmx512M -Xms256M"

ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh

RestartSec=10
Restart=on-failure
RestartForceExitStatus=1

[Install]
WantedBy=multi-user.target
```

### Enable and Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable tomcat
sudo systemctl start tomcat

# Verify
sudo systemctl status tomcat

# View logs
sudo journalctl -u tomcat -f
```

## Nginx as Reverse Proxy

### Nginx Configuration

```nginx
upstream tomcat_backend {
    server localhost:8080;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS (optional)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://tomcat_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Important for WebSocket if added later
        proxy_http_version 1.1;
        proxy_set_header Connection "upgrade";
        proxy_set_header Upgrade $http_upgrade;
    }

    # Static file caching
    location ~* \.(css|js|images|fonts|static)/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Monitoring

### Check Application Health

```bash
curl -s http://localhost:8080/tictactoeweb/api/game/state | jq .
```

### Monitor System Resources

```bash
# Tomcat process
ps aux | grep tomcat

# Memory usage
top -p $(pgrep -f catalina)

# Disk usage
du -sh /opt/tomcat/webapps/*
```

### Log Rotation

```bash
# Install logrotate config
sudo nano /etc/logrotate.d/tomcat
```

```
/opt/tomcat/logs/*.log {
    weekly
    rotate 13
    compress
    delaycompress
    missingok
    notifempty
    create 0640 tomcat tomcat
    sharedscripts
    postrotate
        /bin/kill -HUP `cat /var/run/syslog.pid 2>/dev/null` 2>/dev/null || true
    endscript
}
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
tail -100 /opt/tomcat/logs/catalina.out

# Check permissions
ls -la /opt/tomcat/webapps/

# Verify Java is installed
java -version

# Check port 8080 is available
netstat -tuln | grep 8080
```

### 404 Error

```bash
# Check deployment directory
ls -la /opt/tomcat/webapps/tictactoeweb/

# Verify WAR extracted
unzip -l /opt/tomcat/webapps/tictactoeweb.war | head -20
```

### Out of Memory

```bash
# Increase heap in startup script
nano /opt/tomcat/bin/catalina.sh

# Add before CLASSPATH:
export CATALINA_OPTS="-Xmx1024M -Xms512M"
```

### Slow Performance

```bash
# Check system resources
free -h
df -h

# Monitor Tomcat
jps -l  # Lists Java processes
jstat -gc <pid>  # Garbage collection stats
```

## Backup & Recovery

### Backup Application

```bash
# Backup WAR
cp /opt/tomcat/webapps/tictactoeweb.war /backup/tictactoeweb-$(date +%Y%m%d).war

# Backup configuration
cp -r /opt/tomcat/conf /backup/tomcat-conf-$(date +%Y%m%d)

# Backup logs
tar -czf /backup/tomcat-logs-$(date +%Y%m%d).tar.gz /opt/tomcat/logs/
```

### Restore Application

```bash
# Stop Tomcat
sudo systemctl stop tomcat

# Remove old deployment
rm -rf /opt/tomcat/webapps/tictactoeweb
rm /opt/tomcat/webapps/tictactoeweb.war

# Restore from backup
cp /backup/tictactoeweb-<date>.war /opt/tomcat/webapps/tictactoeweb.war

# Start Tomcat
sudo systemctl start tomcat
```

## Updates

### Deploy New Version

```bash
# 1. Build new WAR
./mvnw clean package

# 2. Stop Tomcat
sudo systemctl stop tomcat

# 3. Backup current version
cp /opt/tomcat/webapps/tictactoeweb.war /backup/tictactoeweb-backup.war

# 4. Deploy new version
cp target/tictactoeweb-0.0.1-SNAPSHOT.war /opt/tomcat/webapps/tictactoeweb.war

# 5. Start Tomcat
sudo systemctl start tomcat

# 6. Verify
sleep 5
curl http://localhost:8080/tictactoeweb/api/game/state
```

## Security

### Change Tomcat Manager Password

```bash
nano /opt/tomcat/conf/tomcat-users.xml
```

```xml
<role rolename="manager-gui"/>
<role rolename="admin-gui"/>
<user username="admin" password="YOUR_SECURE_PASSWORD" roles="manager-gui,admin-gui"/>
```

### Disable Directory Listing

Edit `/opt/tomcat/conf/web.xml`:

```xml
<!-- Set to false to disable directory listing -->
<init-param>
    <param-name>listings</param-name>
    <param-value>false</param-value>
</init-param>
```

### Set Security Headers

In Nginx (if using as reverse proxy):

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## Need Help?

- **Logs**: `/opt/tomcat/logs/catalina.out`
- **Status**: `sudo systemctl status tomcat`
- **Health Check**: `curl http://localhost:8080/tictactoeweb/api/game/state`
- **Tomcat Docs**: http://tomcat.apache.org/

---

**Happy deploying! 🚀**
