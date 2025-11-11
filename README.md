# MyCanteen - Canteen Management System

![CI/CD Pipeline](https://github.com/anandaa-arch/MyCanteen/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/anandaa-arch/MyCanteen/actions/workflows/deploy.yml/badge.svg)

A modern, efficient canteen management system built with Next.js 15, featuring QR-based attendance, automated billing, and real-time analytics.

## ✨ Features

- 🔐 **Authentication & Authorization** - Secure login with role-based access
- 📱 **QR Code Attendance** - Quick scan-in system for meal tracking
- 💰 **Automated Billing** - Smart billing with payment tracking
- 📊 **Analytics Dashboard** - Real-time insights and reporting
- 🍽️ **Menu Management** - Daily menu updates and notifications
- 💾 **Caching System** - Optimized performance with intelligent caching
- 🖼️ **Image Optimization** - Next.js Image component with AVIF/WebP support
- 🚀 **CI/CD Pipeline** - Automated testing and deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PDF Generation**: pdf-lib
- **QR Codes**: react-qrcode-logo
- **Icons**: Lucide React
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🧪 Testing & Development

```bash
# Run linter
npm run lint

# Build test
npm run build

# Security audit
npm audit

# Seed test data (for development)
npm run seed
```

### Test Data Sets

The project includes comprehensive test data for development:
- **10 Test Users** (9 students + 1 admin)
- **Poll Responses** with various statuses
- **Billing Records** (paid, partial, pending)
- **Inventory Items** across multiple categories
- **Expense & Revenue Records**

**Quick Start:**
```bash
# 1. Set up environment variables in .env.local
# 2. Run the seeder
npm run seed

# 3. Login with test account
# Email: student1@test.com or admin@test.com
# Password: Test@123
```

📖 **Full Documentation**: See [Test Data Guide](scripts/README.md) | [Quick Reference](scripts/QUICK-REFERENCE.md)

## 🚀 CI/CD Pipeline

Automated workflows run on every push and pull request:

- ✅ **Lint Check** - Code quality validation
- ✅ **Build Test** - Production build verification
- ✅ **Security Audit** - Dependency vulnerability scanning
- ✅ **Automated Deployment** - Deploy to production on main branch

See [CI/CD Setup Guide](.github/CI_CD_SETUP.md) for detailed configuration.

## 📊 Performance Optimizations

- **Caching**: Client-side caching with TTL for frequently accessed data
- **Image Optimization**: Automatic AVIF/WebP conversion with responsive sizing
- **Code Splitting**: Automatic route-based code splitting
- **Build Optimization**: Webpack cache disabled for clean builds

## 📁 Project Structure

```
MyCanteen/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── user/              # User dashboard pages
│   ├── api/               # API routes
│   └── ...
├── components/            # Reusable React components
├── lib/                   # Utility libraries (Supabase, cache)
├── utils/                 # Helper functions
├── public/                # Static assets
├── .github/               # GitHub Actions workflows
└── __tests__/             # Test files

```

## 🔐 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📚 Documentation

- [Image Optimization Guide](IMAGE_OPTIMIZATION.md)
- [CI/CD Setup](.github/CI_CD_SETUP.md)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and confidential.
