#!/bin/bash

# Script de deploy para Vercel - Spanish Tutor WhatsApp Bot

echo "🚀 Iniciando deploy para Vercel..."

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se existe .env
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📋 Copie .env.example para .env e configure as variáveis:"
    echo "   cp .env.example .env"
    echo "   # Edite o .env com suas chaves de API"
    exit 1
fi

# Verificar se as variáveis essenciais estão configuradas
if ! grep -q "OPENROUTER_API_KEY=sk-" .env; then
    echo "❌ OPENROUTER_API_KEY não configurada no .env"
    echo "📝 Configure sua chave do OpenRouter no arquivo .env"
    exit 1
fi

echo "✅ Configurações verificadas"

# Fazer build local para verificar erros
echo "🔨 Verificando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build local"
    exit 1
fi

echo "✅ Build local OK"

# Deploy para Vercel
echo "🚀 Fazendo deploy..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "📱 Configure o webhook nos provedores WhatsApp:"
    echo "   UltraMsg: https://seu-projeto.vercel.app/webhook"
    echo "   Gupshup: https://seu-projeto.vercel.app/webhook"
    echo "📊 Status: https://seu-projeto.vercel.app/status"
else
    echo "❌ Erro no deploy"
    exit 1
fi