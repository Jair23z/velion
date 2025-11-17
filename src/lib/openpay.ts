// Configuración de OpenPay
const Openpay = require('openpay');

// Credenciales
const MERCHANT_ID = process.env.OPENPAY_MERCHANT_ID;
const PRIVATE_KEY = process.env.OPENPAY_PRIVATE_KEY;
const IS_SANDBOX = process.env.OPENPAY_SANDBOX === 'true';

// Debug: Verificar que las variables de entorno se carguen correctamente
console.log('🔑 Verificando credenciales de OpenPay:');
console.log('Merchant ID completo:', MERCHANT_ID);
console.log('Private Key completo:', PRIVATE_KEY);
console.log('Is Sandbox:', IS_SANDBOX);

if (!MERCHANT_ID || !PRIVATE_KEY) {
  throw new Error('❌ Faltan credenciales de OpenPay en las variables de entorno');
}

// Inicializar OpenPay con configuración completa
const openpay = new Openpay(MERCHANT_ID, PRIVATE_KEY, IS_SANDBOX);

// Configurar la URL base según el ambiente
if (IS_SANDBOX) {
  openpay.setProductionReady(false);
} else {
  openpay.setProductionReady(true);
}

console.log('✅ OpenPay inicializado correctamente');
console.log('🌐 Modo:', IS_SANDBOX ? 'Sandbox (Pruebas)' : 'Producción');

export default openpay;
