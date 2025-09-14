import 'dotenv/config'
import { PrismaClient, UserRole, SwipeDirection } from '../generated/prisma'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function createUsersAndProfiles() {
  const passwordHash = await bcrypt.hash('password123', 10)

  const agents = [] as { userId: string; id: string }[]
  const sellers = [] as { userId: string; id: string }[]
  const buyers = [] as { userId: string; id: string }[]

  // Agents
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: `agent${i}@example.com`,
        passwordHash,
        role: UserRole.AGENT,
        displayName: faker.person.fullName(),
        phone: faker.phone.number(),
        avatarUrl: faker.image.avatarGitHub(),
      },
    })
    const agent = await prisma.agentProfile.create({
      data: {
        userId: user.id,
        licenseNo: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
        bio: faker.lorem.sentences({ min: 1, max: 3 }),
        website: faker.internet.url(),
        brokerage: randomFrom(['Compass', 'Redfin', 'Keller Williams', 'Coldwell Banker', 'Sotheby\'s']),
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      },
    })
    agents.push({ userId: user.id, id: agent.id })
  }

  // Sellers
  for (let i = 0; i < 40; i++) {
    const user = await prisma.user.create({
      data: {
        email: `seller${i}@example.com`,
        passwordHash,
        role: UserRole.SELLER,
        displayName: faker.person.fullName(),
        phone: faker.phone.number(),
        avatarUrl: faker.image.avatarGitHub(),
      },
    })
    const seller = await prisma.sellerProfile.create({ data: { userId: user.id } })
    sellers.push({ userId: user.id, id: seller.id })
  }

  // Buyers
  for (let i = 0; i < 200; i++) {
    const user = await prisma.user.create({
      data: {
        email: `buyer${i}@example.com`,
        passwordHash,
        role: UserRole.BUYER,
        displayName: faker.person.fullName(),
        phone: faker.phone.number(),
        avatarUrl: faker.image.avatarGitHub(),
      },
    })
    const buyer = await prisma.buyerProfile.create({ data: { userId: user.id } })
    // Preferences
    await prisma.buyerPreference.create({
      data: {
        buyerId: buyer.id,
        minPrice: 250_000,
        maxPrice: 1_500_000,
        minBeds: 2,
        maxBeds: 5,
        minBaths: 1,
        maxBaths: 4,
        propertyTypes: ['HOUSE', 'CONDO', 'TOWNHOME'],
        neighborhoods: [faker.location.city(), faker.location.city()],
        minSqft: 900,
        maxSqft: 4000,
        minLotSqft: 1000,
        maxLotSqft: 20000,
        hasGarage: faker.datatype.boolean(),
        hasPool: faker.datatype.boolean(),
        yearBuiltMin: 1950,
        yearBuiltMax: 2024,
        hoaMaxMonthly: 600,
        allowFixerUpper: faker.datatype.boolean(),
      },
    })
    buyers.push({ userId: user.id, id: buyer.id })
  }

  return { agents, sellers, buyers }
}

function generateHouseBase(city?: string) {
  const propertyType = randomFrom(['HOUSE', 'CONDO', 'TOWNHOME'])
  const bedrooms = faker.number.int({ min: 1, max: 6 })
  const bathrooms = faker.number.int({ min: 1, max: 5 })
  const sqft = faker.number.int({ min: 600, max: 6000 })
  const lotSqft = faker.helpers.maybe(() => faker.number.int({ min: 1000, max: 30000 }), { probability: 0.7 })
  const yearBuilt = faker.helpers.maybe(() => faker.number.int({ min: 1900, max: 2024 }), { probability: 0.9 })
  const hasGarage = faker.datatype.boolean()
  const hasPool = faker.datatype.boolean()
  const hoaMonthly = faker.helpers.maybe(() => faker.number.int({ min: 100, max: 1200 }), { probability: 0.4 })
  const price = faker.number.int({ min: 150_000, max: 3_000_000 })

  const address = faker.location.streetAddress()
  const cityName = city ?? faker.location.city()
  const state = faker.location.state({ abbreviated: true })
  const postalCode = faker.location.zipCode()
  const latitude = Number(faker.location.latitude())
  const longitude = Number(faker.location.longitude())

  return {
    title: `${bedrooms}BR ${propertyType} in ${cityName}`,
    description: faker.lorem.paragraphs({ min: 1, max: 2 }),
    price,
    bedrooms,
    bathrooms,
    sqft,
    lotSqft: lotSqft ?? null,
    yearBuilt: yearBuilt ?? null,
    propertyType,
    addressLine1: address,
    city: cityName,
    state,
    postalCode,
    country: 'US',
    latitude,
    longitude,
    hoaMonthly: hoaMonthly ?? null,
    hasGarage,
    hasPool,
    isActive: true,
  }
}

