const axios = require('axios');

async function testWebhookMessage() {
  try {
    console.log('🧪 Testando envio de mensagem via webhook...');
    
    const testMessage = {
      from: '+5511999999999',
      body: 'Hola, ¿cómo estás?',
      type: 'text'
    };
    
    console.log('📤 Enviando mensagem de teste:', testMessage);
    
    const response = await axios.post('http://localhost:3000/webhook/simulate', testMessage, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Resposta do webhook:', response.status, response.data);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

testWebhookMessage();