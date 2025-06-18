const fs = require('fs');
const path = require('path');

/**
 * Gerenciador de Sessões para o Spanish Tutor
 * Armazena as últimas 5 mensagens por número de telefone
 * Remove sessões inativas após 24 horas
 */
class SessionManager {
  constructor(sessionFilePath = './sessions.json') {
    this.sessionFilePath = path.resolve(sessionFilePath);
    this.sessions = new Map();
    this.maxMessages = 5; // Máximo de 5 mensagens por sessão
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    this.isServerless = process.env.NODE_ENV === 'production';
    
    // Carregar sessões existentes (apenas em ambiente local)
    if (!this.isServerless) {
      this.loadSessions();
      
      // Configurar limpeza automática a cada hora (apenas em ambiente local)
      this.cleanupInterval = setInterval(() => {
        this.cleanupInactiveSessions();
      }, 60 * 60 * 1000); // A cada 1 hora
    }
    
    console.log('📁 SessionManager inicializado');
    console.log(`📂 Modo: ${this.isServerless ? 'Serverless (memória)' : 'Local (arquivo)'}`);
    console.log(`📊 Sessões carregadas: ${this.sessions.size}`);
  }

  /**
   * Carrega sessões do arquivo JSON
   */
  loadSessions() {
    try {
      if (fs.existsSync(this.sessionFilePath)) {
        const data = fs.readFileSync(this.sessionFilePath, 'utf8');
        const sessionsData = JSON.parse(data);
        
        // Converter objeto para Map e validar estrutura
        for (const [phoneNumber, sessionData] of Object.entries(sessionsData)) {
          if (sessionData && sessionData.messages && sessionData.lastActivity) {
            this.sessions.set(phoneNumber, {
              messages: sessionData.messages || [],
              lastActivity: new Date(sessionData.lastActivity),
              createdAt: new Date(sessionData.createdAt || sessionData.lastActivity)
            });
          }
        }
        
        console.log(`✅ Sessões carregadas do arquivo: ${this.sessions.size}`);
      } else {
        console.log('📄 Arquivo de sessões não existe, criando novo...');
        this.saveSessions();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar sessões:', error.message);
      this.sessions = new Map();
    }
  }

  /**
   * Salva sessões no arquivo JSON
   */
  saveSessions() {
    // Não salvar em arquivo no ambiente serverless
    if (this.isServerless) {
      console.log('💾 Modo serverless: sessões mantidas apenas em memória');
      return;
    }
    
    try {
      const sessionsData = {};
      
      // Converter Map para objeto
      for (const [phoneNumber, sessionData] of this.sessions.entries()) {
        sessionsData[phoneNumber] = {
          messages: sessionData.messages,
          lastActivity: sessionData.lastActivity.toISOString(),
          createdAt: sessionData.createdAt.toISOString()
        };
      }
      
      fs.writeFileSync(this.sessionFilePath, JSON.stringify(sessionsData, null, 2), 'utf8');
      console.log(`💾 Sessões salvas: ${this.sessions.size} sessões`);
    } catch (error) {
      console.error('❌ Erro ao salvar sessões:', error.message);
    }
  }

  /**
   * Adiciona uma nova mensagem à sessão
   * @param {string} phoneNumber - Número de telefone
   * @param {string} userMessage - Mensagem do usuário
   * @param {string} assistantMessage - Resposta do assistente
   * @param {string} userLevel - Nível detectado do usuário
   */
  addMessage(phoneNumber, userMessage, assistantMessage, userLevel = 'intermediate') {
    const now = new Date();
    
    // Obter ou criar sessão
    let session = this.sessions.get(phoneNumber);
    if (!session) {
      session = {
        messages: [],
        lastActivity: now,
        createdAt: now
      };
      this.sessions.set(phoneNumber, session);
      console.log(`🆕 Nova sessão criada para: ${phoneNumber}`);
    }
    
    // Adicionar nova mensagem
    const messageEntry = {
      user: userMessage,
      assistant: assistantMessage,
      timestamp: now.toISOString(),
      level: userLevel
    };
    
    session.messages.push(messageEntry);
    session.lastActivity = now;
    
    // Manter apenas as últimas 5 mensagens
    if (session.messages.length > this.maxMessages) {
      const removedMessages = session.messages.splice(0, session.messages.length - this.maxMessages);
      console.log(`🗑️ Removidas ${removedMessages.length} mensagens antigas de ${phoneNumber}`);
    }
    
    // Salvar no arquivo
    this.saveSessions();
    
    console.log(`💬 Mensagem adicionada para ${phoneNumber} (${session.messages.length}/${this.maxMessages})`);
    
    return session;
  }

  /**
   * Obtém o histórico de mensagens de uma sessão
   * @param {string} phoneNumber - Número de telefone
   * @returns {Array} - Array de mensagens formatadas
   */
  getSessionHistory(phoneNumber) {
    const session = this.sessions.get(phoneNumber);
    
    if (!session || !session.messages || session.messages.length === 0) {
      console.log(`📭 Nenhum histórico encontrado para: ${phoneNumber}`);
      return [];
    }
    
    // Atualizar última atividade
    session.lastActivity = new Date();
    this.saveSessions();
    
    console.log(`📚 Histórico recuperado para ${phoneNumber}: ${session.messages.length} mensagens`);
    return session.messages;
  }

  /**
   * Remove sessões inativas (mais de 24 horas)
   */
  cleanupInactiveSessions() {
    const now = new Date();
    const inactiveSessions = [];
    
    for (const [phoneNumber, session] of this.sessions.entries()) {
      const timeSinceLastActivity = now - session.lastActivity;
      
      if (timeSinceLastActivity > this.sessionTimeout) {
        inactiveSessions.push(phoneNumber);
      }
    }
    
    // Remover sessões inativas
    for (const phoneNumber of inactiveSessions) {
      this.sessions.delete(phoneNumber);
      console.log(`🗑️ Sessão inativa removida: ${phoneNumber}`);
    }
    
    if (inactiveSessions.length > 0) {
      this.saveSessions();
      console.log(`🧹 Limpeza concluída: ${inactiveSessions.length} sessões removidas`);
    } else {
      console.log('✨ Nenhuma sessão inativa encontrada');
    }
    
    return inactiveSessions.length;
  }

  /**
   * Obtém estatísticas das sessões
   * @returns {Object} - Estatísticas
   */
  getStats() {
    const now = new Date();
    let totalMessages = 0;
    let activeSessions = 0;
    const sessionAges = [];
    
    for (const [phoneNumber, session] of this.sessions.entries()) {
      totalMessages += session.messages.length;
      
      const timeSinceLastActivity = now - session.lastActivity;
      if (timeSinceLastActivity <= this.sessionTimeout) {
        activeSessions++;
      }
      
      const sessionAge = now - session.createdAt;
      sessionAges.push(sessionAge);
    }
    
    return {
      totalSessions: this.sessions.size,
      activeSessions,
      inactiveSessions: this.sessions.size - activeSessions,
      totalMessages,
      averageMessagesPerSession: this.sessions.size > 0 ? (totalMessages / this.sessions.size).toFixed(2) : 0,
      maxMessagesPerSession: this.maxMessages,
      sessionTimeoutHours: this.sessionTimeout / (60 * 60 * 1000),
      oldestSessionAge: sessionAges.length > 0 ? Math.max(...sessionAges) : 0,
      newestSessionAge: sessionAges.length > 0 ? Math.min(...sessionAges) : 0
    };
  }

  /**
   * Remove uma sessão específica
   * @param {string} phoneNumber - Número de telefone
   * @returns {boolean} - True se a sessão foi removida
   */
  removeSession(phoneNumber) {
    const existed = this.sessions.has(phoneNumber);
    if (existed) {
      this.sessions.delete(phoneNumber);
      this.saveSessions();
      console.log(`🗑️ Sessão removida manualmente: ${phoneNumber}`);
    }
    return existed;
  }

  /**
   * Limpa todas as sessões
   */
  clearAllSessions() {
    const count = this.sessions.size;
    this.sessions.clear();
    this.saveSessions();
    console.log(`🗑️ Todas as sessões foram removidas: ${count} sessões`);
    return count;
  }

  /**
   * Finaliza o gerenciador de sessões
   */
  destroy() {
    console.log('🔄 Finalizando SessionManager...');
    
    // Salvar sessões antes de finalizar (apenas em ambiente local)
    if (!this.isServerless) {
      this.saveSessions();
    }
    
    // Limpar o intervalo de limpeza (apenas se existir)
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Limpar todas as sessões da memória
    this.sessions.clear();
    
    console.log('✅ SessionManager finalizado');
  }
}

module.exports = SessionManager;