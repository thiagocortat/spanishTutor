/**
 * Endpoints adicionais para gerenciamento de sessões
 * Este arquivo contém endpoints específicos para o SessionManager
 */

/**
 * Adiciona endpoints de gerenciamento de sessões ao app Express
 * @param {Express} app - Instância do Express
 * @param {SessionManager} sessionManager - Instância do SessionManager
 */
function addSessionEndpoints(app, sessionManager) {
  
  // Endpoint para obter estatísticas detalhadas das sessões
  app.get('/sessions/stats', (req, res) => {
    try {
      const stats = sessionManager.getStats();
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        statistics: stats,
        details: {
          description: 'Estatísticas do sistema de sessões',
          sessionTimeout: '24 horas',
          maxMessagesPerSession: 5,
          cleanupInterval: '1 hora'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao obter estatísticas',
        details: error.message
      });
    }
  });

  // Endpoint para forçar limpeza de sessões inativas
  app.post('/sessions/cleanup', (req, res) => {
    try {
      const removedCount = sessionManager.cleanupInactiveSessions();
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Limpeza de sessões executada',
        removedSessions: removedCount,
        remainingSessions: sessionManager.getStats().totalSessions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao executar limpeza',
        details: error.message
      });
    }
  });

  // Endpoint para remover uma sessão específica
  app.delete('/sessions/:phone', (req, res) => {
    try {
      const phone = req.params.phone;
      const removed = sessionManager.removeSession(phone);
      
      if (removed) {
        res.json({
          success: true,
          timestamp: new Date().toISOString(),
          message: `Sessão removida para ${phone}`,
          phone: phone
        });
      } else {
        res.status(404).json({
          success: false,
          message: `Sessão não encontrada para ${phone}`,
          phone: phone
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao remover sessão',
        details: error.message
      });
    }
  });

  // Endpoint para listar todas as sessões ativas
  app.get('/sessions/list', (req, res) => {
    try {
      const stats = sessionManager.getStats();
      const sessions = [];
      
      // Obter informações básicas de cada sessão
      for (const [phoneNumber, sessionData] of sessionManager.sessions.entries()) {
        const now = new Date();
        const timeSinceLastActivity = now - sessionData.lastActivity;
        const isActive = timeSinceLastActivity <= sessionManager.sessionTimeout;
        
        sessions.push({
          phoneNumber,
          messageCount: sessionData.messages.length,
          lastActivity: sessionData.lastActivity.toISOString(),
          createdAt: sessionData.createdAt.toISOString(),
          isActive,
          timeSinceLastActivity: Math.round(timeSinceLastActivity / (1000 * 60)) // em minutos
        });
      }
      
      // Ordenar por última atividade (mais recente primeiro)
      sessions.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.isActive).length,
        sessions: sessions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar sessões',
        details: error.message
      });
    }
  });

  // Endpoint para limpar todas as sessões (usar com cuidado!)
  app.delete('/sessions/all', (req, res) => {
    try {
      const { confirm } = req.body;
      
      if (confirm !== 'DELETE_ALL_SESSIONS') {
        return res.status(400).json({
          success: false,
          error: 'Confirmação necessária',
          message: 'Para confirmar, envie { "confirm": "DELETE_ALL_SESSIONS" } no body da requisição'
        });
      }
      
      const removedCount = sessionManager.clearAllSessions();
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Todas as sessões foram removidas',
        removedSessions: removedCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao limpar todas as sessões',
        details: error.message
      });
    }
  });

  // Endpoint para obter histórico detalhado de uma sessão
  app.get('/sessions/:phone/history', (req, res) => {
    try {
      const phone = req.params.phone;
      const history = sessionManager.getSessionHistory(phone);
      
      if (history.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Nenhuma sessão encontrada para ${phone}`,
          phone: phone
        });
      }
      
      // Calcular estatísticas da sessão
      const levels = history.map(msg => msg.level);
      const levelCounts = levels.reduce((acc, level) => {
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});
      
      const mostCommonLevel = Object.keys(levelCounts).reduce((a, b) => 
        levelCounts[a] > levelCounts[b] ? a : b
      );
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        phone: phone,
        messageCount: history.length,
        maxMessages: sessionManager.maxMessages,
        sessionAnalysis: {
          mostCommonLevel,
          levelDistribution: levelCounts,
          firstMessage: history[0]?.timestamp,
          lastMessage: history[history.length - 1]?.timestamp
        },
        messages: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao obter histórico da sessão',
        details: error.message
      });
    }
  });

  console.log('📋 Endpoints de gerenciamento de sessões adicionados:');
  console.log('   GET /sessions/stats - Estatísticas das sessões');
  console.log('   POST /sessions/cleanup - Forçar limpeza de sessões inativas');
  console.log('   GET /sessions/list - Listar todas as sessões');
  console.log('   GET /sessions/:phone/history - Histórico detalhado de uma sessão');
  console.log('   DELETE /sessions/:phone - Remover sessão específica');
  console.log('   DELETE /sessions/all - Remover todas as sessões (requer confirmação)');
}

module.exports = { addSessionEndpoints };