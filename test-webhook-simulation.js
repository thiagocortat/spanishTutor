/**
 * Script de teste para o endpoint de simulação do webhook
 * Este script demonstra como testar o ciclo completo sem WhatsApp real
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:3000';

async function testWebhookSimulation() {
  try {
    console.log('🧪 Testando simulação de webhook WhatsApp...');
    console.log('=' .repeat(50));
    
    // Dados de teste
    const testData = {
      phone: '+5511999999999',
      message: 'Hola, ¿cómo estás?'
    };
    
    console.log('📱 Enviando mensagem de teste:');
    console.log('Telefone:', testData.phone);
    console.log('Mensagem:', testData.message);
    console.log('');
    
    // Fazer requisição para o endpoint de simulação
    const response = await axios.post(`${SERVER_URL}/webhook/simulate`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta recebida:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Função para testar múltiplas mensagens (conversação)
async function testConversation() {
  const phone = '+5511999999999';
  const messages = [
    'Hola, ¿cómo estás?',
    '¿Puedes ayudarme con el español?',
    'Quiero aprender los verbos',
    '¿Cómo se dice "hello" en español?',
    'Gracias por tu ayuda'
  ];
  
  console.log('\n🗣️ Testando conversação completa...');
  console.log('=' .repeat(50));
  
  for (let i = 0; i < messages.length; i++) {
    try {
      console.log(`\n📨 Mensagem ${i + 1}/${messages.length}: "${messages[i]}"`);
      
      const response = await axios.post(`${SERVER_URL}/webhook/simulate`, {
        phone: phone,
        message: messages[i]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Resposta:', response.data.aiResponse);
      console.log('🎯 Nível detectado:', response.data.detectedLevel);
      console.log('📊 Total de mensagens na sessão:', response.data.sessionMessages);
      
      // Aguardar um pouco entre mensagens
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Erro na mensagem ${i + 1}:`, error.message);
    }
  }
}

// Função para verificar o histórico da sessão
async function checkSessionHistory(phone) {
  try {
    console.log('\n📚 Verificando histórico da sessão...');
    console.log('=' .repeat(50));
    
    const response = await axios.get(`${SERVER_URL}/conversation/${encodeURIComponent(phone)}`);
    
    console.log('📱 Telefone:', response.data.phone);
    console.log('📊 Total de mensagens:', response.data.messageCount);
    console.log('⏰ Última atividade:', response.data.lastActivity);
    console.log('\n💬 Histórico:');
    
    response.data.conversation.forEach((msg, index) => {
      console.log(`\n${index + 1}. [${msg.timestamp}]`);
      console.log(`   👤 Usuário: ${msg.userMessage}`);
      console.log(`   🤖 IA: ${msg.aiResponse}`);
      console.log(`   🎯 Nível: ${msg.userLevel}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar histórico:', error.message);
  }
}

// Executar testes
async function runAllTests() {
  console.log('🚀 Iniciando testes do sistema de simulação...');
  
  // Teste 1: Mensagem única
  await testWebhookSimulation();
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Teste 2: Conversação completa
  await testConversation();
  
  // Teste 3: Verificar histórico
  await checkSessionHistory('+5511999999999');
  
  console.log('\n🎉 Testes concluídos!');
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await axios.get(`${SERVER_URL}/status`);
    console.log('✅ Servidor está rodando!');
    console.log('Status:', response.data.status);
    return true;
  } catch (error) {
    console.error('❌ Servidor não está rodando. Inicie com: npm start');
    return false;
  }
}

// Executar
if (require.main === module) {
  checkServer().then(serverRunning => {
    if (serverRunning) {
      runAllTests();
    }
  });
}

module.exports = {
  testWebhookSimulation,
  testConversation,
  checkSessionHistory,
  runAllTests
};