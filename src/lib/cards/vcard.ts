export interface VCardData {
  fullName: string;
  position?: string | null;
  companyName?: string | null;
  bio?: string | null;
  phones?: string[];
  emails?: string[];
  websites?: string[];
  address?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;
  vk?: string | null;
  cardUrl?: string | null;
}

function escapeVCardValue(val: string): string {
  return val
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Builds RFC 2426 vCard 3.0 content string.
 */
export function generateVCard3(data: VCardData): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `PRODID:-//CardHub//Digital Business Card//RU`,
  ];

  // Full Name
  const cleanName = data.fullName.trim();
  lines.push(`FN;CHARSET=UTF-8:${escapeVCardValue(cleanName)}`);

  // Split name for N property (Last, First)
  const nameParts = cleanName.split(/\s+/);
  if (nameParts.length > 1) {
    const lastName = nameParts[0];
    const firstName = nameParts.slice(1).join(' ');
    lines.push(`N;CHARSET=UTF-8:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`);
  } else {
    lines.push(`N;CHARSET=UTF-8:${escapeVCardValue(cleanName)};;;;`);
  }

  // Company and Title
  if (data.companyName) {
    lines.push(`ORG;CHARSET=UTF-8:${escapeVCardValue(data.companyName.trim())}`);
  }
  if (data.position) {
    lines.push(`TITLE;CHARSET=UTF-8:${escapeVCardValue(data.position.trim())}`);
  }

  // Bio / Note
  if (data.bio) {
    lines.push(`NOTE;CHARSET=UTF-8:${escapeVCardValue(data.bio.trim())}`);
  }

  // Phones
  if (data.phones && data.phones.length > 0) {
    data.phones.forEach((phone, idx) => {
      const type = idx === 0 ? 'CELL,PREF' : 'WORK';
      lines.push(`TEL;TYPE=${type}:${phone.replace(/[^\d+]/g, '')}`);
    });
  }

  // Emails
  if (data.emails && data.emails.length > 0) {
    data.emails.forEach((email, idx) => {
      const type = idx === 0 ? 'INTERNET,PREF' : 'INTERNET';
      lines.push(`EMAIL;TYPE=${type}:${email.trim()}`);
    });
  }

  // Websites
  if (data.websites && data.websites.length > 0) {
    data.websites.forEach((url) => {
      lines.push(`URL:${url.trim()}`);
    });
  } else if (data.cardUrl) {
    lines.push(`URL:${data.cardUrl.trim()}`);
  }

  // Address
  if (data.address) {
    lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${escapeVCardValue(data.address.trim())};;;;`);
  }

  // Messengers & Socials
  if (data.telegram) {
    const tg = data.telegram.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
    lines.push(`X-SOCIALPROFILE;TYPE=telegram:https://t.me/${tg}`);
  }

  if (data.vk) {
    const vk = data.vk.replace(/^https?:\/\/vk\.com\//, '');
    lines.push(`X-SOCIALPROFILE;TYPE=vk:https://vk.com/${vk}`);
  }

  if (data.whatsapp) {
    const wa = data.whatsapp.replace(/[^\d]/g, '');
    lines.push(`X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${wa}`);
  }

  // CardHub source reference
  if (data.cardUrl) {
    lines.push(`X-CARDHUB-URL:${data.cardUrl}`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}
