/**
 * Função pura para formatar respostas da IA com melhorias educativas
 * @param {string} respostaIA - Texto da IA sem formatação
 * @returns {string} - Texto formatado com quebras de linha, traduções, emojis e ênfase
 */
function formatarResposta(respostaIA) {
  if (!respostaIA || typeof respostaIA !== 'string') {
    return '';
  }

  let textoFormatado = respostaIA;

  // 1. Adicionar quebras de linha para exemplos
  // Detecta padrões como "Exemplo:", "Por exemplo:", "Ejemplos:"
  textoFormatado = textoFormatado.replace(
    /(ejemplos?|examples?|por exemplo|for example):/gi,
    '\n\n📝 $1:\n'
  );

  // Quebras de linha antes de listas numeradas ou com bullets
  textoFormatado = textoFormatado.replace(
    /(\d+\.|•|-)\s/g,
    '\n$1 '
  );

  // 2. Tradução destacada de palavras novas em espanhol
  // Padrão: palavra em espanhol seguida de tradução entre parênteses
  const palavrasComTraducao = [
    { es: 'hola', pt: 'olá' },
    { es: 'buenos días', pt: 'bom dia' },
    { es: 'buenas tardes', pt: 'boa tarde' },
    { es: 'buenas noches', pt: 'boa noite' },
    { es: 'gracias', pt: 'obrigado' },
    { es: 'por favor', pt: 'por favor' },
    { es: 'perdón', pt: 'desculpa' },
    { es: 'disculpe', pt: 'com licença' },
    { es: 'adiós', pt: 'tchau' },
    { es: 'hasta luego', pt: 'até logo' },
    { es: 'me llamo', pt: 'meu nome é' },
    { es: '¿cómo estás?', pt: 'como você está?' },
    { es: '¿cómo te llamas?', pt: 'qual é o seu nome?' },
    { es: 'muy bien', pt: 'muito bem' },
    { es: 'no entiendo', pt: 'não entendo' },
    { es: '¿hablas español?', pt: 'você fala espanhol?' },
    { es: 'sí', pt: 'sim' },
    { es: 'no', pt: 'não' },
    { es: 'agua', pt: 'água' },
    { es: 'comida', pt: 'comida' },
    { es: 'casa', pt: 'casa' },
    { es: 'trabajo', pt: 'trabalho' },
    { es: 'familia', pt: 'família' },
    { es: 'amigo', pt: 'amigo' },
    { es: 'tiempo', pt: 'tempo' },
    { es: 'dinero', pt: 'dinheiro' }
  ];

  // Aplicar traduções destacadas
  palavrasComTraducao.forEach(({ es, pt }) => {
    const regex = new RegExp(`\\b${es}\\b`, 'gi');
    textoFormatado = textoFormatado.replace(regex, `*${es}* (${pt})`);
  });

  // 3. Adicionar emojis educativos
  const emojisEducativos = [
    { palavra: /\b(nivel|nível|level)\b/gi, emoji: '📊' },
    { palavra: /\b(pronuncia|pronunciation)\b/gi, emoji: '🗣️' },
    { palavra: /\b(gramática|grammar)\b/gi, emoji: '📚' },
    { palavra: /\b(vocabulário|vocabulary)\b/gi, emoji: '📖' },
    { palavra: /\b(conjugação|conjugation)\b/gi, emoji: '🔄' },
    { palavra: /\b(exercício|exercise)\b/gi, emoji: '💪' },
    { palavra: /\b(prática|practice)\b/gi, emoji: '🎯' },
    { palavra: /\b(dica|tip|sugestão)\b/gi, emoji: '💡' },
    { palavra: /\b(atenção|attention|cuidado)\b/gi, emoji: '⚠️' },
    { palavra: /\b(correto|correct|certo)\b/gi, emoji: '✅' },
    { palavra: /\b(erro|error|incorreto)\b/gi, emoji: '❌' },
    { palavra: /\b(pergunta|question)\b/gi, emoji: '❓' },
    { palavra: /\b(resposta|answer)\b/gi, emoji: '💬' },
    { palavra: /\b(cultura|culture)\b/gi, emoji: '🌍' },
    { palavra: /\b(país|country)\b/gi, emoji: '🏳️' }
  ];

  emojisEducativos.forEach(({ palavra, emoji }) => {
    textoFormatado = textoFormatado.replace(palavra, `${emoji} $&`);
  });

  // 4. Ênfase com asteriscos para palavras importantes
  // Detectar palavras em espanhol que não foram traduzidas ainda
  const palavrasParaEnfase = [
    'español', 'castellano', 'idioma', 'lengua',
    'verbo', 'sustantivo', 'adjetivo', 'adverbio',
    'presente', 'pasado', 'futuro', 'subjuntivo',
    'masculino', 'femenino', 'singular', 'plural'
  ];

  palavrasParaEnfase.forEach(palavra => {
    const regex = new RegExp(`\\b${palavra}\\b(?![^*]*\\*[^*]*\\*)`, 'gi');
    textoFormatado = textoFormatado.replace(regex, `*$&*`);
  });

  // 5. Limpar formatação excessiva e organizar
  // Remover múltiplas quebras de linha consecutivas
  textoFormatado = textoFormatado.replace(/\n{3,}/g, '\n\n');
  
  // Remover espaços no início e fim
  textoFormatado = textoFormatado.trim();

  // Adicionar emoji de início se não houver
  if (!textoFormatado.match(/^[🎓📚🗣️💡]/)) {
    textoFormatado = `🎓 ${textoFormatado}`;
  }

  return textoFormatado;
}

// Função de teste
function testarFormatarResposta() {
  console.log('🧪 Testando função formatarResposta()\n');
  console.log('='.repeat(60));

  // Entrada mockada - resposta típica da IA
  const entradaMockada = `Hola significa olá em português. É uma saudação muito comum. Buenos días é usado pela manhã. Por exemplo: quando você encontra alguém de manhã, pode dizer buenos días. Outros exemplos incluem: 1. Hola, me llamo María. 2. Buenos días, ¿cómo estás? 3. Gracias por la ayuda. A pronuncia é importante no español. Pratique o vocabulário diariamente. Atenção: o verbo ser é irregular. Correto: Yo soy estudiante.`;

  console.log('📥 ENTRADA (texto da IA sem formatação):');
  console.log(entradaMockada);
  console.log('\n' + '-'.repeat(60));

  // Aplicar formatação
  const saidaFormatada = formatarResposta(entradaMockada);

  console.log('\n📤 SAÍDA (texto formatado):');
  console.log(saidaFormatada);
  console.log('\n' + '='.repeat(60));

  // Teste com entrada vazia
  console.log('\n🧪 Teste com entrada vazia:');
  console.log('Resultado:', `"${formatarResposta('')}"`);  

  // Teste com entrada inválida
  console.log('\n🧪 Teste com entrada inválida:');
  console.log('Resultado:', `"${formatarResposta(null)}"`);  

  console.log('\n✅ Testes concluídos!');
}

// Executar teste se o arquivo for executado diretamente
if (require.main === module) {
  testarFormatarResposta();
}

// Exportar a função para uso em outros módulos
module.exports = { formatarResposta, testarFormatarResposta };