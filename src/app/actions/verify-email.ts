'use server';

import { verifyEmailToken } from '@/lib/tokens';

export async function verifyEmail(token: string) {
    return await verifyEmailToken(token);
}
