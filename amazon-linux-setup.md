# Amazon Linux 2023 Setup for Timbr

## Instance Details
- **Instance ID**: i-08845925d01d76e68
- **Public IP**: 3.134.116.76
- **OS**: Amazon Linux 2023
- **Connection**: EC2 Instance Connect (username: ec2-user)

## Step 1: Connect to Instance
1. AWS Console → EC2 → Instances
2. Select instance i-08845925d01d76e68
3. Click "Connect" → "EC2 Instance Connect"
4. Username: `ec2-user`
5. Click "Connect"

## Step 2: System Update and Basic Setup

```bash
# Update system packages
sudo dnf update -y

# Install development tools
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y git curl wget unzip
```

## Step 3: Install Node.js 18

```bash
# Install Node.js 18 using dnf
sudo dnf install -y nodejs npm

# Verify installation
node --version
npm --version

# If you need a specific version, use NodeSource repository:
# curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
# sudo dnf install -y nodejs
```

## Step 4: Install PM2 and Nginx

```bash
# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo dnf install -y nginx

# Start and enable services
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

## Step 5: Configure Firewall

```bash
# Amazon Linux uses firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow HTTP and HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=4000/tcp
sudo firewall-cmd --reload

# Check rules
sudo firewall-cmd --list-all
```

## Step 6: Set Up Application Directory

```bash
# Create app directory
sudo mkdir -p /var/www/timbr
sudo chown ec2-user:ec2-user /var/www/timbr
cd /var/www/timbr

# You'll need to upload your code here
# Option 1: Clone from GitHub (recommended)
# git clone https://github.com/yourusername/timbr.git .

# Option 2: Upload files manually using SCP or Instance Connect file transfer
```

## Step 7: Upload Your Code (Multiple Options)

### Option A: GitHub (Recommended)
```bash
# First, push your local code to GitHub, then:
git clone https://github.com/yourusername/timbr.git .
```

### Option B: File Transfer via Instance Connect
1. In AWS Console, go to your instance
2. Click "Connect" → "EC2 Instance Connect"
3. Use the file transfer feature to upload your project files

### Option C: Create files manually
```bash
# Create basic structure
mkdir -p backend frontend
cd backend

# You can copy-paste your files one by one
nano package.json
# Paste your package.json content

nano src/server.ts
# Paste your server.ts content
```

## Step 8: Install Dependencies and Build

```bash
# Backend setup
cd /var/www/timbr/backend
npm install

# Create environment file
cat > .env << 'EOF'
DATABASE_URL="file:./prod.db"
JWT_SECRET="amazon-linux-super-secure-production-secret-key-2023"
NODE_ENV=production
PORT=4000
EOF

# Build the application
npm run build

# Set up database
npm run prisma:generate
npm run prisma:push

# Optional: Seed with sample data
npm run seed
```

## Step 9: Start Application with PM2

```bash
# Start the backend
pm2 start dist/server.js --name "timbr-backend"

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the command it suggests (copy and run the sudo command)

# Check status
pm2 status
pm2 logs timbr-backend
```

## Step 10: Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/conf.d/timbr.conf << 'EOF'
server {
    listen 80;
    server_name 3.134.116.76;  # Your public IP
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # API routes
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:4000;
    }
    
    # Default response for now
    location / {
        return 200 "Timbr API Server is running! Access the API at /api/";
        add_header Content-Type text/plain;
    }
}
EOF

# Remove default config
sudo rm -f /etc/nginx/conf.d/default.conf

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 11: Test Your Deployment

```bash
# Test locally on the server
curl http://localhost:4000/health

# Test via Nginx
curl http://localhost/health

# Check logs
pm2 logs timbr-backend
sudo tail -f /var/log/nginx/error.log
```

## Step 12: Test from Outside

Open your browser and go to:
- **API Health**: http://3.134.116.76/health
- **API Base**: http://3.134.116.76/api/

## Troubleshooting Commands

```bash
# Check if backend is running
pm2 status
pm2 logs timbr-backend

# Check Nginx status
sudo systemctl status nginx

# Check firewall
sudo firewall-cmd --list-all

# Check what's listening on ports
sudo netstat -tlnp | grep :4000
sudo netstat -tlnp | grep :80

# Restart services
pm2 restart timbr-backend
sudo systemctl restart nginx

# Check system resources
top
df -h
free -h
```

## Performance Optimization for Small Instance

```bash
# Create swap file for memory
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Next Steps After Setup

1. **Push your code to GitHub** for easier deployment
2. **Set up a domain name** (optional)
3. **Configure SSL with Let's Encrypt**
4. **Set up monitoring and backups**

Your API will be accessible at: **http://3.134.116.76/api/**
