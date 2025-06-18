#!/usr/bin/env node

/**
 * Script para testar a funcionalidade da IA localmente
 * Uso: node test-ai.js "sua mensagem aqui"
 */

// Carregar variáveis de ambiente do arquivo .env
const fs = require('fs');
const path = require('path');

// Função simples para carregar .env
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

// Carregar .env antes de importar outros módulos
loadEnv();

const SpanishTutor = require('./spanishTutor');

// Verificar se a chave da API foi fornecida
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey || apiKey === 'sua-chave-aqui') {
  console.error('❌ Erro: Configure a variável OPENROUTER_API_KEY');
  console.log('\n📝 Como configurar:');
  console.log('1. Acesse https://openrouter.ai e obtenha sua chave');
  console.log('2. Execute: export OPENROUTER_API_KEY="sua-chave-aqui"');
  console.log('3. Ou crie um arquivo .env com: OPENROUTER_API_KEY=sua-chave-aqui');
  process.exit(1);
}

// Obter mensagem dos argumentos da linha de comando
const message = process.argv[2];
if (!message) {
  console.error('❌ Erro: Forneça uma mensagem para testar');
  console.log('\n📝 Uso: node test-ai.js "sua mensagem aqui"');
  console.log('\n🔍 Exemplos:');
  console.log('node test-ai.js "Olá, quero aprender espanhol"');
  console.log('node test-ai.js "Como se diz obrigado em espanhol?"');
  console.log('node test-ai.js "Hola, ¿cómo estás?"');
  process.exit(1);
}

async function testAI() {
  try {
    console.log('🤖 Testando Spanish Tutor AI...');
    console.log('📝 Mensagem:', message);
    console.log('⏳ Processando...');
    
    const tutor = new SpanishTutor(apiKey);
    
    // Detectar nível
    const level = tutor.detectUserLevel(message);
    console.log('🎯 Nível detectado:', level);
    
    // Gerar resposta
    const startTime = Date.now();
    const rawResponse = await tutor.generateSpanishResponse(message);
    const formattedResponse = tutor.formatDidacticResponse(rawResponse, message, level);
    const endTime = Date.now();
    
    console.log('\n✅ Resposta gerada em', (endTime - startTime), 'ms');
    console.log('\n📝 Resposta Original:');
    console.log('─'.repeat(50));
    console.log(rawResponse);
    console.log('─'.repeat(50));
    console.log('\n🎓 Resposta Didática Formatada:');
    console.log('─'.repeat(50));
    console.log(formattedResponse);
    console.log('─'.repeat(50));
    
    console.log('\n📊 Comparação:');
    console.log('• Original:', rawResponse.length, 'caracteres');
    console.log('• Formatada:', formattedResponse.length, 'caracteres');
    console.log('• Nível do usuário:', level);
    
  } catch (error) {
    console.error('❌ Erro ao testar IA:', error.message);
    
    if (error.message.includes('API Error: 401')) {
      console.log('\n🔑 Problema de autenticação:');
      console.log('- Verifique se sua chave da API está correta');
      console.log('- Acesse https://openrouter.ai para verificar sua conta');
    } else if (error.message.includes('API Error: 429')) {
      console.log('\n⏰ Limite de requisições atingido:');
      console.log('- Aguarde alguns minutos antes de tentar novamente');
      console.log('- Considere fazer upgrade da sua conta OpenRouter');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n🌐 Problema de conexão:');
      console.log('- Verifique sua conexão com a internet');
      console.log('- Tente novamente em alguns minutos');
    }
  }
}

// Executar teste
testAI();