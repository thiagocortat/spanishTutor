const axios = require('axios');

async function testWebhookReal() {
  try {
    console.log('🧪 Simulando mensagem real recebida no webhook...');
    
    // Simular formato real do UltraMsg
    const webhookData = {
      event_type: 'message_received',
      instanceId: 'instance126416',
      data: {
        id: 'false_5521971189552@c.us_3EB0FF54790702367270',
        from: '5521971189552@c.us',
        to: 'instance126416@c.us',
        ack: '',
        type: 'chat',
        body: 'Hola, ¿cómo estás?',
        fromMe: false,
        time: Math.floor(Date.now() / 1000)
      }
    };
    
    console.log('📤 Enviando webhook data:', JSON.stringify(webhookData, null, 2));
    
    const response = await axios.post('http://localhost:3000/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'UltraMsg-Webhook/1.0'
      },
      timeout: 60000
    });
    
    console.log('✅ Webhook processado!');
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
    // Aguardar um pouco para ver os logs do servidor
    console.log('\n⏳ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code) {
      console.error('Código do erro:', error.code);
    } else {
      console.error('Erro completo:', error);
    }
  }
}

testWebhookReal();