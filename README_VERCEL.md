# 🚀 Deploy no Vercel - Spanish Tutor WhatsApp Bot

Guia completo para fazer deploy do Spanish Tutor WhatsApp Bot no Vercel.

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com) (recomendado)
- Chave da API do [OpenRouter](https://openrouter.ai)
- Configuração de pelo menos um provedor WhatsApp (UltraMsg ou Gupshup)

## 🔧 Preparação do Projeto

### 1. Arquivos de Configuração

O projeto já inclui os arquivos necessários para o Vercel:
- `vercel.json` - Configurações de build e rotas
- `.vercelignore` - Arquivos a serem ignorados no deploy
- `.env.example` - Modelo das variáveis de ambiente

### 2. Estrutura de Arquivos
```
spanishTutor/
├── server.js              # Servidor principal
├── spanishTutor.js        # Lógica da IA
├── sessionManager.js      # Gerenciamento de sessões
├── sessionEndpoints.js    # Endpoints de sessão
├── formatarResposta.js    # Formatação de respostas
├── package.json           # Dependências
├── vercel.json           # Configuração Vercel
├── .vercelignore         # Arquivos ignorados
└── .env.example          # Modelo de variáveis
```

## 🚀 Deploy no Vercel

### Método 1: Via GitHub (Recomendado)

1. **Faça push do código para o GitHub:**
```bash
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

2. **Conecte ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório GitHub
   - Vercel detectará automaticamente as configurações

### Método 2: Via Vercel CLI

1. **Instale o Vercel CLI:**
```bash
npm i -g vercel
```

2. **Faça login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

## ⚙️ Configuração das Variáveis de Ambiente

No painel do Vercel, configure as seguintes variáveis:

### Obrigatórias:
```
OPENROUTER_API_KEY=sk-or-v1-sua_chave_aqui
```

### Para UltraMsg:
```
ULTRAMSG_TOKEN=seu_token_aqui
ULTRAMSG_INSTANCE_ID=seu_instance_id_aqui
```

### Para Gupshup (opcional):
```
GUPSHUP_API_KEY=sua_api_key_aqui
GUPSHUP_APP_NAME=seu_app_name_aqui
GUPSHUP_SOURCE_NUMBER=seu_numero_aqui
```

## 🔗 Configuração do Webhook

Após o deploy, configure o webhook nos provedores:

### UltraMsg:
1. Acesse o painel do UltraMsg
2. Configure o webhook URL: `https://seu-projeto.vercel.app/webhook`
3. Método: POST

### Gupshup:
1. Acesse o painel do Gupshup
2. Configure o webhook URL: `https://seu-projeto.vercel.app/webhook`
3. Método: POST

## 📊 Endpoints Disponíveis

Após o deploy, os seguintes endpoints estarão disponíveis:

- `GET /` - Informações do bot
- `POST /webhook` - Receber mensagens WhatsApp
- `GET /webhook` - Verificação do webhook
- `GET /status` - Status do servidor
- `POST /test-ai` - Testar IA
- `POST /test-send` - Testar envio
- `POST /webhook/simulate` - Simular mensagem

## 🧪 Testando o Deploy

### 1. Verificar Status
```bash
curl https://seu-projeto.vercel.app/status
```

### 2. Testar IA
```bash
curl -X POST https://seu-projeto.vercel.app/test-ai \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿cómo estás?"}'
```

### 3. Simular Mensagem WhatsApp
```bash
curl -X POST https://seu-projeto.vercel.app/webhook/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5511999999999",
    "message": "Quiero aprender español"
  }'
```

## 🔍 Monitoramento

### Logs do Vercel
- Acesse o painel do Vercel
- Vá em "Functions" > "View Function Logs"
- Monitore as requisições e erros

### Métricas
- Tempo de resposta
- Número de invocações
- Erros e timeouts

## ⚠️ Limitações do Vercel

- **Timeout:** Máximo 30 segundos por função
- **Memória:** 1024MB por função
- **Armazenamento:** Sem persistência entre invocações
- **Sessões:** Armazenadas em memória (perdidas entre deploys)

## 🔧 Otimizações

### Para Produção:
1. **Use banco de dados externo** para sessões (Redis, MongoDB)
2. **Configure CDN** para assets estáticos
3. **Monitore performance** com Vercel Analytics
4. **Configure alertas** para erros

### Exemplo de Integração com Redis:
```javascript
// Adicione ao package.json
"redis": "^4.0.0"

// Configure no .env
REDIS_URL=redis://seu-redis-url
```

## 🆘 Troubleshooting

### Erro de Timeout
- Verifique se a API do OpenRouter está respondendo
- Reduza o timeout das requisições HTTP

### Variáveis de Ambiente
- Verifique se todas as variáveis estão configuradas
- Use o endpoint `/status` para verificar configurações

### Webhook não Funciona
- Verifique se a URL está correta
- Teste com `/webhook/simulate` primeiro
- Verifique os logs no painel do Vercel

## 📞 Suporte

Para problemas específicos do Vercel:
- [Documentação Vercel](https://vercel.com/docs)
- [Suporte Vercel](https://vercel.com/support)
- [Comunidade Vercel](https://github.com/vercel/vercel/discussions)