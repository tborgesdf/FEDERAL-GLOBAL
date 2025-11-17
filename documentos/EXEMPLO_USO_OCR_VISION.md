# 📘 EXEMPLO DE USO - OCR Vision Integrado

## 🎯 Como usar o novo módulo OCR Vision

O módulo `api/ocr-vision.ts` foi integrado e está pronto para uso. Aqui está como usá-lo:

---

## 📝 OPÇÃO 1: Criar novo endpoint (Recomendado)

Crie um novo arquivo `api/ocr-advanced.ts`:

```typescript
/**
 * API: OCR Advanced (Google Vision)
 * Endpoint dedicado para OCR com auto-detecção
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processarOCR } from './ocr-vision';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imagemFrente, imagemVerso, tipoDocumento } = req.body;

    if (!imagemFrente) {
      return res.status(400).json({ 
        error: 'Campo obrigatório: imagemFrente (base64)' 
      });
    }

    // Processar OCR
    const resultado = await processarOCR({
      imagemFrente,
      imagemVerso,
      tipoDocumento, // ou deixe vazio para auto-detect
    });

    return res.status(200).json(resultado);

  } catch (error: any) {
    console.error('❌ Erro no OCR Advanced:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar OCR',
      details: error.message 
    });
  }
}
```

---

## 📝 OPÇÃO 2: Integrar ao endpoint existente

Modifique `api/ocr.ts` para usar o novo módulo em casos específicos:

```typescript
import { processarOCR } from './ocr-vision';

// ... código existente ...

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ... código existente ...

  try {
    const { fields, files } = await parseForm(req);
    const docType = fields.doc_type;
    
    // Se for RG, CNH, OAB, CRECI, CREA ou CRC, usar o OCR Advanced
    const tiposAvancados = ['rg', 'cin', 'cnh', 'oab', 'creci', 'crea', 'crc', 'br_id'];
    
    if (tiposAvancados.includes(docType)) {
      // Converter arquivo para base64
      const fileBuffer = fs.readFileSync(file.filepath);
      const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
      
      // Processar com OCR Advanced
      const resultado = await processarOCR({
        imagemFrente: base64Image,
        tipoDocumento: docType,
      });
      
      if (resultado.success) {
        // Usar dados extraídos do OCR Advanced
        const ocrResult = {
          doc_type: resultado.dados.tipoDocumento,
          confidence: 0.95,
          fields_detected: Object.keys(resultado.dados),
          fields_missing: [],
          ocr_json: resultado.dados,
        };
        
        // ... continuar com upload e salvamento ...
      }
    }
    
    // ... resto do código existente para outros tipos de documentos ...
    
  } catch (error) {
    // ... tratamento de erro ...
  }
}
```

---

## 🌐 CHAMADA DO FRONTEND

### JavaScript/TypeScript:

```typescript
async function processarDocumento(arquivo: File) {
  try {
    // Converter para base64
    const base64 = await fileToBase64(arquivo);
    
    // Chamar API
    const response = await fetch('/api/ocr-advanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // se usar auth
      },
      body: JSON.stringify({
        imagemFrente: base64,
        tipoDocumento: 'RG', // ou null para auto-detect
      }),
    });
    
    const resultado = await response.json();
    
    if (resultado.success) {
      console.log('✅ OCR processado!');
      console.log('Tipo:', resultado.dados.tipoDocumento);
      console.log('CPF:', resultado.dados.cpf);
      console.log('Nome:', resultado.dados.nome);
      console.log('Foto:', resultado.dados.fotoDocumento ? 'Extraída' : 'Não encontrada');
    } else {
      console.error('❌ Erro:', resultado.error);
    }
    
  } catch (error) {
    console.error('❌ Erro na chamada:', error);
  }
}

// Função auxiliar para converter File para base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}
```

### React Component:

```typescript
import { useState } from 'react';

function DocumentUpload() {
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    
    try {
      // Converter para base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Chamar API
        const response = await fetch('/api/ocr-advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imagemFrente: base64,
            // tipoDocumento deixe vazio para auto-detect
          }),
        });
        
        const data = await response.json();
        setResultado(data);
        setLoading(false);
      };
      
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      
      {loading && <p>Processando OCR...</p>}
      
      {resultado && resultado.success && (
        <div>
          <h3>Dados Extraídos:</h3>
          <p><strong>Tipo:</strong> {resultado.dados.tipoDocumento}</p>
          <p><strong>Nome:</strong> {resultado.dados.nome}</p>
          <p><strong>CPF:</strong> {resultado.dados.cpf}</p>
          <p><strong>Data Nasc:</strong> {resultado.dados.dataNascimento}</p>
          
          {resultado.dados.fotoDocumento && (
            <div>
              <h4>Foto Extraída:</h4>
              <p>Confiança: {(resultado.dados.fotoDocumento.confianca * 100).toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
```

---

## 📦 EXEMPLO COM FRENTE E VERSO

```typescript
async function processarDocumentoCompleto(arquivoFrente: File, arquivoVerso?: File) {
  const base64Frente = await fileToBase64(arquivoFrente);
  const base64Verso = arquivoVerso ? await fileToBase64(arquivoVerso) : undefined;
  
  const response = await fetch('/api/ocr-advanced', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imagemFrente: base64Frente,
      imagemVerso: base64Verso,
      tipoDocumento: 'RG', // deixe vazio para auto-detect
    }),
  });
  
  return await response.json();
}
```

---

## 🎯 AUTO-DETECÇÃO

Deixe `tipoDocumento` vazio ou `null` para que o sistema detecte automaticamente:

```typescript
const response = await fetch('/api/ocr-advanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imagemFrente: base64Image,
    // não enviar tipoDocumento = auto-detect
  }),
});
```

O sistema vai detectar na ordem:
1. OAB → CRECI → CREA → CRC
2. CNH
3. RG/CIN

---

## 📊 RESPOSTA COMPLETA

```json
{
  "success": true,
  "mode": "real",
  "message": "OCR processado com sucesso usando Google Vision API",
  "dados": {
    "tipoDocumento": "RG",
    "cpf": "123.456.789-09",
    "rg": "12.345.678-9",
    "nome": "JOÃO DA SILVA SANTOS",
    "dataNascimento": "15/03/1990",
    "naturalidade": "SÃO PAULO SP",
    "filiacao": "MARIA DA SILVA",
    "nomePai": "JOSÉ DOS SANTOS",
    "nomeMae": "MARIA DA SILVA",
    "orgaoEmissor": "SSP-SP",
    "docOrigem": "C NASC 12345 LV A-01 FL 123",
    "certidaoNumero": "12345",
    "livro": "A-01",
    "folha": "123",
    "cartorio": "1º CARTÓRIO - SÃO PAULO SP",
    "fotoDocumento": {
      "imagemCompleta": "data:image/jpeg;base64,...",
      "cropData": {
        "x": 100,
        "y": 50,
        "width": 200,
        "height": 250
      },
      "origem": "Imagem 1",
      "confianca": 0.92
    }
  }
}
```

---

## ⚙️ CONFIGURAÇÃO

Não esqueça de configurar as variáveis de ambiente:

```bash
# .env.local
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
USE_REAL_OCR=true

# Supabase (se for salvar os dados)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

---

## 🎉 PRONTO!

Agora você tem um sistema OCR completo integrado ao Federal Global!

**Documentos suportados:** RG, CIN, CNH, OAB, CRECI, CREA, CRC  
**Auto-detecção:** ✅  
**Extração de foto:** ✅  
**Modo fallback:** ✅  
**TypeScript:** ✅

