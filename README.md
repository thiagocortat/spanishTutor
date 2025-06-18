# 🇪🇸 Spanish Tutor WhatsApp Bot

Bot inteligente de WhatsApp que funciona como professor de espanhol, usando IA (GPT-3.5-turbo via OpenRouter) para gerar respostas didáticas personalizadas.

## ✨ Funcionalidades

- 🤖 **IA Integrada**: Usa GPT-3.5-turbo via OpenRouter para respostas inteligentes
- 📚 **Professor Virtual**: Atua como professor de espanhol paciente e instrutivo
- 🎯 **Adaptativo**: Detecta o nível do usuário e adapta as respostas
- 💬 **Histórico**: Mantém contexto da conversa para aprendizado progressivo
- 🌐 **Multilíngue**: Aceita português e espanhol, sempre responde em espanhol
- 📱 **WhatsApp**: Compatível com Gupshup Sandbox e UltraMsg

## 🚀 Instalação e Execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar API OpenRouter
1. Acesse [OpenRouter.ai](https://openrouter.ai) e crie uma conta gratuita
2. Obtenha sua chave da API
3. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
4. Edite o arquivo `.env` e adicione sua chave:
```
OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
```

### 3. Executar o servidor
```bash
npm start
```

O servidor será iniciado na porta 3000 (ou na porta definida pela variável de ambiente PORT).

## 📡 Endpoints Disponíveis

- **POST /webhook** - Recebe mensagens do WhatsApp e processa com IA
- **GET /webhook** - Verificação do webhook (para alguns provedores)
- **POST /test-ai** - Testa a IA diretamente (para desenvolvimento)
- **GET /conversation/:phone** - Visualiza histórico de uma conversa
- **GET /status** - Status do servidor e configurações
- **GET /** - Informações gerais

## 🔧 Configuração nos Provedores

### Gupshup Sandbox
1. Acesse o painel do Gupshup Sandbox
2. Configure o webhook URL: `http://seu-servidor:3000/webhook`
3. O webhook receberá dados no formato:
```json
{
  "payload": {
    "sender": {
      "phone": "+5511999999999"
    },
    "payload": {
      "text": "Mensagem recebida"
    },
    "type": "text"
  }
}
```

### UltraMsg
1. Acesse o painel do UltraMsg
2. Configure o webhook URL: `http://seu-servidor:3000/webhook`
3. O webhook receberá dados no formato:
```json
{
  "data": {
    "from": "5511999999999",
    "body": "Mensagem recebida",
    "type": "text"
  }
}
```

## 📝 Logs

O servidor registra automaticamente:
- Timestamp de cada mensagem recebida
- Headers da requisição
- Corpo completo da mensagem
- Telefone do remetente
- Conteúdo da mensagem
- Tipo da mensagem

## 🌐 Exposição Pública

Para usar com provedores externos, você precisa expor o servidor publicamente. Opções:

### Usando ngrok (desenvolvimento)
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000
```

Use a URL fornecida pelo ngrok como webhook URL.

### Deploy em produção
- Heroku
- Vercel
- Railway
- DigitalOcean
- AWS/GCP/Azure

## 🔒 Segurança

- O webhook aceita qualquer requisição POST (para compatibilidade)
- Em produção, considere adicionar:
  - Verificação de assinatura/token
  - Rate limiting
  - HTTPS obrigatório
  - Validação de origem

## 🧪 Teste Local

### Testar Webhook Completo
```bash
# Simular mensagem do WhatsApp
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "sender": {"phone": "+5511999999999"},
      "payload": {"text": "Olá, quero aprender espanhol"},
      "type": "text"
    }
  }'
```

### Testar IA Diretamente
```bash
# Testar apenas a IA
curl -X POST http://localhost:3000/test-ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Como se diz obrigado em espanhol?"
  }'
```

### Ver Histórico de Conversa
```bash
# Ver conversa de um usuário
curl http://localhost:3000/conversation/+5511999999999
```

## 📊 Monitoramento

- Acesse `http://localhost:3000/status` para verificar se o servidor está rodando
- Logs são exibidos no console em tempo real
- Cada mensagem recebida é logada com timestamp

## 🤖 Como Funciona a IA

### Detecção de Nível
O bot detecta automaticamente o nível do usuário:
- **Iniciante**: Mensagens em português
- **Básico**: Palavras básicas em espanhol
- **Intermediário**: Estruturas mais complexas
- **Avançado**: Vocabulário e gramática avançada

### Respostas Adaptativas
- Sempre responde em espanhol
- Inclui explicações em português quando necessário
- Corrige erros gentilmente
- Expande vocabulário progressivamente
- Mantém contexto da conversa

### Histórico Inteligente
- Armazena últimas 20 mensagens por usuário
- Mantém contexto para aprendizado progressivo
- Detecta evolução do nível do usuário

## 🛠️ Personalização

O código está preparado para:
- Múltiplos formatos de webhook (Gupshup, UltraMsg, genérico)
- Fácil extensão para outros provedores
- Logging detalhado para debugging
- Resposta rápida (200 OK) para evitar timeouts
- Histórico persistente (pode ser integrado com banco de dados)
- Customização do prompt do professor

## 💰 Custos

- **OpenRouter**: Modelo GPT-3.5-turbo tem custo muito baixo
- **Gupshup/UltraMsg**: Versões gratuitas disponíveis
- **Hospedagem**: Pode usar serviços gratuitos como Heroku, Railway, etc.

## 🔧 Variáveis de Ambiente

```bash
OPENROUTER_API_KEY=sua-chave-aqui  # Obrigatório
PORT=3000                          # Opcional
```