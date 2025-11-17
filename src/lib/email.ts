import nodemailer from 'nodemailer';

// Configurar el transporter de Mailtrap
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.MAILTRAP_PORT) || 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

export async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    
    try {
        await transporter.sendMail({
            from: '"Velion" <noreply@velion.com>',
            to: email,
            subject: 'Verifica tu correo electrónico - Velion',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f9f9f9;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: white;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header {
                            background-color: #16a34a;
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .header h1 {
                            color: white;
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .button {
                            display: inline-block;
                            padding: 14px 32px;
                            background-color: #16a34a;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .button:hover {
                            background-color: #15803d;
                        }
                        .link {
                            word-break: break-all;
                            color: #666;
                            font-size: 12px;
                            background-color: #f3f4f6;
                            padding: 10px;
                            border-radius: 4px;
                            display: block;
                            margin: 10px 0;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            font-size: 12px;
                            color: #666;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>VELION</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #16a34a; margin-top: 0;">¡Bienvenido a Velion!</h2>
                            <p>Gracias por registrarte en nuestra plataforma. Para completar tu registro y comenzar a disfrutar de nuestro contenido, por favor verifica tu correo electrónico.</p>
                            <p style="text-align: center;">
                                <a href="${verificationUrl}" class="button">Verificar mi email</a>
                            </p>
                            <p style="color: #666; font-size: 14px;">O copia y pega este enlace en tu navegador:</p>
                            <div class="link">${verificationUrl}</div>
                            <div class="footer">
                                Este enlace expirará en 24 horas.<br>
                                Si no creaste esta cuenta, puedes ignorar este mensaje.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                ¡Bienvenido a Velion!
                
                Gracias por registrarte en nuestra plataforma. Para completar tu registro, visita el siguiente enlace:
                
                ${verificationUrl}
                
                Este enlace expirará en 24 horas.
                Si no creaste esta cuenta, puedes ignorar este mensaje.
            `,
        });

        console.log('✅ Email de verificación enviado a:', email);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        throw error;
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    try {
        await transporter.sendMail({
            from: '"Velion" <noreply@velion.com>',
            to: email,
            subject: 'Recupera tu contraseña - Velion',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f9f9f9;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: white;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header {
                            background-color: #16a34a;
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .header h1 {
                            color: white;
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .button {
                            display: inline-block;
                            padding: 14px 32px;
                            background-color: #16a34a;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .button:hover {
                            background-color: #15803d;
                        }
                        .link {
                            word-break: break-all;
                            color: #666;
                            font-size: 12px;
                            background-color: #f3f4f6;
                            padding: 10px;
                            border-radius: 4px;
                            display: block;
                            margin: 10px 0;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            font-size: 12px;
                            color: #666;
                            text-align: center;
                        }
                        .warning {
                            background-color: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 12px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>VELION</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #16a34a; margin-top: 0;">Recuperación de contraseña</h2>
                            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Velion.</p>
                            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                            <p style="text-align: center;">
                                <a href="${resetUrl}" class="button">Restablecer contraseña</a>
                            </p>
                            <p style="color: #666; font-size: 14px;">O copia y pega este enlace en tu navegador:</p>
                            <div class="link">${resetUrl}</div>
                            <div class="warning">
                                <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este mensaje. Tu contraseña actual seguirá siendo válida.
                            </div>
                            <div class="footer">
                                Este enlace expirará en 24 horas por seguridad.<br>
                                Si tienes problemas, contacta a soporte.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Recuperación de contraseña - Velion
                
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
                
                Visita el siguiente enlace para crear una nueva contraseña:
                ${resetUrl}
                
                Este enlace expirará en 24 horas.
                
                Si no solicitaste este cambio, ignora este mensaje.
            `,
        });

        console.log('✅ Email de recuperación enviado a:', email);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar email de recuperación:', error);
        throw error;
    }
}

// Función genérica para enviar emails
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
    try {
        await transporter.sendMail({
            from: '"Velion" <noreply@velion.com>',
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML si no hay texto plano
        });

        console.log('✅ Email enviado a:', to);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        throw error;
    }
}
