require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const SpanishTutor = require('./spanishTutor');
const SessionManager = require('./sessionManager');
const { addSessionEndpoints } = require('./sessionEndpoints');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar o tutor de espanhol
// IMPORTANTE: Defina sua chave da API OpenRouter na variável de ambiente OPENROUTER_API_KEY
const apiKey = process.env.OPENROUTER_API_KEY || 'sua-chave-aqui';
const spanishTutor = new SpanishTutor(apiKey);

// Inicializar gerenciador de sessões
const sessionManager = new SessionManager('./sessions.json');

// Configurações das APIs de WhatsApp (adicione no .env)
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;
const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID;
const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;
const GUPSHUP_APP_NAME = process.env.GUPSHUP_APP_NAME;
const GUPSHUP_SOURCE_NUMBER = process.env.GUPSHUP_SOURCE_NUMBER;

/**
 * Função para enviar mensagem via UltraMsg API
 * @param {string} to - Número do destinatário (formato internacional, ex: +5511999999999)
 * @param {string} message - Mensagem a ser enviada
 * @returns {Promise<Object>} - Resposta da API
 */
async function sendMessageViaUltraMsg(to, message) {
  try {
    if (!ULTRAMSG_TOKEN || !ULTRAMSG_INSTANCE_ID) {
      throw new Error('Configurações do UltraMsg não encontradas. Configure ULTRAMSG_TOKEN e ULTRAMSG_INSTANCE_ID no .env');
    }

    // Remover caracteres especiais do número e garantir formato correto
    const cleanNumber = to.replace(/[^0-9]/g, '');
    
    const url = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`;
    const data = {
      token: ULTRAMSG_TOKEN,
      to: cleanNumber,
      body: message,
      priority: 1 // Alta prioridade para respostas do tutor
    };

    console.log('\n📤 Enviando mensagem via UltraMsg...');
    console.log('URL:', url);
    console.log('Destinatário:', cleanNumber);
    console.log('Mensagem:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000 // 10 segundos de timeout
    });

    console.log('✅ Mensagem enviada via UltraMsg!');
    console.log('Status HTTP:', response.status);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

    return {
      success: true,
      provider: 'ultramsg',
      messageId: response.data.id,
      status: response.data.sent,
      httpStatus: response.status,
      response: response.data
    };

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem via UltraMsg:', error.message);
    if (error.response) {
      console.error('Status HTTP:', error.response.status);
      console.error('Resposta de erro:', JSON.stringify(error.response.data, null, 2));
    }
    
    return {
      success: false,
      provider: 'ultramsg',
      error: error.message,
      httpStatus: error.response?.status,
      response: error.response?.data
    };
  }
}

/**
 * Função para enviar mensagem via Gupshup API
 * @param {string} to - Número do destinatário (formato internacional, ex: +5511999999999)
 * @param {string} message - Mensagem a ser enviada
 * @returns {Promise<Object>} - Resposta da API
 */
async function sendMessageViaGupshup(to, message) {
  try {
    if (!GUPSHUP_API_KEY || !GUPSHUP_APP_NAME || !GUPSHUP_SOURCE_NUMBER) {
      throw new Error('Configurações do Gupshup não encontradas. Configure GUPSHUP_API_KEY, GUPSHUP_APP_NAME e GUPSHUP_SOURCE_NUMBER no .env');
    }

    // Remover caracteres especiais do número e garantir formato correto
    const cleanNumber = to.replace(/[^0-9]/g, '');
    
    const url = 'https://api.gupshup.io/sm/api/v1/msg';
    const data = {
      channel: 'whatsapp',
      source: GUPSHUP_SOURCE_NUMBER,
      'src.name': GUPSHUP_APP_NAME,
      destination: cleanNumber,
      message: JSON.stringify({
        type: 'text',
        text: message
      })
    };

    console.log('\n📤 Enviando mensagem via Gupshup...');
    console.log('URL:', url);
    console.log('Destinatário:', cleanNumber);
    console.log('Mensagem:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': GUPSHUP_API_KEY
      },
      timeout: 10000 // 10 segundos de timeout
    });

    console.log('✅ Mensagem enviada via Gupshup!');
    console.log('Status HTTP:', response.status);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

    return {
      success: true,
      provider: 'gupshup',
      messageId: response.data.messageId,
      status: response.data.status,
      httpStatus: response.status,
      response: response.data
    };

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem via Gupshup:', error.message);
    if (error.response) {
      console.error('Status HTTP:', error.response.status);
      console.error('Resposta de erro:', JSON.stringify(error.response.data, null, 2));
    }
    
    return {
      success: false,
      provider: 'gupshup',
      error: error.message,
      httpStatus: error.response?.status,
      response: error.response?.data
    };
  }
}

/**
 * Função principal para enviar mensagem via WhatsApp
 * Tenta primeiro UltraMsg, depois Gupshup como fallback
 * @param {string} to - Número do destinatário
 * @param {string} message - Mensagem a ser enviada
 * @returns {Promise<Object>} - Resultado do envio
 */
async function sendWhatsAppMessage(to, message) {
  console.log('\n🚀 Iniciando envio de mensagem WhatsApp...');
  
  // Tentar UltraMsg primeiro
  if (ULTRAMSG_TOKEN && ULTRAMSG_INSTANCE_ID) {
    const ultraMsgResult = await sendMessageViaUltraMsg(to, message);
    if (ultraMsgResult.success) {
      return ultraMsgResult;
    }
    console.log('⚠️ UltraMsg falhou, tentando Gupshup...');
  }
  
  // Fallback para Gupshup
  if (GUPSHUP_API_KEY && GUPSHUP_APP_NAME && GUPSHUP_SOURCE_NUMBER) {
    const gupshupResult = await sendMessageViaGupshup(to, message);
    if (gupshupResult.success) {
      return gupshupResult;
    }
  }
  
  // Se ambos falharam
  console.error('❌ Falha ao enviar mensagem por ambos os provedores');
  return {
    success: false,
    error: 'Nenhum provedor de WhatsApp configurado ou disponível',
    providers_tried: ['ultramsg', 'gupshup']
  };
}

// Middleware para parsing do JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para logging de todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Endpoint webhook para receber mensagens do WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    console.log('\n=== MENSAGEM RECEBIDA ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body completo:', JSON.stringify(req.body, null, 2));
    
    let senderPhone = null;
    let messageText = null;
    let messageType = null;
    
    // Extração de dados para Gupshup
    if (req.body.payload) {
      const payload = req.body.payload;
      senderPhone = payload.sender?.phone || payload.from;
      messageText = payload.payload?.text || payload.text;
      messageType = payload.type;
      
      console.log('\n--- Dados da Mensagem (Gupshup) ---');
      console.log('Telefone do remetente:', senderPhone);
      console.log('Conteúdo da mensagem:', messageText);
      console.log('Tipo da mensagem:', messageType);
    }
    
    // Extração de dados para UltraMsg
    if (req.body.data) {
      const data = req.body.data;
      senderPhone = data.from;
      messageText = data.body;
      messageType = data.type;
      
      console.log('\n--- Dados da Mensagem (UltraMsg) ---');
      console.log('Telefone do remetente:', senderPhone);
      console.log('Conteúdo da mensagem:', messageText);
      console.log('Tipo da mensagem:', messageType);
    }
    
    // Formato genérico para outros provedores
    if (req.body.from || req.body.sender) {
      senderPhone = req.body.from || req.body.sender;
      messageText = req.body.body || req.body.message || req.body.text;
      messageType = req.body.type || 'text';
      
      console.log('\n--- Dados da Mensagem (Genérico) ---');
      console.log('Telefone do remetente:', senderPhone);
      console.log('Conteúdo da mensagem:', messageText);
    }
    
    // Processar mensagem de texto com IA
    if (messageText && messageType === 'text' && senderPhone) {
      console.log('\n🤖 Processando com IA...');
      
      // Recuperar histórico da sessão (últimas 5 mensagens)
      const sessionHistory = sessionManager.getSessionHistory(senderPhone);
      const formattedHistory = spanishTutor.formatConversationHistory(sessionHistory);
      
      // Detectar nível do usuário
      const userLevel = spanishTutor.detectUserLevel(messageText);
      console.log('Nível detectado:', userLevel);
      
      // Gerar resposta com IA
      const rawAiResponse = await spanishTutor.generateSpanishResponse(messageText, formattedHistory);
      
      // Aplicar formatação didática
      const aiResponse = spanishTutor.formatDidacticResponse(rawAiResponse, messageText, userLevel);
      
      console.log('\n📝 Resposta original:', rawAiResponse);
      console.log('📚 Resposta formatada:', aiResponse);
      
      // Adicionar mensagem à sessão (mantém apenas as últimas 5)
      sessionManager.addMessage(senderPhone, messageText, aiResponse, userLevel);
      
      console.log('\n✅ Resposta processada e sessão atualizada');
      
      // Enviar resposta de volta ao usuário via WhatsApp
      const sendResult = await sendWhatsAppMessage(senderPhone, aiResponse);
      
      if (sendResult.success) {
        console.log('\n📱 Mensagem enviada com sucesso!');
        console.log('Provedor usado:', sendResult.provider);
        console.log('ID da mensagem:', sendResult.messageId);
      } else {
        console.error('\n❌ Falha ao enviar mensagem de resposta');
        console.error('Erro:', sendResult.error);
      }
    }
    
    console.log('========================\n');
    
    // Resposta rápida 200 OK
    res.status(200).json({ 
      status: 'success', 
      message: 'Webhook recebido com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(200).json({ 
      status: 'error', 
      message: 'Erro interno, mas webhook aceito',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de verificação (GET) - alguns provedores fazem verificação inicial
app.get('/webhook', (req, res) => {
  console.log('Verificação do webhook recebida:', req.query);
  
  // Para Gupshup, pode ser necessário retornar um challenge
  if (req.query['hub.challenge']) {
    return res.send(req.query['hub.challenge']);
  }
  
  res.status(200).send('Webhook ativo e funcionando!');
});

// Endpoint de status para verificar se o servidor está rodando
app.get('/status', (req, res) => {
  const sessionStats = sessionManager.getStats();
  
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    apiKeyConfigured: !!process.env.OPENROUTER_API_KEY,
    sessions: sessionStats,
    whatsappProviders: {
      ultramsg: {
        configured: !!(ULTRAMSG_TOKEN && ULTRAMSG_INSTANCE_ID)
      },
      gupshup: {
        configured: !!(GUPSHUP_API_KEY && GUPSHUP_APP_NAME && GUPSHUP_SOURCE_NUMBER)
      }
    }
  });
});

// Endpoint para testar a IA diretamente
app.post('/test-ai', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }
    
    const formattedHistory = history ? spanishTutor.formatConversationHistory(history) : [];
    const level = spanishTutor.detectUserLevel(message);
    const rawResponse = await spanishTutor.generateSpanishResponse(message, formattedHistory);
    const formattedResponse = spanishTutor.formatDidacticResponse(rawResponse, message, level);
    
    res.json({
      userMessage: message,
      rawAiResponse: rawResponse,
      formattedResponse: formattedResponse,
      detectedLevel: level,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro no teste da IA:', error);
    res.status(500).json({ 
      error: 'Erro ao processar mensagem',
      details: error.message 
    });
  }
});

// Endpoint para ver histórico de uma conversa
app.get('/conversation/:phone', (req, res) => {
  const phone = req.params.phone;
  const history = sessionManager.getSessionHistory(phone);
  
  res.json({
    phone: phone,
    messageCount: history.length,
    conversation: history,
    lastActivity: history.length > 0 ? history[history.length - 1].timestamp : null,
    maxMessages: 5,
    sessionTimeout: '24 horas'
  });
});

// Endpoint para simular recebimento de mensagens do WhatsApp (teste manual)
app.post('/webhook/simulate', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: phone (número do remetente) e message (mensagem)' 
      });
    }
    
    console.log('\n=== SIMULAÇÃO DE MENSAGEM WHATSAPP ===');
    console.log('📱 Telefone:', phone);
    console.log('💬 Mensagem recebida:', message);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    // Recuperar histórico da sessão
    const sessionHistory = sessionManager.getSessionHistory(phone);
    const formattedHistory = spanishTutor.formatConversationHistory(sessionHistory);
    
    console.log('📚 Histórico da sessão:', sessionHistory.length, 'mensagens');
    
    // Detectar nível do usuário
    const userLevel = spanishTutor.detectUserLevel(message);
    console.log('🎯 Nível detectado:', userLevel);
    
    // Gerar resposta com IA
    console.log('🤖 Gerando resposta com IA...');
    const rawAiResponse = await spanishTutor.generateSpanishResponse(message, formattedHistory);
    
    // Aplicar formatação didática
    const aiResponse = spanishTutor.formatDidacticResponse(rawAiResponse, message, userLevel);
    
    console.log('\n📝 Resposta da IA (bruta):', rawAiResponse);
    console.log('📚 Resposta formatada:', aiResponse);
    
    // Adicionar mensagem à sessão
    sessionManager.addMessage(phone, message, aiResponse, userLevel);
    
    // Simular envio da resposta (apenas log)
    console.log('\n>> RESPOSTA ENVIADA:', aiResponse);
    console.log('=====================================\n');
    
    res.json({
      success: true,
      userMessage: message,
      aiResponse: aiResponse,
      detectedLevel: userLevel,
      sessionMessages: sessionHistory.length + 1,
      timestamp: new Date().toISOString(),
      note: 'Simulação concluída - resposta exibida no console'
    });
    
  } catch (error) {
    console.error('❌ Erro na simulação:', error);
    res.status(500).json({ 
      error: 'Erro ao processar simulação',
      details: error.message 
    });
  }
});

// Endpoint para testar envio de mensagens WhatsApp
app.post('/test-send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: to (número do destinatário) e message (mensagem)' 
      });
    }
    
    console.log('\n🧪 Teste de envio de mensagem...');
    console.log('Destinatário:', to);
    console.log('Mensagem:', message);
    
    const result = await sendWhatsAppMessage(to, message);
    
    res.json({
      testResult: result,
      timestamp: new Date().toISOString(),
      configStatus: {
        ultramsg: !!(ULTRAMSG_TOKEN && ULTRAMSG_INSTANCE_ID),
        gupshup: !!(GUPSHUP_API_KEY && GUPSHUP_APP_NAME && GUPSHUP_SOURCE_NUMBER)
      }
    });
    
  } catch (error) {
    console.error('Erro no teste de envio:', error);
    res.status(500).json({ 
      error: 'Erro ao testar envio de mensagem',
      details: error.message 
    });
  }
});

// Adicionar endpoints de gerenciamento de sessões
addSessionEndpoints(app, sessionManager);

// Endpoint raiz
app.get('/', (req, res) => {
  const sessionStats = sessionManager.getStats();
  
  res.json({
    message: 'Spanish Tutor WhatsApp Bot está rodando!',
    endpoints: {
      webhook_post: '/webhook (POST) - Receber mensagens do WhatsApp',
      webhook_get: '/webhook (GET) - Verificação do webhook',
      webhook_simulate: '/webhook/simulate (POST) - Simular mensagem WhatsApp para teste',
      status: '/status (GET) - Status do servidor',
      test_ai: '/test-ai (POST) - Testar IA diretamente',
      test_send: '/test-send (POST) - Testar envio de mensagens',
      conversation: '/conversation/:phone (GET) - Ver histórico',
      sessions_stats: '/sessions/stats (GET) - Estatísticas das sessões',
      sessions_list: '/sessions/list (GET) - Listar todas as sessões',
      sessions_cleanup: '/sessions/cleanup (POST) - Forçar limpeza',
      session_history: '/sessions/:phone/history (GET) - Histórico detalhado',
      session_delete: '/sessions/:phone (DELETE) - Remover sessão',
      sessions_clear: '/sessions/all (DELETE) - Remover todas (requer confirmação)'
    },
    sessionSystem: {
      enabled: true,
      maxMessagesPerSession: sessionStats.maxMessagesPerSession,
      sessionTimeoutHours: sessionStats.sessionTimeoutHours,
      totalSessions: sessionStats.totalSessions,
      activeSessions: sessionStats.activeSessions
    },
    whatsappProviders: {
      ultramsg: !!(ULTRAMSG_TOKEN && ULTRAMSG_INSTANCE_ID),
      gupshup: !!(GUPSHUP_API_KEY && GUPSHUP_APP_NAME && GUPSHUP_SOURCE_NUMBER)
    },
    timestamp: new Date().toISOString()
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor webhook rodando na porta ${PORT}`);
  console.log(`📱 Endpoint webhook: http://localhost:${PORT}/webhook`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
  console.log(`\n⚡ Pronto para receber mensagens do WhatsApp!\n`);
});

// Tratamento de finalização do processo
process.on('SIGINT', () => {
  console.log('\n🔄 Finalizando servidor...');
  sessionManager.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Finalizando servidor...');
  sessionManager.destroy();
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  sessionManager.destroy();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
});