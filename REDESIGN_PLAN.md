# Forest Queen Van - Build Journal Redesign Plan

## Executive Summary

Transform the current for-sale site into a world-class build journal inspired by FarOutRide.com, with the for-sale page as one section. The site will focus on storytelling, technical depth, and progressive disclosure to engage visitors emotionally before leading them to actionable content.

---

## Site Architecture

### Primary Navigation Structure

```
Forest Queen Van
├── Home (/)
│   └── Story-driven landing with hero imagery and journey overview
├── Build Journal (/journal)
│   ├── Timeline view of all 15+ posts
│   └── Individual post pages (/journal/[slug])
├── Systems (/systems)
│   ├── Overview page with all major systems
│   ├── Electrical (/systems/electrical)
│   ├── Plumbing (/systems/plumbing)
│   ├── HVAC (/systems/hvac)
│   ├── Solar (/systems/solar)
│   └── Propane (/systems/propane)
├── Costs (/costs)
│   └── Interactive breakdown with charts and filtering
├── For Sale (/for-sale)
│   └── Current sales page (existing content)
├── About (/about)
│   └── Shaun's story, philosophy, and background
└── Contact (/contact)
    └── Contact form and social links
```

### Secondary Features
- **Search**: Full-text search across all blog posts
- **Tags/Categories**: Filter posts by system, phase, or topic
- **Photo Galleries**: Lightbox galleries throughout
- **Progress Indicators**: Visual timeline and completion tracking
- **Mobile-First**: Optimized for all devices

---

## Content Inventory (Extracted from forestqueenvan.com)

### Blog Posts (15 total, chronologically ordered)
1. **Windows** (June 10, 2020) - 2 images
2. **Framing** (Sept 23, 2020) - 36 images, 80/20 aluminum structure
3. **Walls & Ceiling Panels** (May 5, 2021) - 5 images
4. **Plumbing** (July 7, 2021) - 32 images, complete water system
5. **Air Conditioner** (July 30, 2021) - 28 images, cooling installation
6. **Roof** (Aug 3, 2021) - 24 images, solar + skylight
7. **Propane** (Sept 10, 2021) - 10 images, gas system
8. **Slats** (Sept 23, 2021) - Ceiling detail: 2" poplar, 1" spacing, 10 puck lights
9. **Upper Cabinets** (March 8, 2022) - 6 images
10. **Design & Layout** (July 31, 2022) - Philosophy and planning methodology
11. **Electrical** (July 31, 2022) - 400Ah LiFePO4, wire sizing, power analysis
12. **Floor #2** (July 31, 2022) - 10-layer floor system breakdown
13. **Butcher Block Extension** (April 16, 2024) - 5 images, counter expansion
14. **Van Build Costs** (April 16, 2024) - Complete $30,500 breakdown (28 line items)
15. **Garden** (July 4, 2024) - 4 images, skylight garden update

### Cost Breakdown (from April 2024 post)
**Total: $30,500**
- 80/20 Framing: $5,500
- Batteries (400Ah LiFePO4): $4,000
- Wood Paneling: $3,000
- Inverter/Charger (Victron Multiplus 3000): $2,500
- Solar Panels & Controllers: $1,500
- [... 23 additional line items]

### Technical Specifications Captured
- **Electrical**: 4/0 AWG to 18AWG wire sizing, consumption analysis
- **Power**: 400Ah battery, 400W solar, Victron Multiplus 3000
- **Water**: 27-gallon fresh tank, complete plumbing manifold
- **Floor**: 10-layer system with insulation, vapor barriers, hardwood
- **HVAC**: Diesel heater, MaxxAir fan, AC unit

---

## Design Philosophy (Inspired by FarOutRide)

### 1. **Progressive Disclosure**
- **Homepage**: Emotional hook with stunning imagery and lifestyle narrative
- **Journal**: Build journey with chronological storytelling
- **Systems**: Technical depth for DIY builders
- **Costs**: Transparency for planning
- **For Sale**: Action-oriented for buyers

