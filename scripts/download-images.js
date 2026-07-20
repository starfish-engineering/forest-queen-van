const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Image URLs from forestqueenvan.com blog posts
const imageUrls = [
  // Windows post
  'https://images.squarespace-cdn.com/content/v1/5ef0c7b2b184d22052bf8b10/1591809155642-DEYBLTHPJGFNXLX7O5BZ/IMG_1005.jpeg',
  'https://images.squarespace-cdn.com/content/v1/5ef0c7b2b184d22052bf8b10/1591809196371-B2QLPG3QP5Z8HQEKFZIF/IMG_1025.jpeg',

  // Add more URLs as we find them...
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Downloaded: ${path.basename(filepath)}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function main() {
  const outputDir = path.join(__dirname, '../public/images/posts');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Starting image downloads from forestqueenvan.com...\n');

  for (const url of imageUrls) {
    try {
      const filename = path.basename(new URL(url).pathname);
      const filepath = path.join(outputDir, filename);

      if (fs.existsSync(filepath)) {
        console.log(`⊘ Skipped (exists): ${filename}`);
        continue;
      }

      await downloadImage(url, filepath);
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
    } catch (error) {
      console.error(`✗ Error downloading ${url}:`, error.message);
    }
  }

  console.log('\n✓ Download complete!');
}

main().catch(console.error);
