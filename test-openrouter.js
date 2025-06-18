const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function testOpenRouterConnection() {
  try {
    console.log('🔑 Testando conexão com OpenRouter...');
    console.log('API Key:', OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 20)}...` : 'NÃO ENCONTRADA');
    
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY não encontrada no .env');
    }
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "Connection successful"'
        }
      ],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://spanish-tutor-three.vercel.app',
        'X-Title': 'Spanish Tutor App'
      }
    });
    
    console.log('✅ Conexão bem-sucedida!');
    console.log('Status:', response.status);
    console.log('Modelo usado:', response.data.model);
    console.log('Resposta da IA:', response.data.choices[0].message.content);
    console.log('Tokens usados:', response.data.usage);
    
    return {
      success: true,
      response: response.data
    };
    
  } catch (error) {
    console.error('❌ Erro na conexão com OpenRouter:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados do erro:', error.response.data);
      
      if (error.response.status === 402) {
        console.error('💳 ERRO: Créditos insuficientes na conta OpenRouter');
      } else if (error.response.status === 401) {
        console.error('🔐 ERRO: API Key inválida ou expirada');
      }
    } else {
      console.error('Erro de rede:', error.message);
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
}

// Executar o teste
testOpenRouterConnection().then(result => {
  if (result.success) {
    console.log('\n🎉 Teste concluído com sucesso!');
  } else {
    console.log('\n💥 Teste falhou. Verifique os créditos da conta OpenRouter.');
  }
}).catch(console.error);