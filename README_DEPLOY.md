# Guía de Despliegue Permanente (PostgreSQL + Cloudinary)

Para que tu portal municipal guarde los datos y archivos de forma **permanente** y gratuita en Render.com, sigue estos pasos:

## 1. Configurar Base de Datos (PostgreSQL)
1. En el Dashboard de Render, haz clic en **"New"** > **"PostgreSQL"**.
2. Ponle un nombre (ej. `municipal-db`) y haz clic en **"Create Database"**.
3. Una vez creada, busca la sección **"Connections"** y copia la **"External Database URL"**. La necesitaremos más adelante.

## 2. Configurar Almacenamiento de Archivos (Cloudinary)
1. Regístrate gratis en [Cloudinary](https://cloudinary.com/).
2. En tu Dashboard de Cloudinary, verás tres valores:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

## 3. Desplegar el Servicio Web en Render
1. Sube tu código a GitHub (instrucciones en la guía anterior).
2. Crea un nuevo **Web Service** conectado a ese repositorio.
3. En la sección **"Environment"**, haz clic en **"Add Environment Variable"** y añade estas 5 variables:
   - `DATABASE_URL`: (Pega la External URL de tu PostgreSQL)
   - `CLOUDINARY_CLOUD_NAME`: (Tu Cloud Name)
   - `CLOUDINARY_API_KEY`: (Tu API Key)
   - `CLOUDINARY_API_SECRET`: (Tu API Secret)
   - `PORT`: `3000`

## 4. Finalizar
Haz clic en **"Deploy Web Service"**. Render instalará las librerías automáticamente y conectará todo.

---
**¿Por qué esto es mejor?**
- **CVs Seguros**: Los archivos se guardan en Cloudinary y nunca se borran.
- **Datos Seguros**: PostgreSQL es una base de datos real que mantiene tus solicitudes aunque el servidor se reinicie.
