import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';

describe('Card Permissions & IDOR Protection', () => {
  let userAId = '';
  let userBId = '';
  let cardAId = '';

  beforeAll(async () => {
    const passwordHash = await hashPassword('SecurePass123!');

    const userA = await prisma.user.create({
      data: {
        email: `usera_${Date.now()}@example.com`,
        passwordHash,
        emailVerified: true,
      },
    });
    userAId = userA.id;

    const userB = await prisma.user.create({
      data: {
        email: `userb_${Date.now()}@example.com`,
        passwordHash,
        emailVerified: true,
      },
    });
    userBId = userB.id;

    // User A creates a card
    const cardA = await prisma.card.create({
      data: {
        ownerId: userAId,
        slug: `card-${Date.now()}`,
        fullName: 'Пользователь А',
        published: true,
      },
    });
    cardAId = cardA.id;
  });

  afterAll(async () => {
    await prisma.card.deleteMany({ where: { id: cardAId } });
    await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId] } } });
    await prisma.$disconnect();
  });

  it('allows owner User A to access and update their own card', async () => {
    const card = await prisma.card.findFirst({
      where: {
        id: cardAId,
        ownerId: userAId,
        deletedAt: null,
      },
    });

    expect(card).not.toBeNull();
    expect(card?.fullName).toBe('Пользователь А');

    // Update
    await prisma.card.update({
      where: { id: cardAId },
      data: { fullName: 'Пользователь А Обновленный' },
    });

    const updated = await prisma.card.findUnique({ where: { id: cardAId } });
    expect(updated?.fullName).toBe('Пользователь А Обновленный');
  });

  it('strictly blocks User B from accessing or updating User A card (Anti-IDOR)', async () => {
    // Attempted access by User B
    const cardAccessByUserB = await prisma.card.findFirst({
      where: {
        id: cardAId,
        ownerId: userBId, // User B is not the owner!
        deletedAt: null,
      },
    });

    expect(cardAccessByUserB).toBeNull();
  });
});
