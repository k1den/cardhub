import { prisma } from '@/lib/prisma';
import { MemberRole, MemberStatus, ConsentType, UserRole } from '@prisma/client';
import { generateSecureToken, hashToken } from '@/lib/auth/tokens';
import { generateRandomSlug } from '@/lib/cards/slug';

export interface CreateCompanyInput {
  name: string;
  website?: string;
  brandColor?: string;
  brandSecondaryColor?: string;
  brandFont?: string;
  logoUrl?: string;
  coverUrl?: string;
  tagline?: string;
  brandPattern?: string;
  themeConfig?: any;
  slug?: string;
}

export interface UpdateCompanyInput {
  name?: string;
  website?: string;
  brandColor?: string;
  brandSecondaryColor?: string;
  brandFont?: string;
  logoUrl?: string;
  coverUrl?: string;
  tagline?: string;
  brandPattern?: string;
  themeConfig?: any;
  slug?: string;
}

export class CompanyService {
  /**
   * Get company for user (as OWNER or active MEMBER)
   */
  async getCompanyForUser(userId: string) {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        status: MemberStatus.ACTIVE,
      },
      include: {
        company: {
          include: {
            memberships: {
              where: { status: MemberStatus.ACTIVE },
              include: {
                user: {
                  select: { id: true, email: true, role: true },
                },
              },
            },
            cards: {
              where: { deletedAt: null },
              include: {
                owner: {
                  select: { id: true, email: true },
                },
                fields: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            invitations: {
              where: { acceptedAt: null, expiresAt: { gt: new Date() } },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!membership || !membership.company) {
      return null;
    }

    return {
      company: membership.company,
      role: membership.role,
      isOwner: membership.role === MemberRole.OWNER,
    };
  }

  /**
   * Create a company for a PRO user
   */
  async createCompany(userId: string, data: CreateCompanyInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
        },
      },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Check if user has active Pro subscription or platform ADMIN or PRO role
    const isPro =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.PRO ||
      user.subscriptions.some((s) => s.plan.code === 'PRO');

    if (!isPro) {
      throw new Error('Создание компании доступно только на тарифе Pro');
    }

    // Check if user already owns a company
    const existingMembership = await prisma.membership.findFirst({
      where: {
        userId,
        role: MemberRole.OWNER,
      },
      include: { company: true },
    });

    if (existingMembership && !existingMembership.company.deletedAt) {
      throw new Error('У вас уже есть созданная компания');
    }

    // Generate or format company slug
    const companySlug =
      data.slug?.toLowerCase().trim() ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]/gi, '-')
        .replace(/-+/g, '-')
        .slice(0, 30) ||
      generateRandomSlug(8);

    const company = await prisma.$transaction(async (tx) => {
      const comp = await tx.company.create({
        data: {
          name: data.name.trim(),
          website: data.website?.trim() || null,
          brandColor: data.brandColor || '#d97706',
          brandSecondaryColor: data.brandSecondaryColor || '#ea580c',
          brandFont: data.brandFont || 'sans',
          logoUrl: data.logoUrl || null,
          coverUrl: data.coverUrl || null,
          tagline: data.tagline?.trim() || null,
          brandPattern: data.brandPattern || 'smooth',
          themeConfig: data.themeConfig || null,
          slug: companySlug,
        },
      });

      await tx.membership.create({
        data: {
          userId,
          companyId: comp.id,
          role: MemberRole.OWNER,
          status: MemberStatus.ACTIVE,
        },
      });

      // Also assign existing user card to this company if exists
      const userCard = await tx.card.findFirst({
        where: { ownerId: userId, deletedAt: null },
      });

      if (userCard) {
        await tx.card.update({
          where: { id: userCard.id },
          data: {
            companyId: comp.id,
            companyName: comp.name,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: userId,
          companyId: comp.id,
          targetType: 'Company',
          targetId: comp.id,
          action: 'COMPANY_CREATED',
          details: { name: comp.name },
        },
      });

      return comp;
    });

    return company;
  }

  /**
   * Update company settings and corporate branding
   */
  async updateCompany(userId: string, companyId: string, data: UpdateCompanyInput) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: { userId, companyId },
      },
    });

    if (!membership || membership.role !== MemberRole.OWNER) {
      throw new Error('Недостаточно прав для изменения настроек компании');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const comp = await tx.company.update({
        where: { id: companyId },
        data: {
          name: data.name?.trim(),
          website: data.website !== undefined ? data.website.trim() || null : undefined,
          brandColor: data.brandColor,
          brandSecondaryColor: data.brandSecondaryColor !== undefined ? data.brandSecondaryColor : undefined,
          brandFont: data.brandFont,
          logoUrl: data.logoUrl !== undefined ? data.logoUrl || null : undefined,
          coverUrl: data.coverUrl !== undefined ? data.coverUrl || null : undefined,
          tagline: data.tagline !== undefined ? data.tagline?.trim() || null : undefined,
          brandPattern: data.brandPattern !== undefined ? data.brandPattern : undefined,
          themeConfig: data.themeConfig !== undefined ? data.themeConfig : undefined,
        },
      });

      // Update corporate companyName on all connected company cards
      if (data.name) {
        await tx.card.updateMany({
          where: { companyId, deletedAt: null },
          data: { companyName: data.name.trim() },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: userId,
          companyId,
          targetType: 'Company',
          targetId: companyId,
          action: 'COMPANY_BRANDING_UPDATED',
          details: data as any,
        },
      });

      return comp;
    });

    return updated;
  }

  /**
   * Send 7-day employee invitation link
   */
  async createInvitation(ownerId: string, companyId: string, email: string) {
    const cleanEmail = email.toLowerCase().trim();

    // Verify ownership
    const membership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: ownerId, companyId } },
      include: {
        company: {
          include: {
            memberships: { where: { status: MemberStatus.ACTIVE } },
            invitations: { where: { acceptedAt: null, expiresAt: { gt: new Date() } } },
          },
        },
      },
    });

    if (!membership || membership.role !== MemberRole.OWNER) {
      throw new Error('Только администратор компании может приглашать сотрудников');
    }

    // Limit check (10 members by default on Pro plan)
    const activeMembersCount = membership.company.memberships.length;
    const pendingInvitesCount = membership.company.invitations.length;
    const maxMembers = 10;

    if (activeMembersCount + pendingInvitesCount >= maxMembers) {
      throw new Error(
        `Достигнут лимит сотрудников компании (${maxMembers} мест). Освободите слот или отмените неиспользованные приглашения.`
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.membership.findFirst({
      where: {
        companyId,
        user: { email: cleanEmail },
        status: MemberStatus.ACTIVE,
      },
    });

    if (existingMember) {
      throw new Error('Этот пользователь уже является сотрудником компании');
    }

    // 7-day token per TZ Section 4.5
    const { token, tokenHash } = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Invalidate existing pending invites to this email
    await prisma.invitation.deleteMany({
      where: {
        companyId,
        email: cleanEmail,
        acceptedAt: null,
      },
    });

    const invitation = await prisma.invitation.create({
      data: {
        companyId,
        email: cleanEmail,
        tokenHash,
        expiresAt,
      },
      include: {
        company: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: ownerId,
        companyId,
        targetType: 'Invitation',
        targetId: invitation.id,
        action: 'COMPANY_MEMBER_INVITED',
        details: { email: cleanEmail, expiresAt: expiresAt.toISOString() },
      },
    }).catch(() => {});

    return {
      invitation,
      token,
      expiresAt,
    };
  }

  /**
   * Cancel / revoke a pending invitation
   */
  async cancelInvitation(ownerId: string, companyId: string, invitationId: string) {
    const membership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: ownerId, companyId } },
    });

    if (!membership || membership.role !== MemberRole.OWNER) {
      throw new Error('Недостаточно прав');
    }

    await prisma.invitation.deleteMany({
      where: {
        id: invitationId,
        companyId,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: ownerId,
        companyId,
        targetType: 'Invitation',
        targetId: invitationId,
        action: 'COMPANY_INVITATION_CANCELED',
      },
    }).catch(() => {});

    return { success: true };
  }

  /**
   * Get invitation by raw token string
   */
  async getInvitationByToken(token: string) {
    const tokenHash = hashToken(token);

    const invitation = await prisma.invitation.findUnique({
      where: { tokenHash },
      include: {
        company: true,
      },
    });

    if (!invitation) {
      return null;
    }

    const isExpired = new Date() > invitation.expiresAt;
    const isAccepted = Boolean(invitation.acceptedAt);

    return {
      invitation,
      isExpired,
      isAccepted,
      valid: !isExpired && !isAccepted,
    };
  }

  /**
   * Accept invitation with mandatory consent (Section 4.5 & 152-FZ)
   */
  async acceptInvitation(
    userId: string,
    token: string,
    consentGiven: boolean,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!consentGiven) {
      throw new Error(
        'Для присоединения к компании необходимо подтвердить согласие на управление визиткой администратором'
      );
    }

    const tokenHash = hashToken(token);
    const invitation = await prisma.invitation.findUnique({
      where: { tokenHash },
      include: { company: true },
    });

    if (!invitation) {
      throw new Error('Приглашение не найдено или недействительно');
    }

    if (invitation.acceptedAt) {
      throw new Error('Это приглашение уже было использовано');
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error('Срок действия приглашения (7 дней) истек');
    }

    const companyId = invitation.companyId;

    // Check if user is already in another company (Section 3: max 1 company at a time)
    const currentMembership = await prisma.membership.findFirst({
      where: {
        userId,
        status: MemberStatus.ACTIVE,
      },
      include: { company: true },
    });

    if (currentMembership && currentMembership.companyId !== companyId) {
      throw new Error(
        `Вы уже состоите в компании «${currentMembership.company.name}». Чтобы присоединиться к новой компании, сначала покиньте текущую.`
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark invitation accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      // 2. Create or update Membership
      const membership = await tx.membership.upsert({
        where: {
          userId_companyId: { userId, companyId },
        },
        update: {
          status: MemberStatus.ACTIVE,
          role: MemberRole.MEMBER,
        },
        create: {
          userId,
          companyId,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACTIVE,
        },
      });

      // 3. Store 152-FZ consent for company card management & distribution
      await tx.consent.create({
        data: {
          userId,
          consentType: ConsentType.PD_DISTRIBUTION,
          documentVersion: '1.0',
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
        },
      });

      // 4. Connect employee's card to company
      const employeeCard = await tx.card.findFirst({
        where: { ownerId: userId, deletedAt: null },
      });

      if (employeeCard) {
        await tx.card.update({
          where: { id: employeeCard.id },
          data: {
            companyId,
            companyName: invitation.company.name,
          },
        });
      }

      // 5. Audit Log entry
      await tx.auditLog.create({
        data: {
          actorId: userId,
          companyId,
          targetType: 'Membership',
          targetId: membership.id,
          action: 'COMPANY_MEMBER_JOINED',
          details: { email: invitation.email, consentGiven: true },
        },
      });

      return membership;
    });

    return result;
  }

  /**
   * Remove member from company (Section 4.5 & 3)
   * The card remains with the employee, but company branding is stripped and companyId cleared.
   */
  async removeMember(ownerId: string, companyId: string, memberUserId: string) {
    const ownerMembership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: ownerId, companyId } },
    });

    if (!ownerMembership || ownerMembership.role !== MemberRole.OWNER) {
      throw new Error('Только владелец компании может удалять сотрудников');
    }

    if (ownerId === memberUserId) {
      throw new Error('Владелец компании не может удалить самого себя');
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete membership
      await tx.membership.deleteMany({
        where: {
          userId: memberUserId,
          companyId,
        },
      });

      // 2. Unlink all company cards belonging to this member (branding stripped)
      await tx.card.updateMany({
        where: {
          ownerId: memberUserId,
          companyId,
        },
        data: {
          companyId: null,
          companyName: null,
        },
      });

      // 3. Write Audit Log
      await tx.auditLog.create({
        data: {
          actorId: ownerId,
          companyId,
          targetType: 'Membership',
          targetId: memberUserId,
          action: 'COMPANY_MEMBER_REMOVED',
          details: { removedUserId: memberUserId },
        },
      });
    });

    return { success: true };
  }

  /**
   * Employee leaves company willingly (Section 4.5 & 3)
   */
  async leaveCompany(userId: string) {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new Error('Вы не состоите в компании в качестве сотрудника');
    }

    const companyId = membership.companyId;

    await prisma.$transaction(async (tx) => {
      await tx.membership.delete({
        where: { id: membership.id },
      });

      // Unlink cards
      await tx.card.updateMany({
        where: {
          ownerId: userId,
          companyId,
        },
        data: {
          companyId: null,
          companyName: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          companyId,
          targetType: 'Membership',
          targetId: userId,
          action: 'COMPANY_MEMBER_LEFT',
          details: { leftUserId: userId },
        },
      });
    });

    return { success: true };
  }

  /**
   * Admin edits employee's card (writes to AuditLog visible to employee)
   */
  async editEmployeeCard(
    adminId: string,
    companyId: string,
    cardId: string,
    changes: {
      fullName?: string;
      position?: string;
      companyName?: string;
      bio?: string;
      published?: boolean;
    }
  ) {
    const adminMembership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: adminId, companyId } },
    });

    if (!adminMembership || adminMembership.role !== MemberRole.OWNER) {
      throw new Error('Только администратор компании может редактировать визитки сотрудников');
    }

    const card = await prisma.card.findFirst({
      where: { id: cardId, companyId, deletedAt: null },
    });

    if (!card) {
      throw new Error('Визитка сотрудника не найдена в этой компании');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.card.update({
        where: { id: cardId },
        data: changes,
      });

      // Write Audit Log (Section 4.5: logged and visible to employee)
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          companyId,
          targetType: 'Card',
          targetId: cardId,
          action: 'COMPANY_ADMIN_EDITED_CARD',
          details: {
            ownerId: card.ownerId,
            changes,
          },
        },
      });

      return c;
    });

    return updated;
  }

  /**
   * Get audit logs for company (admin sees all, employee sees logs regarding their own card/membership)
   */
  async getAuditLogs(userId: string, companyId: string) {
    const membership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (!membership) {
      throw new Error('Нет доступа к журналу компании');
    }

    if (membership.role === MemberRole.OWNER) {
      return prisma.auditLog.findMany({
        where: { companyId },
        include: {
          actor: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    // Employee sees only actions touching their cards or their membership
    const userCards = await prisma.card.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const cardIds = userCards.map((c) => c.id);

    return prisma.auditLog.findMany({
      where: {
        companyId,
        OR: [
          { targetType: 'Card', targetId: { in: cardIds } },
          { targetType: 'Membership', targetId: userId },
          { actorId: userId },
        ],
      },
      include: {
        actor: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Generate CSV with all company business card links with ?s=nfc (Section 4.4 & 4.5)
   */
  async generateBatchNfcCsv(ownerId: string, companyId: string) {
    const membership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: ownerId, companyId } },
    });

    if (!membership || membership.role !== MemberRole.OWNER) {
      throw new Error('Только администратор компании может экспортировать ссылки');
    }

    const cards = await prisma.card.findMany({
      where: { companyId, deletedAt: null },
      include: {
        owner: { select: { email: true } },
      },
      orderBy: { fullName: 'asc' },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // UTF-8 BOM for Excel compatibility in Russia
    const bom = '\uFEFF';
    const header = 'Имя сотрудника;Должность;Email;URL для NFC-метки;Адрес визитки\n';

    const rows = cards.map((c) => {
      const nfcUrl = `${appUrl}/c/${c.slug}?s=nfc`;
      const webUrl = `${appUrl}/c/${c.slug}`;
      const name = (c.fullName || '').replace(/;/g, ',');
      const pos = (c.position || '').replace(/;/g, ',');
      const email = c.owner.email;

      return `"${name}";"${pos}";"${email}";"${nfcUrl}";"${webUrl}"`;
    });

    return bom + header + rows.join('\n');
  }
}

export const companyService = new CompanyService();
