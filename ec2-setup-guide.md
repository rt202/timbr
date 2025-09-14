# EC2 Setup Guide for Timbr

## Step 1: Launch EC2 Instance

### Instance Configuration
- **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
- **Instance type**: t3.micro
- **Key pair**: Create new key pair (save the .pem file securely)
- **Network settings**: Create security group with:
  - SSH (22) - Your IP only
  - HTTP (80) - Anywhere (0.0.0.0/0)
  - HTTPS (443) - Anywhere (0.0.0.0/0)
  - Custom TCP (4000) - Anywhere (for API during setup)

### Storage
- **Root volume**: 30 GB gp3 (free tier includes 30GB)

## Step 2: Connect to Your Instance

```bash
# Make key file read-only
chmod 400 your-key-name.pem

# Connect via SSH
ssh -i your-key-name.pem ubuntu@your-ec2-public-ip
```

## Step 3: Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 4: Install Additional Tools

```bash
# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Web Server)
sudo apt install -y nginx

# Install UFW (Firewall)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Start and enable services
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl start ufw
sudo systemctl enable ufw
```

## Step 5: Set Up Your Application

```bash
# Create app directory
sudo mkdir -p /var/www/timbr
sudo chown ubuntu:ubuntu /var/www/timbr
cd /var/www/timbr

# Clone your repository (you'll need to push to GitHub first)
git clone https://github.com/yourusername/timbr.git .

# Install backend dependencies
cd backend
npm install

# Create production environment file
sudo nano .env
```

### Environment File (.env)
```env
DATABASE_URL="file:./prod.db"
JWT_SECRET="your-super-secure-production-secret-key-make-it-long"
NODE_ENV=production
PORT=4000
```

```bash
# Build and set up database
npm run build
npm run prisma:generate
npm run prisma:push

# Optional: Seed database with sample data
npm run seed
```

## Step 6: Configure PM2

```bash
# Start your application with PM2
pm2 start dist/server.js --name "timbr-backend"

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions it gives you (run the command it suggests)
```

## Step 7: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/timbr
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 IP
    
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
    
    # Serve static files (if you build frontend for web)
    location / {
        root /var/www/timbr/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/timbr /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 8: Set Up SSL (Optional but Recommended)

```bash
# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 9: Monitoring and Maintenance

```bash
# Check PM2 status
pm2 status
pm2 logs timbr-backend

# Check Nginx status
sudo systemctl status nginx

# Check system resources
htop
df -h
free -h

# Update system (run monthly)
sudo apt update && sudo apt upgrade -y
```

## Troubleshooting Commands

```bash
# Restart backend
pm2 restart timbr-backend

# Check logs
pm2 logs timbr-backend --lines 50

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check if port 4000 is in use
sudo netstat -tlnp | grep :4000

# Check firewall status
sudo ufw status
```

## Performance Optimization for t3.micro

```bash
# Create swap file (helps with low memory)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Cost Monitoring
- Monitor your usage in AWS console
- Set up billing alerts
- t3.micro gives you 750 hours/month free (24/7 for 31 days)
- Stay under 30GB storage and 15GB data transfer

Your app should be accessible at: `http://your-ec2-ip` or `https://your-domain.com`
