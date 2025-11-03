# Forest Queen Gallery Pipeline - Updated Plan

## ✅ Setup Complete

**Anthropic API Key**: Configured in `.env.local`
**Image Location**: `~/Desktop/Forest Queen/`
**Total Folders**: 30 project categories
**Estimated Images**: ~2,000-3,000 images

---

## 📁 Your Folder Structure → Database Categories

Based on your actual folder structure, these will become our primary categories:

### Major Systems
1. **electrical** ← Electrical (65 images)
2. **plumbing** ← Plumbing (47 images)
3. **hvac** ← Air Conditioner (31 images) + Heater (12 images)
4. **solar** ← Roof (Solar, Vent, MaxxFan) (135 images) + Roof 2 (27 images)
5. **propane** ← Propane (12 images)

### Structural
6. **framing** ← Framing (51 images)
7. **floor** ← Floor (8 images) + Floor #1 (34 images) + Floor #2 (37 images)
8. **walls** ← Walls (48 images) + Upholstered Walls & Ceiling (58 images)
9. **insulation** ← Insulation (15 images)
10. **windows** ← Windows (5 images)

### Interior & Finishes
11. **cabinets** ← Upper Cabinets (8 images) + Kitchen Galley (24 images)
12. **countertops** ← Butcher Block (7 images) + Backsplash (9 images)
13. **slats** ← Slats (53 images)
14. **paneling** ← Paneling (9 images)
15. **garden** ← Garden (7 images)

### Appliances
16. **microwave** ← Microwave (2 images)

### Planning & Documentation
17. **design** ← Design (17 images)
18. **lifestyle** ← Chillin (11 images) + Van 1 (11 images) + Van 10 (225 images)
19. **master** ← Master (1,505 images - needs AI to categorize these!)

---

## 🎯 Updated Strategy

### Phase 1: Folder-Based Upload (Easy wins)
Upload images using folder names as initial categories for the well-organized folders.

**Benefits:**
- Fast initial setup
- Clear organization
- Can refine with AI later

### Phase 2: AI Analysis for Master Folder
The Master folder (1,505 images) clearly needs AI analysis to properly categorize.

**Approach:**
- Use Claude 4.5 Sonnet vision API
- Batch process in groups of 20 images
- Auto-categorize into the folder-based categories
- Cost: ~$4-5 for all Master images

### Phase 3: AI Enhancement (Optional)
Run AI on all images to add:
- Detailed descriptions
- Technical specifications
- Additional tags
- Quality/featured image detection

---

## 💰 Cost Breakdown

**Option A: Folder-based only** (No AI cost)
- Upload ~500 images from organized folders
- Use folder names as categories
- Add Master folder descriptions manually if needed
- **Cost: $0**

**Option B: AI for Master folder only** (Recommended)
- Upload all images with folder categories
- AI analysis only for 1,505 Master images
- **Cost: ~$5**

**Option C: Full AI pipeline** (Maximum quality)
- AI analysis for all ~2,500 images
- Detailed descriptions for everything
- **Cost: ~$8-10**

---

## 🚀 Recommended Execution Plan

### Step 1: Database Setup (15 min)
```bash
# Create Supabase tables
npm run setup:database

# Create storage bucket
npm run setup:storage
```

### Step 2: Upload with Folder Categories (30 min)
```bash
# Upload all images with folder names as tags
npm run upload:images ~/Desktop/Forest\ Queen

# This will:
# - Upload to Supabase Storage
# - Create database entries
# - Use folder names as primary_category
# - Set folder names as tags
```

### Step 3: AI Analysis for Master Folder (2-3 hours)
```bash
# Analyze only Master folder images
npm run analyze:master-folder

# Cost: ~$5
# Categorizes 1,505 uncategorized images
```

### Step 4: Optional AI Enhancement (4-6 hours)
```bash
# Add AI descriptions to all images
npm run enhance:all-descriptions

# Cost: ~$3-5 additional
# Adds detailed descriptions and tags
```

---

## 📊 Database Schema (Updated)

```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Storage
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,

  -- Original folder info
  original_folder TEXT, -- "Electrical", "Master", etc.
  original_subfolder TEXT, -- For nested folders

  -- Categories (derived from folders or AI)
  primary_category TEXT, -- electrical, plumbing, etc.
  tags TEXT[], -- ["Electrical", "Wiring", "12V"]

  -- AI-generated (optional)
  ai_description TEXT,
  ai_confidence FLOAT,
  ai_detected_objects TEXT[],

  -- Manual overrides
  manual_category TEXT,
  manual_description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Relationships
  post_id TEXT,
  system_id TEXT
);

-- Fast category lookups
CREATE INDEX idx_images_category ON images(primary_category);
CREATE INDEX idx_images_folder ON images(original_folder);
CREATE INDEX idx_images_tags ON images USING GIN(tags);
```

