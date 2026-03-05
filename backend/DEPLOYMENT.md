# Guía de Deployment - ScanQueue Backend

## Entornos Soportados

- Linux (Ubuntu 20.04+, Debian 11+)
- macOS (Intel y Apple Silicon)
- Windows (WSL2 recomendado)
- Docker (Recomendado para producción)

## Deployment en Linux (Ubuntu)

### 1. Preparar Servidor
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Git
sudo apt install -y git
```

### 2. Crear Usuario de Aplicación
```bash
sudo useradd -m -s /bin/bash scanqueue
sudo su - scanqueue
```

### 3. Clonar y Configurar
```bash
cd /home/scanqueue
git clone <repo-url>
cd scanqueue/backend

npm install --production

# Crear .env desde ejemplo
cp .env.example .env
nano .env  # Editar con credenciales reales
```

### 4. Configurar PostgreSQL
```bash
sudo su - postgres
psql

CREATE DATABASE scanqueue_db;
CREATE USER scanqueue_user WITH PASSWORD 'strong_password_here';
ALTER ROLE scanqueue_user SET client_encoding TO 'utf8';
ALTER ROLE scanqueue_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE scanqueue_user SET default_transaction_deferrable TO on;
ALTER ROLE scanqueue_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE scanqueue_db TO scanqueue_user;

\q
exit
```

### 5. Inicializar Base de Datos
```bash
su - scanqueue
cd /home/scanqueue/scanqueue/backend
npm run db:init
npm run db:seed
```

### 6. Configurar PM2 (Process Manager)
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar aplicación
pm2 start src/server.js --name "scanqueue-api"

# Guardar configuración
pm2 save

# Habilitar auto-start en reinicio
pm2 startup systemd -u scanqueue --hp /home/scanqueue
```

### 7. Configurar Nginx (Reverse Proxy)
```bash
sudo apt install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/scanqueue
```

Contenido:
```nginx
upstream scanqueue_backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name tu-dominio.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # Certificados SSL (usar Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://scanqueue_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://scanqueue_backend/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Habilitar:
```bash
sudo ln -s /etc/nginx/sites-available/scanqueue /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL con Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot certonly --nginx -d tu-dominio.com

# Auto-renovación
sudo certbot renew --dry-run
```

## Deployment con Docker

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: scanqueue_db
      POSTGRES_USER: scanqueue_user
      POSTGRES_PASSWORD: changeme
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: scanqueue_db
      DB_USER: scanqueue_user
      DB_PASSWORD: changeme
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - db
    restart: always

volumes:
  postgres_data:
```

Deploy:
```bash
docker-compose up -d
```

## Monitoreo

### Logs con PM2
```bash
pm2 logs scanqueue-api
pm2 monit
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Check
```bash
curl https://tu-dominio.com/health
```

## Backup de Base de Datos

### Script de backup automático
```bash
#!/bin/bash
# /home/scanqueue/backup.sh

BACKUP_DIR="/home/scanqueue/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U scanqueue_user scanqueue_db \
  | gzip > $BACKUP_DIR/scanqueue_db_$DATE.sql.gz

# Mantener solo últimos 30 días
find $BACKUP_DIR -name "scanqueue_db_*.sql.gz" -mtime +30 -delete

echo "Backup completado: $BACKUP_DIR/scanqueue_db_$DATE.sql.gz"
```

Agendar:
```bash
crontab -e

# Backup diario a las 2:00 AM
0 2 * * * /home/scanqueue/backup.sh
```

## Escalabilidad

### Con Redis para Caching
```bash
sudo apt install -y redis-server
npm install redis
```

### Load Balancing
Usar nginx upstream con múltiples instancias.

## Troubleshooting

### Puerto 5000 en uso
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

### Permiso denegado
```bash
sudo chown -R scanqueue:scanqueue /home/scanqueue/scanqueue
```

### Database connection error
```bash
sudo -u postgres psql -c "SELECT version();"
```

## Checklist Pre-Producción

- [ ] Variables de entorno configuradas
- [ ] Base de datos inicializada y backupada
- [ ] SSL/HTTPS habilitado
- [ ] PM2 o similar configurado
- [ ] Nginx reverse proxy funcional
- [ ] Logs habilitados y monitoreados
- [ ] Backups automáticos configurados
- [ ] Health checks funcionando
- [ ] Rate limiting activo
- [ ] CORS configurado correctamente
- [ ] Contraseñas y secretos seguros
- [ ] Tests finales completados

## Recursos

- Node.js: https://nodejs.org
- PostgreSQL: https://www.postgresql.org
- PM2: https://pm2.keymetrics.io
- Nginx: https://nginx.org
- Let's Encrypt: https://letsencrypt.org
- Docker: https://www.docker.com

---

**Versión:** 1.0.0  
**Última actualización:** 3 de marzo de 2026
