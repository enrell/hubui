#!/bin/bash

# HubUI CI/CD Setup Script
# This script helps configure GitHub Actions for Docker image building and pushing

set -e

echo "🚀 HubUI CI/CD Setup"
echo "===================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "This script must be run from the root of your Git repository"
    exit 1
fi

# Check if GitHub Actions workflow exists
if [ ! -f ".github/workflows/docker-build-push.yml" ]; then
    print_error "GitHub Actions workflow not found. Make sure you have the docker-build-push.yml file"
    exit 1
fi

print_success "GitHub Actions workflow found"

echo ""
print_info "Next steps to complete your CI/CD setup:"
echo ""

echo "1️⃣  Create a Docker Hub account (if you don't have one):"
echo "   📋 Visit: https://hub.docker.com/"
echo ""

echo "2️⃣  Create a Docker Hub repository:"
echo "   📋 Repository name: hubui"
echo "   📋 Make it public for easy access"
echo ""

echo "3️⃣  Configure GitHub Secrets:"
print_info "Go to your GitHub repository → Settings → Secrets and variables → Actions"
echo ""
echo "   Add these secrets:"
echo "   🔑 DOCKER_USERNAME: your-docker-hub-username"
echo "   🔑 DOCKER_PASSWORD: your-docker-hub-password-or-token"
echo ""
print_warning "For security, use a Docker Hub Access Token instead of your password"
echo "   📋 Create token at: https://hub.docker.com/settings/security"
echo ""

echo "4️⃣  Update configuration files:"
echo ""

# Get current Docker Hub username if they want to update files
read -p "🤔 Enter your Docker Hub username (or press Enter to skip): " DOCKER_USERNAME

if [ ! -z "$DOCKER_USERNAME" ]; then
    print_info "Updating docker-compose.production.yml with your username..."
    
    if [ -f "docker-compose.production.yml" ]; then
        sed -i.bak "s/your-username/$DOCKER_USERNAME/g" docker-compose.production.yml
        rm docker-compose.production.yml.bak 2>/dev/null || true
        print_success "Updated docker-compose.production.yml"
    fi
    
    if [ -f "DEPLOYMENT.md" ]; then
        sed -i.bak "s/your-dockerhub-username/$DOCKER_USERNAME/g" DEPLOYMENT.md
        rm DEPLOYMENT.md.bak 2>/dev/null || true
        print_success "Updated DEPLOYMENT.md"
    fi
    
    print_info "Updating README.md with Docker Hub commands..."
    if [ -f "README.md" ]; then
        sed -i.bak "s/enrell\/hubui/$DOCKER_USERNAME\/hubui/g" README.md
        rm README.md.bak 2>/dev/null || true
        print_success "Updated README.md"
    fi
fi

echo ""
echo "5️⃣  Test the workflow:"
echo "   📋 Push your changes to the main branch"
echo "   📋 Check GitHub Actions tab for build status"
echo "   📋 Verify image appears on Docker Hub"
echo ""

echo "6️⃣  Use your deployed image:"
if [ ! -z "$DOCKER_USERNAME" ]; then
    echo "   📋 docker run -d -p 3000:3000 $DOCKER_USERNAME/hubui:latest"
else
    echo "   📋 docker run -d -p 3000:3000 your-username/hubui:latest"
fi
echo ""

print_success "Setup script completed!"
echo ""
print_info "After completing these steps, your HubUI will be automatically built and"
print_info "pushed to Docker Hub on every commit to the main branch."
echo ""
print_warning "Remember: Only expose HubUI on trusted networks. It's designed for local use."
echo ""

# Check if they want to commit the changes
if [ ! -z "$DOCKER_USERNAME" ]; then
    echo ""
    read -p "🤔 Commit the updated configuration files? (y/N): " COMMIT_CHANGES
    
    if [[ $COMMIT_CHANGES =~ ^[Yy]$ ]]; then
        git add docker-compose.production.yml DEPLOYMENT.md README.md 2>/dev/null || true
        git commit -m "chore: update Docker Hub username in deployment configs" 2>/dev/null || print_warning "No changes to commit"
        print_success "Changes committed!"
        print_info "Don't forget to push: git push origin main"
    fi
fi
