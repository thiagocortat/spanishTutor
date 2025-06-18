const https = require('https');
const querystring = require('querystring');

// Dados da mensagem
const data = querystring.stringify({
  token: 'wb0s9i41xo314n88',
  to: '5521971189552',
  body: 'Olá! Este é um teste do Spanish Tutor. Por favor, responda com uma frase em português para testar a tradução automática.'
});

const options = {
  hostname: 'api.ultramsg.com',
  port: 443,
  path: '/instance126416/messages/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': data.length
  }
};

console.log('Enviando mensagem de teste via UltraMsg...');
console.log('Para:', '5521971189552');
console.log('Mensagem:', 'Olá! Este é um teste do Spanish Tutor...');

const req = https.request(options, (res) => {
  console.log('\nStatus HTTP:', res.statusCode);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResposta da API UltraMsg:', responseData);
    try {
      const parsed = JSON.parse(responseData);
      if (parsed.sent === 'true') {
        console.log('✅ Mensagem enviada com sucesso!');
        console.log('ID da mensagem:', parsed.id);
        console.log('\n📱 Agora envie uma resposta em português para o WhatsApp para testar a tradução automática.');
      } else {
        console.log('❌ Falha no envio:', parsed.message);
      }
    } catch (e) {
      console.log('Resposta recebida (não JSON):', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Erro na requisição:', e.message);
});

req.write(data);
req.end();