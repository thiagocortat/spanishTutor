#!/bin/bash

# Cores para output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Vercel CLI não está instalado!${NC}"
  echo -e "${YELLOW}ℹ️  Instale o Vercel CLI usando o comando:${NC}"
  echo -e "${BLUE}   npm install -g vercel${NC}"
  echo -e "${YELLOW}ℹ️  Após a instalação, execute este script novamente.${NC}"
  exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
  echo -e "${YELLOW}ℹ️  Crie um arquivo .env baseado no .env.example e configure suas chaves de API.${NC}"
  exit 1
fi

# Verificar se a chave GROQ_API_KEY está configurada
if ! grep -q "GROQ_API_KEY=" .env || grep -q "GROQ_API_KEY=$" .env || grep -q "GROQ_API_KEY=\"\"" .env; then
  echo -e "${RED}❌ GROQ_API_KEY não configurada no arquivo .env!${NC}"
  echo -e "${YELLOW}ℹ️  Configure sua chave de API do Groq no arquivo .env.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Configurações verificadas${NC}"

# Verificar build local
echo -e "${BLUE}🔨 Verificando build...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Falha no build local${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build local OK${NC}"

# Deploy para Vercel
echo -e "${BLUE}🚀 Fazendo deploy...${NC}"
vercel --prod

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Erro no deploy${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${YELLOW}ℹ️  Não esqueça de configurar o webhook no seu provedor WhatsApp:${NC}"
echo -e "${BLUE}   - Para UltraMsg: https://seu-app-vercel.vercel.app/webhook/ultramsg${NC}"
echo -e "${BLUE}   - Para Gupshup: https://seu-app-vercel.vercel.app/webhook/gupshup${NC}"
echo -e "${YELLOW}ℹ️  Você pode verificar o status do seu bot em:${NC}"
echo -e "${BLUE}   - https://seu-app-vercel.vercel.app/status${NC}"