# AWS EC2 Deployment Guide for Timbr

## Prerequisites
- AWS account with free tier
- Domain name (optional, but recommended)

## Option 1: Single Server Setup (Recommended for Free Tier)

### Step 1: Launch EC2 Instance
1. Launch t3.micro Ubuntu instance
2. Security group: Allow HTTP (80), HTTPS (443), SSH (22)
3. Create key pair for SSH access

### Step 2: Server Setup
```bash
# Connect to your instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 and Nginx
sudo npm install -g pm2
sudo apt install nginx -y
```

### Step 3: Deploy Your App
```bash
# Clone your repo (you'll need to push to GitHub first)
git clone your-repo-url
cd timbr

# Backend setup
cd backend
npm install
npm run build
npm run prisma:generate
npm run prisma:push

# Frontend setup (build for production)
cd ../frontend
npm install
# For web deployment, you'll need to build the web version
```

### Step 4: Environment Configuration
Create `/home/ubuntu/timbr/backend/.env`:
```
DATABASE_URL="file:./prod.db"
JWT_SECRET="your-super-secret-production-key"
NODE_ENV=production
PORT=4000
```

### Step 5: PM2 Process Management
```bash
# Start backend
pm2 start dist/server.js --name "timbr-backend"
pm2 startup
pm2 save
```

### Step 6: Nginx Configuration
Create `/etc/nginx/sites-available/timbr`:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 IP

    # Serve frontend
    location / {
        root /home/ubuntu/timbr/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/timbr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Option 2: Separate Services

### Backend on EC2 + Frontend on S3
- Backend: EC2 t3.micro with just the API
- Frontend: S3 static hosting + CloudFront
- Database: RDS free tier PostgreSQL

This gives better scalability but uses more AWS services.

## Cost Estimate (Free Tier)
- EC2 t3.micro: Free for 750 hours/month
- EBS 30GB: Free
- Data transfer: 15GB free/month
- Total: $0 if you stay within limits

## Next Steps
1. Test your localhost setup first
2. Push code to GitHub
3. Follow deployment guide above
4. Set up domain name (optional)
5. Configure SSL with Let's Encrypt (free)
