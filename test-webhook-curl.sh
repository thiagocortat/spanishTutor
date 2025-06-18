#!/bin/bash

echo "🧪 Testando webhook com curl..."

# Dados do webhook no formato UltraMsg
DATA='{
  "event_type": "message_received",
  "instanceId": "instance126416",
  "data": {
    "id": "false_5521971189552@c.us_3EB0FF54790702367270",
    "from": "5521971189552@c.us",
    "to": "instance126416@c.us",
    "ack": "",
    "type": "chat",
    "body": "Hola, ¿cómo estás?",
    "fromMe": false,
    "time": '$(date +%s)'
  }
}'

echo "📤 Enviando dados:"
echo "$DATA" | jq .

echo "\n🔄 Fazendo requisição..."
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "User-Agent: UltraMsg-Webhook/1.0" \
  -d "$DATA" \
  -v

echo "\n✅ Teste concluído!"