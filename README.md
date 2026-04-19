# Tara & Bandana's Wedding Website 💕

A beautiful, elegant, and interactive wedding website built with Next.js, React, and Framer Motion animations. Mobile-first design perfect for guests to RSVP, explore wedding details, suggest songs, and view photos.

## 🎨 Features

### Pages Included
- **Landing Page**: Beautiful animated envelope with wax seal - tap to open and discover the wedding details with countdown timer
- **Home**: Welcome page with quick links and countdown timer
- **Story**: Timeline of how Tara & Bandana met and fell in love with expandable chapters
- **About Us**: Personal bios, fun facts, and photos of the couple
- **Timeline**: Wedding day schedule with all events and timings
- **Gallery**: Photo gallery with lightbox modal (24+ photo slots with zoom blur effect)
- **Music**: Guest song suggestions with voting system (prevents duplicate votes)
- **Registry**: Links to Amazon registry and gift information
- **FAQs**: Common questions and answers (12+ topics)

### Design & Animations
- ✨ **Smooth animations** using Framer Motion
- 🎭 **Animated envelope** landing page with wax seal tap-to-open effect
- 🖼️ **Photo gallery** with lightbox and zoom animations
- 📱 **Fully responsive** mobile-first design (95%+ mobile users)
- 🎨 **Elegant earthy tones**: warm browns, golds, sage greens, cream colors
- ✍️ **Beautiful typography** with Playfair Display and Lora fonts
- 🎵 **Interactive music voting** with real-time updates
- 🧭 **Smooth navigation** with sticky header and mobile menu

### Technical Highlights
- Built with **Next.js 16** & **React** with TypeScript
- **Framer Motion** for smooth, professional animations
- **Zustand** for lightweight state management (song voting)
- **Tailwind CSS** for responsive styling
- **Lucide React** for clean icons
- **LocalStorage** to prevent duplicate votes per guest
- **SEO-optimized** and accessible design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
cd /path/to/wedding/website
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### Build for Production

```bash
npm run build
npm run start
```

## 📝 Customization Guide

### Update Names, Date & Location

Edit the following files to customize your wedding details:

1. **`src/hooks/useCountdown.ts`**: Change the wedding date
   ```typescript
   const weddingDate = new Date('2027-05-08T00:00:00').getTime();
   ```

2. **`src/components/EnvelopeLanding.tsx`**: Update couple names and location
3. **`src/app/home/page.tsx`**: Update welcome message
4. **`src/components/Navigation.tsx`**: Update logo/initials

### Update Colors

Edit `src/config/theme.ts` to change the color palette:
```typescript
export const colors = {
  primary: '#8B7355', // Warm brown
  secondary: '#D4AF85', // Gold
  // ... other colors
};
```

Also update `src/app/globals.css` to match your new color scheme.

### Add Your Story

Edit **`src/app/story/page.tsx`** - Update the `storyChapters` array with your actual story:
```typescript
const storyChapters = [
  {
    title: 'How We Met',
    date: 'Summer 2018',
    description: 'Your story here...',
    image: '/placeholder-meet.jpg',
  },
  // ... more chapters
];
```

### Add About Information

Edit **`src/app/about/page.tsx`** - Update:
- Tara's bio and fun facts
- Bandana's bio and fun facts
- Hobbies and quotes

### Update Timeline Events

Edit **`src/app/timeline/page.tsx`** - Modify the `timelineEvents` array:
```typescript
const timelineEvents = [
  {
    time: '3:00 PM',
    title: 'Ceremony',
    description: 'Join us...',
    location: 'Main Garden',
  },
  // ... more events
];
```

### Update FAQs

Edit **`src/app/faqs/page.tsx`** - Modify the `faqItems` array with your questions and answers.

### Add Photos to Gallery

The gallery currently has 24 placeholder slots in **`src/app/gallery/page.tsx`**. Replace placeholder divs with actual image URLs.

### Contact Information

Update the phone number throughout the site:
- Currently set to `+1 (415) 555-1234` (placeholder)
- Edit in: `src/app/home/page.tsx`, `src/app/faqs/page.tsx`

### Registry Link

Update the Amazon registry link in **`src/app/registry/page.tsx`**.

## 📂 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── home/                # Main wedding page
│   ├── story/               # Our story with timeline
│   ├── about/               # About us section
│   ├── timeline/            # Wedding day schedule
│   ├── gallery/             # Photo gallery
│   ├── music/               # Song suggestions & voting
│   ├── registry/            # Gift registry
│   ├── faqs/                # Frequently asked questions
│   ├── globals.css          # Global styles & animations
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page (envelope)
├── components/
│   ├── EnvelopeLanding.tsx  # Animated envelope component
│   └── Navigation.tsx        # Top navigation bar
├── config/
│   └── theme.ts             # Color palette & typography
├── hooks/
│   └── useCountdown.ts      # Countdown timer hook
└── store/
    └── songStore.ts         # Zustand store for songs
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect to Vercel at [https://vercel.com](https://vercel.com)
3. Select your repository and deploy!

## 🛠️ Technologies Used

- **Next.js 16**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Framer Motion**: Advanced animations
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **Lucide React**: Icons

## 📱 Mobile-First Design

- Optimized for mobile devices (95%+ of guests)
- Responsive on all screen sizes
- Touch-friendly interactions
- Fast loading performance

---

**Made with ❤️ for Tara & Bandana's Wedding**

May 8, 2027 - Kenwood, California

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
