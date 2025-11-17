'use server';

import { hash, compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/lib/validations/auth';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
import { changePasswordSchema } from '@/lib/validations/password';

export async function registerUser(data: RegisterInput) {
    // Validar con Zod en el servidor
    const validated = registerSchema.safeParse(data);

    if (!validated.success) {
        return {
            error: validated.error.issues[0].message
        };
    }

    const { name, email, password } = validated.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: 'Este email ya está registrado' };
        }

        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                emailVerified: null, // Email no verificado
            },
        });

        // Generar token de verificación
        const token = await generateVerificationToken(email);
        
        // Enviar email de verificación
        await sendVerificationEmail(email, token);

        return { 
            success: true, 
            userId: user.id,
            message: 'Cuenta creada. Por favor verifica tu email.' 
        };
    } catch (error) {
        console.error('Error en registro:', error);
        return { error: 'Error al crear la cuenta' };
    }
}

export async function loginUser(data: LoginInput) {
    // Validar con Zod en el servidor
    const validated = loginSchema.safeParse(data);

    if (!validated.success) {
        return {
            error: validated.error.issues[0].message
        };
    }

    const { email, password } = validated.data;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return { error: 'Credenciales inválidas' };
        }

        const isValid = await compare(password, user.password);

        if (!isValid) {
            return { error: 'Credenciales inválidas' };
        }

        // Verificar que el email esté confirmado
        if (!user.emailVerified) {
            return { error: 'Por favor verifica tu email antes de iniciar sesión' };
        }

        return { success: true, userId: user.id };
    } catch (error) {
        console.error('Error en login:', error);
        return { error: 'Error al iniciar sesión' };
    }
}

export async function resendVerificationEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return { error: 'Usuario no encontrado' };
        }

        if (user.emailVerified) {
            return { error: 'El email ya está verificado' };
        }

        // Generar nuevo token
        const token = await generateVerificationToken(email);
        
        // Reenviar email
        await sendVerificationEmail(email, token);

        return { success: true, message: 'Email de verificación reenviado' };
    } catch (error) {
        console.error('Error al reenviar email:', error);
        return { error: 'Error al reenviar el email' };
    }
}

/**
 * Cambia la contraseña de un usuario. Esta función es server-side y espera
 * el id del usuario y los datos validados (password actual, nueva y confirm).
 */
export async function changePasswordForUser(
    userId: string,
    data: { password: string; newPassword: string; confirmPassword: string }
) {
    // Validar con Zod
    const validated = changePasswordSchema.safeParse({
        password: data.password,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
    });

    if (!validated.success) {
        return { error: validated.error.issues[0].message };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.password) {
            return { error: 'Usuario no encontrado' };
        }

        // Verificar contraseña actual
        const isValid = await compare(data.password, user.password);
        if (!isValid) {
            return { error: 'La contraseña actual es incorrecta' };
        }

        // Hashear nueva contraseña y guardar
        const hashedPassword = await hash(data.newPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        return { error: 'Error al cambiar la contraseña' };
    }
}