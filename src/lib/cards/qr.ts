import QRCode from 'qrcode';

export interface QROptions {
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generates an SVG string representation of the QR code.
 */
export async function generateQrSvg(text: string, options: QROptions = {}): Promise<string> {
  return await QRCode.toString(text, {
    type: 'svg',
    margin: options.margin ?? 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: options.color?.dark ?? '#0f172a',
      light: options.color?.light ?? '#ffffff',
    },
  });
}

/**
 * Generates a high-resolution PNG Data URL for high-quality downloads.
 */
export async function generateQrPngDataUrl(text: string, width = 800): Promise<string> {
  return await QRCode.toDataURL(text, {
    type: 'image/png',
    width,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}
