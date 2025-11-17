import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Genera una firma manual para URLs de Cloudinary
 * Esto crea una URL que expira y solo puede ser generada por el servidor
 */
function generateSignature(publicId: string, transformation: string, timestamp: number): string {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET no configurado');
  }

  // Crear string para firmar según documentación de Cloudinary
  const stringToSign = `${transformation}${publicId}${timestamp}${apiSecret}`;
  
  // Generar SHA-256 hash
  const signature = crypto
    .createHash('sha256')
    .update(stringToSign)
    .digest('hex')
    .substring(0, 8); // Cloudinary usa los primeros 8 caracteres

  return signature;
}

/**
 * Genera una URL firmada de Cloudinary con expiración
 * @param publicId - ID del video en Cloudinary (ej: "The_Matrix_qj2a3u")
 * @param isPremium - Si el usuario tiene suscripción Premium
 * @returns URL firmada que expira
 */
export function getSignedVideoUrl(publicId: string, isPremium: boolean): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME no configurado');
  }

  // Timestamp actual (en segundos)
  const timestamp = Math.floor(Date.now() / 1000);

  if (isPremium) {
    // Usuario Premium: video completo con firma
    const transformation = 'q_auto,f_auto';
    const signature = generateSignature(publicId, transformation, timestamp);
    
    return `https://res.cloudinary.com/${cloudName}/video/upload/s--${signature}--/${transformation}/${publicId}.mp4`;
  } else {
    // Usuario Free: 15 segundos con firma
    const transformation = 'du_15,q_auto,f_auto';
    const signature = generateSignature(publicId, transformation, timestamp);
    
    return `https://res.cloudinary.com/${cloudName}/video/upload/s--${signature}--/${transformation}/${publicId}.mp4`;
  }
}

export default cloudinary;
