import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = join(process.cwd(), 'public/icons/icon.svg');
const outputDir = join(process.cwd(), 'public/icons');

async function generateIcons() {
  try {
    const svgBuffer = readFileSync(inputSvg);
    
    console.log('Generating PWA icons...');
    
    for (const size of sizes) {
      const outputPath = join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${size}x${size} icon`);
    }
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 