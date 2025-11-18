# 🔧 RESOLVER ERRO: Campo Tags Obrigatório

## ❌ PROBLEMA:

O campo "Tags" está marcado como **"Required"** (obrigatório) e está vazio.

---

## ✅ SOLUÇÃO:

### **OPÇÃO 1: Usar Asterisco (*) para Limpar Tudo**

1. **No campo "Tags"** (que está com borda vermelha)
2. **Digite apenas um asterisco:**
   ```
   *
   ```
3. **Clique em "Purge Tag"**

O asterisco (*) significa "todos" e vai limpar todo o cache CDN.

---

### **OPÇÃO 2: Cancelar e Usar Outro Método**

Se a opção 1 não funcionar:

1. **Clique em "Cancel"** para fechar o modal
2. **Volte para a seção "Caches"**
3. **Procure por outra opção** que não exija tags
4. **OU vá direto para "Data Cache"** e limpe esse primeiro

---

## 🎯 RECOMENDAÇÃO:

**Use o asterisco (*) no campo Tags:**

```
Campo Tags: *
```

Isso vai limpar **TODO o cache CDN** sem precisar especificar tags individuais.

---

## 📝 PASSOS COMPLETOS:

1. ✅ Deixe "Invalidate content" selecionado
2. ✅ No campo "Tags", digite: **`*`** (asterisco)
3. ✅ Clique em "Purge Tag"

---

## ✅ PRONTO!

Após isso, o cache será limpo e você pode continuar com os próximos passos!

