const https = require('https');

class SpanishTutor {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'openrouter.ai';
    this.model = 'openai/gpt-3.5-turbo';
  }

  /**
   * Gera uma resposta didática em espanhol usando OpenRouter API
   * @param {string} userMessage - Mensagem do usuário (português ou espanhol)
   * @param {Array} conversationHistory - Histórico da conversa (opcional)
   * @returns {Promise<string>} - Resposta em espanhol do professor
   */
  async generateSpanishResponse(userMessage, conversationHistory = []) {
    try {
      // Construir o prompt do sistema
      const systemPrompt = `Você é um professor de espanhol paciente e instrutivo. Suas responsabilidades:

1. SEMPRE responda em espanhol, adaptando ao nível do usuário
2. Se o usuário escrever em português, ajude-o a expressar a mesma ideia em espanhol
3. Se o usuário escrever em espanhol, corrija erros gentilmente e expanda o vocabulário
4. Inclua explicações breves em português quando necessário para conceitos difíceis
5. Use exemplos práticos e contextualizados
6. Seja encorajador e positivo
7. Adapte a complexidade da resposta ao nível demonstrado pelo usuário

Formato da resposta:
- Resposta principal em espanhol
- [Explicação em português] quando necessário
- Sugestões de vocabulário ou gramática quando apropriado`;

      // Construir mensagens para a API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      // Preparar dados da requisição
      const requestData = JSON.stringify({
        model: this.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      // Fazer requisição para OpenRouter
      const response = await this.makeApiRequest(requestData);
      
      if (response.choices && response.choices[0] && response.choices[0].message) {
        return response.choices[0].message.content.trim();
      } else {
        throw new Error('Resposta inválida da API');
      }

    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Lo siento, hubo un problema técnico. [Desculpe, houve um problema técnico.] Por favor, intenta de nuevo.';
    }
  }

  /**
   * Faz requisição HTTP para a API OpenRouter
   * @param {string} requestData - Dados da requisição em JSON
   * @returns {Promise<Object>} - Resposta da API
   */
  makeApiRequest(requestData) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Spanish Tutor WhatsApp Bot',
          'Content-Length': Buffer.byteLength(requestData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonResponse = JSON.parse(data);
            if (res.statusCode === 200) {
              resolve(jsonResponse);
            } else {
              reject(new Error(`API Error: ${res.statusCode} - ${jsonResponse.error?.message || data}`));
            }
          } catch (parseError) {
            reject(new Error(`Erro ao parsear resposta: ${parseError.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Erro de requisição: ${error.message}`));
      });

      req.write(requestData);
      req.end();
    });
  }

  /**
   * Formata o histórico da conversa para a API
   * @param {Array} messages - Array de mensagens {user: string, assistant: string}
   * @returns {Array} - Histórico formatado para a API
   */
  formatConversationHistory(messages) {
    const formatted = [];
    
    messages.forEach(msg => {
      if (msg.user) {
        formatted.push({ role: 'user', content: msg.user });
      }
      if (msg.assistant) {
        formatted.push({ role: 'assistant', content: msg.assistant });
      }
    });

    // Manter apenas as últimas 10 mensagens para não exceder limites
    return formatted.slice(-10);
  }

  /**
   * Formata a resposta do assistente seguindo padrão didático
   * @param {string} response - Resposta original da IA
   * @param {string} userMessage - Mensagem original do usuário
   * @param {string} userLevel - Nível do usuário (iniciante, básico, intermediário, avançado)
   * @returns {string} - Resposta formatada com padrão didático
   */
  formatDidacticResponse(response, userMessage, userLevel) {
    try {
      let formattedResponse = response.trim();
      
      // Palavras-chave comuns para traduzir
      const keywordTranslations = {
        'hola': 'olá',
        'gracias': 'obrigado/obrigada',
        'buenos días': 'bom dia',
        'buenas tardes': 'boa tarde',
        'buenas noches': 'boa noite',
        'adiós': 'tchau',
        'hasta luego': 'até logo',
        'me llamo': 'meu nome é',
        'soy': 'eu sou',
        'tengo': 'eu tenho',
        'quiero': 'eu quero',
        'necesito': 'eu preciso',
        'muy bien': 'muito bem',
        'perfecto': 'perfeito',
        'excelente': 'excelente',
        'por favor': 'por favor',
        'de nada': 'de nada',
        'lo siento': 'desculpe'
      };

      // Para usuários iniciantes, adicionar traduções e exemplos
       if (userLevel === 'iniciante') {
         // Detectar palavras-chave na resposta (busca mais flexível)
         const foundKeywords = [];
         const lowerResponse = formattedResponse.toLowerCase();
         
         Object.keys(keywordTranslations).forEach(spanish => {
           if (lowerResponse.includes(spanish.toLowerCase())) {
             foundKeywords.push({ spanish, portuguese: keywordTranslations[spanish] });
           }
         });

         // Se não encontrou palavras-chave específicas, adicionar traduções baseadas no contexto
         if (foundKeywords.length === 0) {
           // Detectar contexto da mensagem do usuário
           const userLower = userMessage.toLowerCase();
           if (userLower.includes('bom dia') || userLower.includes('buenos días')) {
             foundKeywords.push({ spanish: 'buenos días', portuguese: 'bom dia' });
           } else if (userLower.includes('olá') || userLower.includes('hola')) {
             foundKeywords.push({ spanish: 'hola', portuguese: 'olá' });
           } else if (userLower.includes('obrigad') || userLower.includes('gracias')) {
             foundKeywords.push({ spanish: 'gracias', portuguese: 'obrigado/obrigada' });
           }
         }

         // Adicionar traduções (máximo 2 para não sobrecarregar)
         if (foundKeywords.length > 0) {
           const translations = foundKeywords
             .slice(0, 2)
             .map(kw => `*${kw.spanish}* = ${kw.portuguese}`)
             .join(', ');
           formattedResponse += ` 📝 (${translations})`;
         }

         // Adicionar exemplo de uso para respostas curtas (antes das traduções para não cortar)
          let exampleAdded = false;
          if (formattedResponse.length < 100) {
            const examples = {
              'buenos días': 'Buenos días, ¿cómo está usted?',
              'hola': '¡Hola! ¿Qué tal?',
              'gracias': 'Gracias por su ayuda',
              'me llamo': 'Me llamo Ana, ¿y tú?',
              'quiero': 'Quiero un café, por favor'
            };
            
            // Buscar exemplo baseado na resposta ou contexto do usuário
            let foundExample = Object.keys(examples).find(key => 
              lowerResponse.includes(key)
            );
            
            // Se não encontrou na resposta, buscar no contexto do usuário
            if (!foundExample) {
              const userLower = userMessage.toLowerCase();
              if (userLower.includes('bom dia') || userLower.includes('buenos días')) {
                foundExample = 'buenos días';
              } else if (userLower.includes('olá') || userLower.includes('hola')) {
                foundExample = 'hola';
              }
            }
            
            if (foundExample && examples[foundExample]) {
              formattedResponse += ` 💡 Exemplo: *${examples[foundExample]}*`;
              exampleAdded = true;
            }
          }
       }

      // Adicionar emoji se não houver
      if (!/[😊🎉👍💡📝🌟]/u.test(formattedResponse)) {
        if (formattedResponse.includes('¡')) {
          formattedResponse = '😊 ' + formattedResponse;
        } else if (formattedResponse.includes('muy bien') || formattedResponse.includes('excelente')) {
          formattedResponse = '🎉 ' + formattedResponse;
        } else {
          formattedResponse = '😊 ' + formattedResponse;
        }
      }

      // Garantir que seja conciso (2-4 frases) e bem formatado
       const sentences = formattedResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
       if (sentences.length > 4) {
         // Preservar formatação didática ao cortar
         const mainSentences = [];
         const didacticParts = [];
         
         sentences.forEach(sentence => {
           if (sentence.includes('📝') || sentence.includes('💡')) {
             didacticParts.push(sentence);
           } else {
             mainSentences.push(sentence);
           }
         });
         
         // Manter 2-3 frases principais + partes didáticas
         const finalSentences = mainSentences.slice(0, 3).concat(didacticParts);
         formattedResponse = finalSentences.join('. ').replace(/\. \./g, '.') + '.';
       }
       
       // Corrigir formatação de exemplos cortados e asteriscos extras
        formattedResponse = formattedResponse.replace(/\*[^*]*$/, match => {
          if (!match.endsWith('*')) {
            return match + '*';
          }
          return match;
        });
        
        // Remover asteriscos duplicados ou soltos
        formattedResponse = formattedResponse.replace(/\*\s*\*+/g, '*').replace(/\*\s*$/g, '');

       return formattedResponse.trim();

    } catch (error) {
      console.error('Erro ao formatar resposta didática:', error);
      return response; // Retorna resposta original em caso de erro
    }
  }

  /**
   * Detecta o nível aproximado do usuário baseado na mensagem
   * @param {string} message - Mensagem do usuário
   * @returns {string} - Nível estimado (básico, intermediário, avançado)
   */
  detectUserLevel(message) {
    const spanishWords = [
      'hola', 'gracias', 'por favor', 'buenos días', 'buenas tardes',
      'me llamo', 'soy', 'tengo', 'quiero', 'necesito', 'donde está',
      'cuánto cuesta', 'habla español', 'no entiendo'
    ];

    const intermediateWords = [
      'aunque', 'sin embargo', 'por lo tanto', 'además', 'mientras',
      'subjuntivo', 'condicional', 'pretérito', 'imperfecto'
    ];

    const advancedWords = [
      'no obstante', 'por consiguiente', 'en cuanto a', 'respecto a',
      'pluscuamperfecto', 'gerundio', 'participio'
    ];

    const lowerMessage = message.toLowerCase();
    
    if (advancedWords.some(word => lowerMessage.includes(word))) {
      return 'avançado';
    } else if (intermediateWords.some(word => lowerMessage.includes(word))) {
      return 'intermediário';
    } else if (spanishWords.some(word => lowerMessage.includes(word))) {
      return 'básico';
    } else {
      // Se não detectar espanhol, provavelmente é português (iniciante)
      return 'iniciante';
    }
  }
}

module.exports = SpanishTutor;