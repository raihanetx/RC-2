# 🛍️ RC-2 - Complete E-commerce Subscription Platform

A modern, feature-rich Next.js e-commerce platform for digital subscriptions with integrated payment system, admin dashboard, and responsive design.

## ✨ Features

### 🛒 Customer Features
- **Product Catalog**: Browse digital subscription products by category
- **Shopping Cart**: Add/remove items with persistent cart storage
- **Secure Checkout**: Multi-step checkout process with payment integration
- **Order Management**: View order history and track order status
- **Hot Deals**: Animated carousel showcasing special offers
- **Coupon System**: Apply discount codes at checkout
- **Responsive Design**: Mobile-first design with Tailwind CSS

### 💳 Payment Integration
- **RupantorPay Integration**: Complete payment gateway integration
- **Payment Verification**: Secure payment confirmation and webhook handling
- **Multiple Payment Methods**: Support for various payment options
- **Transaction History**: Complete payment tracking and receipts

### 👨‍💼 Admin Dashboard
- **Product Management**: Add, edit, delete products with image upload
- **Order Management**: View, process, and update customer orders
- **Category Management**: Organize products by categories
- **Coupon Management**: Create and manage discount codes
- **Hot Deals Control**: Configure promotional carousel
- **Analytics Dashboard**: Sales and performance metrics
- **Settings Management**: Site configuration and preferences

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface with shadcn/ui components
- **Dark Mode**: Built-in theme switching support
- **Loading States**: Skeleton loaders and smooth transitions
- **Toast Notifications**: User-friendly feedback system
- **Search Functionality**: Product search with real-time filtering
- **Image Optimization**: Automatic image processing and optimization

## 🛠 Technology Stack

### Core Framework
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Utility-first CSS framework
- **🧩 shadcn/ui** - High-quality component library

### Database & Backend
- **🗄️ Prisma ORM** - Type-safe database operations
- **🐘 PostgreSQL** - Production-ready database
- **🔐 NextAuth.js** - Authentication system
- **📧 Email Integration** - Order confirmations and notifications

### Payment & APIs
- **💳 RupantorPay** - Payment gateway integration
- **🔄 Webhooks** - Real-time payment processing
- **📡 REST APIs** - Complete API endpoints for all features

### State Management & Tools
- **🐻 Zustand** - Client state management
- **🎣 React Hook Form** - Form handling with validation
- **✅ Zod** - Schema validation
- **🎯 Lucide React** - Icon library

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- RupantorPay account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/raihanetx/RC-2.git
cd RC-2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up the database
npx prisma generate
npx prisma db push

# Seed sample data (optional)
npm run seed

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local` with the following:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rc2_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# RupantorPay
RUPANTORPAY_API_KEY="your-api-key"
RUPANTORPAY_SECRET="your-secret-key"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── admin/         # Admin endpoints
│   │   ├── payment/       # Payment processing
│   │   ├── products/      # Product data
│   │   └── ...
│   ├── admin/             # Admin dashboard pages
│   ├── [categorySlug]/    # Product detail pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── admin/            # Admin-specific components
├── lib/                  # Utilities and configurations
│   ├── db.ts             # Database client
│   ├── payment.ts        # Payment processing
│   ├── email.ts          # Email templates
│   └── ...
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## 🎯 Available Pages

### Customer Pages
- `/` - Home page with product showcase
- `/products` - All products grid
- `/products/category/[slug]` - Category-specific products
- `/[category]/[product]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Multi-step checkout
- `/order-history` - Customer order history
- `/payment/success` - Payment confirmation
- `/payment/cancel` - Payment cancellation

### Admin Pages
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard overview
- `/admin/dashboard/products` - Product management
- `/admin/dashboard/orders` - Order management
- `/admin/dashboard/categories` - Category management
- `/admin/dashboard/coupons` - Coupon management
- `/admin/dashboard/hot-deals` - Hot deals configuration
- `/admin/dashboard/settings` - Site settings
- `/admin/dashboard/analytics` - Performance analytics

## 💳 Payment Integration

The platform includes complete RupantorPay integration:

1. **Payment Initiation**: Secure payment request generation
2. **Payment Processing**: Real-time payment status tracking
3. **Webhook Handling**: Automatic payment confirmation
4. **Order Management**: Payment-linked order processing
5. **Email Notifications**: Automated payment receipts

## 📧 Email Features

- **Order Confirmations**: Automatic order receipt emails
- **Payment Notifications**: Payment success/failure alerts
- **Order Status Updates**: Shipping and delivery notifications
- **Admin Notifications**: New order alerts for administrators

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open database browser
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed sample data

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Docker
```bash
# Build Docker image
docker build -t rc2-ecommerce .

# Run container
docker run -p 3000:3000 rc2-ecommerce
```

### Traditional Hosting
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

Built with ❤️ for modern e-commerce. Powered by Next.js 15 and cutting-edge web technologies.