const https = require('https');

const data = JSON.stringify({
  data: {
    from: '5521971189552',
    body: 'Oi, como você está?',
    type: 'text'
  }
});

const options = {
  hostname: 'spanish-tutor-three.vercel.app',
  port: 443,
  path: '/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testando webhook...');
console.log('URL:', `https://${options.hostname}${options.path}`);
console.log('Dados:', data);

const req = https.request(options, (res) => {
  console.log('\nStatus HTTP:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResposta completa:', responseData);
  });
});

req.on('error', (e) => {
  console.error('Erro na requisição:', e.message);
});

req.write(data);
req.end();