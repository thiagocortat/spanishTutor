const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGroqConnection() {
  try {
    console.log('🔑 Testando conexão com Groq...');
    console.log('API Key:', GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 20)}...` : 'NÃO ENCONTRADA');
    
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY não encontrada no .env');
    }
    
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "Connection successful"'
        }
      ],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
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
    console.error('❌ Erro na conexão com Groq:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados do erro:', error.response.data);
      
      if (error.response.status === 402) {
        console.error('💳 ERRO: Créditos insuficientes na conta Groq');
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
testGroqConnection().then(result => {
  if (result.success) {
    console.log('\n🎉 Teste concluído com sucesso!');
  } else {
    console.log('\n💥 Teste falhou. Verifique os créditos da conta Groq.');
  }
}).catch(console.error);