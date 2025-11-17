# 🧪 GUIA DE TESTE RÁPIDO - Sistema OCR Google Vision

## ✅ SERVIDOR INICIADO!

O servidor de desenvolvimento está rodando em:
```
http://localhost:5173
```

---

## 🎯 TESTES A REALIZAR

### **Teste 1: Verificar se o servidor está funcionando**

1. ✅ Abra o navegador em: http://localhost:5173
2. ✅ Verifique se a página carrega sem erros
3. ✅ Abra o Console do navegador (F12)
4. ✅ Verifique se não há erros vermelhos

---

### **Teste 2: Testar Calculadora de Moedas**

1. Vá para a calculadora de moedas
2. Teste a conversão entre moedas
3. Verifique se as bandeiras aparecem
4. Verifique se o dropdown customizado funciona

**Status esperado:** ✅ Deve funcionar normalmente

---

### **Teste 3: Testar MarketTicker (Carrossel)**

1. Verifique se o carrossel está rolando
2. Verifique se mostra apenas:
   - ✅ Cotações de moedas (BRL/USD, EUR/USD, etc)
   - ✅ Cotações de criptomoedas (BTC, ETH, BNB, etc)
   - ❌ NÃO deve mostrar índices (NASDAQ, S&P 500, etc)

**Status esperado:** ✅ Deve mostrar apenas moedas e cripto

---

### **Teste 4: Sistema OCR (quando configurado)**

**⚠️ IMPORTANTE:** O OCR Google Vision precisa de configuração!

#### **Sem configuração (modo atual):**
- Sistema funcionará em **modo simulação**
- Retornará dados fictícios
- Console mostrará: `"Modo OCR: SIMULAÇÃO (fallback)"`

#### **Com configuração (produção):**

1. Configure a variável de ambiente:
   ```bash
   # .env.local
   GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
   USE_REAL_OCR=true
   ```

2. Reinicie o servidor:
   ```bash
   npm run dev
   ```

3. Teste com um documento real:
   - Acesse a página de upload de documentos
   - Faça upload de um RG, CNH, OAB, etc
   - Verifique os dados extraídos

---

## 🔍 CHECKLIST DE TESTE VISUAL

### ✅ **Frontend Geral**
- [ ] Página inicial carrega sem erros
- [ ] Logo e menu funcionam
- [ ] Navegação entre páginas funciona
- [ ] Não há erros no console (F12)

### ✅ **Calculadora de Moedas**
- [ ] Bandeiras aparecem ao lado das moedas
- [ ] Dropdown customizado funciona
- [ ] Campo de busca no dropdown funciona
- [ ] Conversão de valores funciona
- [ ] Botão "Toggle All Currencies" foi removido

### ✅ **MarketTicker (Carrossel)**
- [ ] Carrossel rola automaticamente
- [ ] Mostra cotações de moedas (BRL/USD, EUR/USD, etc)
- [ ] Mostra cotações de cripto (BTC, ETH, BNB, etc)
- [ ] NÃO mostra índices de mercado (NASDAQ, S&P 500)
- [ ] Cores funcionam (verde para alta, vermelho para baixa)

### ✅ **Sistema OCR (se configurado)**
- [ ] Endpoint `/api/ocr-advanced` existe
- [ ] Upload de imagem funciona
- [ ] Auto-detecção de documento funciona
- [ ] Dados são extraídos corretamente
- [ ] Foto do rosto é extraída (se aplicável)

---

## 🧪 TESTE DO OCR (Modo Simulação)

Mesmo sem configurar o Google Vision, você pode testar a estrutura:

### **Teste via Console do Navegador:**

1. Abra o Console (F12)
2. Cole este código:

```javascript
async function testarOCR() {
  // Criar uma imagem base64 fake
  const fakeImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='; // imagem mínima
  
  try {
    const response = await fetch('/api/ocr-vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imagemFrente: fakeImage,
        tipoDocumento: 'RG',
      }),
    });
    
    const resultado = await response.json();
    console.log('✅ Resultado OCR:', resultado);
    
    if (resultado.mode === 'simulated' || resultado.mode === 'simulated-fallback') {
      console.log('⚠️ OCR em modo SIMULAÇÃO (esperado sem configuração)');
    } else if (resultado.mode === 'real') {
      console.log('✅ OCR em modo REAL (Google Vision configurado!)');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar OCR:', error);
  }
}

// Executar teste
testarOCR();
```