### 2. **Storytelling First**
- Lead with "why" before "how"
- Document failures, iterations, and learning
- Show personality and authenticity
- Create emotional investment before technical details

### 3. **Multi-Layered Content**
- **Casual visitors**: Beautiful photos, inspiring narrative
- **Aspiring builders**: Technical guides, cost breakdowns
- **Potential buyers**: Complete specs, viewing scheduling
- **Community**: Social links, engagement pathways

### 4. **Visual Hierarchy**
- Hero imagery dominates above fold
- Large, high-quality photos throughout
- White space for readability
- Clear call-to-actions at strategic points
- Breadcrumb navigation for context

---

## Page-by-Page Design Specs

### Homepage (/)
**Purpose**: Create emotional connection and establish narrative

**Sections**:
1. **Hero Section**
   - Full-screen background video or rotating hero images
   - Overlay: "Building Freedom, One Bolt at a Time"
   - Subtitle: "Follow the complete journey from empty cargo van to full-time home"
   - CTA: "Explore the Build" → /journal

2. **Quick Stats Strip**
   - 400 hours of work
   - $30,500 invested
   - 15 major milestones
   - 4-season ready

3. **Journey Preview**
   - 3-4 featured posts with large imagery
   - "From Vision to Reality" narrative
   - CTA: "Read the Full Story"

4. **Featured Systems**
   - Visual grid of major systems (Electrical, Plumbing, HVAC)
   - Icon + photo + short description
   - Links to system detail pages

5. **Current Status Banner**
   - "This van is currently available" with link to /for-sale
   - OR "Follow along with future adventures"

6. **Footer**
   - Navigation links
   - Social media
   - Newsletter signup (optional)

---

### Build Journal (/journal)
**Purpose**: Comprehensive chronological documentation

**Layout**:
- **Timeline View** (default)
  - Vertical timeline with posts as nodes
  - Date markers
  - Large featured image per post
  - Short excerpt
  - Click to expand to full post

- **Grid View** (toggle)
  - Masonry grid of post cards
  - Filter by: System, Phase, Year
  - Search bar

- **Sorting Options**
  - Chronological (oldest first) - DEFAULT
  - Reverse chronological (newest first)
  - By system (Electrical, Plumbing, etc.)

**Features**:
- Progress bar showing build completion
- "Jump to phase" quick nav
- Share individual posts
- Image count per post
- Reading time estimate

---

### Individual Blog Post (/journal/[slug])
**Layout Structure**:
1. **Hero Image** - Featured photo full-width
2. **Post Header**
   - Title
   - Date
   - Categories/tags
   - Reading time
3. **Breadcrumb Navigation** - Home / Journal / Post Title
4. **Content Area**
   - Rich text content
   - Embedded photo galleries (lightbox)
   - Technical specs in styled boxes
   - Parts lists with links
   - Cost callouts
5. **Related Systems** - Links to system overview pages
6. **Post Navigation** - Previous/Next post in timeline
7. **Comments/Engagement** (optional)

**Post Template Components**:
- `<GalleryGrid>` - Multi-photo lightbox galleries
- `<SpecBox>` - Highlighted technical specifications
- `<CostCallout>` - Individual project cost
- `<PartsTable>` - Itemized parts with links
- `<TipBox>` - Lessons learned, tips, warnings

---

### Systems Overview (/systems)
**Purpose**: Technical deep-dives for builders

**Layout**:
- Hero section: "Built for Adventure, Engineered for Reliability"
- Grid of major systems cards:
  - **Electrical** - 400Ah LiFePO4, Victron inverter, solar
  - **Plumbing** - Fresh/gray water, pump, heater
  - **HVAC** - Diesel heater, AC, ventilation
  - **Solar** - 400W array, controllers, monitoring
  - **Propane** - Tank, lines, appliances, safety
  - **Structural** - 80/20 framing, insulation, paneling

