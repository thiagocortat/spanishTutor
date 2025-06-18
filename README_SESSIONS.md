# Sistema de Sessões - Spanish Tutor

Este documento descreve o sistema de controle de sessões implementado no Spanish Tutor WhatsApp Bot.

## 📋 Visão Geral

O sistema de sessões foi projetado para:
- **Manter contexto curto**: Armazena apenas as últimas 5 mensagens por usuário
- **Persistência local**: Usa arquivo JSON para armazenamento (sem infraestrutura complexa)
- **Limpeza automática**: Remove sessões inativas após 24 horas
- **Eficiência**: Otimizado para uso de memória e performance

## 🏗️ Arquitetura

### Componentes Principais

1. **SessionManager** (`sessionManager.js`)
   - Classe principal para gerenciamento de sessões
   - Armazenamento em arquivo JSON
   - Limpeza automática de sessões inativas

2. **Session Endpoints** (`sessionEndpoints.js`)
   - Endpoints REST para gerenciamento de sessões
   - Estatísticas e monitoramento
   - Operações administrativas

3. **Integração no Server** (`server.js`)
   - Substituição do Map simples pelo SessionManager
   - Tratamento de finalização graceful

## 📊 Estrutura de Dados

### Formato da Sessão
```json
{
  "phoneNumber": {
    "messages": [
      {
        "user": "Como se diz olá em espanhol?",
        "assistant": "Em espanhol, 'olá' se diz *hola* 📝...",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "level": "beginner"
      }
    ],
    "lastActivity": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Configurações
- **Máximo de mensagens por sessão**: 5
- **Timeout de sessão**: 24 horas
- **Intervalo de limpeza**: 1 hora
- **Arquivo de armazenamento**: `sessions.json`

## 🚀 Funcionalidades

### 1. Armazenamento Automático
- Cada mensagem é automaticamente salva na sessão do usuário
- Mantém apenas as últimas 5 mensagens (FIFO)
- Persiste no arquivo JSON a cada operação

### 2. Limpeza Automática
- Executa a cada 1 hora
- Remove sessões inativas há mais de 24 horas
- Log detalhado das operações de limpeza

### 3. Recuperação de Contexto
- Carrega automaticamente o histórico ao processar mensagens
- Fornece contexto para a IA gerar respostas mais relevantes
- Detecta nível do usuário baseado no histórico

## 🔧 API Endpoints

### Endpoints Básicos

#### `GET /conversation/:phone`
Obter histórico de uma conversa específica.

**Resposta:**
```json
{
  "phone": "+5511999999999",
  "messageCount": 3,
  "conversation": [...],
  "lastActivity": "2024-01-15T10:30:00.000Z",
  "maxMessages": 5,
  "sessionTimeout": "24 horas"
}
```

### Endpoints de Gerenciamento

#### `GET /sessions/stats`
Estatísticas detalhadas do sistema de sessões.

**Resposta:**
```json
{
  "success": true,
  "statistics": {
    "totalSessions": 15,
    "activeSessions": 12,
    "inactiveSessions": 3,
    "totalMessages": 45,
    "averageMessagesPerSession": "3.00",
    "maxMessagesPerSession": 5,
    "sessionTimeoutHours": 24
  }
}
```

#### `GET /sessions/list`
Listar todas as sessões com informações básicas.

#### `GET /sessions/:phone/history`
Histórico detalhado com análise da sessão.

#### `POST /sessions/cleanup`
Forçar limpeza de sessões inativas.

#### `DELETE /sessions/:phone`
Remover uma sessão específica.

#### `DELETE /sessions/all`
Remover todas as sessões (requer confirmação).

**Body necessário:**
```json
{
  "confirm": "DELETE_ALL_SESSIONS"
}
```

## 📈 Monitoramento

### Logs Automáticos
O sistema gera logs detalhados para:
- Criação de novas sessões
- Adição de mensagens
- Limpeza de mensagens antigas
- Remoção de sessões inativas
- Operações de arquivo

### Estatísticas em Tempo Real
- Total de sessões ativas/inativas
- Média de mensagens por sessão
- Idade das sessões
- Performance do sistema

## 🔒 Segurança e Performance

### Limitações de Recursos
- **Máximo 5 mensagens por sessão**: Evita crescimento descontrolado
- **Timeout de 24h**: Remove dados antigos automaticamente
- **Limpeza periódica**: Mantém o sistema otimizado

### Tratamento de Erros
- Validação de estrutura de dados
- Recuperação automática de arquivos corrompidos
- Logs detalhados de erros
- Fallback para Map em memória em caso de falha

### Finalização Graceful
- Salva todas as sessões ao finalizar o processo
- Limpa intervalos de limpeza automática
- Tratamento de sinais SIGINT e SIGTERM

## 🛠️ Configuração

### Variáveis Personalizáveis
```javascript
// No SessionManager constructor
const sessionManager = new SessionManager(
  './sessions.json',     // Caminho do arquivo
  5,                     // Máximo de mensagens
  24 * 60 * 60 * 1000   // Timeout em ms
);
```

### Estrutura de Arquivos
```
spanishTutor/
├── sessionManager.js      # Classe principal
├── sessionEndpoints.js    # Endpoints REST
├── sessions.json         # Arquivo de dados (criado automaticamente)
├── server.js            # Integração principal
└── README_SESSIONS.md   # Esta documentação
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Arquivo sessions.json corrompido**
   - O sistema recria automaticamente
   - Logs indicam a recuperação

2. **Sessões não sendo limpas**
   - Verificar logs de limpeza automática
   - Usar endpoint `/sessions/cleanup` para forçar

3. **Performance degradada**
   - Verificar número total de sessões
   - Considerar reduzir timeout se necessário

### Comandos Úteis

```bash
# Verificar estatísticas
curl http://localhost:3000/sessions/stats

# Forçar limpeza
curl -X POST http://localhost:3000/sessions/cleanup

# Listar sessões
curl http://localhost:3000/sessions/list

# Ver histórico específico
curl http://localhost:3000/sessions/+5511999999999/history
```

## 🔄 Migração

### Do Map para SessionManager
A migração foi automática e transparente:
- Substituição do `conversationHistory` Map
- Manutenção da mesma interface de uso
- Adição de persistência e limpeza automática

### Backup e Restauração
```bash
# Backup
cp sessions.json sessions_backup_$(date +%Y%m%d_%H%M%S).json

# Restauração
cp sessions_backup_YYYYMMDD_HHMMSS.json sessions.json
```

## 📝 Próximos Passos

### Melhorias Futuras
- [ ] Compressão do arquivo JSON
- [ ] Migração opcional para SQLite
- [ ] Métricas de performance
- [ ] Dashboard web para monitoramento
- [ ] Backup automático
- [ ] Configuração via variáveis de ambiente

### Considerações para Produção
- Monitorar tamanho do arquivo sessions.json
- Implementar rotação de logs
- Considerar backup periódico
- Avaliar migração para banco de dados se necessário

---

**Desenvolvido para o Spanish Tutor WhatsApp Bot**  
*Sistema de sessões simples, eficiente e sem infraestrutura complexa*