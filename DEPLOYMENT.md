# HubUI Deployment Guide

This guide covers all deployment options for HubUI, from quick Docker deployments to custom builds.

## 🚀 Quick Deployment (Docker Hub)

### Prerequisites

- Docker installed
- Docker Compose (optional but recommended)

### Option 1: Docker Compose (Recommended)

1. Download the production docker-compose file:
```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/enrell/hubui/main/docker-compose.production.yml
```

2. Update the image name in `docker-compose.yml`:
```yaml
services:
  hubui:
    image: enrellsa/hubui:latest  # Replace with your Docker Hub username
```

3. Start the application:
```bash
docker-compose up -d
```

### Option 2: Direct Docker Run

```bash
docker run -d \
  --name hubui \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  --restart unless-stopped \
  enrellsa/hubui:latest
```

## 🛠️ Building from Source

### Prerequisites

- Docker
- Git
- Bun (optional, for local development)

### Step 1: Clone the Repository

```bash
git clone https://github.com/enrell/hubui.git
cd hubui
```

### Step 2: Build and Deploy

#### Using Docker Compose
```bash
docker-compose up -d --build
```

#### Using Docker Commands
```bash
# Build the image
docker build -t hubui .

# Run the container
docker run -d \
  --name hubui \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  hubui
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Port to run the application | `3000` |
| `HOSTNAME` | Hostname to bind to | `0.0.0.0` |

### Custom Port

To run on a different port:

```bash
# Docker Compose
# Edit docker-compose.yml and change:
ports:
  - "8080:3000"  # External:Internal

# Docker Run
docker run -d \
  --name hubui \
  -p 8080:3000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  enrellsa/hubui:latest
```

## 📊 Monitoring

### Health Checks

The Docker container includes built-in health checks. Check status with:

```bash
docker ps
```

Look for the health status in the STATUS column:
- `healthy` - Application is running correctly
- `unhealthy` - Application is having issues
- `starting` - Health check is initializing

### Logs

View application logs:

```bash
# Docker Compose
docker-compose logs -f hubui

# Docker Run
docker logs -f hubui
```

## 🛑 Management Commands

### Stopping the Application

```bash
# Docker Compose
docker-compose down

# Docker Run
docker stop hubui
docker rm hubui
```

### Updating the Application

```bash
# Docker Compose
docker-compose pull
docker-compose up -d

# Docker Run
docker stop hubui
docker rm hubui
docker pull enrellsa/hubui:latest
# Then run the docker run command again
```

### Backup/Restore

HubUI stores data in browser local storage, but you can backup the container configuration:

```bash
# Export configuration
docker-compose config > hubui-config-backup.yml

# Create container backup
docker commit hubui hubui-backup:$(date +%Y%m%d)
```

## 🔐 Security Considerations

> [!WARNING]
> **Local Use Only**: HubUI is designed for local/private network usage only. Do not expose it to the public internet without proper authentication and security measures.

### Recommended Security Practices

1. **Network Isolation**: Run on private networks only
2. **Firewall**: Block external access to port 3000
3. **Reverse Proxy**: If internet access is needed, use a reverse proxy with authentication
4. **Regular Updates**: Keep the Docker image updated

### Using with Reverse Proxy

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name hubui.local;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Use a different port
docker run -p 8080:3000 ...
```

#### Container Won't Start
```bash
# Check logs
docker logs hubui

# Check if image exists
docker images | grep hubui
```

#### Health Check Failing
```bash
# Check container status
docker inspect hubui

# Test manually
docker exec hubui wget --no-verbose --tries=1 --spider http://localhost:3000/
```

### Getting Help

1. Check the [GitHub Issues](https://github.com/enrell/hubui/issues)
2. Review container logs
3. Verify your Docker setup
4. Check network connectivity

## 📝 Development Deployment

For development with hot reloading:

```bash
git clone https://github.com/enrell/hubui.git
cd hubui

# Install dependencies
bun install

# Start development server
bun dev
```

Access at [http://localhost:3000](http://localhost:3000)
