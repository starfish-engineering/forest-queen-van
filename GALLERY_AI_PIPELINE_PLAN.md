# AI-Powered Gallery Pipeline - Comprehensive Plan

## Executive Summary

Transform 500MB of van build images into a fully categorized, tagged, and optimized gallery using AI vision models, Supabase Storage, and a custom processing pipeline.

---

## 🎯 Goals

1. **Store** ~500MB of images efficiently without bloating the git repo
2. **Categorize** images automatically using AI vision (electrical, plumbing, framing, etc.)
3. **Generate** detailed descriptions for each image
4. **Optimize** images for web delivery with CDN
5. **Database** everything in Supabase for dynamic gallery rendering

---

## 🏗️ Architecture Overview

```
Desktop Images (500MB)
    ↓
Upload Script → Supabase Storage (with CDN)
    ↓
AI Vision Analysis (Claude 4.5 Sonnet or GPT-4o)
    ↓
Supabase Database (metadata, categories, tags, descriptions)
    ↓
Next.js Gallery Pages (dynamic rendering)
```

---

## 📊 Technology Stack Decisions

### 1. **Image Storage: Supabase Storage** ✅ RECOMMENDED

**Why Supabase Storage:**
- ✅ Already integrated in the project
- ✅ Built-in CDN (285+ global cities)
- ✅ Automatic image optimization & transformation
- ✅ WebP conversion on-the-fly
- ✅ Pricing: $0.021/GB storage + $0.09/GB egress (after 250GB free)
- ✅ 500MB = ~$10.50/month storage cost
- ✅ Smart CDN caching reduces egress costs significantly

**Features we'll use:**
- Image transformations (resize, quality, format)
- Public buckets with CDN
- Signed URLs for private images
- Auto WebP conversion for modern browsers

**Alternatives considered:**
- Vercel Blob: $0.023/GB (slightly more expensive, less features)
- Cloudinary: Credit-based, more expensive at scale

### 2. **AI Vision Model: Claude 4.5 Sonnet** ✅ RECOMMENDED

**Why Claude 4.5 Sonnet:**
- ✅ Superior vision understanding for technical/construction images
- ✅ Better at chart/diagram interpretation (perfect for technical builds)
- ✅ 200K token context (can process many images in one request)
- ✅ Pricing: $3/1M input tokens, $15/1M output tokens
- ✅ More cost-effective than GPT-4o for vision tasks
- ✅ Excellent at structured output (JSON)

**Cost estimate for 500MB (~1,500 images):**
- Avg image: ~300KB → ~500 tokens per image
- 1,500 images × 500 tokens = 750,000 input tokens = $2.25
- Output (descriptions + categories) = ~300,000 tokens = $4.50
- **Total: ~$7 for full batch processing**

**Note about your Claude Pro Max:**
- Subscription does NOT include API access
- You need separate Anthropic API account ($5 credit to start)
- Alternative: Use GPT-4o if you have OpenAI API access

**GPT-4o alternative:**
- $5/1M input ($2.50 cached), $20/1M output
- Multimodal (text + vision + audio)
- Estimated cost: ~$11 for same batch

### 3. **Database Schema: Supabase Postgres**

We'll create these tables:

