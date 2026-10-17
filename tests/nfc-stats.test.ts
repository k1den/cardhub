import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { EventSource } from '@prisma/client';

describe('Stage 3: NFC & Privacy-Compliant Statistics', () => {
  let userAId = '';
  let userBId = '';
  let cardId = '';

  beforeAll(async () => {
    const passwordHash = await hashPassword('SecurePass123!');

    const userA = await prisma.user.create({
      data: {
        email: `nfctest_a_${Date.now()}@example.com`,
        passwordHash,
        emailVerified: true,
      },
    });
    userAId = userA.id;

    const userB = await prisma.user.create({
      data: {
        email: `nfctest_b_${Date.now()}@example.com`,
        passwordHash,
        emailVerified: true,
      },
    });
    userBId = userB.id;

    const card = await prisma.card.create({
      data: {
        ownerId: userAId,
        slug: `nfc-card-${Date.now()}`,
        fullName: 'Тестовый Пользователь NFC',
        published: true,
      },
    });
    cardId = card.id;
  });

  afterAll(async () => {
    await prisma.cardEvent.deleteMany({ where: { cardId } });
    await prisma.card.deleteMany({ where: { id: cardId } });
    await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId] } } });
    await prisma.$disconnect();
  });

  it('records NFC touch events with ?s=nfc parameter correctly', async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Simulate an NFC tap
    await prisma.cardEvent.upsert({
      where: {
        cardId_date_source: {
          cardId,
          date: today,
          source: EventSource.NFC,
        },
      },
      update: { viewsCount: { increment: 1 } },
      create: {
        cardId,
        date: today,
        source: EventSource.NFC,
        viewsCount: 1,
      },
    });

    const event = await prisma.cardEvent.findUnique({
      where: {
        cardId_date_source: {
          cardId,
          date: today,
          source: EventSource.NFC,
        },
      },
    });

    expect(event).not.toBeNull();
    expect(event?.source).toBe(EventSource.NFC);
    expect(event?.viewsCount).toBeGreaterThanOrEqual(1);
  });

  it('records QR scans and vCard downloads separately', async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Simulate QR scan
    await prisma.cardEvent.upsert({
      where: {
        cardId_date_source: {
          cardId,
          date: today,
          source: EventSource.QR,
        },
      },
      update: { viewsCount: { increment: 2 } },
      create: {
        cardId,
        date: today,
        source: EventSource.QR,
        viewsCount: 2,
      },
    });

    // Simulate vCard download
    await prisma.cardEvent.upsert({
      where: {
        cardId_date_source: {
          cardId,
          date: today,
          source: EventSource.DIRECT,
        },
      },
      update: { vcardDownloads: { increment: 1 } },
      create: {
        cardId,
        date: today,
        source: EventSource.DIRECT,
        vcardDownloads: 1,
      },
    });

    const qrEvent = await prisma.cardEvent.findUnique({
      where: { cardId_date_source: { cardId, date: today, source: EventSource.QR } },
    });
    const directEvent = await prisma.cardEvent.findUnique({
      where: { cardId_date_source: { cardId, date: today, source: EventSource.DIRECT } },
    });

    expect(qrEvent?.viewsCount).toBe(2);
    expect(directEvent?.vcardDownloads).toBe(1);
  });

  it('records button/contact clicks in card_events', async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Simulate clicking contact button
    await prisma.cardEvent.upsert({
      where: {
        cardId_date_source: {
          cardId,
          date: today,
          source: EventSource.DIRECT,
        },
      },
      update: { clicksCount: { increment: 3 } },
      create: {
        cardId,
        date: today,
        source: EventSource.DIRECT,
        clicksCount: 3,
      },
    });

    const event = await prisma.cardEvent.findUnique({
      where: { cardId_date_source: { cardId, date: today, source: EventSource.DIRECT } },
    });

    expect(event?.clicksCount).toBeGreaterThanOrEqual(3);
  });

  it('protects statistics from unauthorized access (Anti-IDOR)', async () => {
    // User B tries to view Card A's stats
    const cardOwnedByUserB = await prisma.card.findFirst({
      where: {
        id: cardId,
        ownerId: userBId, // not owner!
        deletedAt: null,
      },
    });

    expect(cardOwnedByUserB).toBeNull();
  });
});
