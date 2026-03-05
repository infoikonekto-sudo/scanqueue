#!/bin/bash

# ============================================
# ScanQueue SSL Certificate Generator
# ============================================
# Genera certificados SSL auto-firmados
# Para producción usar Let's Encrypt con Certbot
# Uso: ./generate-certs.sh [opciones]

set -e

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/certs"
VALIDITY_DAYS=365

# ============================================
# Colors
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# Logging
# ============================================
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# ============================================
# Functions
# ============================================

check_prerequisites() {
    if ! command -v openssl &> /dev/null; then
        error "OpenSSL no está instalado"
        exit 1
    fi
    
    success "OpenSSL disponible"
}

create_self_signed_cert() {
    log "Generando certificado auto-firmado..."
    
    mkdir -p "$CERTS_DIR"
    
    local domain="$1"
    local common_name="${domain:-localhost}"
    
    # Generar clave privada
    log "Generando clave privada..."
    openssl genrsa -out "${CERTS_DIR}/key.pem" 2048
    
    # Generar certificado
    log "Generando certificado para: $common_name"
    openssl req -new -x509 \
        -key "${CERTS_DIR}/key.pem" \
        -out "${CERTS_DIR}/cert.pem" \
        -days "$VALIDITY_DAYS" \
        -subj "/C=AR/ST=Buenos Aires/L=Buenos Aires/O=ScanQueue/CN=${common_name}"
    
    # Generar chain (para compatibilidad)
    cp "${CERTS_DIR}/cert.pem" "${CERTS_DIR}/chain.pem"
    
    success "Certificados generados"
    log "Válido por $VALIDITY_DAYS días"
    
    # Mostrar información
    log "Detalles del certificado:"
    openssl x509 -text -noout -in "${CERTS_DIR}/cert.pem" | grep -E "Subject:|Issuer:|Not Before|Not After"
}

setup_letsencrypt() {
    log "Configurando Let's Encrypt con Certbot..."
    
    local domain="$1"
    local email="$2"
    
    if ! command -v certbot &> /dev/null; then
        error "Certbot no instalado. Instalar con:"
        echo "  Ubuntu/Debian: sudo apt-get install certbot python3-certbot-nginx"
        echo "  RHEL/CentOS: sudo yum install certbot python3-certbot-nginx"
        echo "  macOS: brew install certbot"
        return 1
    fi
    
    log "Solicitando certificado para: $domain"
    
    mkdir -p "$CERTS_DIR"
    
    # Crear directorio para validación
    mkdir -p "${SCRIPT_DIR}/.well-known/acme-challenge"
    
    # Generar certificado
    if certbot certonly --standalone \
        -d "$domain" \
        -m "$email" \
        --agree-tos \
        --noninteractive \
        --cert-path "$CERTS_DIR"; then
        
        success "Certificado Let's Encrypt obtenido"
    else
        error "Error al obtener certificado Let's Encrypt"
        return 1
    fi
}

renew_letsencrypt() {
    log "Renovando certificado Let's Encrypt..."
    
    if command -v certbot &> /dev/null; then
        certbot renew --quiet
        success "Certificado renovado"
    else
        warning "Certbot no está instalado"
    fi
}

show_cert_info() {
    if [ ! -f "${CERTS_DIR}/cert.pem" ]; then
        error "Certificado no encontrado en: ${CERTS_DIR}/cert.pem"
        return 1
    fi
    
    echo ""
    echo -e "${BLUE}=== INFORMACIÓN DEL CERTIFICADO ===${NC}"
    echo ""
    
    openssl x509 -text -noout -in "${CERTS_DIR}/cert.pem" | \
        grep -E "Subject:|Issuer:|Not Before|Not After|Public-Key"
    
    echo ""
    
    # Días restantes
    local not_after=$(openssl x509 -enddate -noout -in "${CERTS_DIR}/cert.pem" | cut -d= -f2)
    local expire_date=$(date -d "$not_after" +%s)
    local now=$(date +%s)
    local days_left=$(( ($expire_date - $now) / 86400 ))
    
    echo "Archivos:"
    echo "  Certificado: ${CERTS_DIR}/cert.pem"
    echo "  Clave Privada: ${CERTS_DIR}/key.pem"
    echo ""
    
    if [ "$days_left" -gt 0 ]; then
        if [ "$days_left" -gt 30 ]; then
            echo -e "${GREEN}Válido por ${days_left} días${NC}"
        else
            echo -e "${YELLOW}Vence en ${days_left} días (renovar pronto)${NC}"
        fi
    else
        echo -e "${RED}EXPIRADO (renovar inmediatamente)${NC}"
    fi
    
    echo ""
}

install_auto_renewal() {
    log "Configurando auto-renovación..."
    
    # Crear script de renovación
    local renewal_script="${SCRIPT_DIR}/renew-certs-auto.sh"
    
    cat > "$renewal_script" << 'EOF'
#!/bin/bash
# Auto-renewal script for Let's Encrypt certificates

CERTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/certs"
LOG_FILE="$CERTS_DIR/renewal.log"

{
    echo "[$(date)] Starting certificate renewal..."
    certbot renew --quiet
    echo "[$(date)] Renewal completed"
} >> "$LOG_FILE" 2>&1

# Restar Nginx para aplicar nuevos certificados
docker-compose -f docker-compose.prod.yml restar nginx || true
EOF
    
    chmod +x "$renewal_script"
    
    # Crear entrada en crontab (requerir instalación manual)
    log "Para auto-renovación automática, agregar a crontab:"
    echo "  crontab -e"
    echo "  # Agregar esta línea para renovar diariamente a las 2 AM:"
    echo "  0 2 * * * $renewal_script"
    
    success "Script de renovación creado: $renewal_script"
}

show_usage() {
    echo "Uso: $0 [opción] [argumentos]"
    echo ""
    echo "Opciones:"
    echo "  self-signed [domain]    Generar certificado auto-firmado"
    echo "  letsencrypt <domain> <email>"
    echo "                          Generar certificado Let's Encrypt"
    echo "  info                    Mostrar información del certificado actual"
    echo "  renew                   Renovar certificado Let's Encrypt"
    echo "  auto-renewal            Configurar renovación automática"
    echo "  help                    Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 self-signed                    # Auto-firmado para localhost"
    echo "  $0 self-signed midominio.com      # Auto-firmado con dominio"
    echo "  $0 letsencrypt midominio.com admin@midominio.com"
    echo "  $0 info                           # Información del certificado"
}

# ============================================
# Main
# ============================================

main() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    ScanQueue SSL Certificate Generator    ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    check_prerequisites
    
    local option="${1:-help}"
    
    case "$option" in
        self-signed)
            local domain="${2:-localhost}"
            create_self_signed_cert "$domain"
            show_cert_info
            ;;
        letsencrypt)
            if [ -z "$2" ] || [ -z "$3" ]; then
                error "Uso: $0 letsencrypt <domain> <email>"
                exit 1
            fi
            setup_letsencrypt "$2" "$3"
            ;;
        info)
            show_cert_info
            ;;
        renew)
            renew_letsencrypt
            show_cert_info
            ;;
        auto-renewal)
            install_auto_renewal
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            error "Opción desconocida: $option"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