**Each System Card Shows**:
- Hero image
- System overview (2-3 sentences)
- Key specs
- Total cost
- Related journal posts
- CTA: "View Details"

---

### Individual System Pages (/systems/[system])
**Example**: `/systems/electrical`

**Sections**:
1. **System Hero**
   - Title: "Electrical System"
   - Hero image of battery bank or main setup
   - Overview paragraph

2. **System Diagram**
   - Wiring diagram or flow chart
   - Interactive or zoomable

3. **Components List**
   - Battery: 4x 100Ah Battle Born LiFePO4
   - Inverter: Victron Multiplus 3000
   - Solar: 400W panels with MPPT controller
   - Each with specs, cost, vendor link

4. **Power Analysis**
   - Daily consumption breakdown
   - Generation capacity
   - Battery runtime calculator (interactive)

5. **Wire Sizing Reference**
   - Table from original blog post
   - 4/0 AWG to 18AWG specifications

6. **Related Posts**
   - Links to journal posts about this system
   - "Electrical" (July 31, 2022)
   - "Solar Installation" (Aug 3, 2021)

7. **Lessons Learned**
   - What worked
   - What I'd change
   - Tips for DIY builders

---

### Costs Page (/costs)
**Purpose**: Complete transparency for aspiring builders

**Layout**:
1. **Total Cost Hero**
   - Large: "$30,500"
   - "Complete Build Cost Breakdown"
   - Subtitle: "Every dollar accounted for"

2. **Cost Summary Chart**
   - Pie chart or bar chart
   - Interactive: hover to see details
   - Top categories highlighted

3. **Detailed Breakdown Table**
   - All 28 line items from original post
   - Sortable by: Cost (high to low), Category, Date
   - Filter by: Category (Electrical, Plumbing, etc.)
   - Search functionality

4. **Cost Timeline**
   - When money was spent over build timeline
   - Visual timeline with spend markers

5. **Cost Comparison**
   - "DIY vs Professional Build" callout
   - "Similar van conversions cost $60-120k"

6. **Savings Tips**
   - "Where I saved money"
   - "Where I splurged (and why)"
   - "What I'd do differently"

7. **Resources**
   - Vendor recommendations
   - Discount codes (if available)
   - Alternative products

---

### For Sale Page (/for-sale)
**Purpose**: Convert interested buyers

**Content**: Keep existing for-sale page largely intact:
- Hero with pricing
- Quick stats
- Feature grid
- Vehicle specs
- Gallery
- Contact form

**Additions**:
- "Read the complete build story" CTA → /journal
- "View technical systems" CTA → /systems
- "See cost breakdown" CTA → /costs
- Testimonial/story from Shaun about building it
- "Why I'm selling" section (authenticity)

---

### About Page (/about)
**Purpose**: Personal connection and credibility

**Content** (from original About page):
1. **Hero Section**
   - Photo of Shaun
   - "Hi, I'm Shaun"
   - Brief tagline

2. **Story**
   - Background: Why I built this van
   - The journey from idea to completion
   - What I learned
   - What's next

3. **Build Philosophy**
   - Quality over speed
   - Documentation for the community
   - Thoughtful design
   - Continuous improvement

4. **Stats/Timeline**
   - Build start date
   - Completion date
   - Total hours
   - Miles traveled

5. **Connect**
   - Social links (Instagram prominent)
   - Contact info
   - Newsletter (optional)

---

### Contact Page (/contact)
**Purpose**: Multiple engagement pathways

**Layout**:
1. **Contact Form**
   - Name, Email, Subject, Message
   - Purpose dropdown: General inquiry, Build question, For sale inquiry, Partnership

2. **Other Ways to Connect**
   - Email: hello@forestqueenvan.com
   - Instagram: @forestqueenvan (link)
   - Location: Washington State / Nashville, TN

3. **FAQ Quick Links**
   - "Want to buy the van?" → /for-sale
   - "Have build questions?" → /journal
   - "Need technical specs?" → /systems

---

## Technical Implementation Plan

