import { prisma } from './prisma';
import { randomBytes } from 'crypto';

export async function generateVerificationToken(email: string) {
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Eliminar tokens anteriores para este email
    await prisma.verificationToken.deleteMany({
        where: { identifier: email }
    });

    // Crear nuevo token
    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires
        }
    });

    return token;
}

export async function verifyEmailToken(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token }
    });

    if (!verificationToken) {
        return { error: 'Token inválido' };
    }

    if (verificationToken.expires < new Date()) {
        await prisma.verificationToken.delete({
            where: { token }
        });
        return { error: 'Token expirado' };
    }

    // Actualizar el usuario como verificado
    await prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() }
    });

    // Eliminar el token usado
    await prisma.verificationToken.delete({
        where: { token }
    });

    return { success: true, email: verificationToken.identifier };
}
