# Database Setup Guide

## Current Configuration

The project is now configured to use **PostgreSQL with Neon** as the primary database. The connection is working and tested.

## Database Options

### 1. PostgreSQL with Neon (Current - Production Ready) ✅
- **Provider**: Neon (Serverless PostgreSQL)
- **Host**: ep-restless-lab-a147eavy-pooler.ap-southeast-1.aws.neon.tech
- **Database**: neondb
- **User**: neondb_owner
- **Status**: ✅ Connected and working
- **Configuration**: Set up in `.env` as `POSTGRES_URL`

### 2. SQLite (Fallback for Local Development)
- **File**: `./dev.db`
- **Purpose**: Emergency fallback or offline development
- **Benefits**: No external dependencies, fast setup
- **Configuration**: Available as `DATABASE_URL`

## Current Database Status

✅ **PostgreSQL is Active and Working**
- Connection tested successfully
- Schema pushed to database
- All tables created
- Ready for production use

## Switching Between Databases

### To use PostgreSQL (Current Default):
The project is already configured to use PostgreSQL. The Prisma schema is set to:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_URL")
}
```

### To switch to SQLite (Emergency fallback):
1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Regenerate Prisma client:
```bash
npm run db:generate
npm run db:push
```

## Database Commands

### Setup/Reset Database
```bash
# Push schema to database (creates tables)
npm run db:push

# Generate Prisma client
npm run db:generate

# Reset database (deletes all data)
npm run db:reset
```

### Test Connection
```bash
# Test database connection
node scripts/test-db.js
```

## Connection Details

### PostgreSQL Connection String
```
postgresql://neondb_owner:npg_l16yPNHWqpGO@ep-restless-lab-a147eavy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Alternative Connection URLs (if needed)
- **Direct URL**: `postgresql://neondb_owner:npg_l16yPNHWqpGO@ep-restless-lab-a147eavy.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
- **Postgres Protocol**: `postgres://neondb_owner:npg_l16yPNHWqpGO@ep-restless-lab-a147eavy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

## Environment Variables

```env
# PostgreSQL Database (Current - Active)
POSTGRES_URL="postgresql://neondb_owner:npg_l16yPNHWqpGO@ep-restless-lab-a147eavy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# SQLite Database (Fallback)
DATABASE_URL="file:./dev.db"

# Node Environment
NODE_ENV="development"                          # or "production"
```

## Schema Management

The current schema includes:
- Users (authentication)
- Products (e-commerce)
- Categories (product organization)
- Orders (order management)
- Coupons (discount system)
- SiteConfig (configuration)
- HotDeals (featured products)

## Development Workflow

1. **Current Setup**: PostgreSQL with Neon (production ready)
2. **Testing**: Same database as production
3. **Emergency Fallback**: SQLite if connection issues arise
4. **Deployment**: Ready for production deployment

## Troubleshooting

### If PostgreSQL Connection Fails

1. **Check Connection Test**:
   ```bash
   node scripts/test-db.js
   ```

2. **Try Alternative URLs**:
   Uncomment alternative connection strings in `.env`

3. **Switch to SQLite**:
   - Update `prisma/schema.prisma` provider to `sqlite`
   - Change URL to `env("DATABASE_URL")`
   - Run `npm run db:generate` and `npm run db:push`

### Common Issues and Solutions

- **P1001 Error**: Database server unreachable
  - Try alternative connection URLs
  - Check Neon project status
  - Use SQLite as fallback

- **Connection Timeout**: 
  - Try direct URL instead of pooler
  - Check network connectivity

## Production Deployment

✅ **Ready for Production**
- PostgreSQL database is configured and tested
- All tables are created
- Connection is secure with SSL
- Environment variables are properly set

### Deployment Checklist
- [x] Database connection tested
- [x] Schema pushed to database
- [x] Prisma client generated
- [x] Environment variables configured
- [x] SSL connection enabled

## Getting Help

If you experience database connection issues:

1. Run the test script: `node scripts/test-db.js`
2. Check the error code and message
3. Try alternative connection URLs in `.env`
4. Use SQLite as emergency fallback
5. Refer to Neon documentation for advanced troubleshooting