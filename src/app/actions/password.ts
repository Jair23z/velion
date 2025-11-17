'use server';

import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordInput, type ResetPasswordInput } from '@/lib/validations/password';
import { hash } from 'bcryptjs';

export async function requestPasswordReset(data: ForgotPasswordInput) {
    const validated = forgotPasswordSchema.safeParse(data);

    if (!validated.success) {
        return {
            error: validated.error.issues[0].message
        };
    }

    const { email } = validated.data;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Devolver error si el email no existe
        if (!user) {
            return { 
                error: 'No existe una cuenta con este email' 
            };
        }

        // Generar token de reset
        const token = await generateVerificationToken(email);
        
        // Enviar email
        await sendPasswordResetEmail(email, token);

        return { 
            success: true, 
            message: 'Enlace de recuperación enviado. Revisa tu email.' 
        };
    } catch (error) {
        console.error('Error al solicitar reset:', error);
        return { error: 'Error al procesar la solicitud' };
    }
}

export async function resetPassword(token: string, data: ResetPasswordInput) {
    const validated = resetPasswordSchema.safeParse(data);

    if (!validated.success) {
        return {
            error: validated.error.issues[0].message
        };
    }

    const { password } = validated.data;

    try {
        // Verificar token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token }
        });

        if (!verificationToken) {
            return { error: 'Token inválido o expirado' };
        }

        if (verificationToken.expires < new Date()) {
            await prisma.verificationToken.delete({
                where: { token }
            });
            return { error: 'El enlace ha expirado' };
        }

        // Actualizar contraseña
        const hashedPassword = await hash(password, 12);
        
        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { password: hashedPassword }
        });

        // Eliminar token usado
        await prisma.verificationToken.delete({
            where: { token }
        });

        return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
        console.error('Error al resetear contraseña:', error);
        return { error: 'Error al actualizar la contraseña' };
    }
}
