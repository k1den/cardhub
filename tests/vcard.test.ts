import { describe, it, expect } from 'vitest';
import { generateVCard3 } from '@/lib/cards/vcard';

describe('vCard 3.0 Generation', () => {
  it('generates standard compliant RFC 2426 vCard string', () => {
    const vcard = generateVCard3({
      fullName: 'Иван Иванов',
      position: 'Генеральный директор',
      companyName: 'ООО Технологии',
      bio: 'Разработка ПО и NFC-решений',
      phones: ['+7 (999) 111-22-33'],
      emails: ['ivan@tech.ru'],
      websites: ['https://tech.ru'],
      telegram: '@ivan_tech',
      whatsapp: '+79991112233',
      cardUrl: 'https://cardhub.local/c/test-slug',
    });

    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('VERSION:3.0');
    expect(vcard).toContain('FN;CHARSET=UTF-8:Иван Иванов');
    expect(vcard).toContain('TITLE;CHARSET=UTF-8:Генеральный директор');
    expect(vcard).toContain('ORG;CHARSET=UTF-8:ООО Технологии');
    expect(vcard).toContain('TEL;TYPE=CELL,PREF:+79991112233');
    expect(vcard).toContain('EMAIL;TYPE=INTERNET,PREF:ivan@tech.ru');
    expect(vcard).toContain('X-SOCIALPROFILE;TYPE=telegram:https://t.me/ivan_tech');
    expect(vcard).toContain('END:VCARD');
  });

  it('escapes special characters correctly in vCard', () => {
    const vcard = generateVCard3({
      fullName: 'Иван; Сидоров, мл.',
      companyName: 'Tech, Inc; LLC',
    });

    expect(vcard).toContain('FN;CHARSET=UTF-8:Иван\\; Сидоров\\, мл.');
    expect(vcard).toContain('ORG;CHARSET=UTF-8:Tech\\, Inc\\; LLC');
  });
});
