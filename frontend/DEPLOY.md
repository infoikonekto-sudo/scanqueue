# 🚀 Guía de Deploy - Frontend ScanQueue

## 📋 Pre-requisitos

- Node.js 18+
- npm o pnpm
- Acceso a servidor (Vercel, Netlify, AWS, etc)
- Variables de entorno configuradas

## 🏗️ Build Local

```bash
# 1. Navegar a frontend
cd frontend

# 2. Instalar dependencias (si no está hecho)
npm install

# 3. Crear build de producción
npm run build

# 4. Verificar resultado
ls -la dist/
# dist/
# ├── index.html
# ├── assets/
# │   ├── index-XXXXX.js
# │   └── index-XXXXX.css
# └── vite.svg
```

## ☁️ Opciones de Deploy

### 1. **Vercel** (Recomendado - Muy fácil)

```bash
# Instalar CLI de Vercel
npm install -g vercel

# Login
vercel login

# Hacer deploy
vercel

# Después, cada git push se despliega automáticamente
```

**Ventajas:**
- Zero config
- Builds automáticos
- CDN global
- Gratuito para proyectos pequeños

### 2. **Netlify**

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Build y deploy
netlify deploy --prod

# O conectar repositorio Github para auto-deploy
```

**Ventajas:**
- Fácil conexión con GitHub
- Builds automáticos
- Functions serverless disponibles

### 3. **GitHub Pages**

```bash
# 1. Modificar vite.config.js
export default {
  base: '/scanqueue/',  // Si es repo secundario
  // ...
}

# 2. Build
npm run build

# 3. Subir dist/ a rama gh-pages
npm install --save-dev gh-pages

# En package.json
"scripts": {
  "deploy": "npm run build && npx gh-pages -d dist"
}

# 4. Ejecutar
npm run deploy
```

### 4. **Server Propio (VPS/Dedicado)**

```bash
# 1. Conectar vía SSH
ssh user@example.com

# 2. Clonar repo
git clone <repo-url>
cd scanqueue/frontend

# 3. Instalar y build
npm install
npm run build

# 4. Copiar dist/ a directorio web
sudo cp -r dist/* /var/www/scanqueue/

# 5. Configurar servidor web (Nginx)
# /etc/nginx/sites-available/scanqueue
server {
    listen 80;
    server_name scanqueue.example.com;

    root /var/www/scanqueue;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTTPS with Let's Encrypt
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/scanqueue.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/scanqueue.example.com/privkey.pem;
}
```

### 5. **Docker** (Para máxima flexibilidad)

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa final - serve estático
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

```bash
# Build imagen
docker build -t scanqueue-frontend .

# Ejecutar contenedor
docker run -p 3000:3000 scanqueue-frontend
```

## 🔐 Configuración Segura

### Variables de Entorno en Producción

```bash
# .env.production (no commitear!)
VITE_API_URL=https://api.scanqueue.example.com/api
VITE_SOCKET_URL=https://api.scanqueue.example.com
VITE_APP_ENV=production
```

### Headers de Seguridad (Nginx)

```nginx
# /etc/nginx/snippets/security-headers.conf
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(self), microphone=" always;

# CSP para cargas de contenido
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;
```

## 📊 Monitoreo Post-Deploy

### Herramientas Recomendadas

1. **Sentry** (Error tracking)
   ```javascript
   // src/main.jsx
   import * as Sentry from "@sentry/react"
   
   Sentry.init({
     dsn: "https://xxx@xxx.ingest.sentry.io/xxx",
     environment: import.meta.env.VITE_APP_ENV,
   })
   ```

2. **LogRocket** (Session replay)
3. **Datadog** (Performance monitoring)
4. **Google Analytics** (Uso)

### Health Checks

```javascript
// healthcheck.js en servidor
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})
```

## 🚨 Rollback Procedure

```bash
# Vercel
vercel rollback scanqueue

# Netlify
netlify deploy --alias=v1

# GitHub Pages
git revert <commit-hash>
git push

# Server Propio
# Mantener backup anterior
cp -r /var/www/scanqueue /var/www/scanqueue-backup-$(date +%s)
```

## 📈 Performance Checklist

- [ ] Bundle size < 500KB gzipped
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s
- [ ] Core Web Vitals passing
- [ ] Images optimizadas
- [ ] Code splitting implementado
- [ ] Caching headers configurados

## 🔍 Testing Pre-Deploy

```bash
# Build test
npm run build

# Ver resultado localmente
npm run preview

# Network throttling (DevTools)
# Simular 3G/4G lento
# Probar en dispositivo real
```

## 📝 Checklist Deploy Final

- [ ] Variables de entorno correctas
- [ ] Build sin errores
- [ ] Todos los assets se cargan
- [ ] Funcionalidad crítica probada
- [ ] Backups creados
- [ ] Monitoring configurado
- [ ] SSL/HTTPS activo
- [ ] CORS configurado correctamente
- [ ] Rate limiting en API
- [ ] Logs habilitados

## 🆘 Troubleshooting

### Aplicación no carga
1. Verificar logs del servidor (`console` en DevTools)
2. Verificar que índice HTML se sirve correctamente
3. Verificar CORS en backend

### WebSocket no connecs
1. Verificar URL en .env
2. Verificar que backend esté accesible
3. Verificar firewall/proxy

### Assets no cargan
1. Verificar path base en vite.config.js
2. Verificar headers Cache-Control
3. Limpiar caché del navegador (Ctrl+Shift+R)

### Performance lento
1. Analizar bundle con `npm run build --analyze`
2. Activar gzip compression
3. Usar CDN para assets estáticos
4. Implementar lazy loading

## 📚 Documentación Links

- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [SSL/Let's Encrypt](https://letsencrypt.org)
