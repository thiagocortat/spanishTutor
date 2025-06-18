// Servidor de teste simples para verificar se o problema é específico do Spanish Tutor
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de teste
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor de teste funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET / - Este endpoint',
      'GET /status - Status do servidor',
      'POST /webhook/simulate - Simulação de webhook'
    ]
  });
});

// Endpoint de status
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint de simulação simples
app.post('/webhook/simulate', (req, res) => {
  console.log('📥 Requisição recebida no /webhook/simulate');
  console.log('📱 Body:', JSON.stringify(req.body, null, 2));
  
  const { phone, message } = req.body;
  
  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      error: 'phone e message são obrigatórios'
    });
  }
  
  // Simular processamento
  const response = {
    success: true,
    received: {
      phone,
      message,
      timestamp: new Date().toISOString()
    },
    simulation: {
      aiResponse: `Resposta simulada para: "${message}"`,
      level: 'iniciante',
      processed: true
    }
  };
  
  console.log('📤 Enviando resposta:', JSON.stringify(response, null, 2));
  res.json(response);
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
  console.log(`🧪 Teste: POST http://localhost:${PORT}/webhook/simulate`);
  console.log(`\n⚡ Servidor pronto para testes!\n`);
});

// Tratamento de sinais
process.on('SIGINT', () => {
  console.log('\n🔄 Encerrando servidor de teste...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso!');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Encerrando servidor de teste...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso!');
    process.exit(0);
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
});