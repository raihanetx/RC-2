# Free Deployment Guide

## Option 1: Railway (Recommended)
```bash
1. Push to GitHub
2. Connect Railway to GitHub
3. Set DATABASE_URL to PostgreSQL
4. Deploy automatically
```

## Option 2: Vercel + Supabase
```bash
1. Deploy frontend to Vercel
2. Create Supabase database
3. Update DATABASE_URL
4. Deploy API routes
```

## Option 3: Render + Railway
```bash
1. Deploy frontend to Render
2. Use Railway for database
3. Connect both services
```

## Environment Variables Needed:
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret
```