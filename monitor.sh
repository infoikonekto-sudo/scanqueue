#!/bin/bash

# ============================================
# ScanQueue Monitoreo en Tiempo Real
# ============================================
# Monitorea CPU, Memoria, Logs en paralelo

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.prod.yml"

# Colores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Limpiar pantalla
clear

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ScanQueue Live Monitoring Dashboard     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Funciones de monitoreo
show_container_stats() {
    echo -e "${GREEN}=== DOCKER CONTAINERS ===${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
}

show_resource_usage() {
    echo -e "${GREEN}=== RESOURCE USAGE ===${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    echo ""
}

show_recent_errors() {
    echo -e "${GREEN}=== RECENT ERRORS ===${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=10 backend | grep -i error || echo "No errors found"
    echo ""
}

show_api_status() {
    echo -e "${GREEN}=== API STATUS ===${NC}"
    
    if curl -sf http://localhost:5000/api/health &>/dev/null; then
        echo -e "${GREEN}✓ Backend API: Respondiendo${NC}"
    else
        echo -e "${RED}✗ Backend API: NO responde${NC}"
    fi
    
    if curl -sf http://localhost/ &>/dev/null; then
        echo -e "${GREEN}✓ Frontend: Disponible${NC}"
    else
        echo -e "${RED}✗ Frontend: NO disponible${NC}"
    fi
    
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U scanqueue &>/dev/null; then
        echo -e "${GREEN}✓ PostgreSQL: Conectado${NC}"
    else
        echo -e "${RED}✗ PostgreSQL: NO accesible${NC}"
    fi
    
    echo ""
}

show_db_stats() {
    echo -e "${GREEN}=== DATABASE STATS ===${NC}"
    
    docker-compose -f "$COMPOSE_FILE" exec -T postgres \
        psql -U scanqueue -d scanqueue \
        -c "SELECT 
            (SELECT count(*) FROM students) as students,
            (SELECT count(*) FROM scans) as scans,
            (SELECT count(*) FROM users) as users,
            pg_size_pretty(pg_database_size('scanqueue')) as size;" \
        2>/dev/null || echo "DB Stats unavailable"
    
    echo ""
}

# Mostrar información inicial
show_container_stats
show_resource_usage
show_api_status
show_db_stats
show_recent_errors

echo -e "${BLUE}Presione Ctrl+C para seguir logs en tiempo real${NC}"
echo ""

# Logs en tiempo real
docker-compose -f "$COMPOSE_FILE" logs -f backend
