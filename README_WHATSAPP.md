# Spanish Tutor WhatsApp Bot - Guia de Configuração

## 📱 Funcionalidades de Envio de Mensagens

Este bot agora suporta o envio automático de respostas via WhatsApp usando duas APIs:
- **UltraMsg** (https://ultramsg.com)
- **Gupshup** (https://gupshup.io)

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` e configure pelo menos uma das APIs:

#### Para UltraMsg:
```env
ULTRAMSG_TOKEN=seu_token_ultramsg_aqui
ULTRAMSG_INSTANCE_ID=seu_instance_id_aqui
```

#### Para Gupshup:
```env
GUPSHUP_API_KEY=sua_api_key_gupshup_aqui
GUPSHUP_APP_NAME=seu_app_name_aqui
GUPSHUP_SOURCE_NUMBER=seu_numero_registrado_aqui
```

### 3. Como Obter as Credenciais

#### UltraMsg:
1. Acesse https://ultramsg.com
2. Crie uma conta
3. Crie uma instância
4. Escaneie o QR Code com seu WhatsApp
5. Copie o Token e Instance ID

#### Gupshup:
1. Acesse https://gupshup.io
2. Crie uma conta
3. Configure um app WhatsApp
4. Obtenha a API Key, App Name e número registrado

## 🚀 Como Funciona

### Fluxo Completo:
1. **Entrada**: Usuário envia mensagem via WhatsApp
2. **Webhook**: Servidor recebe a mensagem
3. **IA**: Gera resposta personalizada em espanhol
4. **Formatação**: Aplica formatação didática
5. **Envio**: Envia resposta de volta ao usuário

### Estratégia de Fallback:
- Tenta enviar via UltraMsg primeiro
- Se falhar, tenta via Gupshup
- Logs detalhados de cada tentativa

## 🧪 Testando o Sistema

### 1. Testar IA (sem envio):
```bash
npm run test-ai "Hola, ¿cómo estás?"
```

### 2. Testar Envio de Mensagens:
```bash
curl -X POST http://localhost:3000/test-send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5511999999999",
    "message": "Teste de envio do Spanish Tutor!"
  }'
```

### 3. Verificar Status:
```bash
curl http://localhost:3000/status
```

## 📋 Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|----------|
| `/` | GET | Informações gerais e status |
| `/webhook` | POST | Receber mensagens do WhatsApp |
| `/webhook` | GET | Verificação do webhook |
| `/status` | GET | Status do servidor e configurações |
| `/test-ai` | POST | Testar IA diretamente |
| `/test-send` | POST | Testar envio de mensagens |
| `/conversation/:phone` | GET | Ver histórico de conversa |

## 📊 Logs e Monitoramento

O sistema gera logs detalhados para:
- ✅ Mensagens recebidas
- 🤖 Processamento da IA
- 📤 Tentativas de envio
- ❌ Erros e falhas
- 📱 Status de entrega

## 🔒 Segurança

- Nunca commite credenciais no código
- Use variáveis de ambiente para tokens
- Timeout de 10 segundos para requisições
- Validação de números de telefone
- Logs sem exposição de dados sensíveis

## 🐛 Troubleshooting

### Problema: Mensagens não são enviadas
1. Verifique se as credenciais estão corretas no `.env`
2. Teste o endpoint `/test-send`
3. Verifique os logs do servidor
4. Confirme se a instância está autenticada (QR Code)

### Problema: Webhook não recebe mensagens
1. Verifique se o webhook está configurado corretamente
2. Use ngrok para expor localhost em desenvolvimento
3. Confirme o formato das mensagens recebidas

### Problema: IA não responde
1. Verifique a chave da OpenRouter API
2. Teste o endpoint `/test-ai`
3. Verifique os logs de erro

## 📈 Próximos Passos

- [ ] Suporte a mensagens de mídia
- [ ] Templates de mensagem
- [ ] Métricas de uso
- [ ] Banco de dados persistente
- [ ] Interface web de administração

## 🤝 Contribuindo

Para contribuir com melhorias:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Teste suas mudanças
4. Envie um pull request

---

**Nota**: Este é um projeto educacional. Use com responsabilidade e respeite os termos de uso das APIs do WhatsApp.