# Jeevani Nepal NODAS – Crowdfunding Platform

**The Source Of Life** | Crowdfunding for Nepal with Trust & Transparency

## Project Overview
- **Name**: Jeevani Nepal NODAS
- **Goal**: A GoFundMe/Milaap-style crowdfunding platform for Nepal supporting medical emergencies, education, disaster relief, and community causes
- **Tech Stack**: Hono (TypeScript) + Cloudflare Pages + TailwindCSS CDN + GSAP Animations

## Live URLs
- **Local Dev**: http://localhost:3000
- **Production**: Deploy via `npm run deploy`

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage – Hero, Popular Campaigns, How It Works, Testimonials, CTA |
| `/campaigns` | All campaigns with filter/sort |
| `/campaigns/:id` | Individual campaign page with donation widget |
| `/donate` | Full donation form (eSewa, Khalti, IME Pay, Bank Transfer) |
| `/start-fundraiser` | Campaign creation form with document upload |
| `/resources` | Guides, FAQs, templates, support |
| `/contact` | Contact form + office info |
| `/api/campaigns` | JSON API – list all campaigns |
| `/api/campaigns/:id` | JSON API – single campaign |
| `/api/donate` | POST endpoint for donations |

## Features Implemented
- ✅ Hero section with floating image animation & stats badges
- ✅ 6 sample campaigns with progress bars (animated on scroll)
- ✅ Campaign cards with category badges, days-left countdown, donor counts
- ✅ Individual campaign pages with donation amount picker
- ✅ Secure donation form with multiple Nepali payment gateways
- ✅ Campaign creation/fundraiser form with document upload UI
- ✅ Resources page with FAQ accordion
- ✅ Contact page with form submission
- ✅ Scroll reveal animations (GSAP)
- ✅ Mobile-responsive with hamburger menu
- ✅ Progress bar animation on scroll
- ✅ Platform statistics section
- ✅ Testimonials section
- ✅ Full footer with social links
- ✅ Favicon (SVG)
- ✅ REST API endpoints

## Data Architecture
- **Campaigns**: In-memory array (6 campaigns across Medical, Education, Disaster Relief, Community)
- **Payment Gateways**: eSewa, Khalti, IME Pay, ConnectIPS, Bank Transfer (UI only)
- **Storage**: Currently in-memory; upgrade to Cloudflare D1 for production persistence

## Deployment
```bash
# Local development
npm run build && pm2 start ecosystem.config.cjs

# Deploy to Cloudflare Pages
npm run deploy
```

## What's Next (Recommended)
1. Add Cloudflare D1 database for persistent campaigns & donations
2. Integrate real eSewa/Khalti payment APIs
3. Add user authentication (login/signup)
4. Admin dashboard for campaign moderation
5. Email notifications (via SendGrid/Resend)
6. Image upload via Cloudflare R2
7. Social sharing functionality

## Status
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active (Local Dev)
- **Last Updated**: 2026-02-19
