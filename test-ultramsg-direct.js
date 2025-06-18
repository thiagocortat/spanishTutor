require('dotenv').config();
const axios = require('axios');

async function testUltraMsgDirect() {
  try {
    console.log('🧪 Testando UltraMsg API diretamente...');
    
    const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;
    const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID;
    
    console.log('🔑 Token:', ULTRAMSG_TOKEN ? `${ULTRAMSG_TOKEN.substring(0, 8)}...` : 'NÃO CONFIGURADO');
    console.log('🆔 Instance ID:', ULTRAMSG_INSTANCE_ID || 'NÃO CONFIGURADO');
    
    if (!ULTRAMSG_TOKEN || !ULTRAMSG_INSTANCE_ID) {
      console.error('❌ Configurações do UltraMsg não encontradas!');
      return;
    }
    
    const url = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`;
    const data = {
      token: ULTRAMSG_TOKEN,
      to: '5511999999999', // Número de teste sem +
      body: 'Teste direto da API UltraMsg - Spanish Tutor Bot',
      priority: 1
    };
    
    console.log('🌐 URL:', url);
    console.log('📤 Dados:', {
      token: `${data.token.substring(0, 8)}...`,
      to: data.to,
      body: data.body,
      priority: data.priority
    });
    
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000
    });
    
    console.log('✅ Sucesso!');
    console.log('Status HTTP:', response.status);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status HTTP:', error.response.status);
      console.error('Resposta de erro:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
  }
}

testUltraMsgDirect();