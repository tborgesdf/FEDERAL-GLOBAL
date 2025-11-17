// ============================================================================
// MÓDULO OCR COMPLETO - FEDERAL GLOBAL
// ============================================================================
// Sistema de OCR com Google Vision API para extração de dados de documentos
// Suporta: RG, CIN, CNH, OAB, CRECI, CREA, CRC
// Data: 2025-11-17 (Migrado do DeltaBets)
// ============================================================================

import { google } from 'googleapis';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface OcrResult {
  success: boolean;
  dados?: any;
  mode?: 'real' | 'simulated' | 'simulated-fallback';
  message?: string;
  error?: string;
  detalhes?: any;
}

interface ImageValidation {
  valida: boolean;
  tamanhoKB?: string;
  mensagens: string[];
}

interface FotoDocumento {
  imagemCompleta: string;
  cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  origem: string;
  confianca: number;
}

// ============================================================================
// CONFIGURAÇÃO GOOGLE VISION API
// ============================================================================

const USE_REAL_OCR = process.env.USE_REAL_OCR === 'true' || true;

let credentials: any = null;
try {
  // Tentar carregar credenciais do environment variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log('🔧 Google Vision API: ✅ Service Account configurada');
    console.log('  - Projeto:', credentials.project_id);
    console.log('  - Email:', credentials.client_email);
    console.log('  - Modo OCR:', USE_REAL_OCR ? 'REAL' : 'SIMULAÇÃO');
  } else {
    console.log('🔧 Google Vision API: ⚠️ Variável GOOGLE_APPLICATION_CREDENTIALS_JSON não encontrada');
    console.log('  - Modo OCR: SIMULAÇÃO (fallback)');
  }
} catch (error) {
  console.log('🔧 Google Vision API: ❌ Erro ao carregar credenciais');
  console.log('  - Modo OCR: SIMULAÇÃO (fallback)');
  console.error(error);
}

// ============================================================================
// FUNÇÃO: Obter Access Token do Service Account
// ============================================================================

async function getAccessToken(): Promise<string> {
  if (!credentials) {
    throw new Error('Credenciais não configuradas');
  }

  const jwtClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-vision']
  });

  const tokens = await jwtClient.authorize();
  if (!tokens.access_token) {
    throw new Error('Falha ao obter access token');
  }
  return tokens.access_token;
}

// ============================================================================
// FUNÇÃO: Validar Qualidade da Imagem
// ============================================================================

function validarQualidadeImagem(imagemBase64: string, tipo: string): ImageValidation {
  try {
    // Remover prefixo se existir
    const base64Data = imagemBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // Calcular tamanho em KB
    const tamanhoBytes = (base64Data.length * 3) / 4;
    const tamanhoKB = tamanhoBytes / 1024;
    
    console.log(`📏 Tamanho ${tipo}: ${tamanhoKB.toFixed(2)} KB`);
    
    // Validações
    const validacao: ImageValidation = {
      valida: true,
      tamanhoKB: tamanhoKB.toFixed(2),
      mensagens: []
    };
    
    // Tamanho mínimo: 10KB
    if (tamanhoKB < 10) {
      validacao.valida = false;
      validacao.mensagens.push(`Imagem muito pequena (${tamanhoKB.toFixed(2)} KB). Mínimo: 10 KB`);
    }
    
    // Tamanho máximo: 10MB
    if (tamanhoKB > 10240) {
      validacao.valida = false;
      validacao.mensagens.push(`Imagem muito grande (${tamanhoKB.toFixed(2)} KB). Máximo: 10 MB`);
    }
    
    // Validar se parece ser base64
    const base64LimpoTeste = base64Data.replace(/\s/g, '');
    if (base64LimpoTeste.length < 100) {
      validacao.valida = false;
      validacao.mensagens.push('Conteúdo base64 muito curto ou inválido');
    }
    
    if (validacao.valida) {
      console.log(`✅ ${tipo}: Qualidade adequada`);
    } else {
      console.log(`❌ ${tipo}: ${validacao.mensagens.join(', ')}`);
    }
    
    return validacao;
  } catch (error) {
    console.error(`❌ Erro ao validar ${tipo}:`, error);
    return {
      valida: false,
      mensagens: ['Erro ao validar imagem']
    };
  }
}

