# 🚀 Guía de Despliegue (Producción)

Dado que cada cuenta en la nube es personal, he preparado todo el "Cableado" interno por ti. He creado los archivos **`render.yaml`** (Para el Backend) y **`vercel.json`** (Para el Frontend). 

Con estos archivos, el despliegue es prácticamente automático "Plug & Play". Sigue estos 3 pasos:

### 1️⃣ Sube tu código a GitHub
1. Entra a tu cuenta de GitHub y crea un nuevo repositorio llamado `scanqueue`.
2. En tu consola, sube el código:
   ```bash
   git init
   git add .
   git commit -m "Listo para producción"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/scanqueue.git
   git push -u origin main
   ```

### 2️⃣ Despliega el Backend (El Cerebro) en Render.com
*Para que los monitores JAMÁS se desconecten.*
1. Entra a [Render.com](https://render.com) y vincula tu GitHub.
2. Da clic en **New +** > **Blueprint**.
3. Selecciona tu repositorio `scanqueue`.
4. Render detectará automáticamente el archivo `render.yaml` que acabo de crear por ti. 
5. Clic en **Apply**. Render te dará una URL (ej: `https://scanqueue-api.onrender.com`). Cópiala.

### 3️⃣ Despliega el Frontend (Las Pantallas) en Vercel
1. Entra a [Vercel.com](https://vercel.com) y vincula tu GitHub.
2. Da clic en **Add New...** > **Project** y selecciona tu repo `scanqueue`.
3. En la sección **Root Directory**, dale a edit y elige la carpeta `frontend`. Todo lo demás déjalo igual (el framework Vite y mi configuración `vercel.json` harán su magia solos).
4. **⚠️ MUY IMPORTANTE (Environment Variables):**
   Abre las variables de entorno y añade estas dos:
   * `VITE_API_URL` = `https://TU_URL_DE_RENDER.onrender.com/api`
   * `VITE_SOCKET_URL` = `https://TU_URL_DE_RENDER.onrender.com`
5. Clic en **Deploy**. 

¡Y listo! Tendrás tu sistema en la nube, protegido, rápido y tus monitores se mantendrán sincronizados las 24 horas.