### Technology Stack
- **Framework**: Next.js 15 (App Router) ✅ Already set up
- **Language**: TypeScript ✅ Already configured
- **Styling**: Tailwind CSS ✅ Already configured
- **Content**: Static generation with MDX or JSON data files
- **Images**: Next.js Image component with optimization
- **Deployment**: Vercel ✅ Already configured

### Project Structure
```
forest-queen-van/
├── app/
│   ├── layout.tsx                 # Root layout with nav
│   ├── page.tsx                   # Homepage (redesign)
│   ├── journal/
│   │   ├── page.tsx              # Journal index (timeline view)
│   │   └── [slug]/
│   │       └── page.tsx          # Individual post
│   ├── systems/
│   │   ├── page.tsx              # Systems overview
│   │   └── [system]/
│   │       └── page.tsx          # Individual system
│   ├── costs/
│   │   └── page.tsx              # Cost breakdown
│   ├── for-sale/
│   │   └── page.tsx              # Existing sales page
│   ├── about/
│   │   └── page.tsx              # About Shaun
│   └── contact/
│       └── page.tsx              # Contact form
├── components/
│   ├── Navigation.tsx            # Global header nav
│   ├── Footer.tsx                # Global footer
│   ├── GalleryGrid.tsx           # Photo gallery with lightbox
│   ├── Timeline.tsx              # Journal timeline view
│   ├── PostCard.tsx              # Blog post preview card
│   ├── SystemCard.tsx            # System overview card
│   ├── CostChart.tsx             # Interactive cost charts
│   ├── SpecBox.tsx               # Technical specs display
│   ├── CostCallout.tsx           # Cost highlight boxes
│   └── Breadcrumbs.tsx           # Navigation breadcrumbs
├── data/
│   ├── posts.json                # All blog posts content
│   ├── systems.json              # System specifications
│   ├── costs.json                # Cost breakdown data
│   └── about.json                # About page content
├── public/
│   └── images/
│       ├── posts/                # Blog post images (organized by post)
│       ├── systems/              # System diagrams and photos
│       └── gallery/              # General gallery images
└── lib/
    ├── posts.ts                  # Post fetching utilities
    ├── systems.ts                # System data utilities
    └── utils.ts                  # General helpers
```

### Data Structure

#### posts.json
```json
[
  {
    "id": "windows-2020-06",
    "slug": "windows",
    "title": "Windows",
    "date": "2020-06-10",
    "excerpt": "Installing side and rear windows for natural light...",
    "content": "Full markdown or HTML content...",
    "featuredImage": "/images/posts/windows/hero.jpg",
    "gallery": [
      "/images/posts/windows/01.jpg",
      "/images/posts/windows/02.jpg"
    ],
    "categories": ["structure", "phase-1"],
    "systems": ["structural"],
    "readingTime": 5,
    "cost": 800
  }
]
```

#### systems.json
```json
[
  {
    "id": "electrical",
    "name": "Electrical System",
    "slug": "electrical",
    "description": "400Ah LiFePO4 battery bank with Victron inverter...",
    "heroImage": "/images/systems/electrical-hero.jpg",
    "totalCost": 8500,
    "components": [
      {
        "name": "Battle Born LiFePO4 Batteries",
        "quantity": 4,
        "specs": "100Ah each, 12V",
        "cost": 4000,
        "vendor": "Battle Born",
        "link": "https://..."
      }
    ],
    "relatedPosts": ["electrical-2022-07"],
    "diagram": "/images/systems/electrical-diagram.png"
  }
]
```

#### costs.json
```json
{
  "total": 30500,
  "categories": [
    {
      "name": "Electrical",
      "total": 8500,
      "items": [...]
    }
  ],
  "timeline": [
    {
      "date": "2020-06",
      "amount": 800,
      "item": "Windows"
    }
  ]
}
```

---

## Design System

