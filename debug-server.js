// Script de diagnóstico para identificar problemas no servidor
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando diagnóstico do servidor...');
console.log('='.repeat(50));

// 1. Verificar Node.js
console.log('✅ Node.js versão:', process.version);
console.log('✅ Plataforma:', process.platform);
console.log('✅ Arquitetura:', process.arch);

// 2. Verificar diretório atual
console.log('📁 Diretório atual:', process.cwd());

// 3. Verificar arquivos essenciais
const essentialFiles = [
  'server.js',
  'spanishTutor.js',
  'sessionManager.js',
  'sessionEndpoints.js',
  'package.json',
  '.env'
];

console.log('\n📋 Verificando arquivos essenciais:');
essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 4. Verificar dependências
console.log('\n📦 Verificando dependências:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  Object.keys(dependencies).forEach(dep => {
    try {
      require(dep);
      console.log(`✅ ${dep}`);
    } catch (e) {
      console.log(`❌ ${dep} - ${e.message}`);
    }
  });
} catch (e) {
  console.log('❌ Erro ao ler package.json:', e.message);
}

// 5. Testar importações dos módulos locais
console.log('\n🔧 Testando importações dos módulos:');
const modules = [
  './spanishTutor',
  './sessionManager',
  './sessionEndpoints'
];

modules.forEach(mod => {
  try {
    require(mod);
    console.log(`✅ ${mod}`);
  } catch (e) {
    console.log(`❌ ${mod} - ${e.message}`);
  }
});

// 6. Testar Express básico
console.log('\n🌐 Testando Express básico:');
try {
  const express = require('express');
  const app = express();
  
  app.get('/test', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  const server = app.listen(3001, () => {
    console.log('✅ Express funcionando na porta 3001');
    
    // Testar requisição
    const http = require('http');
    const req = http.get('http://localhost:3001/test', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Requisição de teste bem-sucedida:', data);
        server.close();
        console.log('\n🎯 Diagnóstico concluído!');
      });
    });
    
    req.on('error', (e) => {
      console.log('❌ Erro na requisição de teste:', e.message);
      server.close();
    });
  });
  
  server.on('error', (e) => {
    console.log('❌ Erro no servidor Express:', e.message);
  });
  
} catch (e) {
  console.log('❌ Erro ao testar Express:', e.message);
}

// 7. Verificar variáveis de ambiente
console.log('\n🔐 Verificando variáveis de ambiente:');
const envVars = ['OPENROUTER_API_KEY', 'PORT'];
envVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${envVar === 'OPENROUTER_API_KEY' ? value.substring(0, 10) + '...' : value}`);
  } else {
    console.log(`⚠️  ${envVar}: não definida`);
  }
});