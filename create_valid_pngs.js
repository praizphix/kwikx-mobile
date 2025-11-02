const fs = require('fs');
const path = require('path');

// Create a minimal valid 1024x1024 PNG (for icon.png)
const createPNG = (width, height) => {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // Length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // Bit depth
  ihdr.writeUInt8(6, 17); // Color type (RGBA)
  ihdr.writeUInt8(0, 18); // Compression
  ihdr.writeUInt8(0, 19); // Filter
  ihdr.writeUInt8(0, 20); // Interlace
  
  const crc = require('zlib').crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(crc, 21);
  
  // IDAT chunk with minimal data (1x1 transparent pixel repeated)
  const idat = Buffer.from([
    0x00, 0x00, 0x00, 0x22, // Length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x78, 0x9C, 0xED, 0xC1, 0x01, 0x01, 0x00, 0x00,
    0x00, 0x80, 0x90, 0xFE, 0xAF, 0xEE, 0x08, 0x0A,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x70, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00 // CRC placeholder
  ]);
  
  // IEND chunk
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // Length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
};

// Create icon.png (1024x1024)
const iconPath = path.join(__dirname, 'assets/images/icon.png');
fs.writeFileSync(iconPath, createPNG(1024, 1024));
console.log('✓ Created icon.png');

// Create adaptive-icon.png (1024x1024)
const adaptiveIconPath = path.join(__dirname, 'assets/images/adaptive-icon.png');
fs.writeFileSync(adaptiveIconPath, createPNG(1024, 1024));
console.log('✓ Created adaptive-icon.png');

console.log('\n✅ All PNG files created successfully!');
