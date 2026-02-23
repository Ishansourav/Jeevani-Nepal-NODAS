# 🌟 Jeevani Nepal NODAS – Crowdfunding Platform

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![Status](https://img.shields.io/badge/Status-Active-success) ![Tech Stack](https://img.shields.io/badge/Tech-Hono%20%7C%20TypeScript%20%7C%20TailwindCSS-blue?style=flat-square) ![Deployment](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange?style=flat-square)

**“The Source of Life”** – Transparent and trust-driven crowdfunding for Nepal supporting medical emergencies, education, disaster relief, and community development.

🔗 **Live Demo:** Deploy via `npm run deploy`  
🌐 **Local Development:** [http://localhost:3000](http://localhost:3000)

---

## 👥 Team & Contributors

| Name | Role | GitHub |
|------|------|--------|
| Ishansourav | Project Lead & Fullstack Developer | [![GitHub](https://img.shields.io/badge/github-Ishansourav-blue?style=flat-square&logo=github)](https://github.com/Ishansourav) |
| Shaloni Sharma | Frontend/UI Specialist | [![GitHub](https://img.shields.io/badge/github-ShaloniSharma00-blue?style=flat-square&logo=github)](https://github.com/ShaloniSharma00) |

---

## 🔎 Project Overview

- **Goal:** Build a GoFundMe/Milaap-style platform for Nepal with **trust, transparency, and ease-of-use**.  
- **Platform:** Cloudflare Pages for hosting, Hono (TypeScript) backend, TailwindCSS frontend.  
- **Target Users:** Donors, Fundraisers, NGOs in Nepal.  
- **Status:** ✅ Active (Local Development)  
- **Last Updated:** 2026-02-19  

---

## 🚀 Key Features

- ✅ Hero section with animated stats and floating images  
- ✅ Campaigns page with filters, sorting, progress bars, and countdowns  
- ✅ Individual campaign pages with secure donation widgets  
- ✅ Fundraiser creation form with document uploads  
- ✅ Multi-gateway donations: eSewa, Khalti, IME Pay, Bank Transfer (UI ready)  
- ✅ Resource center with FAQs, guides, and templates  
- ✅ Contact form for support and inquiries  
- ✅ Scroll-triggered animations using GSAP  
- ✅ Fully responsive design for mobile and desktop  
- ✅ Platform statistics, testimonials, and progress highlights  
- ✅ REST API endpoints for campaigns and donations  

---

## 💻 Tech Stack

| Layer       | Tools & Frameworks |
|------------|------------------|
| Frontend   | Hono (TypeScript), TailwindCSS CDN, GSAP Animations |
| Backend    | Hono API endpoints, in-memory JSON storage |
| Deployment | Cloudflare Pages |
| Others     | MIT License |

---

## 📂 Folder Structure

```
Jeevani-Nepal-NODAS/
├── webapp/
│ ├── index.html # Homepage
│ ├── campaigns.html # All campaigns
│ ├── donate.html # Donation form
│ ├── start-fundraiser.html # Campaign creation form
│ └── resources.html # Resources & FAQ
├── api/
│ ├── campaigns.js # Campaign endpoints
│ └── donate.js # Donation endpoint
├── assets/
│ ├── images/ # Campaign & UI images
│ └── favicon.svg
├── README.md
├── package.json
└── .gitignore
```

---

## 🧠 System Architecture
```
  +------------------------+
  |    Frontend Web App     |
  |  (HTML, Tailwind, GSAP)|
  +-----------+------------+
              |
       User Interactions
              v
  +------------------------+
  |   Hono Backend/API      |
  | - Campaign & Donation   |
  | - In-memory JSON Store  |
  +-----------+------------+
              |
       Response JSON
              v
  +------------------------+
  | Dynamic Page Rendering  |
  |  - Campaigns & Donations|
  +------------------------+
```

---

## ⚙️ Setup Instructions (Local Development)

```bash
# Clone the repository
git clone https://github.com/Ishansourav/Jeevani-Nepal-NODAS.git
cd Jeevani-Nepal-NODAS/webapp

# Install dependencies
npm install

# Start local development server
npm run dev

# Build & deploy to Cloudflare Pages
npm run build
npm run deploy
```

---
# 🌍 Deployment

- Hosted on Cloudflare Pages
- Local testing at http://localhost:3000

--- 

# 🔮 Roadmap 

- Integrate Cloudflare D1 for persistent campaign & donation storage
- Implement real payment gateway APIs (eSewa, Khalti, IME Pay)
- User authentication (login/signup)
- Admin dashboard for campaign moderation
- Email notifications to donors and fundraisers
- Cloudflare R2 image storage
- Social sharing and referral system

---

# 📜 License

> This project is licensed under the MIT License. See LICENSE file for details.

---

# 🙏 Acknowledgements
- TailwindCSS & GSAP community
- Cloudflare Pages hosting
- Open-source HTML, CSS, JS libraries
- Inspiration from crowdfunding platforms (GoFundMe, Milaap)

---

