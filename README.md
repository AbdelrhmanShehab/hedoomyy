# Hedoomy 🛍️

Hedoomy is a modern, multilingual e-commerce platform built with Next.js and Firebase. It provides a seamless shopping experience for users with features like product variants, favorites, a shopping cart, and bilingual support (English & Egyptian Arabic). It also includes a robust admin dashboard for managing orders, finances, and products.

## ✨ Features

### User Experience
- **Multilingual Support**: Fully localized in English and Egyptian Arabic (RTL support).
- **Product Browsing**: Dynamic product listings, categorized products, and product sliders.
- **Product Variants**: Support for different sizes, colors, and stock management per variant.
- **Shopping Cart & Checkout**: Smooth and intuitive checkout process.
- **Favorites / Wishlist**: Users can save products to their favorites list.
- **Responsive Design**: Fully responsive layout that looks great on desktop and mobile devices.
- **Animations**: Subtle, engaging micro-animations using Framer Motion.

### Admin Dashboard
- **Order Management**: Track orders, handle order cancellations, and manage order statuses (Confirmed, Shipped, Delivered).
- **Finance Tracking**: Comprehensive finance dashboard tracking revenue, expenses, and profits. Distinguishes between online and cash-on-delivery payments.
- **Email Notifications**: Automated order status email notifications to customers.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Components**: [Embla Carousel React](https://www.embla-carousel.com/) (Sliders), [Lucide React](https://lucide.dev/) (Icons)
- **Emails**: [Nodemailer](https://nodemailer.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Firebase account and project set up

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd hedoomyy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory and add your Firebase configuration and Nodemailer credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # For NodeMailer Order Notifications
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_app_password
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router pages and API routes (e.g., checkout, login, product pages).
- `components/`: Reusable React components (UI elements, Product Cards, Sliders).
- `context/`: React Context providers for global state management (Auth, Theme, Language, Favorites).
- `data/`: Type definitions and static data.
- `lib/`: Utility functions and helper scripts (e.g., Firebase config, analytics).


