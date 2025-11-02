const fs = require('fs');
const path = require('path');

// Create a minimal valid PNG
const createPNG = (width, height) => {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16);
  ihdr.writeUInt8(6, 17);
  ihdr.writeUInt8(0, 18);
  ihdr.writeUInt8(0, 19);
  ihdr.writeUInt8(0, 20);
  
  const crc = require('zlib').crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(crc, 21);
  
  const idat = Buffer.from([
    0x00, 0x00, 0x00, 0x22, 0x49, 0x44, 0x41, 0x54,
    0x78, 0x9C, 0xED, 0xC1, 0x01, 0x01, 0x00, 0x00,
    0x00, 0x80, 0x90, 0xFE, 0xAF, 0xEE, 0x08, 0x0A,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x70, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00
  ]);
  
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
};

const imagesDir = path.join(__dirname, 'assets/images');
const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));

let fixed = 0;
files.forEach(file => {
  const filePath = path.join(imagesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it's corrupted (ASCII text)
  if (!content.startsWith('\x89PNG')) {
    const size = file.includes('icon') || file.includes('splash') ? 1024 : 512;
    fs.writeFileSync(filePath, createPNG(size, size));
    console.log(`✓ Fixed: ${file}`);
    fixed++;
  }
});

console.log(`\n✅ Fixed ${fixed} corrupted PNG files!`);
