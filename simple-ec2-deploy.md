# Simple EC2 Deployment - Just Change the API URL

## Backend on EC2 (10 minutes)

### 1. Connect to EC2
- AWS Console → EC2 → Instance i-08845925d01d76e68
- Click "Connect" → "EC2 Instance Connect" 
- Username: `ec2-user`

### 2. Quick Backend Setup
```bash
# Update system
sudo dnf update -y

# Install Node.js
sudo dnf install -y nodejs npm git

# Install PM2
sudo npm install -g pm2

# Clone your repo (push to GitHub first)
git clone https://github.com/yourusername/timbr.git
cd timbr/backend

# Install dependencies
npm install

# Create production env
echo 'DATABASE_URL="file:./prod.db"
JWT_SECRET="your-secret-key"
NODE_ENV=production
PORT=4000' > .env

# Build and start
npm run build
npm run prisma:generate
npm run prisma:push
pm2 start dist/server.js --name timbr-backend
pm2 save
pm2 startup
```

### 3. Open Port in Security Group
- AWS Console → EC2 → Security Groups
- Edit your security group
- Add rule: Custom TCP, Port 4000, Source: 0.0.0.0/0

**That's it! Backend is now running on http://3.134.116.76:4000**

## Frontend Change (2 minutes)

Just change one line in your frontend code:

```typescript
// In src/context/AuthContext.tsx, line 24:
// Change from:
const API_BASE_URL = 'http://localhost:4000';

// To:
const API_BASE_URL = 'http://3.134.116.76:4000';
```

Then run your frontend locally as usual:
```bash
npm start
```

Your frontend runs on localhost, but talks to the EC2 backend!
