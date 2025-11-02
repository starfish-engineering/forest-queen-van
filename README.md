# Forest Queen Van - Sales Website

A beautiful, modern website built with Next.js 15 to showcase and sell the Forest Queen Van - a premium 2019 Ford Transit 250 camper conversion.

## Features

- **Modern Design**: Clean, professional layout with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Fast Performance**: Built with Next.js 15 and optimized for speed
- **SEO Optimized**: Proper metadata and structure for search engines
- **Photo Gallery**: Interactive lightbox gallery for van photos
- **Contact Form**: Easy inquiry form for potential buyers

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Adding Photos

To add your van photos to the gallery:

1. Place your images in the `public/images` directory
2. Update the `galleryImages` array in `app/page.tsx`:

```typescript
const galleryImages = [
  { src: '/images/van-exterior.jpg', alt: 'Forest Queen Van exterior', width: 1200, height: 900 },
  { src: '/images/van-interior.jpg', alt: 'Van interior', width: 1200, height: 900 },
  // Add more images...
];
```

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will automatically detect Next.js and configure settings
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project directory:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Custom Domain

After deployment, you can add a custom domain in your Vercel project settings.

## Customization

### Update Content

- **Hero Section**: Edit the hero text in `app/page.tsx`
- **Pricing**: Update the price in the hero and footer sections
- **Features**: Modify the features grid
- **Vehicle Details**: Update specs in the vehicle details section
- **Contact Info**: Change email/contact details in the contact section

### Update Styling

- All styling uses Tailwind CSS utility classes
- To change colors, modify the Tailwind classes (e.g., `emerald-900` to your preferred color)
- Main color scheme: Emerald green (nature/forest theme)

### Update Metadata

Update SEO information in `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Your Title",
  description: "Your Description",
  keywords: "your, keywords",
};
```

## Project Structure

```
forest-queen-van/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   └── Gallery.tsx         # Photo gallery component
├── public/
│   └── images/             # Van photos go here
├── vercel.json             # Vercel configuration
└── README.md               # This file
```

## Features Included

✅ Hero section with call-to-action
✅ Quick stats overview
✅ Detailed features grid
✅ Vehicle specifications
✅ Photo gallery with lightbox
✅ Contact form
✅ Mobile responsive design
✅ SEO optimized
✅ Fast performance

## License

All rights reserved © 2025
