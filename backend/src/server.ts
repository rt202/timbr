import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient, UserRole, SwipeDirection } from '../generated/prisma'

const app = express()
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000', 'http://127.0.0.1:8081'],
  credentials: true
}))
app.use(express.json())

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) return res.sendStatus(401)
    req.user = user
    next()
  } catch {
    return res.sendStatus(403)
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'timbr-backend' })
})

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().min(1),
    role: z.nativeEnum(UserRole),
    phone: z.string().optional(),
  })

  try {
    const { email, password, displayName, role, phone } = schema.parse(req.body)
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return res.status(400).json({ error: 'User already exists' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName, role, phone },
    })

    // Create role-specific profile
    if (role === UserRole.AGENT) {
      await prisma.agentProfile.create({ data: { userId: user.id } })
    } else if (role === UserRole.SELLER) {
      await prisma.sellerProfile.create({ data: { userId: user.id } })
    } else if (role === UserRole.BUYER) {
      const buyer = await prisma.buyerProfile.create({ data: { userId: user.id } })
      await prisma.buyerPreference.create({ data: { buyerId: buyer.id } })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET)
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } })
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string() })

  try {
    const { email, password } = schema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET)
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } })
  } catch {
    res.status(400).json({ error: 'Invalid input' })
  }
})

// Houses routes
app.get('/api/houses', async (req, res) => {
  const take = Number(req.query.take ?? 20)
  const skip = Number(req.query.skip ?? 0)
  const filters: any = { isActive: true }

  // Apply filters from query params
  if (req.query.minPrice) filters.price = { ...filters.price, gte: Number(req.query.minPrice) }
  if (req.query.maxPrice) filters.price = { ...filters.price, lte: Number(req.query.maxPrice) }
  if (req.query.minBeds) filters.bedrooms = { ...filters.bedrooms, gte: Number(req.query.minBeds) }
  if (req.query.maxBeds) filters.bedrooms = { ...filters.bedrooms, lte: Number(req.query.maxBeds) }
  if (req.query.propertyType) filters.propertyType = req.query.propertyType

  const houses = await prisma.house.findMany({
    where: filters,
    include: { images: true, agent: { include: { user: true } }, seller: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  })
  res.json({ houses })
})

app.get('/api/houses/:id', async (req, res) => {
  const house = await prisma.house.findUnique({
    where: { id: req.params.id },
    include: { images: true, agent: { include: { user: true } }, seller: { include: { user: true } } },
  })
  if (!house) return res.status(404).json({ error: 'Not found' })
  res.json({ house })
})

// Swipe routes
app.post('/api/swipes', authenticateToken, async (req: any, res) => {
  const schema = z.object({
    houseId: z.string(),
    direction: z.nativeEnum(SwipeDirection),
    dwellMs: z.number().optional(),
  })

  try {
    const { houseId, direction, dwellMs } = schema.parse(req.body)
    const swipe = await prisma.swipe.create({
      data: { userId: req.user.id, houseId, direction, dwellMs },
    })
    res.json({ swipe })
  } catch (error) {
    res.status(400).json({ error: 'Invalid input or already swiped' })
  }
})

// User preference routes
app.get('/api/preferences', authenticateToken, async (req: any, res) => {
  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: req.user.id },
    include: { preferences: true },
  })
  if (!buyer) return res.status(404).json({ error: 'Buyer profile not found' })
  res.json({ preferences: buyer.preferences })
})

app.put('/api/preferences', authenticateToken, async (req: any, res) => {
  const schema = z.object({
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minBeds: z.number().optional(),
    maxBeds: z.number().optional(),
    minBaths: z.number().optional(),
    maxBaths: z.number().optional(),
    propertyTypes: z.array(z.string()).optional(),
    neighborhoods: z.array(z.string()).optional(),
    minSqft: z.number().optional(),
    maxSqft: z.number().optional(),
    hasGarage: z.boolean().optional(),
    hasPool: z.boolean().optional(),
  })

  try {
    const data = schema.parse(req.body)
    const buyer = await prisma.buyerProfile.findUnique({ where: { userId: req.user.id } })
    if (!buyer) return res.status(404).json({ error: 'Buyer profile not found' })

    const preferences = await prisma.buyerPreference.upsert({
      where: { buyerId: buyer.id },
      update: data,
      create: { buyerId: buyer.id, ...data },
    })
    res.json({ preferences })
  } catch {
    res.status(400).json({ error: 'Invalid input' })
  }
})

// Agent routes
app.get('/api/agents/:id', async (req, res) => {
  const agent = await prisma.agentProfile.findUnique({
    where: { id: req.params.id },
    include: { user: true, listings: { include: { images: true } } },
  })
  if (!agent) return res.status(404).json({ error: 'Agent not found' })
  res.json({ agent })
})

const port = Number(process.env.PORT ?? 4000)
app.listen(port, () => {
  console.log(`timbr backend listening on http://localhost:${port}`)
})


