import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { companyService } from '@/lib/company/service';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const data = await companyService.getCompanyForUser(session.user.id);

    return NextResponse.json({
      success: true,
      hasCompany: Boolean(data),
      ...data,
    });
  } catch (error: any) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении данных компании' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const { name, website, brandColor, brandFont, logoUrl, slug } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Название компании должно содержать не менее 2 символов' },
        { status: 400 }
      );
    }

    const company = await companyService.createCompany(session.user.id, {
      name: name.trim(),
      website,
      brandColor,
      brandFont,
      logoUrl,
      slug,
    });

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error: any) {
    console.error('Create company error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании компании' },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const { companyId, name, website, brandColor, brandFont, logoUrl } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'Не указан идентификатор компании' }, { status: 400 });
    }

    const updated = await companyService.updateCompany(session.user.id, companyId, {
      name,
      website,
      brandColor,
      brandFont,
      logoUrl,
    });

    return NextResponse.json({
      success: true,
      company: updated,
    });
  } catch (error: any) {
    console.error('Update company error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при обновлении настроек компании' },
      { status: 400 }
    );
  }
}