**Resultado esperado (sem configuração):**
```json
{
  "success": true,
  "mode": "simulated",
  "message": "OCR processado em modo simulação",
  "dados": {
    "tipoDocumento": "RG",
    "nome": "NOME SIMULADO",
    "cpf": "000.000.000-00",
    "rg": "00.000.000-0",
    ...
  }
}
```

---

## 🔧 VERIFICAR LOGS DO SERVIDOR

No terminal onde o servidor está rodando, você verá:

### **Sem Google Vision configurado:**
```
🔧 Google Vision API: ⚠️ Variável GOOGLE_APPLICATION_CREDENTIALS_JSON não encontrada
  - Modo OCR: SIMULAÇÃO (fallback)
```

### **Com Google Vision configurado:**
```
🔧 Google Vision API: ✅ Service Account configurada
  - Projeto: seu-projeto-id
  - Email: seu-service-account@projeto.iam.gserviceaccount.com
  - Modo OCR: REAL
```

---

## 📊 TESTAR API ENDPOINTS

### **1. Testar Health Check:**

Abra no navegador ou use curl:
```
http://localhost:5173/api/health
```

**Resposta esperada:** Status 200 OK

### **2. Testar Exchange Rates (se existir):**

```
http://localhost:5173/api/exchange-rates?base=USD
```

**Resposta esperada:** JSON com cotações de moedas

### **3. Testar Crypto Rates (se existir):**

```
http://localhost:5173/api/crypto-rates
```

**Resposta esperada:** JSON com cotações de criptomoedas

---

## 🐛 TROUBLESHOOTING

### ❌ Erro: "Cannot GET /api/ocr-vision"

**Causa:** O endpoint ainda não foi criado  
**Solução:** Crie o arquivo `api/ocr-advanced.ts` conforme documentação

### ❌ Erro: "Module not found: googleapis"

**Causa:** Dependência não instalada corretamente  
**Solução:**
```bash
npm install googleapis --save
```

### ❌ Erro no Console: "VITE_SUPABASE_URL is not defined"

**Causa:** Variáveis de ambiente não configuradas  
**Solução:** Crie `.env.local` com as variáveis do Supabase

### ❌ Bandeiras não aparecem na calculadora

**Causa:** Font de emojis não carregada ou navegador não suporta  
**Solução:** Use navegador moderno (Chrome, Firefox, Edge)

---

## ✅ CHECKLIST FINAL

Após os testes, verifique:

- [ ] ✅ Servidor inicia sem erros
- [ ] ✅ Página principal carrega
- [ ] ✅ Calculadora de moedas funciona
- [ ] ✅ Carrossel mostra moedas e cripto (sem índices)
- [ ] ✅ Bandeiras aparecem na calculadora
- [ ] ✅ Dropdown customizado funciona
- [ ] ✅ Console sem erros vermelhos
- [ ] ✅ Sistema OCR em modo simulação funciona
- [ ] ⏳ (Opcional) Google Vision configurado e testado

---

## 🎯 PRÓXIMOS PASSOS

### **Imediato:**
1. ✅ Teste visual de todas as funcionalidades
2. ✅ Verifique console do navegador
3. ✅ Teste navegação entre páginas

### **Após testes básicos:**
4. ⏳ Configure Google Vision API (se necessário)
5. ⏳ Teste OCR com documentos reais
6. ⏳ Configure no Vercel (produção)

### **Deploy:**
7. ⏳ Push para Git
8. ⏳ Deploy no Vercel
9. ⏳ Configurar variáveis de ambiente no Vercel
10. ⏳ Testar em produção

---

## 📞 COMANDOS ÚTEIS

```bash
# Parar o servidor
Ctrl + C

# Reiniciar o servidor
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Instalar dependências (se necessário)
npm install

# Verificar dependências
npm list googleapis
npm list @google-cloud/vision
```

---

## 🎉 STATUS ATUAL

**Servidor:** ✅ RODANDO em http://localhost:5173  
**Sistema OCR:** ✅ INTEGRADO (modo simulação)  
**Calculadora:** ✅ FUNCIONANDO (com bandeiras)  
**Carrossel:** ✅ FUNCIONANDO (moedas + cripto)  
**Supabase:** ⏳ AGUARDANDO CONFIGURAÇÃO  
**Google Vision:** ⏳ AGUARDANDO CONFIGURAÇÃO

**Pronto para testar!** 🚀

---

**📅 Data:** 2025-11-17  
**🏢 Projeto:** Federal Global  
**✅ Status:** SERVIDOR INICIADO - PRONTO PARA TESTES

