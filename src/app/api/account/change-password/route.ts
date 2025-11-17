import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { changePasswordForUser } from '@/app/actions/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { password, newPassword, confirmPassword } = body;

    const result = await changePasswordForUser(session.user.id, { password, newPassword, confirmPassword });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err) {
    console.error('API change-password error:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