---

## 📝 Upload Script Preview

```typescript
// scripts/upload-forest-queen.ts

import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const FOREST_QUEEN_PATH = '/Users/shaun/Desktop/Forest Queen';

// Folder name → category mapping
const folderCategoryMap: Record<string, string> = {
  'Electrical': 'electrical',
  'Plumbing': 'plumbing',
  'Air Conditioner': 'hvac',
  'Heater': 'hvac',
  'Roof (Solar, Vent, MaxxFan)': 'solar',
  'Roof 2': 'solar',
  'Propane': 'propane',
  'Framing': 'framing',
  'Floor': 'floor',
  'Floor #1': 'floor',
  'Floor #2': 'floor',
  'Walls': 'walls',
  'Upholstered Walls & Ceiling': 'walls',
  'Insulation': 'insulation',
  'Windows': 'windows',
  'Upper Cabinets': 'cabinets',
  'Kitchen Galley': 'cabinets',
  'Butcher Block': 'countertops',
  'Backsplash': 'countertops',
  'Slats': 'slats',
  'Paneling': 'paneling',
  'Garden': 'garden',
  'Microwave': 'appliances',
  'Design': 'design',
  'Chillin': 'lifestyle',
  'Van 1': 'lifestyle',
  'Van 10': 'lifestyle',
  'Master': 'uncategorized' // Will be AI-analyzed later
};

async function uploadImages() {
  const folders = fs.readdirSync(FOREST_QUEEN_PATH);

  for (const folder of folders) {
    const folderPath = path.join(FOREST_QUEEN_PATH, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const category = folderCategoryMap[folder] || 'other';
    const images = fs.readdirSync(folderPath)
      .filter(f => /\.(jpg|jpeg|png|JPG|JPEG)$/i.test(f));

    console.log(`\n📁 ${folder}: ${images.length} images`);
    console.log(`   Category: ${category}`);

    for (const image of images) {
      const imagePath = path.join(folderPath, image);
      const fileBuffer = fs.readFileSync(imagePath);

      // Upload to Supabase Storage
      const storagePath = `van-build/${folder}/${image}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error(`   ❌ ${image}: ${uploadError.message}`);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('images')
        .getPublicUrl(storagePath);

      // Insert into database
      const { error: dbError } = await supabase
        .from('images')
        .insert({
          storage_path: storagePath,
          public_url: publicUrl,
          file_name: image,
          file_size: fileBuffer.length,
          original_folder: folder,
          primary_category: category,
          tags: [folder, category],
        });

      if (dbError) {
        console.error(`   ❌ DB error for ${image}: ${dbError.message}`);
      } else {
        console.log(`   ✓ ${image}`);
      }
    }
  }
}

uploadImages();
```

---

## 🎨 Gallery UI Components

Once images are uploaded, we'll build:

### 1. Category Gallery Pages
```typescript
// app/gallery/[category]/page.tsx
// URL: /gallery/electrical
// Shows all images from electrical category
```

### 2. Folder Collection Pages
```typescript
// app/gallery/collections/[folder]/page.tsx
// URL: /gallery/collections/air-conditioner
// Shows all images from specific folder
```

### 3. Master Gallery with Filters
```typescript
// app/gallery/page.tsx
// All images with category/tag filtering
// Search by description
// Sort by date/folder/category
```

---

## ✅ Next Steps - Your Choice

**Option 1: Quick Start (Folder-based)**
```bash
# 1. Setup database (I'll create the script)
npm run setup:database

# 2. Upload all images with folder categories
npm run upload:forest-queen

# 3. Build gallery UI
# Result: Working gallery in 2-3 hours, $0 cost
```

**Option 2: Smart Start (Folder + AI for Master)**
```bash
# 1. Setup database
npm run setup:database

# 2. Upload with folder categories
npm run upload:forest-queen

# 3. AI analyze Master folder only
npm run analyze:master

# 4. Build gallery UI
# Result: Fully categorized gallery in 4-5 hours, ~$5 cost
```

**Option 3: Premium (Full AI)**
```bash
# 1. Setup + Upload
# 2. AI analyze ALL images
# 3. Build gallery UI
# Result: Maximum quality in 8-10 hours, ~$10 cost
```

---

## 🚀 Ready to Execute?

I recommend **Option 2** (Folder + AI for Master):
- Fast initial upload using your folder organization
- AI only where needed (Master folder)
- Best value for money (~$5)
- High quality results

**Shall I start building the scripts?**

1. ✅ Anthropic API key configured
2. ✅ Folder structure mapped
3. ✅ Database schema designed
4. ⬜ Create upload scripts
5. ⬜ Create AI analysis scripts
6. ⬜ Build gallery UI

Let me know which option you prefer and I'll start building!
