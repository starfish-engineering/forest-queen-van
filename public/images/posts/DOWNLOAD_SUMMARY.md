# Forest Queen Van Image Download Summary

## Overview
Successfully scraped and downloaded all images from forestqueenvan.com blog posts.

## Statistics
- **Total Images Downloaded**: 148 images
- **Source**: forestqueenvan.com (Squarespace CDN)
- **Format**: High-resolution JPEG/JPG files
- **Date**: November 2, 2025

## Images by Blog Post

### 1. Windows (/windows)
- **Images**: 2
- **Location**: `/public/images/posts/windows/`
- **Files**: IMG_1005.jpeg, IMG_1025.jpeg

### 2. Framing (/framing)
- **Images**: 6
- **Location**: `/public/images/posts/framing/`
- **Files**: IMG_1504.jpeg, IMG_1505.jpeg, plus 4 timestamped photos

### 3. Plumbing (/plumbing)
- **Images**: 5
- **Location**: `/public/images/posts/plumbing/`
- **Files**: IMG_4964-4966.jpeg, plus 2 timestamped photos

### 4. Air Conditioner (/air-conditioner)
- **Images**: 27
- **Location**: `/public/images/posts/air-conditioner/`
- **Files**: IMG_7466-7883.jpeg/JPG, plus timestamped photos

### 5. Roof (/roof)
- **Images**: 24
- **Location**: `/public/images/posts/roof/`
- **Files**: IMG_5884-6256.jpeg

### 6. Propane (/propane)
- **Images**: 10
- **Location**: `/public/images/posts/propane/`
- **Files**: IMG_8459-8628.jpeg

### 7. Slats (/slats)
- **Images**: 1
- **Location**: `/public/images/posts/slats/`
- **Files**: IMG_8356.jpeg

### 8. Upper Cabinets (/upper-cabinets)
- **Images**: 6
- **Location**: `/public/images/posts/upper-cabinets/`
- **Files**: IMG_0593-0628.jpeg

### 9. Electrical (/electrical)
- **Images**: 21
- **Location**: `/public/images/posts/electrical/`
- **Files**: IMG_3859-4049.jpeg

### 10. Floor #2 (/floor-2)
- **Images**: 31
- **Location**: `/public/images/posts/floor-2/`
- **Files**: IMG_2746-3860.jpeg

### 11. Garden - April 2024 (/garden)
- **Images**: 5
- **Location**: `/public/images/posts/garden/`
- **Files**: IMG_1445-1458.jpeg

### 12. Butcher Block Overhang Extension (/butcher-block-overhang-extension)
- **Images**: 5
- **Location**: `/public/images/posts/butcher-block-overhang-extension/`
- **Files**: IMG_0760-0772.jpeg

### 13. Garden - July 2024 (/garden-1)
- **Images**: 4
- **Location**: `/public/images/posts/garden-1/`
- **Files**: IMG_1445-1450.jpeg

### 14. Homepage
- **Images**: 1
- **Location**: `/public/images/posts/homepage/`
- **Files**: IMG_1458.jpeg

## File Structure

```
/public/images/posts/
├── image-manifest.json          # Complete mapping of all image URLs
├── DOWNLOAD_SUMMARY.md          # This file
├── windows/                     # 2 images
├── framing/                     # 6 images
├── plumbing/                    # 5 images
├── air-conditioner/             # 27 images
├── roof/                        # 24 images
├── propane/                     # 10 images
├── slats/                       # 1 image
├── upper-cabinets/              # 6 images
├── electrical/                  # 21 images
├── floor-2/                     # 31 images
├── garden/                      # 5 images
├── butcher-block-overhang-extension/  # 5 images
├── garden-1/                    # 4 images
└── homepage/                    # 1 image
```

## Image Manifest

The complete mapping of original URLs to downloaded files is available in:
`/public/images/posts/image-manifest.json`

This JSON file contains:
- Original Squarespace CDN URLs for each image
- Organized by blog post slug
- Can be used for tracking, attribution, or re-downloading if needed

## Notes

1. **Image Quality**: All images are full-resolution versions from Squarespace CDN
2. **File Naming**: Original filenames preserved (e.g., IMG_1005.jpeg)
3. **Failed Downloads**: None - all 148 images downloaded successfully
4. **Missing Posts**:
   - /walls-ceiling-panels - returned 404 (page not found)
   - /design-layout - returned 404 (page not found)
   - /van-build-costs - no images (text/table only)

## Usage

These images can now be used in your Next.js application:

```jsx
// Example usage in Next.js
import Image from 'next/image'

<Image
  src="/images/posts/windows/IMG_1005.jpeg"
  alt="Window installation"
  width={800}
  height={600}
/>
```

## Attribution

All images are from Forest Queen Van (forestqueenvan.com) and are being used with permission for this project.
