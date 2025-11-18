/*
 Simple test script to send an email via Resend API.
 Usage (PowerShell):
   $env:RESEND_API_KEY="re_..."; $env:EMAIL_FROM="Velion <noreply@tu-dominio.com>"; $env:TEST_TO="dest@example.com"; node scripts/test-send-email.js

 This script does NOT store your API key in the repo. Set the RESEND_API_KEY env var locally when running.
*/

const rawKey = process.env.RESEND_API_KEY || '';
console.log(rawKey);

const key = rawKey.trim();
const from = (process.env.EMAIL_FROM || 'Velion <noreply@velion.com>').trim();
const to = (process.env.TEST_TO || process.argv[2] || '').trim();
const subject = process.env.TEST_SUBJECT || 'Prueba de email desde Velion';
const body = process.env.TEST_BODY || '<p>Este es un email de prueba enviado desde Resend.</p>';

if (!key) {
  console.error('RESEND_API_KEY no está definido. Exporta la variable y vuelve a intentar.');
  process.exit(1);
}
if (!to) {
  console.error('Destinatario no especificado. Usa TEST_TO env var o pasa el email como argumento.');
  console.error('Ej: node scripts/test-send-email.js destino@ejemplo.com');
  process.exit(1);
}

(async () => {
  try {
    const payload = { from, to, subject, html: body };
    console.log('Enviando prueba con payload:', JSON.stringify({ from, to, subject }));
    console.log('Usando RESEND_API_KEY prefix:', key.slice(0, 6) + '...');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('Respuesta HTTP:', res.status, res.statusText);
      console.error('Cuerpo de la respuesta:', text);
      process.exit(1);
    }

    try {
      const data = JSON.parse(text);
      console.log('Email enviado. Resend response:', data);
    } catch (parseErr) {
      console.log('Email enviado. Resend respuesta (no JSON):', text);
    }
  } catch (err) {
    console.error('Error enviando email de prueba:', err);
    process.exit(1);
  }
})();
