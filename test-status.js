const https = require('https');

const options = {
  hostname: 'spanish-tutor-three.vercel.app',
  port: 443,
  path: '/status',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResposta completa:', data);
    try {
      const jsonResponse = JSON.parse(data);
      console.log('\nResposta JSON formatada:', JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('\nResposta não é JSON válido');
    }
  });
});

req.on('error', (error) => {
  console.error('Erro na requisição:', error);
});

req.end();