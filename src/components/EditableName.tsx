'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EditableNameProps {
  initialName: string | null;
}

export default function EditableName({ initialName }: EditableNameProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/update-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el nombre');
      }

      setIsEditing(false);
      router.refresh(); // Recargar datos del servidor
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(initialName || '');
    setIsEditing(false);
    setError('');
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Nombre</label>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-green-500 transition-colors cursor-pointer"
            title="Editar nombre"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2 mt-1">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
              placeholder="Tu nombre"
              autoFocus
            />
          
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white text-lg truncate max-w-md" title={name || 'No especificado'}>
          {name || 'No especificado'}
        </p>
      )}
    </div>
  );
}
