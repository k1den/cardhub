const ALLOWED_PROTOCOLS = new Set(['https:', 'http:', 'tel:', 'mailto:']);

/**
 * Validates a URL against strict allowed schemes per TZ sections 4.2 & 8.
 * Rejects javascript:, data:, vbscript:, file: and other dangerous payloads.
 */
export function isSafeUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return false;
  }

  const trimmed = rawUrl.trim();

  // Explicit dangerous patterns check
  const dangerousPattern = /^(?:javascript|data|vbscript|file|about):/i;
  if (dangerousPattern.test(trimmed)) {
    return false;
  }

  try {
    // If it starts with tel: or mailto:
    if (trimmed.startsWith('tel:') || trimmed.startsWith('mailto:')) {
      const url = new URL(trimmed);
      return ALLOWED_PROTOCOLS.has(url.protocol.toLowerCase());
    }

    // Standard HTTP/HTTPS url
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    return ALLOWED_PROTOCOLS.has(url.protocol.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Formats a messenger or social input into a safe, valid web URL.
 */
export function formatSocialUrl(type: string, value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  switch (type.toUpperCase()) {
    case 'TELEGRAM': {
      const clean = trimmed.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
      return `https://t.me/${clean}`;
    }
    case 'WHATSAPP': {
      const clean = trimmed.replace(/[^0-9]/g, '');
      return `https://wa.me/${clean}`;
    }
    case 'VK': {
      if (trimmed.startsWith('https://vk.com/')) {
        return trimmed;
      }
      const clean = trimmed.replace(/^@/, '').replace(/^vk\.com\//, '');
      return `https://vk.com/${clean}`;
    }
    case 'PHONE': {
      const clean = trimmed.replace(/[^0-9+]/g, '');
      return `tel:${clean}`;
    }
    case 'EMAIL': {
      return `mailto:${trimmed.toLowerCase()}`;
    }
    case 'WEBSITE':
    case 'CUSTOM_LINK': {
      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }
      return `https://${trimmed}`;
    }
    default:
      return trimmed;
  }
}
