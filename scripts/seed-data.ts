import { PrismaClient } from '@prisma/client'
import ZAI from 'z-ai-web-dev-sdk'

const db = new PrismaClient()

async function seedData() {
  try {
    console.log('Starting database seeding...')

    // Clear existing data
    await db.orderCoupon.deleteMany()
    await db.orderItem.deleteMany()
    await db.order.deleteMany()
    await db.coupon.deleteMany()
    await db.product.deleteMany()
    await db.category.deleteMany()
    await db.siteConfig.deleteMany()
    await db.user.deleteMany()

    console.log('Cleared existing data')

    // Create categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: 'Design Tools',
          slug: 'design-tools',
          icon: 'fas fa-palette',
          sortOrder: 1
        }
      }),
      db.category.create({
        data: {
          name: 'Productivity',
          slug: 'productivity',
          icon: 'fas fa-tasks',
          sortOrder: 2
        }
      }),
      db.category.create({
        data: {
          name: 'Development',
          slug: 'development',
          icon: 'fas fa-code',
          sortOrder: 3
        }
      }),
      db.category.create({
        data: {
          name: 'Marketing',
          slug: 'marketing',
          icon: 'fas fa-bullhorn',
          sortOrder: 4
        }
      }),
      db.category.create({
        data: {
          name: 'Education',
          slug: 'education',
          icon: 'fas fa-graduation-cap',
          sortOrder: 5
        }
      })
    ])

    console.log('Created categories')

    // Create products with placeholder images for now
    const products = await Promise.all([
      db.product.create({
        data: {
          name: 'Canva Pro',
          description: 'Professional design tool with premium templates',
          longDescription: 'Canva Pro is a premium design tool that offers advanced features like brand kits, background remover, premium templates, and more. Perfect for professionals and businesses.',
          image: 'https://via.placeholder.com/400x300.png?text=Canva+Pro',
          category: 'Design Tools',
          categorySlug: 'design-tools',
          slug: 'canva-pro',
          pricing: [
            { duration: '1 Month', price: 5 },
            { duration: '3 Months', price: 12 },
            { duration: '6 Months', price: 20 },
            { duration: '1 Year', price: 35 }
          ],
          categoryId: categories[0].id,
          featured: true
        }
      }),
      db.product.create({
        data: {
          name: 'ChatGPT Plus',
          description: 'Advanced AI assistant with GPT-4',
          longDescription: 'ChatGPT Plus gives you access to GPT-4, faster response times, and access to new features. Perfect for professionals, students, and anyone who needs advanced AI assistance.',
          image: 'https://via.placeholder.com/400x300.png?text=ChatGPT+Plus',
          category: 'Productivity',
          categorySlug: 'productivity',
          slug: 'chatgpt-plus',
          pricing: [
            { duration: '1 Month', price: 20 },
            { duration: '3 Months', price: 55 },
            { duration: '6 Months', price: 100 },
            { duration: '1 Year', price: 180 }
          ],
          categoryId: categories[1].id,
          featured: true
        }
      }),
      db.product.create({
        data: {
          name: 'Figma Pro',
          description: 'Collaborative design interface tool',
          longDescription: 'Figma Pro is a powerful design tool that allows teams to collaborate in real-time. Features include advanced prototyping, version history, and team libraries.',
          image: 'https://via.placeholder.com/400x300.png?text=Figma+Pro',
          category: 'Design Tools',
          categorySlug: 'design-tools',
          slug: 'figma-pro',
          pricing: [
            { duration: '1 Month', price: 12 },
            { duration: '3 Months', price: 30 },
            { duration: '6 Months', price: 55 },
            { duration: '1 Year', price: 100 }
          ],
          categoryId: categories[0].id
        }
      }),
      db.product.create({
        data: {
          name: 'Adobe Creative Cloud',
          description: 'Complete suite of creative tools',
          longDescription: 'Adobe Creative Cloud gives you access to all Adobe creative apps like Photoshop, Illustrator, Premiere Pro, and more. Perfect for designers, video editors, and creative professionals.',
          image: 'https://via.placeholder.com/400x300.png?text=Adobe+CC',
          category: 'Design Tools',
          categorySlug: 'design-tools',
          slug: 'adobe-creative-cloud',
          pricing: [
            { duration: '1 Month', price: 20 },
            { duration: '3 Months', price: 55 },
            { duration: '6 Months', price: 100 },
            { duration: '1 Year', price: 180 }
          ],
          categoryId: categories[0].id,
          featured: true
        }
      }),
      db.product.create({
        data: {
          name: 'GitHub Pro',
          description: 'Advanced version control and collaboration',
          longDescription: 'GitHub Pro offers advanced features like private repositories with unlimited collaborators, advanced code review tools, and more. Perfect for developers and teams.',
          image: 'https://via.placeholder.com/400x300.png?text=GitHub+Pro',
          category: 'Development',
          categorySlug: 'development',
          slug: 'github-pro',
          pricing: [
            { duration: '1 Month', price: 4 },
            { duration: '3 Months', price: 10 },
            { duration: '6 Months', price: 18 },
            { duration: '1 Year', price: 30 }
          ],
          categoryId: categories[2].id
        }
      }),
      db.product.create({
        data: {
          name: 'Notion Plus',
          description: 'All-in-one workspace for notes and tasks',
          longDescription: 'Notion Plus is an all-in-one workspace where you can write, plan, collaborate, and organize. Features include unlimited file uploads, version history, and advanced permissions.',
          image: 'https://via.placeholder.com/400x300.png?text=Notion+Plus',
          category: 'Productivity',
          categorySlug: 'productivity',
          slug: 'notion-plus',
          pricing: [
            { duration: '1 Month', price: 8 },
            { duration: '3 Months', price: 20 },
            { duration: '6 Months', price: 35 },
            { duration: '1 Year', price: 60 }
          ],
          categoryId: categories[1].id
        }
      })
    ])

    console.log('Created products')

    // Create site config
    await db.siteConfig.create({
      data: {
        heroBanner: [],
        favicon: '',
        contactPhone: '+880 1234-567890',
        contactWhatsapp: '+880 1234-567890',
        contactEmail: 'info@submonth.com',
        adminPassword: 'password123',
        usdToBdtRate: 110,
        siteLogo: '',
        heroSliderInterval: 5000,
        hotDealsSpeed: 40
      }
    })

    console.log('Created site config')

    // Create some coupons
    await Promise.all([
      db.coupon.create({
        data: {
          code: 'SAVE10',
          name: 'Save 10%',
          description: 'Get 10% off on all products',
          discountType: 'percentage',
          discountValue: 10,
          minimumAmount: 10,
          usageLimit: 100,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      }),
      db.coupon.create({
        data: {
          code: 'SAVE20',
          name: 'Save 20%',
          description: 'Get 20% off on orders above $50',
          discountType: 'percentage',
          discountValue: 20,
          minimumAmount: 50,
          usageLimit: 50,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
    ])

    console.log('Created coupons')

    console.log('Database seeding completed successfully!')
    
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

// Run the seeding
seedData().catch(console.error)