// ============================================================================
// FUNÇÃO PRINCIPAL: Processar OCR
// ============================================================================

export async function processarOCR({ 
  imagemFrente, 
  imagemVerso, 
  tipoDocumento 
}: {
  imagemFrente?: string;
  imagemVerso?: string;
  tipoDocumento?: string;
}): Promise<OcrResult> {
  try {
    console.log('📥 Requisição OCR recebida');
    console.log('📄 Tipo de documento sugerido:', tipoDocumento || 'AUTO-DETECT');

    // Coletar todas as imagens enviadas
    const imagens: Array<{ tipo: string; base64: string }> = [];
    if (imagemFrente) imagens.push({ tipo: 'Imagem 1', base64: imagemFrente });
    if (imagemVerso) imagens.push({ tipo: 'Imagem 2', base64: imagemVerso });
    
    console.log(`🖼️ Total de imagens recebidas: ${imagens.length}`);

    // Validar qualidade de TODAS as imagens
    for (let i = 0; i < imagens.length; i++) {
      const validacao = validarQualidadeImagem(imagens[i].base64, imagens[i].tipo);
      
      if (!validacao.valida) {
        console.log(`⚠️ ${imagens[i].tipo}: Qualidade insuficiente`);
        return {
          success: false,
          error: `Qualidade da ${imagens[i].tipo} insuficiente`,
          detalhes: validacao
        };
      }
    }

    console.log('✅ Todas as imagens passaram na validação de qualidade');

    let dados: any;
    let mode: 'real' | 'simulated' | 'simulated-fallback' = 'simulated';

    if (USE_REAL_OCR && credentials) {
      // ========== OCR REAL COM GOOGLE VISION API ==========
      console.log('🔌 Iniciando análise ULTRA COMPLETA com Google Vision API...');
      
      try {
        // Obter access token
        const accessToken = await getAccessToken();
        console.log('🔑 Access token obtido');

        // Processar TODAS as imagens em paralelo
        const textos: string[] = [];
        const analises: any[] = [];
        let fotoDocumentoExtraida: FotoDocumento | null = null;
        
        for (let i = 0; i < imagens.length; i++) {
          const imagem = imagens[i];
          const imagemBase64 = imagem.base64
            .replace(/^data:image\/\w+;base64,/, '')
            .replace(/^data:application\/pdf;base64,/, '');
          
          console.log(`🔍 Analisando ${imagem.tipo}...`);
          
          const visionResponse = await fetch(
            'https://vision.googleapis.com/v1/images:annotate',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({
                requests: [{
                  image: { content: imagemBase64 },
                  features: [
                    { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
                    { type: 'TEXT_DETECTION', maxResults: 50 },
                    { type: 'LABEL_DETECTION', maxResults: 10 },
                    { type: 'FACE_DETECTION', maxResults: 5 }
                  ]
                }]
              })
            }
          );

          const result = await visionResponse.json();
          const response = result.responses?.[0];
          
          // Extrair texto completo
          const textoCompleto = response?.fullTextAnnotation?.text || '';
          
          // Extrair labels (tipo de documento)
          const labels = response?.labelAnnotations?.map((l: any) => l.description) || [];
          
          // Detectar e extrair foto do rosto
          const faces = response?.faceAnnotations || [];
          if (faces.length > 0 && !fotoDocumentoExtraida) {
            console.log(`👤 Face detectada na ${imagem.tipo}! Extraindo foto...`);
            
            try {
              const face = faces[0];
              const boundingPoly = face.boundingPoly;
              
              if (boundingPoly && boundingPoly.vertices) {
                const vertices = boundingPoly.vertices;
                const minX = Math.min(...vertices.map((v: any) => v.x || 0));
                const minY = Math.min(...vertices.map((v: any) => v.y || 0));
                const maxX = Math.max(...vertices.map((v: any) => v.x || 0));
                const maxY = Math.max(...vertices.map((v: any) => v.y || 0));
                
                const width = maxX - minX;
                const height = maxY - minY;
                const expandX = width * 0.2;
                const expandY = height * 0.2;
                
                const cropData = {
                  x: Math.max(0, minX - expandX),
                  y: Math.max(0, minY - expandY),
                  width: width + (expandX * 2),
                  height: height + (expandY * 2)
                };
                
                console.log('📐 Coordenadas da face:', cropData);
                
                fotoDocumentoExtraida = {
                  imagemCompleta: imagem.base64,
                  cropData: cropData,
                  origem: imagem.tipo,
                  confianca: face.detectionConfidence || 0
                };
                
                console.log(`✅ Foto do rosto extraída da ${imagem.tipo} com ${(face.detectionConfidence * 100).toFixed(1)}% de confiança`);
              }
            } catch (cropError) {
              console.error('⚠️ Erro ao extrair foto do rosto:', cropError);
            }
          }
          
          textos.push(textoCompleto);
          analises.push({
            tipo: imagem.tipo,
            texto: textoCompleto,
            labels: labels,
            blocos: response?.fullTextAnnotation?.pages?.[0]?.blocks?.length || 0,
            facesDetectadas: faces.length
          });
          
          console.log(`✅ ${imagem.tipo} analisada:`);
          console.log(`   📝 Texto extraído: ${textoCompleto.substring(0, 100)}...`);
          console.log(`   🏷️ Labels: ${labels.join(', ')}`);
          console.log(`   👤 Faces detectadas: ${faces.length}`);
        }

        // Consolidar TODOS os textos
        const textoConsolidado = textos.join('\n===SEPARADOR===\n');
        
        console.log('📊 ANÁLISE CONSOLIDADA:');
        console.log(`   🖼️ Total de imagens: ${imagens.length}`);
        console.log(`   📝 Total de caracteres extraídos: ${textoConsolidado.length}`);
        console.log(`   👤 Foto do rosto: ${fotoDocumentoExtraida ? 'EXTRAÍDA ✅' : 'NÃO ENCONTRADA ❌'}`);
        console.log('\n📄 TEXTO COMPLETO CONSOLIDADO:');
        console.log(textoConsolidado);
        console.log('\n');

        // Extrair dados com ULTRA PRECISÃO
        dados = extrairDadosDeTexto(textoConsolidado, tipoDocumento, analises);
        
        // Adicionar foto do documento extraída
        if (fotoDocumentoExtraida) {
          dados.fotoDocumento = fotoDocumentoExtraida;
        }
        
        mode = 'real';
        
        console.log('✅ Dados extraídos com ULTRA PRECISÃO (modo REAL)');

      } catch (apiError) {
        console.error('❌ Erro na API do Google Vision:', apiError);
        console.log('⚠️ Usando modo simulação como fallback');
        dados = gerarDadosSimulados();
        mode = 'simulated-fallback';
      }

    } else {
      // ========== MODO SIMULAÇÃO ==========
      console.log('🎭 Usando modo simulação');
      dados = gerarDadosSimulados();
    }

    return {
      success: true,
      dados: dados,
      mode: mode,
      message: mode === 'real' 
        ? 'OCR processado com sucesso usando Google Vision API' 
        : 'OCR processado em modo simulação'
    };

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// FUNÇÃO: Extrair Dados do Texto OCR
// ============================================================================

function extrairDadosDeTexto(texto: string, tipoDocumento?: string, analises: any[] = []): any {
  console.log('🔍 INICIANDO EXTRAÇÃO ULTRA COMPLETA DE DADOS...');
  console.log('📄 Tipo de documento sugerido pelo usuário:', tipoDocumento || 'AUTO-DETECT');
  console.log('📊 Número de análises recebidas:', analises.length);
  
  // AUTO-DETECÇÃO do tipo de documento
  let tipoDetectado = tipoDocumento || 'GENERICO';
  
  const mapeamentoTipos: Record<string, string | null> = {
    'RG': 'RG',
    'CIN': 'RG',
    'CIN_DIGITAL': 'RG',
    'ID_CLASSE': null
  };
  
  if (tipoDocumento && mapeamentoTipos[tipoDocumento] !== undefined) {
    if (mapeamentoTipos[tipoDocumento] !== null) {
      tipoDetectado = mapeamentoTipos[tipoDocumento]!;
      console.log(`👤 Usando tipo selecionado pelo usuário: ${tipoDocumento} → ${tipoDetectado}`);
    }
  }
  
  // AUTO-DETECÇÃO
  if (!tipoDocumento || tipoDocumento === 'ID_CLASSE') {
    if (texto.match(/ORDEM DOS ADVOGADOS|OAB|CONSELHO SECCIONAL|IDENTIDADE DE ADVOGAD/i)) {
      tipoDetectado = 'OAB';
      console.log('⚖️ Tipo detectado: OAB (Carteira de Advogado)');
    } 
    else if (texto.match(/CRECI|CORRETOR.*IMÓVEIS|CONSELHO REGIONAL.*CORRETORES/i)) {
      tipoDetectado = 'CRECI';
      console.log('🏘️ Tipo detectado: CRECI (Corretor de Imóveis)');
    } 
    else if (texto.match(/CREA|CONSELHO REGIONAL.*ENGENHARIA|ENGENHARIA.*AGRONOMIA/i)) {
      tipoDetectado = 'CREA';
      console.log('🔧 Tipo detectado: CREA (Engenharia)');
    } 
    else if (texto.match(/CRC|CONSELHO REGIONAL.*CONTABILIDADE|CONTADOR/i)) {
      tipoDetectado = 'CRC';
      console.log('📊 Tipo detectado: CRC (Contador)');
    }
  }
  
  if (!tipoDocumento) {
    if (texto.match(/CARTEIRA NACIONAL DE HABILITAÇÃO|CNH DIGITAL|PERMISSÃO PARA DIRIGIR|CATEGORIA\s+[ABCDE]{1,3}\s|PRIMEIRA HABILITAÇÃO/i)) {
      tipoDetectado = 'CNH';
      console.log('🚗 Tipo detectado: CNH (Carteira Nacional de Habilitação)');
    } 
    else if (texto.match(/REPÚBLICA FEDERATIVA DO BRASIL|CARTEIRA DE IDENTIDADE|^RG\s/i) && !texto.match(/CNH|OAB|CRECI|CREA|CRC/i)) {
      tipoDetectado = 'RG';
      console.log('🪪 Tipo detectado: RG (Registro Geral)');
    }
  }
  
  // Limpar texto
  const textoLimpo = texto
    .replace(/VÁLIDA EM TODO O TERRITÓRIO NACIONAL/gi, '')
    .replace(/TEM FÉ PÚBLICA EM TODO O TERRITÓRIO NACIONAL/gi, '')
    .replace(/REPÚBLICA FEDERATIVA DO BRASIL/gi, '')
    .replace(/MINISTERIO DOS TRANSPORTES/gi, '')
    .replace(/MINISTÉRIO DOS TRANSPORTES/gi, '')
    .replace(/SECRETARIA NACIONAL DE TRANSITO/gi, '')
    .replace(/SECRETARIA NACIONAL DE TRÂNSITO/gi, '')
    .replace(/CARTEIRA NACIONAL DE HABILITAÇÃO/gi, '')
    .replace(/DRIVER LICENSE/gi, '')
    .replace(/PERMISO DE CONDUCCIÓN/gi, '')
    .replace(/CONDUCCIÓN/gi, '')
    .replace(/CNH DIGITAL/gi, '')
    .replace(/DOCUMENTO DIGITAL/gi, '')
    .replace(/QR CODE/gi, '')
    .replace(/USO OBRIGATÓRIO/gi, '')
    .replace(/IDENTIDADE CIVIL PARA TODOS OS FINS LEGAIS/gi, '')
    .replace(/ASSINATURA DO PORTADOR/gi, '')
    .replace(/===SEPARADOR===/gi, '')
    .replace(/\bBR\b/g, '');

  console.log('📝 Texto limpo e pronto para análise');

  const dadosExtraidos: any = {
    tipoDocumento: tipoDetectado
  };
  
  // Padrões de extração básicos
  const patterns: Record<string, RegExp> = {
    cpf: /(\d{3}[-\.]\d{3}[-\.]\d{3}[-\.\/]\d{2})/,
    rg: /(\d{1,2}[\.\-]?\d{3}[\.\-]?\d{3}[\-]?\d{1})/,
  };

  // Extrair campos básicos
  for (const [campo, pattern] of Object.entries(patterns)) {
    const match = textoLimpo.match(pattern);
    if (match && match[1]) {
      dadosExtraidos[campo] = match[1].trim();
      console.log(`✓ ${campo}:`, match[1].trim());
    }
  }
  
  // ========== EXTRAÇÃO ESPECÍFICA POR TIPO DE DOCUMENTO ==========
  
  if (tipoDetectado === 'RG' || tipoDetectado === 'CIN' || tipoDetectado === 'CIN_DIGITAL') {
    extrairDadosRG(textoLimpo, dadosExtraidos);
  }
  
  if (tipoDetectado === 'CNH') {
    extrairDadosCNH(textoLimpo, dadosExtraidos);
  }
  
  if (tipoDetectado === 'OAB') {
    extrairDadosOAB(textoLimpo, dadosExtraidos);
  }
  
  if (tipoDetectado === 'CRECI') {
    extrairDadosCRECI(textoLimpo, dadosExtraidos);
  }
  
  if (tipoDetectado === 'CREA') {
    extrairDadosCREA(textoLimpo, dadosExtraidos);
  }
  
  if (tipoDetectado === 'CRC') {
    extrairDadosCRC(textoLimpo, dadosExtraidos);
  }

  // Extrair NOME (padrão genérico)
  const nomeMatch = textoLimpo.match(/(?:NOME)[:\s\n]*([A-ZÀ-Ú\s]{5,})/i);
  if (nomeMatch && nomeMatch[1]) {
    dadosExtraidos.nome = nomeMatch[1].trim();
    console.log('✓ nome:', nomeMatch[1].trim());
  }

  console.log('📊 Dados extraídos finais (apenas essenciais):', dadosExtraidos);
  
  return dadosExtraidos;
}

// ============================================================================
// FUNÇÕES DE EXTRAÇÃO ESPECÍFICAS POR DOCUMENTO
// ============================================================================

function extrairDadosRG(textoLimpo: string, dadosExtraidos: any): void {
  // Extrair DATA DE NASCIMENTO (padrão específico)
  const dataNascPatterns = [
    /DATA\s+DE\s+NASCIMENTO[:\s]*(\d{1,2}[-\/\.]\s*(?:\d{2}|[A-Z]{3}|JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[-\/\.]\s*\d{4})/i,
    /NASCIMENTO[:\s]*(\d{1,2}[-\/\.]\s*(?:\d{2}|[A-Z]{3}|JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[-\/\.]\s*\d{4})/i
  ];
  
  for (const pattern of dataNascPatterns) {
    const match = textoLimpo.match(pattern);
    if (match && match[1]) {
      dadosExtraidos.dataNascimento = match[1].trim().replace(/\s+/g, '').replace(/[-\.]/g, '/');
      console.log('🎂 Data de Nascimento (padrão específico):', dadosExtraidos.dataNascimento);
      break;
    }
  }
  
  // Extrair NATURALIDADE
  const naturalidadePatterns = [
    /NATURALIDADE[:\s]*([A-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜ\s]+[-\/]\s*[A-Z]{2})/i,
    /NATURALIDADE[:\s]*([A-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜ\s]+\s+[A-Z]{2})/i
  ];
  
  for (const pattern of naturalidadePatterns) {
    const match = textoLimpo.match(pattern);
    if (match && match[1]) {
      dadosExtraidos.naturalidade = match[1].trim();
      console.log('🏙️ Naturalidade:', dadosExtraidos.naturalidade);
      break;
    }
  }
  
  // Extrair DOC. ORIGEM
  const docOrigemMatch = textoLimpo.match(/(?:C\s+NASC|CERT\s+NASC)\s+(\d+)\s+LV\s+([A-Z0-9\-]+)\s+FL\s+(\d+)/i);
  if (docOrigemMatch) {
    dadosExtraidos.certidaoNumero = docOrigemMatch[1].trim();
    dadosExtraidos.livro = docOrigemMatch[2].trim();
    dadosExtraidos.folha = docOrigemMatch[3].trim();
    dadosExtraidos.docOrigem = `C NASC ${docOrigemMatch[1]} LV ${docOrigemMatch[2]} FL ${docOrigemMatch[3]}`;
    console.log('📜 Doc. Origem:', dadosExtraidos.docOrigem);
  }
  
  // Extrair CARTÓRIO
  const cartorioMatch = textoLimpo.match(/CART(?:ORIO|ÓRIO)?[:\s]*([A-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜ\s0-9°º\-]+)/i);
  if (cartorioMatch) {
    dadosExtraidos.cartorio = cartorioMatch[0].trim();
    console.log('🏛️ Cartório:', dadosExtraidos.cartorio);
  }
  
  // Extrair ÓRGÃO EMISSOR (com suporte a hífen)
  const orgaoEmissorPatterns = [
    /(SSP|IIRGD|PC|DETRAN|SJ)[-\/\s]([A-Z]{2})/,
    /([A-Z]{2,6}[-\/][A-Z]{2})/
  ];
  
  for (const pattern of orgaoEmissorPatterns) {
    const match = textoLimpo.match(pattern);
    if (match) {
      dadosExtraidos.orgaoEmissor = match[0].trim();
      console.log('🏛️ Órgão Emissor:', match[0]);
      break;
    }
  }
  
  // Extrair FILIAÇÃO
  const filiacaoMatch = textoLimpo.match(/(?:FILIAÇÃO|Filiação)[:\s\n]*([A-ZÀ-Ú\s]+)/i);
  if (filiacaoMatch) {
    dadosExtraidos.filiacao = filiacaoMatch[1].trim();
    console.log('👨‍👩‍👦 Filiação:', filiacaoMatch[1].trim());
  }
}

function extrairDadosCNH(textoLimpo: string, dadosExtraidos: any): void {
  // Extrair CATEGORIA
  const categoriaMatch = textoLimpo.match(/(?:CATEGORIA|CAT\.?)[:\s]*([ABCDE]{1,2})/i);
  if (categoriaMatch) {
    dadosExtraidos.categoria = categoriaMatch[1];
    console.log('🚗 Categoria:', categoriaMatch[1]);
  }
  
  // Extrair NÚMERO DE REGISTRO
  const registroMatch = textoLimpo.match(/\b(\d{11})\b/);
  if (registroMatch) {
    dadosExtraidos.numeroRegistroCNH = registroMatch[1];
    console.log('🆔 Número Registro CNH:', registroMatch[1]);
  }
}

function extrairDadosOAB(textoLimpo: string, dadosExtraidos: any): void {
  // Extrair NÚMERO OAB
  const numeroOABMatch = textoLimpo.match(/^\s*(\d{6,8})\s*$/m);
  if (numeroOABMatch) {
    dadosExtraidos.inscricao = numeroOABMatch[1];
    dadosExtraidos.inscricaoOAB = numeroOABMatch[1];
    console.log('🆔 Número OAB:', numeroOABMatch[1]);
  }
  
  // Extrair SECCIONAL
  const seccionalMatch = textoLimpo.match(/CONSELHO SECCIONAL DO ([A-ZÀ-Ú\s]+)/i);
  if (seccionalMatch) {
    dadosExtraidos.seccional = seccionalMatch[1].trim();
    console.log('🏛️ Seccional:', dadosExtraidos.seccional);
  }
}

function extrairDadosCRECI(textoLimpo: string, dadosExtraidos: any): void {
  // Extrair NÚMERO CRECI
  const numeroCRECIMatch = textoLimpo.match(/CRECI(?:SP)?[:\s]*(\d{6})/i);
  if (numeroCRECIMatch) {
    dadosExtraidos.inscricao = numeroCRECIMatch[1];
    dadosExtraidos.inscricaoCRECI = numeroCRECIMatch[1];
    dadosExtraidos.numeroCRECI = numeroCRECIMatch[1];
    console.log('🆔 Número CRECI:', numeroCRECIMatch[1]);
  }
  
  // Extrair REGIÃO
  const regiaoMatch = textoLimpo.match(/(\d)ª Região/i);
  if (regiaoMatch) {
    dadosExtraidos.regiao = `${regiaoMatch[1]}ª Região`;
    console.log('🗺️ Região:', dadosExtraidos.regiao);
  }
}

function extrairDadosCREA(textoLimpo: string, dadosExtraidos: any): void {
  // Extrair REGISTRO NACIONAL
  const registroNacionalMatch = textoLimpo.match(/Registro Nacional[:\s]*(\d{10}-\d)/i);
  if (registroNacionalMatch) {
    dadosExtraidos.registroNacional = registroNacionalMatch[1];
    console.log('🆔 Registro Nacional:', registroNacionalMatch[1]);
  }
  
  // Extrair TÍTULO PROFISSIONAL
  const tituloMatch = textoLimpo.match(/Título Profissional[:\s]+([A-ZÀ-Ú\s]+)/i);
  if (tituloMatch) {
    dadosExtraidos.tituloProfissional = tituloMatch[1].trim();
    console.log('👷 Título Profissional:', tituloMatch[1].trim());
  }
}

function extrairDadosCRC(textoLimpo: string, dadosExtraidos: any): void {
  // Extrair CATEGORIA
  const categoriaMatch = textoLimpo.match(/(CONTADOR|TÉCNICO EM CONTABILIDADE|TÉCNICO CONTÁBIL)/i);
  if (categoriaMatch) {
    dadosExtraidos.categoria = categoriaMatch[1];
    console.log('📊 Categoria:', categoriaMatch[1]);
  }
  
  // Extrair NÚMERO REGISTRO
  const numeroRegistroMatch = textoLimpo.match(/N[°º]\s*DO REGISTRO[:\s]+([A-Z0-9/-]+)/i);
  if (numeroRegistroMatch) {
    dadosExtraidos.inscricao = numeroRegistroMatch[1];
    dadosExtraidos.numeroRegistro = numeroRegistroMatch[1];
    console.log('🆔 Número Registro:', numeroRegistroMatch[1]);
  }
}

// ============================================================================
// FUNÇÃO: Gerar Dados Simulados (Fallback)
// ============================================================================

function gerarDadosSimulados(): any {
  return {
    tipoDocumento: 'RG',
    nome: 'NOME SIMULADO',
    cpf: '000.000.000-00',
    rg: '00.000.000-0',
    dataNascimento: '01/01/1990',
    naturalidade: 'CIDADE - UF',
    orgaoEmissor: 'SSP-XX',
    mode: 'simulated'
  };
}