```sql
-- Images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Storage info
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,

  -- AI-generated metadata
  ai_description TEXT,
  ai_short_description TEXT (100 chars),
  ai_tags TEXT[], -- Array of tags

  -- Categories
  primary_category TEXT, -- electrical, plumbing, framing, etc.
  secondary_categories TEXT[],
  build_phase TEXT, -- phase-1, phase-2, phase-3

  -- Technical metadata
  technical_details JSONB, -- Extracted technical info
  detected_objects TEXT[], -- What AI sees (wire, conduit, panel, etc.)

  -- Manual overrides
  manual_category TEXT,
  manual_description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER,

  -- Relationships
  post_id TEXT, -- Link to posts.json entries
  system_id TEXT -- Link to systems
);

-- Create indexes
CREATE INDEX idx_images_category ON images(primary_category);
CREATE INDEX idx_images_tags ON images USING GIN(ai_tags);
CREATE INDEX idx_images_post ON images(post_id);
CREATE INDEX idx_images_system ON images(system_id);
CREATE INDEX idx_images_featured ON images(is_featured) WHERE is_featured = TRUE;

-- Gallery collections (for curated galleries)
CREATE TABLE gallery_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  cover_image_id UUID REFERENCES images(id),
  image_ids UUID[], -- Ordered list of images
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 Processing Pipeline

### Phase 1: Upload Images to Supabase Storage

**Script:** `scripts/upload-images-to-supabase.ts`

```typescript
// Process:
1. Read all images from ~/Desktop/van-images/
2. Optimize images (resize if > 2000px width)
3. Upload to Supabase Storage bucket 'van-build-images'
4. Generate public URLs
5. Save upload manifest for next step
```

**Features:**
- Progress tracking
- Error handling & retry logic
- Concurrent uploads (5 at a time)
- Checksum verification
- Resume capability if interrupted

### Phase 2: AI Analysis & Categorization

**Script:** `scripts/analyze-images-with-ai.ts`

```typescript
// Process:
1. Load uploaded images from manifest
2. Batch images (10-20 per API call for efficiency)
3. Send to Claude 4.5 Sonnet with structured prompt
4. Parse JSON responses
5. Save to Supabase database
6. Handle errors & retries
```

**AI Prompt Structure:**
```
Analyze these van build construction images and provide:

1. Category (electrical, plumbing, framing, flooring, ceiling, walls,
   hvac, solar, propane, windows, cabinets, finishes, garden, tools)
