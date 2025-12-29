// Generate PWA icons for deployment
// Run with: node scripts/generate-icons.js

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create gradient background (blue to purple)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6'); // blue-500
  gradient.addColorStop(1, '#9333ea'); // purple-600

  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Add rounded corners effect
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const cornerRadius = size * 0.15; // 15% corner radius
  ctx.roundRect(0, 0, size, size, cornerRadius);
  ctx.fill();

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';

  // Draw "FC" text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.35}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FC', size / 2, size / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(publicDir, `icon-${size}.png`);
  fs.writeFileSync(filename, buffer);

  console.log(`✅ Created ${filename}`);
}

// Generate both icon sizes
console.log('🎨 Generating PWA icons...\n');

try {
  sizes.forEach(size => generateIcon(size));
  console.log('\n✨ PWA icons generated successfully!');
  console.log('📁 Icons saved to /public/ directory');
  console.log('\nYou can now deploy to Vercel!');
} catch (error) {
  console.error('\n❌ Error generating icons:', error.message);
  console.log('\n📝 Alternative: Use https://www.pwabuilder.com/imageGenerator');
  console.log('   Or create simple 192×192 and 512×512 PNG files with your design');
  process.exit(1);
}
