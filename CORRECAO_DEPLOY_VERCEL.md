# 🔧 CORREÇÃO DO DEPLOY NO VERCEL

## ❌ PROBLEMA:

O Vercel está mostrando uma versão antiga do formulário de cadastro (apenas 4 campos) ao invés da versão atual (7 campos completos).

---

## ✅ SOLUÇÃO:

### **1. Verificar Build Local:**

```bash
npm run build
```

Isso vai gerar o build em `dist/` com o código atual.

### **2. Forçar Novo Deploy no Vercel:**

**Opção A: Via Git (Recomendado):**
```bash
# Fazer um commit vazio para forçar novo deploy
git commit --allow-empty -m "chore: Forçar novo deploy no Vercel"
git push origin main
```

**Opção B: Via Dashboard do Vercel:**
1. Acesse https://vercel.com/dashboard
2. Vá no seu projeto
3. Clique em "Deployments"
4. Clique nos 3 pontos do último deploy
5. Selecione "Redeploy"

**Opção C: Limpar Cache e Redeploy:**
1. No Dashboard do Vercel
2. Vá em "Settings" → "General"
3. Role até "Build & Development Settings"
4. Clique em "Clear Build Cache"
5. Depois faça um novo deploy

### **3. Verificar Configuração do Vercel:**

O arquivo `vercel.json` está correto:
- ✅ `outputDirectory: "dist"` (correto)
- ✅ `buildCommand: "npm run build"` (correto)
- ✅ Rewrites para SPA (correto)

### **4. Verificar Variáveis de Ambiente:**

Certifique-se de que todas as variáveis de ambiente estão configuradas no Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- `USE_REAL_OCR`

---

## 🚀 PASSOS PARA CORRIGIR:

### **1. Fazer Build Local e Testar:**

```bash
npm run build
npm run preview
```

Acesse `http://localhost:4173` e verifique se o formulário completo aparece.

### **2. Fazer Commit e Push:**

```bash
git add .
git commit -m "fix: Forçar atualização do deploy no Vercel"
git push origin main
```

### **3. Aguardar Deploy Automático:**

O Vercel detectará o push e fará deploy automaticamente (2-5 minutos).

### **4. Limpar Cache do Navegador:**

Após o deploy, limpe o cache do navegador:
- **Chrome/Edge:** `Ctrl+Shift+Delete` → Limpar cache
- **Firefox:** `Ctrl+Shift+Delete` → Limpar cache
- Ou use modo anônimo para testar

---

## 🔍 VERIFICAÇÕES:

### **1. Verificar se o código está no Git:**

```bash
git log --oneline -10
```

Deve mostrar commits recentes com as mudanças do formulário.

### **2. Verificar Build Local:**

```bash
npm run build
ls -la dist/
```

Deve mostrar os arquivos compilados.

### **3. Verificar Logs do Vercel:**

No Dashboard do Vercel:
1. Vá em "Deployments"
2. Clique no último deploy
3. Veja os logs de build
4. Verifique se há erros

---

## 🎯 RESULTADO ESPERADO:

Após o deploy correto, o formulário deve mostrar:
- ✅ Nome Completo
- ✅ CPF (com validação automática)
- ✅ Data de Nascimento
- ✅ E-mail
- ✅ Telefone Celular
- ✅ Senha
- ✅ Confirmar senha
- ✅ Checkbox de Termos de Uso

---

## 📝 NOTA IMPORTANTE:

O código local está **100% correto**. O problema é apenas no deploy do Vercel que está usando uma versão antiga em cache.

**Solução:** Forçar um novo deploy limpo.

