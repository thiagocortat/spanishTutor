// Teste simples do endpoint de simulação
const http = require('http');

// Dados para teste
const postData = JSON.stringify({
  phone: '+5511999999999',
  message: 'Hola, ¿cómo estás?'
});

// Opções da requisição
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/webhook/simulate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testando endpoint de simulação...');
console.log('📱 Enviando:', postData);
console.log('🔗 URL:', `http://localhost:3000/webhook/simulate`);
console.log('---');

// Fazer a requisição
const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 Resposta recebida:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Resposta (texto):', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro na requisição:', e.message);
  console.log('💡 Certifique-se de que o servidor está rodando na porta 3000');
});

// Enviar os dados
req.write(postData);
req.end();