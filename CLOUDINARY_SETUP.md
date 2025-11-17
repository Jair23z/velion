# 🎬 Guía: Configurar Videos con Cloudinary

## ¿Por qué Cloudinary?

✅ **25 GB gratis** de almacenamiento (vs 50 MB de Supabase)  
✅ **25 GB/mes** de bandwidth  
✅ **Optimización automática** de videos  
✅ **Streaming adaptativo** opcional  
✅ **CDN global** incluido  
✅ **Sin límite de tamaño** por archivo en plan gratuito  

## Paso 1: Crear Cuenta en Cloudinary

1. Ve a https://cloudinary.com/users/register_free
2. Regístrate gratis (con email o GitHub)
3. Completa el formulario básico
4. Verifica tu email

## Paso 2: Obtener Credenciales

1. Una vez dentro, ve a **Dashboard**
2. Verás tus credenciales en la parte superior:
   - **Cloud Name** (ejemplo: `dxyz123abc`)
   - **API Key** (ejemplo: `123456789012345`)
   - **API Secret** (ejemplo: `abcdefghijklmnopqrstuvwxyz`)

## Paso 3: Configurar Variables de Entorno

Agrega estas líneas a tu archivo `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# URL pública de Cloudinary (reemplaza con tu cloud name)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
```

**⚠️ Importante:** Reemplaza `tu-cloud-name`, `tu-api-key`, y `tu-api-secret` con tus valores reales.

## Paso 3.5: Configurar Seguridad en Cloudinary (🔒 IMPORTANTE)

Para que las URLs firmadas funcionen y los videos estén protegidos:

1. Ve a tu Dashboard de Cloudinary
2. Click en **Settings** (⚙️ arriba a la derecha)
3. Ve a la pestaña **Security**
4. En la sección **Delivery and URL Security**:
   - ✅ **Activa "Strict transformations"** (solo transformaciones firmadas)
   - ✅ **Delivery type:** Cambia a **"Authenticated"** para los videos
5. En **Resource Access Control**:
   - ✅ Activa **"URL signature required"** (firmar todas las URLs)
6. Guarda los cambios

### Configurar Carpeta de Videos como Authenticated:

1. Ve a **Media Library**
2. Encuentra tu carpeta `velion-movies` (o donde subes videos)
3. Click derecho → **Manage Folder**
4. Cambia **Access mode** a **"Authenticated"**
5. Guarda

**¿Por qué esto es importante?**
- 🔒 Impide que alguien copie el enlace directo del video
- ⏱️ Las URLs expiran después de cierto tiempo (1 hora free, 24 horas premium)
- 🚫 Sin autenticación válida, el video no se reproduce
- ✅ Solo tu servidor puede generar URLs válidas

**Sin esta configuración:** Cualquiera podría copiar el enlace del video y compartirlo.

## Paso 4: Subir Videos

Tienes 3 opciones:

### Opción A: Usar el Script Automático (Recomendado)

Coloca tus videos en la carpeta `videos/` del proyecto y ejecuta:

```powershell
# Estructura esperada:
# videos/
#   movie-1.mp4
#   movie-2.mp4
#   movie-3.mp4
#   ... etc

# Subir todos los videos a Cloudinary
npx tsx scripts/upload-to-cloudinary.ts
```

El script:
- ✅ Sube automáticamente todos los videos
- ✅ Los nombra correctamente (movie-1, movie-2, etc.)
- ✅ Muestra progreso con barra de carga
- ✅ Actualiza las URLs en la base de datos automáticamente

### Opción B: Dashboard de Cloudinary (Manual)

1. Ve a **Media Library** en tu dashboard
2. Click en **Upload**
3. Selecciona tus videos
4. **IMPORTANTE:** Renombra cada video como `movie-1`, `movie-2`, etc.
5. Después ejecuta: `npx tsx scripts/update-video-urls.ts`

### Opción C: Usar el Admin Panel (Próximamente)

Si necesitas una interfaz web dentro de tu app para subir videos, puedo crear una página de admin.

## Paso 5: Actualizar URLs en la Base de Datos

Si subiste manualmente, ejecuta:

```powershell
npx tsx scripts/update-cloudinary-urls.ts
```

## Formato de URL Final

Las URLs de Cloudinary tienen este formato:

```
https://res.cloudinary.com/tu-cloud-name/video/upload/v1234567890/movie-1.mp4
```

El VideoPlayer las reproduce automáticamente.

## Características Avanzadas (Opcional)

### Optimización Automática

Cloudinary optimiza automáticamente:
- ✅ Compresión inteligente
- ✅ Formato adaptativo (MP4, WebM según navegador)
- ✅ Calidad ajustada según dispositivo

### Thumbnails Automáticos

Para generar miniatura de un video:
```
https://res.cloudinary.com/tu-cloud-name/video/upload/so_2.5/movie-1.jpg
```
(Captura el frame a los 2.5 segundos)

### Streaming Adaptativo (HLS)

Para calidad adaptativa según conexión:
```
https://res.cloudinary.com/tu-cloud-name/video/upload/sp_hd/movie-1.m3u8
```

## Límites del Plan Gratuito

| Recurso | Límite |
|---------|--------|
| Almacenamiento | 25 GB |
| Bandwidth | 25 GB/mes |
| Transformaciones | 25,000/mes |
| Tamaño por archivo | Sin límite* |

\* Archivos grandes pueden tardar más en procesar

## Troubleshooting

### ❌ Error: "Invalid credentials"
- Verifica que las variables en `.env` sean correctas
- Asegúrate de no tener espacios o comillas extras
- Reinicia el servidor después de cambiar `.env`

### ❌ Error: "Upload failed"
- Verifica tu conexión a internet
- El video puede ser muy grande (espera más tiempo)
- Revisa el límite de bandwidth mensual

### ❌ Video no se reproduce
- Verifica que la URL sea correcta
- Abre la URL directamente en el navegador
- Verifica que el video esté en formato compatible (MP4, WebM)

## Comparación: Cloudinary vs Supabase

| Feature | Cloudinary | Supabase |
|---------|-----------|----------|
| Almacenamiento gratis | 25 GB | 1 GB |
| Límite por archivo | Sin límite | 50 MB |
| CDN | ✅ Global | ✅ Global |
| Optimización | ✅ Automática | ❌ Manual |
| Streaming adaptativo | ✅ Sí | ❌ No |
| Transformaciones | ✅ On-the-fly | ❌ No |

## Siguientes Pasos

1. ✅ Crear cuenta en Cloudinary
2. ✅ Configurar `.env` con credenciales
3. ✅ Preparar videos (o usar placeholders)
4. ✅ Ejecutar script de subida
5. ✅ Probar en tu app

¿Necesitas ayuda? Revisa los logs del script o pregúntame 🚀
