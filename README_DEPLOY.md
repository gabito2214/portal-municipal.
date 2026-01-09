# Guía de Despliegue en Railway.app (Alternativa estable a Render)

Para poner tu portal online de forma rápida y persistente:

## 1. Preparar en Railway
1. Ve a [Railway.app](https://railway.app/) e inicia sesión con GitHub.
2. Haz clic en **"New Project"** > **"Deploy from GitHub repo"**.
3. Selecciona tu repositorio `portal-municipal`.

## 2. Agregar Base de Datos (PostgreSQL)
1. Una vez creado el proyecto, haz clic en el botón **"View"** de tu proyecto.
2. Haz clic en **"Create"** (o en el signo +) y elige **"Database"** > **"PostgreSQL"**.
3. Railway creará la base de datos automáticamente y la conectará a tu código (Railway detecta las variables de entorno `DATABASE_URL` por sí solo).

## 3. Configurar Almacenamiento (Cloudinary)
1. En el dashboard de Railway, ve a la pestaña **"Variables"** de tu servicio de Node.js.
2. Añade las variables de Cloudinary que obtuviste en su página:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. (Opcional) Asegúrate de que `PORT` sea `3000`.

## 4. ¡Listo!
Railway desplegará la página automáticamente. Podrás ver la URL pública en la sección "Deployments" o "Settings".

---

# Guía de Despliegue en Render.com (Alternativa Gratuita)

1. **Crear base de datos PostgreSQL**: En Render, ve a "New" > "PostgreSQL". Copia la "External Database URL".
2. **Crear Web Service**: Ve a "New" > "Web Service" y conecta tu repo de GitHub.
3. **Configurar Variables**: En la pestaña "Environment", añade:
   - `DATABASE_URL`: (La URL que copiaste)
   - `CLOUDINARY_CLOUD_NAME`: (De tu dashboard de Cloudinary)
   - `CLOUDINARY_API_KEY`: (De tu dashboard de Cloudinary)
   - `CLOUDINARY_API_SECRET`: (De tu dashboard de Cloudinary)
4. **Deploy**: Render detectará el `package.json` y desplegará automáticamente.

---
**¿Por qué Railway o Render?**
- **Sincronización automática**: Cada vez que se suba un cambio a GitHub, el sitio se actualiza solo.
- **Base de Datos integrada**: No necesitas configurar servidores locales.
- **Persistencia**: Tus archivos (CVs) estarán seguros en Cloudinary.
