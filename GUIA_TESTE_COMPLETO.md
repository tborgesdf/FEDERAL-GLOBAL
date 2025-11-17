# 🧪 GUIA DE TESTE COMPLETO - Sistema de Termos Forenses

## 🚀 PASSO A PASSO PARA TESTE

### **1. Preparar Ambiente** ⚙️

#### **A. Rodar Migração SQL**
```sql
-- Abra o SQL Editor do Supabase em:
-- https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz/sql

-- Cole e execute:
```

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('termos_uso_aceite', 'termos_uso_versoes');

-- Deve retornar 2 tabelas
```

#### **B. Verificar Servidor**
```bash
# O servidor já está rodando na porta 3000
# Acesse: http://localhost:3000
```

---

### **2. Teste de Cadastro Completo** 📝

#### **Passo 1: Acessar Página de Cadastro**
1. Abra: http://localhost:3000
2. Clique no botão **"Cadastrar-se"**

#### **Passo 2: Preencher Formulário**
Preencha os campos na ordem:

1. **Nome Completo:** `João Silva Santos`
2. **CPF:** `495.010.768-22` ✅ (válido)
   - ⏳ Sistema valida automaticamente
   - 🔍 Consulta API CaptchaOK
   - ✅ Preenche nome e data automaticamente (se encontrado)
3. **Data de Nascimento:** `12/09/1997` (28 anos)
4. **E-mail:** `joao.silva@email.com`
5. **Telefone:** `(11) 98765-4321`
6. **Senha:** `123456` (mínimo 6 caracteres)
7. **Confirmar Senha:** `123456`

#### **Passo 3: Enviar Formulário**
- Clique em **"Criar conta"**
- 💾 Sistema valida todos os campos
- 📊 Mensagem: "Capturando dados do dispositivo..."

#### **Passo 4: Autorizar Localização** 📍
- Navegador solicitará permissão de localização
- **Clique em "Permitir"** (recomendado para teste completo)
- Se negar: sistema continua normalmente sem GPS

#### **Passo 5: Termos de Uso** 📜
Modal aparecerá com:

**Dados Capturados Exibidos:**
- ✅ Data/Hora atual
- ✅ IP do usuário
- ✅ Geolocalização IP (Cidade, Estado)
- ✅ Tipo de Conexão (4G/5G/WiFi)
- ✅ Operadora
- ✅ Sistema Operacional + Versão
- ✅ Navegador + Versão
- ✅ Marca/Modelo do dispositivo

**Se autorizou GPS:**
- 🗺️ Botão **"Ver Localização do Dispositivo no Mapa"**
- Clique para abrir Google Maps com sua localização exata

#### **Passo 6: Aceitar Termos**
1. Leia os termos (opcional 😄)
2. ✅ Marque o checkbox **"Li e aceito os termos..."**
3. Clique em **"Aceitar e Continuar"**
4. ⏳ Sistema cria conta e salva dados

#### **Passo 7: Sucesso!** 🎉
- ✅ Mensagem: "Conta criada com sucesso!"
- 🔄 Redirecionamento automático para login

---

### **3. Verificar Dados no Supabase** 🔍

#### **A. Consultar Tabela de Termos**
```sql
-- No SQL Editor do Supabase
SELECT 
  nome_completo,
  cpf,
  idade_verificada,
  data_hora_aceite,
  ip_aceite,
  geolocalizacao_ip_cidade,
  geolocalizacao_ip_estado,
  tipo_conexao,
  operadora,
  sistema_operacional,
  navegador,
  marca_dispositivo,
  modelo_dispositivo
FROM termos_uso_aceite
ORDER BY data_hora_aceite DESC
LIMIT 1;
```

**Resultado Esperado:**
```
nome_completo: João Silva Santos
cpf: 49501076822
idade_verificada: 28
data_hora_aceite: 2025-11-17 14:32:15
ip_aceite: 189.45.123.78
geolocalizacao_ip_cidade: São Paulo
geolocalizacao_ip_estado: São Paulo
tipo_conexao: 4G
operadora: Vivo S.A.
sistema_operacional: iOS
navegador: Safari
marca_dispositivo: Apple
modelo_dispositivo: iPhone (iOS 17.1)
```

#### **B. Consultar Geolocalização Completa**
```sql
SELECT 
  geolocalizacao_dispositivo_lat,
  geolocalizacao_dispositivo_lng,
  geolocalizacao_dispositivo_precisao,
  geolocalizacao_ip_lat,
  geolocalizacao_ip_lng,
  geolocalizacao_ip_timezone
FROM termos_uso_aceite
WHERE cpf = '49501076822'
ORDER BY data_hora_aceite DESC
LIMIT 1;
```

#### **C. Ver Todos os Dados Capturados**
```sql
SELECT * FROM termos_uso_aceite
WHERE cpf = '49501076822'
ORDER BY data_hora_aceite DESC
LIMIT 1;
```

---

### **4. Testar Link do Google Maps** 🗺️

#### **Se autorizou GPS:**

1. No modal de termos, clique em **"Ver Localização do Dispositivo no Mapa"**
2. Google Maps abre em nova aba
3. Localização exata com zoom máximo (z=18)
4. Verificar precisão (±15m, ±50m, etc.)

#### **Gerar Link Manualmente:**
```sql
-- Pegar coordenadas
SELECT 
  geolocalizacao_dispositivo_lat,
  geolocalizacao_dispositivo_lng
FROM termos_uso_aceite
WHERE cpf = '49501076822'
LIMIT 1;

