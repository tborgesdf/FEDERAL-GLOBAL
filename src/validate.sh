#!/bin/bash

# 🎯 Federal Express Brasil - Script de Validação Completa
# Sistema de Design Responsivo v2.0

echo "🚀 Federal Express Brasil - Validação Completa"
echo "================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contador de testes
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Função de log
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar estrutura de arquivos
echo "📁 1/7 Verificando estrutura de arquivos..."
((TOTAL_TESTS++))

if [ -f "styles/globals.css" ] && [ -f "design-tokens.json" ] && [ -f "DESIGN_SYSTEM.md" ]; then
    log_success "Arquivos de design system presentes"
else
    log_error "Arquivos de design system faltando"
fi

# 2. Verificar design tokens no CSS
echo ""
echo "🎨 2/7 Validando design tokens..."
((TOTAL_TESTS++))

if grep -q "--color-brand-blue: #0A4B9E" styles/globals.css && \
   grep -q "--color-brand-green: #2BA84A" styles/globals.css && \
   grep -q "--space-xl: 80px" styles/globals.css; then
    log_success "Design tokens corretos no CSS"
else
    log_error "Design tokens incorretos ou faltando"
fi

# 3. Verificar JSON de tokens
echo ""
echo "📋 3/7 Validando design-tokens.json..."
((TOTAL_TESTS++))

if [ -f "design-tokens.json" ]; then
    if jq empty design-tokens.json 2>/dev/null; then
        log_success "JSON de design tokens válido"
    else
        log_warning "JSON pode ter problemas de sintaxe (jq não instalado ou JSON inválido)"
    fi
else
    log_error "design-tokens.json não encontrado"
fi

# 4. Verificar componentes
echo ""
echo "🧩 4/7 Verificando componentes React..."
((TOTAL_TESTS++))

COMPONENTS=("Header" "Hero" "MarketTicker" "RSSCarousel" "MultimediaSection" "Footer" "RegisterPage" "LoginPage")
MISSING_COMPONENTS=()

for component in "${COMPONENTS[@]}"; do
    if [ ! -f "components/${component}.tsx" ]; then
        MISSING_COMPONENTS+=($component)
    fi
done

if [ ${#MISSING_COMPONENTS[@]} -eq 0 ]; then
    log_success "Todos os componentes principais presentes (${#COMPONENTS[@]})"
else
    log_error "Componentes faltando: ${MISSING_COMPONENTS[*]}"
fi

# 5. Verificar testes E2E
echo ""
echo "🧪 5/7 Verificando testes E2E..."
((TOTAL_TESTS++))

if [ -f "tests/e2e/home.spec.ts" ] && \
   [ -f "tests/e2e/auth.spec.ts" ] && \
   [ -f "tests/e2e/accessibility.spec.ts" ] && \
   [ -f "tests/e2e/responsive.spec.ts" ]; then
    log_success "Todas as suites de teste presentes (4 arquivos)"
else
    log_error "Arquivos de teste faltando"
fi

# 6. Verificar configuração Playwright
echo ""
echo "⚙️  6/7 Verificando configuração Playwright..."
((TOTAL_TESTS++))

if [ -f "playwright.config.ts" ]; then
    log_success "Configuração do Playwright presente"
else
    log_error "playwright.config.ts não encontrado"
fi

# 7. Verificar package.json
echo ""
echo "📦 7/7 Verificando package.json..."
((TOTAL_TESTS++))

if [ -f "package.json" ]; then
    if grep -q "test:e2e" package.json; then
        log_success "Scripts de teste configurados"
    else
        log_warning "Scripts de teste podem estar faltando"
    fi
else
    log_error "package.json não encontrado"
fi

# Resumo Final
echo ""
echo "================================================"
echo "📊 RESUMO DA VALIDAÇÁO"
echo "================================================"
echo -e "${BLUE}Total de verificações: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passaram: $PASSED_TESTS${NC}"
echo -e "${RED}Falharam: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✨ Sistema validado com sucesso!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. npm install"
    echo "2. npm run test:install"
    echo "3. npm run test:e2e"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Alguns problemas foram encontrados.${NC}"
    echo "Revise os erros acima antes de executar os testes."
    echo ""
    exit 1
fi
