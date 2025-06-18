#!/bin/bash

# Script para testar o endpoint de simulação usando curl
echo "🧪 Testando endpoint de simulação com curl..."
echo "📱 Enviando mensagem de teste..."
echo "---"

# Testar se o servidor está respondendo
echo "🔍 Verificando se o servidor está rodando..."
curl -s http://localhost:3000/status > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Servidor está respondendo"
else
    echo "❌ Servidor não está respondendo na porta 3000"
    exit 1
fi

# Testar o endpoint de simulação
echo "\n🚀 Testando endpoint /webhook/simulate..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"+5511999999999","message":"Hola, ¿cómo estás?"}' \
  http://localhost:3000/webhook/simulate

echo "\n\n✅ Teste concluído!"