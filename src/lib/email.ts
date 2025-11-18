import nodemailer from 'nodemailer';

type EmailOptions = { to: string; subject: string; html: string; text?: string };

const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase();
const EMAIL_FROM = process.env.EMAIL_FROM || 'Velion <noreply@velion.com>';

// Nodemailer transporter (fallback / development via Mailtrap)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || Number(process.env.MAILTRAP_PORT) || 2525,
    auth: {
        user: process.env.SMTP_USER || process.env.MAILTRAP_USER,
        pass: process.env.SMTP_PASS || process.env.MAILTRAP_PASS,
    },
});

async function sendViaResend({ to, subject, html, text }: EmailOptions) {
    const key = (process.env.RESEND_API_KEY || '').trim();
    if (!key) throw new Error('RESEND_API_KEY is not set');

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: EMAIL_FROM, to, subject, html, text: text ?? html.replace(/<[^>]*>/g, '') }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Resend error: ${res.status} ${body}`);
    }

    return true;
}

async function sendViaSendGrid({ to, subject, html }: EmailOptions) {
    const key = (process.env.SENDGRID_API_KEY || '').trim();
    if (!key) throw new Error('SENDGRID_API_KEY is not set');

    const payload = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: EMAIL_FROM.replace(/.*<|>.*/g, '') || EMAIL_FROM },
        subject,
        content: [{ type: 'text/html', value: html }],
    };

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`SendGrid error: ${res.status} ${body}`);
    }

    return true;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
    try {
        if (EMAIL_PROVIDER === 'resend') {
            return await sendViaResend({ to, subject, html, text });
        }

        if (EMAIL_PROVIDER === 'sendgrid') {
            return await sendViaSendGrid({ to, subject, html, text });
        }

        // Fallback: SMTP
        await transporter.sendMail({ from: EMAIL_FROM, to, subject, html, text: text ?? html.replace(/<[^>]*>/g, '') });
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background-color: #16a34a; padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; padding: 14px 32px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .button:hover { background-color: #15803d; }
        .link { word-break: break-all; color: #666; font-size: 12px; background-color: #f3f4f6; padding: 10px; border-radius: 4px; display: block; margin: 10px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>VELION</h1></div>
        <div class="content">
            <h2 style="color: #16a34a; margin-top: 0;">¡Bienvenido a Velion!</h2>
            <p>Gracias por registrarte en nuestra plataforma. Para completar tu registro y comenzar a disfrutar de nuestro contenido, por favor verifica tu correo electrónico.</p>
            <p style="text-align: center;"><a href="${verificationUrl}" class="button">Verificar mi email</a></p>
            <p style="color: #666; font-size: 14px;">O copia y pega este enlace en tu navegador:</p>
            <div class="link">${verificationUrl}</div>
            <div class="footer">Este enlace expirará en 24 horas.<br>Si no creaste esta cuenta, puedes ignorar este mensaje.</div>
        </div>
    </div>
</body>
</html>`;

    const text = `¡Bienvenido a Velion!\n\nGracias por registrarte en nuestra plataforma. Para completar tu registro, visita el siguiente enlace:\n\n${verificationUrl}\n\nEste enlace expirará en 24 horas.`;

    return sendEmail({ to: email, subject: 'Verifica tu correo electrónico - Velion', html, text });
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background-color: #16a34a; padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; padding: 14px 32px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .button:hover { background-color: #15803d; }
        .link { word-break: break-all; color: #666; font-size: 12px; background-color: #f3f4f6; padding: 10px; border-radius: 4px; display: block; margin: 10px 0; }
        .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>VELION</h1></div>
        <div class="content">
            <h2 style="color: #16a34a; margin-top: 0;">Recuperación de contraseña</h2>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Velion.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <p style="text-align: center;"><a href="${resetUrl}" class="button">Restablecer contraseña</a></p>
            <p style="color: #666; font-size: 14px;">O copia y pega este enlace en tu navegador:</p>
            <div class="link">${resetUrl}</div>
            <div class="warning"><strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este mensaje. Tu contraseña actual seguirá siendo válida.</div>
            <div class="footer">Este enlace expirará en 24 horas por seguridad.<br>Si tienes problemas, contacta a soporte.</div>
        </div>
    </div>
</body>
</html>`;

    const text = `Recuperación de contraseña - Velion\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta. Visita el siguiente enlace para crear una nueva contraseña: ${resetUrl}\n\nEste enlace expirará en 24 horas.`;

    return sendEmail({ to: email, subject: 'Recupera tu contraseña - Velion', html, text });
}