2. Build phase (planning, demolition, framing, systems, finishing)
3. Short description (100 chars, focus on what's being done)
4. Long description (technical details, materials, progress)
5. Tags (5-10 relevant tags)
6. Detected objects (wire, conduit, drill, lumber, etc.)
7. Technical details (voltage, measurements, brands, if visible)

Return as JSON array matching this schema...
```

**Optimization:**
- Use Claude's 200K context to batch 20 images/request
- Implement exponential backoff for rate limits
- Cache results to avoid re-processing
- Cost monitoring & limits

### Phase 3: Database Population

**Script:** `scripts/populate-database.ts`

```typescript
// Process:
1. Load AI analysis results
2. Insert into Supabase images table
3. Create relationships to existing posts
4. Generate gallery collections automatically
5. Set featured images
6. Verify data integrity
```

### Phase 4: Gallery UI Components

**New Components:**

```typescript
// components/ImageGallery.tsx
- Grid view with lazy loading
- Lightbox with navigation
- Filter by category/tag
- Search functionality
- Masonry layout option

// components/CategoryGallery.tsx
- Category-specific galleries
- Show related images from same category

// app/gallery/page.tsx
- Main gallery page
- All images, filterable

// app/gallery/[category]/page.tsx
- Category-specific galleries

// app/gallery/collections/[slug]/page.tsx
- Curated collections
```

---

## 📋 Implementation Steps

### Step 1: Setup Supabase Storage ✓
```bash
1. Create storage bucket 'van-build-images'
2. Set public access policies
3. Enable image transformations
4. Configure CDN caching
```

### Step 2: Create Database Schema ✓
```bash
1. Run SQL migrations
2. Create indexes
3. Set up RLS policies
4. Test queries
```

### Step 3: Build Upload Pipeline
```bash
1. Create upload script
2. Test with 10 images
3. Add progress tracking
4. Add resume capability
5. Run full upload
```

### Step 4: Build AI Analysis Pipeline
```bash
1. Get Anthropic API key (or OpenAI)
2. Create analysis script
3. Test with 10 images
4. Refine prompts based on results
5. Run full batch (monitor costs!)
6. Review & adjust categories
```

### Step 5: Populate Database
```bash
1. Insert analyzed data
2. Create relationships
3. Generate collections
4. Set featured images
```

### Step 6: Build Gallery UI
```bash
1. Create gallery components
2. Build gallery pages
3. Add filtering/search
4. Optimize loading
5. Test performance
```

### Step 7: Migrate Existing Images
```bash
1. Move current public/images/posts to Supabase
2. Update posts.json URLs
3. Run AI analysis on existing images too
4. Link to database
```

---

## 💰 Cost Analysis

### Storage (Supabase)
- 500MB storage: $0.021/GB = ~$0.01/month initially
- Egress: 250GB free, then $0.09/GB
- Image transformations: Included in Pro plan
- **Estimated: $1-5/month**

### AI Processing (One-time)
- 1,500 images with Claude 4.5 Sonnet
- Input tokens: ~$2.25
- Output tokens: ~$4.50
- **Total: ~$7 one-time**

### Ongoing
- New images: ~$0.005 per image analyzed
- Storage growth: ~$0.021/GB/month

**Total first month: ~$13**
**Ongoing: ~$2-5/month**

---

## 🎨 Categories & System Mapping

Based on your current systems, we'll use these categories:

**Primary Categories:**
1. `electrical` → maps to "electrical" system
2. `plumbing` → maps to "plumbing" system
3. `hvac` → maps to "hvac" system
4. `solar` → maps to "solar" system
5. `propane` → maps to "propane" system
6. `structural` → framing, walls, ceiling, floor
7. `windows` → window installation
8. `cabinets` → upper/lower cabinets
9. `finishes` → slats, paneling, trim
10. `garden` → indoor garden
11. `exterior` → roof, exterior work
12. `tools-workspace` → tools, workshop

**Build Phases:**
- `phase-1`: Planning, demo, framing (2019-2020)
- `phase-2`: Systems installation (2021-2022)
- `phase-3`: Finishing, details (2022-2024)

---

## 🔒 Security Considerations

1. **Storage Bucket Policies**
   - Public read for gallery images
   - Authenticated write only
   - Size limits (5MB per file)

2. **API Keys**
   - Store in environment variables
   - Never commit to repo
   - Rotate periodically

3. **Rate Limiting**
   - Implement in upload script
   - Respect API limits
   - Exponential backoff

4. **Image Validation**
   - Verify MIME types
   - Scan for malicious content
   - Limit file sizes

---

## 🚀 Quick Start Commands

```bash
# 1. Setup environment
npm install @anthropic-ai/sdk
# or: npm install openai

# 2. Create Supabase bucket
npm run setup:storage

# 3. Create database tables
npm run setup:database

# 4. Upload images
npm run upload:images ~/Desktop/van-images

# 5. Analyze with AI
export ANTHROPIC_API_KEY=your_key
npm run analyze:images

# 6. Populate database
npm run populate:database

# 7. Generate galleries
npm run generate:galleries
```

---

## 📈 Success Metrics

- ✅ All 1,500+ images uploaded to Supabase
- ✅ 95%+ accuracy in categorization
- ✅ <2s page load time for gallery
- ✅ Proper CDN caching (90%+ hit rate)
- ✅ Images load progressively
- ✅ Mobile-optimized
- ✅ SEO-friendly image alt texts
- ✅ Total cost < $20 for setup

---

## 🔄 Alternative: Hybrid Approach

If you want to start simpler:

**Option A: Manual categorization, AI descriptions only**
- Upload to Supabase ✓
- Manually assign categories
- Use AI only for descriptions
- Cost: ~$3 for descriptions

**Option B: Use existing images, enhance with AI**
- Keep current public/images structure
- Add database layer on top
- AI analyzes existing 148 images
- Gradually migrate to Supabase

---

## 📝 Next Steps

1. **Decision needed:** Claude API or GPT-4o? (I recommend Claude)
2. **Confirm:** Location of 500MB of images on Desktop?
3. **Choose:** Full AI pipeline or hybrid approach?
4. **Provide:** API key for chosen model

Once confirmed, we'll execute step-by-step!
