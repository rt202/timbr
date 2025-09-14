# 🏠 timbr

**Tinder for houses** - A mobile app where buyers can swipe through houses to find their perfect home, with detailed property information and smart filtering.

## Features

- 📱 **Mobile-first** - Built with Expo React Native for iOS/Android
- 🔥 **Swipe Interface** - Tinder-like swiping for browsing houses
- 🏠 **Detailed Property Info** - Comprehensive house details, photos, amenities
- 👤 **Multi-role Support** - Buyers, Sellers, and Agents with different interfaces
- 🎯 **Smart Filtering** - Buyers set preferences for personalized house feeds
- 🤝 **Agent Profiles** - Professional agent pages with listings and ratings
- 📊 **Data Analytics** - Track swipe patterns and user engagement

## Tech Stack

### Backend
- **Node.js** + **TypeScript** + **Express**
- **Prisma ORM** with **PostgreSQL** (AWS RDS)
- **JWT Authentication**
- **Zod** for validation
- **Faker.js** for synthetic data generation

### Frontend
- **Expo React Native** + **TypeScript**
- **React Navigation** for routing
- **React Native Reanimated** for smooth animations
- **React Native Gesture Handler** for swipe gestures
- **Expo Secure Store** for token storage

### Database
- **AWS RDS PostgreSQL** with multi-AZ deployment
- **Prisma migrations** for schema management

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- AWS RDS PostgreSQL instance

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file:**
   ```env
   DATABASE_URL="postgresql://username:password@timbr.czk62cmagjz3.us-east-2.rds.amazonaws.com:5432/postgres?schema=public"
   PORT=4000
   JWT_SECRET="your-super-secret-jwt-key"
   ```

5. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

6. **Push database schema:**
   ```bash
   npm run prisma:push
   ```

7. **Seed the database with synthetic data:**
   ```bash
   npm run seed
   ```

8. **Start the development server:**
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API base URL in `src/context/AuthContext.tsx`:**
   ```typescript
   const API_BASE_URL = 'http://your-backend-url:4000'; // Update this
   ```

4. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator:**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

## Database Schema

### Core Models
- **User** - Authentication and basic profile info
- **AgentProfile** - Real estate agent details, license, brokerage
- **SellerProfile** - Property seller information
- **BuyerProfile** - House buyer with preferences
- **House** - Property listings with detailed information
- **HouseImage** - Property photos with captions
- **BuyerPreference** - Buyer's filtering criteria
- **Swipe** - User swipe actions (left/right) with analytics

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Houses
- `GET /api/houses` - Get houses with filtering
- `GET /api/houses/:id` - Get house details

### User Preferences (Buyers)
- `GET /api/preferences` - Get buyer preferences
- `PUT /api/preferences` - Update buyer preferences

### Swipes
- `POST /api/swipes` - Record swipe action

### Agents
- `GET /api/agents/:id` - Get agent profile and listings

## AWS RDS Setup

Your PostgreSQL database is already set up at:
- **Endpoint:** `timbr.czk62cmagjz3.us-east-2.rds.amazonaws.com`
- **Port:** `5432`
- **Engine:** PostgreSQL

Make sure your security group allows connections on port 5432 from your development environment.

## Deployment

### Backend Deployment
- Deploy to AWS EC2, Heroku, or Vercel
- Set environment variables in production
- Use AWS RDS for production database

### Frontend Deployment
- Build with `expo build` for app stores
- Use Expo EAS Build for cloud building
- Deploy web version with `expo export:web`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
