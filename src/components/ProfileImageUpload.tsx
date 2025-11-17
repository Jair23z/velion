'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProfileImageUploadProps {
  currentImage: string | null;
  userName: string | null;
}

export default function ProfileImageUpload({ currentImage, userName }: ProfileImageUploadProps) {
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);

      // Subir a la API
      const response = await fetch('/api/account/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      // Actualizar la sesión de NextAuth con la nueva imagen
      await update({
        ...data,
        image: data.imageUrl
      });

      // Refrescar la página para mostrar la nueva imagen
      router.refresh();
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-sm text-gray-400">Foto de perfil</label>
      <div className="flex items-center gap-4 mt-2">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center relative">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt={userName || 'Usuario'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button 
            onClick={handleButtonClick}
            disabled={uploading}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Subiendo...' : 'Cambiar foto'}
          </button>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF (máx. 5MB)</p>
        </div>
      </div>
    </div>
  );
}