function generateImages(houseData: any) {
  const images: { url: string; caption?: string; order: number }[] = []
  
  // Room and area types based on house features
  const roomTypes = [
    'living-room', 'kitchen', 'bedroom', 'bathroom', 'dining-room',
    'home-office', 'family-room', 'master-bedroom', 'guest-room'
  ]
  
  const exteriorTypes = [
    'house-exterior', 'front-yard', 'backyard', 'porch', 'entrance',
    'driveway', 'landscape', 'curb-appeal'
  ]
  
  let imageOrder = 0
  
  // Always start with exterior shot
  images.push({
    url: `https://loremflickr.com/1280/960/house,exterior,home?random=${Math.random()}`,
    caption: 'Front exterior view',
    order: imageOrder++,
  })
  
  // Add kitchen (high priority)
  images.push({
    url: `https://loremflickr.com/1280/960/kitchen,modern,interior?random=${Math.random()}`,
    caption: 'Modern kitchen with updated appliances',
    order: imageOrder++,
  })
  
  // Add living room
  images.push({
    url: `https://loremflickr.com/1280/960/living-room,interior,cozy?random=${Math.random()}`,
    caption: 'Spacious living room',
    order: imageOrder++,
  })
  
  // Add bedrooms based on bedroom count
  for (let i = 0; i < Math.min(houseData.bedrooms, 3); i++) {
    const bedroomType = i === 0 ? 'master-bedroom' : 'bedroom'
    const caption = i === 0 ? 'Master bedroom suite' : `Bedroom ${i + 1}`
    images.push({
      url: `https://loremflickr.com/1280/960/${bedroomType},interior,comfortable?random=${Math.random()}`,
      caption,
      order: imageOrder++,
    })
  }
  
  // Add bathrooms
  const bathroomCount = Math.min(Math.ceil(houseData.bathrooms), 2)
  for (let i = 0; i < bathroomCount; i++) {
    const caption = i === 0 ? 'Master bathroom' : 'Guest bathroom'
    images.push({
      url: `https://loremflickr.com/1280/960/bathroom,interior,modern?random=${Math.random()}`,
      caption,
      order: imageOrder++,
    })
  }
  
  // Add garage if house has one
  if (houseData.hasGarage) {
    images.push({
      url: `https://loremflickr.com/1280/960/garage,car,driveway?random=${Math.random()}`,
      caption: 'Attached garage',
      order: imageOrder++,
    })
  }
  
  // Add pool if house has one
  if (houseData.hasPool) {
    images.push({
      url: `https://loremflickr.com/1280/960/pool,swimming,backyard?random=${Math.random()}`,
      caption: 'Private swimming pool',
      order: imageOrder++,
    })
  }
  
  // Add backyard/outdoor space
  if (houseData.lotSqft && houseData.lotSqft > 5000) {
    images.push({
      url: `https://loremflickr.com/1280/960/backyard,garden,landscape?random=${Math.random()}`,
      caption: 'Spacious backyard',
      order: imageOrder++,
    })
  }
  
  // Add dining room for larger houses
  if (houseData.sqft > 2000) {
    images.push({
      url: `https://loremflickr.com/1280/960/dining-room,interior,elegant?random=${Math.random()}`,
      caption: 'Formal dining room',
      order: imageOrder++,
    })
  }
  
  // Add home office for modern houses
  if (houseData.yearBuilt && houseData.yearBuilt > 2000) {
    images.push({
      url: `https://loremflickr.com/1280/960/home-office,workspace,modern?random=${Math.random()}`,
      caption: 'Home office space',
      order: imageOrder++,
    })
  }
  
  // Ensure we have 5-10 images total
  while (images.length < 5) {
    const randomRoom = randomFrom(roomTypes)
    images.push({
      url: `https://loremflickr.com/1280/960/${randomRoom},interior,home?random=${Math.random()}`,
      caption: `Additional ${randomRoom.replace('-', ' ')} view`,
      order: imageOrder++,
    })
  }
  
  // Limit to maximum 10 images
  return images.slice(0, 10)
}

async function createHouses(agents: { id: string }[], sellers: { id: string }[]) {
  for (let i = 0; i < 500; i++) {
    const base = generateHouseBase()
    const agent = faker.helpers.maybe(() => randomFrom(agents), { probability: 0.7 })
    const seller = faker.helpers.maybe(() => randomFrom(sellers), { probability: 0.6 })

    const house = await prisma.house.create({
      data: {
        ...base,
        agentId: agent?.id ?? null,
        sellerId: seller?.id ?? null,
        images: { create: generateImages(base) },
      },
    })

    // Generate random swipes to simulate activity
    const swipeCount = faker.number.int({ min: 0, max: 50 })
    const buyerIds = (await prisma.buyerProfile.findMany({ select: { userId: true } })).map((b) => b.userId)
    for (let s = 0; s < swipeCount; s++) {
      const userId = randomFrom(buyerIds)
      const direction = Math.random() > 0.5 ? SwipeDirection.RIGHT : SwipeDirection.LEFT
      try {
        await prisma.swipe.create({
          data: { userId, houseId: house.id, direction, dwellMs: faker.number.int({ min: 500, max: 15000 }) },
        })
      } catch {
        // ignore unique constraint errors for duplicate swipes
      }
    }
  }
}

async function main() {
  console.log('Seeding timbr...')
  await prisma.swipe.deleteMany()
  await prisma.houseImage.deleteMany()
  await prisma.house.deleteMany()
  await prisma.buyerPreference.deleteMany()
  await prisma.buyerProfile.deleteMany()
  await prisma.sellerProfile.deleteMany()
  await prisma.agentProfile.deleteMany()
  await prisma.user.deleteMany()

  const { agents, sellers } = await createUsersAndProfiles()
  await createHouses(agents, sellers)
  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


