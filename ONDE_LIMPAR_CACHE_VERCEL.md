# 🎯 ONDE LIMPAR O CACHE NO VERCEL - PASSO A PASSO

## 📍 LOCALIZAÇÃO EXATA:

### **PASSO 1: Acessar a Seção de Caches**

1. **No menu lateral esquerdo** do Vercel Dashboard
2. **Procure por "Caches"** na lista de opções
3. **Clique em "Caches"**

Você verá duas seções:
- **CDN Cache** (no topo)
- **Data Cache** (embaixo)

---

## 🧹 O QUE FAZER:

### **OPÇÃO 1: Limpar CDN Cache (RECOMENDADO)**

1. **Na seção "CDN Cache"** (primeiro card)
2. **Procure o botão** que diz **"Purge CDN Cache"** (no lado direito)
3. **Clique em "Purge CDN Cache"**
4. **Confirme** quando perguntado

**Isso vai limpar o cache do frontend (HTML, CSS, JavaScript)**

---

### **OPÇÃO 2: Limpar Data Cache (SE NECESSÁRIO)**

1. **Na seção "Data Cache"** (segundo card)
2. **Procure o botão** que diz **"Purge Data Cache"** (no lado direito)
3. **Clique em "Purge Data Cache"**
4. **Confirme** quando perguntado

**Isso vai limpar o cache de dados das funções**

---

## ✅ RECOMENDAÇÃO:

**Faça AMBOS:**
1. ✅ **Primeiro:** Clique em **"Purge CDN Cache"**
2. ✅ **Depois:** Clique em **"Purge Data Cache"**

Isso garante que TODO o cache seja limpo!

---

## 🔄 DEPOIS DE LIMPAR O CACHE:

### **Fazer Redeploy:**

1. **No menu lateral**, clique em **"Deployments"**
2. **Encontre o último deploy** (o mais recente)
3. **Clique nos 3 pontinhos** (⋯) ao lado do deploy
4. **Selecione "Redeploy"**
5. **Aguarde 2-5 minutos**

---

## 📝 RESUMO VISUAL:

```
Dashboard do Vercel
    ↓
Menu Lateral Esquerdo
    ↓
[Caches] ← CLIQUE AQUI
    ↓
Você verá:
    ├─ CDN Cache
    │   └─ [Purge CDN Cache] ← CLIQUE AQUI PRIMEIRO
    │
    └─ Data Cache
        └─ [Purge Data Cache] ← CLIQUE AQUI DEPOIS
```

---

## ⚠️ IMPORTANTE:

- **CDN Cache** = Cache do frontend (o que você vê no navegador)
- **Data Cache** = Cache de dados das APIs

**Para resolver o problema do formulário, limpe AMBOS!**

---

## 🎯 ORDEM CORRETA:

1. ✅ Limpar **CDN Cache**
2. ✅ Limpar **Data Cache**
3. ✅ Fazer **Redeploy** (Deployments → 3 pontinhos → Redeploy)
4. ✅ Limpar **Cache do Navegador** (Ctrl+Shift+Delete)
5. ✅ **Testar** o formulário

---

## ✅ PRONTO!

Após seguir estes passos, o formulário completo aparecerá! 🚀

