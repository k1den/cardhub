import sharp from 'sharp';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';

export interface ProcessedImage {
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_COVER_BYTES = 3 * 1024 * 1024;  // 3 MB

/**
 * Validates, re-encodes (clears EXIF / geotags) and saves image securely.
 */
export async function processAndSaveImage(
  buffer: Buffer,
  type: 'avatar' | 'cover'
): Promise<ProcessedImage> {
  const maxBytes = type === 'avatar' ? MAX_AVATAR_BYTES : MAX_COVER_BYTES;

  if (buffer.length > maxBytes) {
    throw new Error(
      `Размер файла превышает лимит (${type === 'avatar' ? '2 МБ' : '3 МБ'})`
    );
  }

  // Inspect image metadata with sharp to verify it is a valid image
  const metadata = await sharp(buffer).metadata();

  const format = metadata.format;
  if (!format || !ALLOWED_MIME_TYPES.has(`image/${format === 'jpeg' ? 'jpeg' : format}`)) {
    throw new Error('Недопустимый формат файла. Разрешены только JPEG, PNG и WebP (SVG запрещён)');
  }

  // Security: Re-encode to WebP and explicitly strip EXIF metadata / GPS tags
  let transformer = sharp(buffer)
    .rotate() // auto-orient based on EXIF before stripping
    .withMetadata({ exif: {} }); // remove all EXIF tags

  if (type === 'avatar') {
    // Resize avatar to max 800x800 square
    transformer = transformer.resize(800, 800, {
      fit: 'cover',
      position: 'center',
    });
  } else {
    // Resize cover to max 1600x900
    transformer = transformer.resize(1600, 900, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const processedBuffer = await transformer
    .webp({ quality: 85, effort: 4 })
    .toBuffer();

  // Generate safe unique filename
  const filename = `${crypto.randomUUID()}.webp`;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), processedBuffer);

  return {
    filename,
    url: `/uploads/${filename}`,
    mimeType: 'image/webp',
    sizeBytes: processedBuffer.length,
  };
}
