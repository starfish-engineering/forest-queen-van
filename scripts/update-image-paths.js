const fs = require('fs');
const path = require('path');

// Read the manifest
const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/images/posts/image-manifest.json'), 'utf8')
);

// Read posts.json
const postsPath = path.join(__dirname, '../data/posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

// Mapping of post IDs to manifest keys
const postToManifestKey = {
  'windows-2020-06': 'windows',
  'framing-2020-09': 'framing',
  'walls-ceiling-2021-05': 'walls-ceiling',
  'plumbing-2021-07': 'plumbing',
  'air-conditioner-2021-07': 'air-conditioner',
  'roof-2021-08': 'roof',
  'propane-2021-09': 'propane',
  'slats-2021-09': 'slats',
  'upper-cabinets-2022-03': 'upper-cabinets',
  'design-layout-2022-07': 'design-layout',
  'electrical-2022-07': 'electrical',
  'floor-2022-07': 'floor-2',
  'butcher-block-2024-04': 'butcher-block-overhang-extension',
  'costs-2024-04': 'costs',
  'garden-2024-07': 'garden-1'
};

// Update each post
posts.forEach(post => {
  const manifestKey = postToManifestKey[post.id];

  if (manifestKey && manifest[manifestKey]) {
    const images = manifest[manifestKey];
    const folder = manifestKey;

    // Get filename from URL
    const getFilename = (url) => {
      const match = url.match(/([^/]+\.(jpeg|jpg|png|JPG))$/);
      return match ? match[1] : null;
    };

    // Set featured image (first image)
    if (images.length > 0) {
      const filename = getFilename(images[0]);
      if (filename) {
        post.featuredImage = `/images/posts/${folder}/${filename}`;
      }
    }

    // Set gallery images
    post.gallery = images.map(url => {
      const filename = getFilename(url);
      return filename ? `/images/posts/${folder}/${filename}` : null;
    }).filter(Boolean);

    // Update image count
    post.imageCount = post.gallery.length;

    console.log(`✓ Updated ${post.slug}: ${post.imageCount} images`);
  } else {
    console.log(`⊘ No images found for ${post.slug}`);
  }
});

// Write updated posts
fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
console.log('\n✓ posts.json updated successfully!');
