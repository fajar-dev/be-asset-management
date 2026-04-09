import sharp from 'sharp';
import { DateTime } from 'luxon';

/**
 * Adds a timestamp watermark to an image buffer.
 * @param image - Express.Multer.File object
 * @returns Promise<Express.Multer.File> - The watermarked image object
 */
export async function watermarkImage(image: Express.Multer.File): Promise<Express.Multer.File> {
  const timestamp = DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd HH:mm:ss');
  const metadata = await sharp(image.buffer).metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 600;

  const bgHeight = Math.max(30, width * 0.08);
  const fontSize = Math.max(16, width * 0.04);
  
  const svgImage = `<svg width="${width}" height="${height}">
    <style>
    .bg { fill: rgba(0, 0, 0, 0.5); } 
    .title { fill: white; font-size: ${fontSize}px; font-family: sans-serif; }
    </style>
    <rect x="0" y="${height - bgHeight}" width="${width}" height="${bgHeight}" class="bg" />
    <text x="10" y="${height - 10}" class="title">${timestamp}</text>
    </svg>`;

  const watermarkedBuffer = await sharp(image.buffer)
    .composite([{ input: Buffer.from(svgImage), gravity: 'south' }])
    .toBuffer();

  image.buffer = watermarkedBuffer;
  image.size = watermarkedBuffer.length;
  return image;
}