### Color Palette
**Primary**: Forest Green Theme (keep emerald-900 base)
- Primary: `emerald-900` (#064e3b)
- Primary Light: `emerald-700` (#047857)
- Accent: `emerald-500` (#10b981)
- Neutral: Gray scale (50-900)
- Background: White + `gray-50`
- Text: `gray-900` for body, `gray-600` for secondary

### Typography
- **Headings**: Bold, large, hierarchical (text-4xl to text-6xl)
- **Body**: text-lg or text-xl for readability
- **Captions**: text-sm with gray-600
- **Line Height**: Generous (leading-relaxed)

### Components Style
- **Cards**: Rounded corners (rounded-2xl), shadow-lg, hover effects
- **Buttons**: Rounded-full for primary CTAs, solid colors
- **Inputs**: Rounded-lg, border focus states
- **Images**: Rounded corners, shadow, aspect ratio preserved
- **Spacing**: Generous padding (py-20, px-6)

### Responsive Breakpoints
- Mobile: Default
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)
- Wide: `xl:` (1280px)

---

## Content Migration Strategy

### Phase 1: Structure Setup
1. Create new page routes
2. Build reusable components
3. Set up data structure (JSON files)
4. Create navigation and layout

### Phase 2: Content Migration
1. Convert blog post HTML/text to structured JSON
2. Organize images by post in /public/images/posts/
3. Extract system data to systems.json
4. Format cost data to costs.json
5. Write About page content

### Phase 3: Feature Implementation
1. Search functionality
2. Interactive cost charts
3. Lightbox galleries
4. Timeline visualization
5. Filtering and sorting

### Phase 4: Polish
1. SEO optimization (metadata for all pages)
2. Performance optimization (image loading, code splitting)
3. Mobile testing and refinement
4. Analytics setup
5. Form submission handling

---

## Key Differentiators from FarOutRide

While inspired by FarOutRide, Forest Queen Van will have unique characteristics:

1. **Single Van Focus**: Deep dive into ONE build vs multiple vans
2. **Completed Journey**: Show the finished product AND the journey
3. **For Sale Angle**: Unique opportunity to buy this exact build
4. **Personal Story**: Shaun's individual voice and perspective
5. **Pacific Northwest Aesthetic**: Forest/nature theme vs desert vibes
6. **Authentic Documentation**: Real build, real costs, real challenges

---

## Success Metrics

### User Engagement
- Time on site: Target >3 minutes average
- Pages per session: Target >3 pages
- Bounce rate: Target <50%

### Content Goals
- All 15 blog posts migrated with images
- 5 detailed system pages
- Interactive cost breakdown
- Complete about/contact pages

### Conversion Goals (if selling)
- For-sale page views
- Contact form submissions
- Viewing requests

### Community Building
- Newsletter signups (if implemented)
- Social media follows
- Inbound links and shares

---

## Timeline Estimate

**Week 1: Foundation**
- Set up routing structure
- Build navigation components
- Create data structure
- Design homepage

**Week 2: Core Pages**
- Build journal index and post template
- Migrate 5-6 blog posts
- Create systems overview page

**Week 3: Content Migration**
- Migrate remaining blog posts
- Build system detail pages
- Create costs page

**Week 4: Polish & Launch**
- About and contact pages
- SEO optimization
- Mobile testing
- Deploy to production

---

## Next Steps

1. **Review & Approve Plan**: Ensure this direction aligns with your vision
2. **Content Prioritization**: Which posts/sections are most important?
3. **Design Preferences**: Any specific design elements you love/hate?
4. **Timeline**: How quickly do you need this completed?
5. **For-Sale Status**: Is the van currently for sale or is this pure build journal?

---

## Questions for Shaun

1. Do you have access to all original images from the blog posts?
2. Is the van currently for sale, or should we de-emphasize that?
3. Any specific features from FarOutRide you particularly love?
4. Do you want user accounts, comments, or newsletter?
5. Any additional content (videos, 3D models, tours)?
6. What's your primary goal: Sell the van? Build community? Inspire builders?

---

**End of Plan Document**
