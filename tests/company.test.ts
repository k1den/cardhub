import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { companyService } from '@/lib/company/service';
import { UserRole, MemberRole, MemberStatus } from '@prisma/client';

describe('Stage 5: Pro Companies, 7-day Invitations, 152-FZ Consent & Audit Logs', () => {
  let ownerId = '';
  let employeeId = '';
  let otherAdminId = '';
  let companyId = '';
  let invitationToken = '';
  let employeeCardId = '';

  beforeAll(async () => {
    const passwordHash = await hashPassword('SecurePass123!');

    // 1. Company Owner (Pro user)
    const owner = await prisma.user.create({
      data: {
        email: `comp_owner_${Date.now()}@example.com`,
        passwordHash,
        emailVerified: true,
        role: UserRole.PRO,
      },
    });
    ownerId = owner.id;

    // 2. Future Employee (Regular user)
    const employee = await prisma.user.create({
      data: {
        email: `comp_emp_${Date.now()}@example.com`,
        passwordHash,
        emailVerified: true,
        role: UserRole.USER,
      },
    });
    employeeId = employee.id;

    // Employee's existing personal card
    const card = await prisma.card.create({
      data: {
        ownerId: employeeId,
        slug: `emp-card-${Date.now()}`,
        fullName: 'Иван Сотрудник',
        position: 'Менеджер проектов',
        published: true,
      },
    });
    employeeCardId = card.id;

    // 3. Admin of a different company (for IDOR isolation testing)
    const otherAdmin = await prisma.user.create({
      data: {
        email: `other_admin_${Date.now()}@example.com`,
        passwordHash,
        emailVerified: true,
        role: UserRole.PRO,
      },
    });
    otherAdminId = otherAdmin.id;
  });

  afterAll(async () => {
    await prisma.card.deleteMany({ where: { ownerId: { in: [ownerId, employeeId, otherAdminId] } } });
    await prisma.invitation.deleteMany({ where: { companyId } });
    await prisma.membership.deleteMany({ where: { companyId } });
    await prisma.auditLog.deleteMany({ where: { companyId } });
    if (companyId) {
      await prisma.company.deleteMany({ where: { id: companyId } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, employeeId, otherAdminId] } } });
    await prisma.$disconnect();
  });

  it('allows Pro user to create a company with branding', async () => {
    const company = await companyService.createCompany(ownerId, {
      name: 'ООО Инновации',
      website: 'https://innovations.ru',
      brandColor: '#4f46e5',
      brandFont: 'sans',
    });

    companyId = company.id;
    expect(company.name).toBe('ООО Инновации');
    expect(company.brandColor).toBe('#4f46e5');

    // Verify owner membership
    const membership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: ownerId, companyId } },
    });
    expect(membership).not.toBeNull();
    expect(membership?.role).toBe(MemberRole.OWNER);
  });

  it('rejects company creation for non-Pro users without Pro subscription', async () => {
    await expect(
      companyService.createCompany(employeeId, {
        name: 'Недопустимая компания',
      })
    ).rejects.toThrow('Создание компании доступно только на тарифе Pro');
  });

  it('generates a 7-day employee invitation with secure token hash', async () => {
    const result = await companyService.createInvitation(
      ownerId,
      companyId,
      `comp_emp_${Date.now()}@example.com`
    );

    invitationToken = result.token;
    expect(result.token).toBeDefined();
    expect(result.invitation.companyId).toBe(companyId);

    // Verify 7-day expiry (within 1 minute margin of 7 days)
    const expectedExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const actualExpiry = result.expiresAt.getTime();
    expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(60000);

    // Verify retrieval by token
    const fetched = await companyService.getInvitationByToken(invitationToken);
    expect(fetched?.valid).toBe(true);
    expect(fetched?.invitation.companyId).toBe(companyId);
  });

  it('strictly rejects invitation acceptance without explicit 152-FZ consent', async () => {
    await expect(
      companyService.acceptInvitation(employeeId, invitationToken, false)
    ).rejects.toThrow('согласие на управление визиткой');
  });

  it('accepts invitation with explicit consent and connects employee card to company', async () => {
    const membership = await companyService.acceptInvitation(
      employeeId,
      invitationToken,
      true,
      '127.0.0.1',
      'Vitest-Runner'
    );

    expect(membership.companyId).toBe(companyId);
    expect(membership.role).toBe(MemberRole.MEMBER);

    // Verify employee card now has companyId and companyName attached
    const updatedCard = await prisma.card.findUnique({
      where: { id: employeeCardId },
    });
    expect(updatedCard?.companyId).toBe(companyId);
    expect(updatedCard?.companyName).toBe('ООО Инновации');

    // Verify 152-FZ consent recorded
    const consent = await prisma.consent.findFirst({
      where: { userId: employeeId },
    });
    expect(consent).not.toBeNull();
  });

  it('logs admin edits to employee card and allows employee to view card audit log', async () => {
    // Admin edits employee card position
    await companyService.editEmployeeCard(ownerId, companyId, employeeCardId, {
      position: 'Ведущий архитектор',
    });

    const updatedCard = await prisma.card.findUnique({
      where: { id: employeeCardId },
    });
    expect(updatedCard?.position).toBe('Ведущий архитектор');

    // Employee checks audit log
    const employeeLogs = await companyService.getAuditLogs(employeeId, companyId);
    expect(employeeLogs.length).toBeGreaterThan(0);

    const editLog = employeeLogs.find((l) => l.action === 'COMPANY_ADMIN_EDITED_CARD');
    expect(editLog).toBeDefined();
    expect(editLog?.targetId).toBe(employeeCardId);
  });

  it('prevents cross-company admin access (Anti-IDOR protection)', async () => {
    // Admin of Company B attempts to edit Company A employee's card
    await expect(
      companyService.editEmployeeCard(otherAdminId, companyId, employeeCardId, {
        position: 'Хакерская должность',
      })
    ).rejects.toThrow('Только администратор компании может редактировать визитки сотрудников');

    // Admin B attempts to remove Member from Company A
    await expect(
      companyService.removeMember(otherAdminId, companyId, employeeId)
    ).rejects.toThrow('Только владелец компании может удалять сотрудников');
  });

  it('exports batch NFC links in CSV with UTF-8 BOM and ?s=nfc parameter', async () => {
    const csv = await companyService.generateBatchNfcCsv(ownerId, companyId);

    // Check UTF-8 BOM
    expect(csv.startsWith('\uFEFF')).toBe(true);
    // Check header
    expect(csv).toContain('Имя сотрудника;Должность;Email;URL для NFC-метки;Адрес визитки');
    // Check ?s=nfc in card links
    expect(csv).toContain('?s=nfc');
    expect(csv).toContain('Иван Сотрудник');
  });

  it('strips company branding and unlinks companyId when employee leaves or is removed, keeping card with employee', async () => {
    // Employee leaves company
    await companyService.leaveCompany(employeeId);

    // Verify membership deleted
    const memberRecord = await prisma.membership.findFirst({
      where: { userId: employeeId, companyId },
    });
    expect(memberRecord).toBeNull();

    // Verify card remains with employee, but companyId and companyName are null
    const cardAfterLeave = await prisma.card.findUnique({
      where: { id: employeeCardId },
    });
    expect(cardAfterLeave?.ownerId).toBe(employeeId); // Card still belongs to employee!
    expect(cardAfterLeave?.companyId).toBeNull(); // Detached from company
    expect(cardAfterLeave?.companyName).toBeNull(); // Branding stripped
  });
});
