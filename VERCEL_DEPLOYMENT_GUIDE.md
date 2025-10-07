# 🚀 Vercel Deployment Guide - RC-2 E-commerce Platform

This guide will help you deploy your RC-2 e-commerce platform to Vercel with the RupantorPay payment gateway fully configured.

## 📋 Prerequisites

- GitHub repository: https://github.com/raihanetx/RC-2
- Vercel account (connected to GitHub)
- PostgreSQL database (recommended: Vercel Postgres or Neon)

## 🔧 Environment Variables Configuration

### Required Variables

Add these environment variables in your Vercel project settings:

```bash
# Database
DATABASE_URL="your_postgresql_connection_string"

# NextAuth
NEXTAUTH_SECRET="your_random_secret_key"
NEXTAUTH_URL="https://your-domain.vercel.app"

# RupantorPay Payment Gateway
RUPANTOR_API_KEY="MEg5dK0kih7ERNCo0zjZqHNuD58oXWTtnVNGyA8DDN34rrFZx5"
RUPANTOR_BASE_URL="https://payment.rupantorpay.com"

# Application
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"

# Admin Credentials
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure_admin_password"
```

### Optional Variables

```bash
# Email Configuration (for order notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string to `DATABASE_URL`
4. Run database migrations automatically

### Option 2: Neon PostgreSQL
1. Create account at [Neon](https://neon.tech)
2. Create new PostgreSQL database
3. Copy connection string to `DATABASE_URL`
4. Run migrations: `npx prisma db push`

### Option 3: External PostgreSQL
1. Use any PostgreSQL provider
2. Ensure connection is accessible from Vercel
3. Add connection string to `DATABASE_URL`

## 🚀 Deployment Steps

### 1. Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `raihanetx/RC-2`
4. Click "Deploy"

### 2. Configure Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all required variables from above
3. Redeploy the project

### 3. Set Up Database
1. If using Vercel Postgres, it will auto-configure
2. If using external database, run migrations:
   ```bash
   npx prisma db push
   ```

### 4. Verify Deployment
1. Visit your deployed site
2. Check these endpoints:
   - `/` - Home page should load
   - `/api/payment/config` - Should show payment is configured
   - `/admin/login` - Admin login should work

## 🧪 Testing Payment Integration

### Test Payment Flow
1. Go to any product page
2. Add product to cart
3. Proceed to checkout
4. Fill in customer details
5. Submit payment - should redirect to RupantorPay

### Verify Payment Configuration
Visit: `https://your-domain.vercel.app/api/payment/config`

Expected response:
```json
{
  "message": "RupantorPay payment configuration",
  "configured": true,
  "provider": "RupantorPay",
  "isTest": false,
  "baseUrl": "https://payment.rupantorpay.com",
  "features": {
    "createPayment": true,
    "verifyPayment": true,
    "webhook": true
  },
  "note": "RupantorPay is configured for production use."
}
```

## 🔍 Troubleshooting

### Build Issues
- ✅ **Fixed**: Payment API key errors during build
- ✅ **Solution**: Graceful fallback handling implemented

### Payment Issues
- Check `RUPANTOR_API_KEY` is correctly set
- Verify `RUPANTOR_BASE_URL` is accessible
- Check webhook URL configuration

### Database Issues
- Verify `DATABASE_URL` is correct and accessible
- Run `npx prisma db push` to update schema
- Check database permissions

### Common Solutions
1. **Clear build cache**: In Vercel, redeploy without cache
2. **Check logs**: Vercel Function logs for errors
3. **Verify env vars**: All required variables are set

## 🎯 Post-Deployment Checklist

- [ ] Home page loads correctly
- [ ] Product catalog displays
- [ ] Shopping cart works
- [ ] Checkout process functions
- [ ] Payment gateway redirects properly
- [ ] Admin dashboard accessible
- [ ] Database operations work
- [ ] Email notifications (if configured)

## 📞 Support

### RupantorPay Support
- API Documentation: Available in your RupantorPay dashboard
- API Key: `MEg5dK0kih7ERNCo0zjZqHNuD58oXWTtnVNGyA8DDN34rrFZx5`

### Vercel Support
- Dashboard: https://vercel.com/dashboard
- Documentation: https://vercel.com/docs

### Project Repository
- GitHub: https://github.com/raihanetx/RC-2
- Issues: Report issues in GitHub repository

---

## 🎉 Ready to Launch!

Your RC-2 e-commerce platform is now ready for production deployment with:
- ✅ Fully configured RupantorPay payment gateway
- ✅ Robust error handling and fallbacks
- ✅ Production-ready database integration
- ✅ Complete admin dashboard
- ✅ Mobile-responsive design

Deploy now and start selling! 🚀