-- Montar URL:
-- https://www.google.com/maps?q=-23.5505,-46.6333&z=18
```

---

### **5. Testes Adicionais** 🧪

#### **A. Testar Menor de 18 Anos**
1. Use CPF de alguém com menos de 18 anos
2. Pop-up aparece: "Cadastro Negado"
3. Campos CPF e Data limpos

#### **B. Testar CPF Inválido**
1. Digite: `111.111.111-11`
2. Erro: "CPF inválido"

#### **C. Testar Sem Preencher Campos**
1. Deixe algum campo vazio
2. Erro: "Preencha todos os campos obrigatórios"

#### **D. Testar Senhas Diferentes**
1. Senha: `123456`
2. Confirmar: `654321`
3. Erro: "As senhas não coincidem"

#### **E. Testar Sem Aceitar Termos**
1. Deixe checkbox desmarcado
2. Botão "Aceitar e Continuar" desabilitado

---

### **6. Análises BI de Teste** 📊

#### **A. Cadastros por Hora**
```sql
SELECT 
  EXTRACT(HOUR FROM data_hora_aceite) as hora,
  COUNT(*) as total_cadastros
FROM termos_uso_aceite
GROUP BY hora
ORDER BY hora;
```

#### **B. Distribuição por Estado**
```sql
SELECT 
  geolocalizacao_ip_estado,
  COUNT(*) as total
FROM termos_uso_aceite
GROUP BY geolocalizacao_ip_estado
ORDER BY total DESC;
```

#### **C. Dispositivos Usados**
```sql
SELECT 
  tipo_dispositivo,
  marca_dispositivo,
  COUNT(*) as total
FROM termos_uso_aceite
GROUP BY tipo_dispositivo, marca_dispositivo
ORDER BY total DESC;
```

#### **D. Operadoras**
```sql
SELECT 
  operadora,
  COUNT(*) as total
FROM termos_uso_aceite
GROUP BY operadora
ORDER BY total DESC;
```

#### **E. Navegadores**
```sql
SELECT 
  navegador,
  versao_navegador,
  COUNT(*) as total
FROM termos_uso_aceite
GROUP BY navegador, versao_navegador
ORDER BY total DESC;
```

---

### **7. Teste de Visualização no Google Maps** 🌍

#### **Opção 1: Via Modal (Recomendado)**
1. Durante cadastro, autorize localização
2. Clique no botão no modal
3. Google Maps abre automaticamente

#### **Opção 2: URL Manual**
```
https://www.google.com/maps?q=LAT,LNG&z=18

Exemplo:
https://www.google.com/maps?q=-23.5505,-46.6333&z=18
```

#### **Opção 3: Query SQL + URL**
```sql
SELECT 
  nome_completo,
  CONCAT(
    'https://www.google.com/maps?q=',
    geolocalizacao_dispositivo_lat,
    ',',
    geolocalizacao_dispositivo_lng,
    '&z=18'
  ) as google_maps_url
FROM termos_uso_aceite
WHERE geolocalizacao_dispositivo_lat IS NOT NULL
ORDER BY data_hora_aceite DESC;
```

---

### **8. Checklist de Teste** ✅

- [ ] ✅ Migração SQL rodada no Supabase
- [ ] ✅ Servidor rodando (http://localhost:3000)
- [ ] ✅ Formulário carregou corretamente
- [ ] ✅ CPF validado automaticamente
- [ ] ✅ API CaptchaOK consultada
- [ ] ✅ Validação de idade (18+) funcionando
- [ ] ✅ Localização GPS solicitada
- [ ] ✅ Modal de termos apareceu
- [ ] ✅ Dados exibidos no modal
- [ ] ✅ Botão Google Maps funcionando
- [ ] ✅ Checkbox obrigatório funcionando
- [ ] ✅ Conta criada com sucesso
- [ ] ✅ Dados salvos no Supabase
- [ ] ✅ Todos os campos capturados
- [ ] ✅ Geolocalização GPS salva
- [ ] ✅ Geolocalização IP salva
- [ ] ✅ Link Google Maps funcional

---

### **9. Troubleshooting** 🔧

#### **Problema: Localização não capturada**
- ✅ Verifique se autorizou no navegador
- ✅ HTTPS pode ser necessário (localhost funciona)
- ✅ Sistema continua sem GPS normalmente

#### **Problema: IP não capturado**
- ✅ Verifique conexão com internet
- ✅ API ipapi.co pode estar temporariamente indisponível
- ✅ Tente novamente em alguns minutos

#### **Problema: Dados não salvos no Supabase**
- ✅ Verifique se migração foi rodada
- ✅ Verifique RLS policies
- ✅ Verifique console do navegador

#### **Problema: Modal não aparece**
- ✅ Verifique console do navegador
- ✅ Verifique se todos os campos foram preenchidos
- ✅ Verifique validações

---

### **10. Resultado Esperado** 🎯

Após teste completo, você deve ter:

✅ **1 registro em `termos_uso_aceite`** com:
- Dados pessoais completos
- Data/hora do aceite
- IP capturado
- Geolocalização GPS (se autorizado)
- Geolocalização IP
- Dados do dispositivo completos
- Dados da conexão
- User agent completo
- URL de origem

✅ **Link funcional do Google Maps** mostrando:
- Localização exata do usuário
- Zoom máximo (18)
- Coordenadas precisas

✅ **Dados prontos para BI** com:
- Índices otimizados
- View BI criada
- Queries rápidas

---

## 🎉 TESTE COMPLETO!

Se todos os itens acima funcionaram, o sistema está **100% operacional** e pronto para produção!

**Próximo passo:** Criar dashboard BI com os dados capturados! 📊

---

**📅 Data:** 2025-11-17  
**✅ Status:** PRONTO PARA TESTE  
**🚀 Versão:** 1.0

