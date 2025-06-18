const axios = require('axios');

async function testSendMessage() {
  try {
    console.log('🧪 Testando envio de mensagem via UltraMsg...');
    
    const testData = {
      to: '+5521971189552',
      message: 'Teste de envio de mensagem do Spanish Tutor Bot'
    };
    
    console.log('📤 Enviando para:', testData.to);
    console.log('💬 Mensagem:', testData.message);
    
    const response = await axios.post('http://localhost:3000/test-send', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Resposta do teste:', response.status);
    console.log('📊 Resultado:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSendMessage();