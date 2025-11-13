/**
 * FEDERAL EXPRESS BRASIL
 * API: DS-160 Generator
 * 
 * Gera formulário DS-160 em Excel com todos os dados do usuário
 * Consolida: user_profile, documents OCR, social_accounts, selfie
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // 2. Receber applicationId
    const { applicationId } = req.body;
    if (!applicationId) {
      return res.status(400).json({ error: 'applicationId é obrigatório' });
    }

    // 3. Buscar dados completos
    const [application, profile, documents, socials, selfie] = await Promise.all([
      // Application
      supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .eq('user_id', user.id)
        .single(),
      
      // User Profile
      supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      
      // Documents
      supabase
        .from('documents')
        .select('*')
        .eq('application_id', applicationId),
      
      // Social Accounts
      supabase
        .from('social_accounts')
        .select('*')
        .eq('application_id', applicationId),
      
      // Selfie
      supabase
        .from('selfies')
        .select('*')
        .eq('application_id', applicationId)
        .eq('accepted', true)
        .single(),
    ]);

    if (application.error || !application.data) {
      return res.status(404).json({ error: 'Aplicação não encontrada' });
    }

    // 4. Extrair dados dos documentos OCR
    const passport = documents.data?.find(d => d.doc_type === 'passport');
    const previousVisa = documents.data?.find(d => d.doc_type === 'previous_visa');
    const brId = documents.data?.find(d => ['rg', 'cnh', 'cnh_digital'].includes(d.doc_type));
    const marriageCert = documents.data?.find(d => d.doc_type === 'marriage_cert');

    // 5. Criar workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DS-160');

    // 6. Configurar colunas
    worksheet.columns = [
      { header: 'Seção', key: 'section', width: 30 },
      { header: 'Campo', key: 'field', width: 50 },
      { header: 'Resposta', key: 'answer', width: 60 },
    ];

    // 7. Estilizar header
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0A4B9E' },
    };
    worksheet.getRow(1).font = { ...worksheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };

    // 8. Preencher dados
    const rows: any[] = [];

    // SEÇÃO A: Dados Pessoais
    rows.push(
      { section: 'A. DADOS PESSOAIS', field: 'Nome Completo', answer: profile.data?.full_name || '' },
      { section: 'A. DADOS PESSOAIS', field: 'CPF', answer: profile.data?.cpf || '' },
      { section: 'A. DADOS PESSOAIS', field: 'Email', answer: profile.data?.email || '' },
      { section: 'A. DADOS PESSOAIS', field: 'Sobrenome (Passport)', answer: passport?.ocr_json?.mrz?.surname || '' },
      { section: 'A. DADOS PESSOAIS', field: 'Primeiro Nome (Passport)', answer: passport?.ocr_json?.mrz?.given_names || '' },
      { section: 'A. DADOS PESSOAIS', field: 'Data de Nascimento', answer: passport?.ocr_json?.holder?.birth_date || '' },
      { section: 'A. DADOS PESSOAIS', field: 'Sexo', answer: passport?.ocr_json?.holder?.gender || '' },
      { section: 'A. DADOS PESSOAIS', field: 'Nacionalidade', answer: passport?.ocr_json?.holder?.nationality || 'Brazilian' },
      { section: 'A. DADOS PESSOAIS', field: 'Estado Civil', answer: translateCivilStatus(application.data.civil_status) },
    );

    // SEÇÃO B: Passaporte
    rows.push(
      { section: 'B. PASSAPORTE', field: 'Número do Passaporte', answer: passport?.ocr_json?.document?.passport_number || '' },
      { section: 'B. PASSAPORTE', field: 'Data de Emissão', answer: passport?.ocr_json?.document?.date_of_issue || '' },
      { section: 'B. PASSAPORTE', field: 'Data de Validade', answer: passport?.ocr_json?.document?.date_of_expiry || '' },
      { section: 'B. PASSAPORTE', field: 'País Emissor', answer: passport?.ocr_json?.mrz?.issuing_country || 'BRA' },
    );

    // SEÇÃO C: Endereço
    rows.push(
      { section: 'C. ENDEREÇO', field: 'CEP', answer: profile.data?.address_cep || '' },
      { section: 'C. ENDEREÇO', field: 'Logradouro', answer: profile.data?.address_street || '' },
      { section: 'C. ENDEREÇO', field: 'Número', answer: profile.data?.address_number || '' },
      { section: 'C. ENDEREÇO', field: 'Complemento', answer: profile.data?.address_complement || '' },
      { section: 'C. ENDEREÇO', field: 'Bairro', answer: profile.data?.address_district || '' },
      { section: 'C. ENDEREÇO', field: 'Cidade', answer: profile.data?.address_city || '' },
      { section: 'C. ENDEREÇO', field: 'Estado', answer: profile.data?.address_state || '' },
      { section: 'C. ENDEREÇO', field: 'País', answer: 'Brasil' },
    );

    // SEÇÃO D: Contato
    rows.push(
      { section: 'D. CONTATO', field: 'Telefone Celular', answer: profile.data?.phone_mobile || '' },
      { section: 'D. CONTATO', field: 'Telefone Residencial', answer: profile.data?.phone_home || '' },
      { section: 'D. CONTATO', field: 'Email', answer: profile.data?.email || '' },
    );

    // SEÇÃO E: Redes Sociais
    const hasSocials = socials.data && socials.data.length > 0;
    rows.push(
      { section: 'E. REDES SOCIAIS', field: 'Possui redes sociais?', answer: hasSocials ? 'Sim' : 'Não' },
    );

    if (hasSocials) {
      socials.data?.forEach(social => {
        rows.push({
          section: 'E. REDES SOCIAIS',
          field: capitalizeFirst(social.platform),
          answer: social.handle,
        });
      });
    }

    // SEÇÃO F: Tipo de Visto
    rows.push(
      { section: 'F. VISTO', field: 'Tipo de Aplicação', answer: application.data.visa_type === 'first' ? 'Primeiro Visto' : 'Renovação' },
    );

    // Se renovação, incluir dados do visto anterior
    if (application.data.visa_type === 'renewal' && previousVisa) {
      rows.push(
        { section: 'F. VISTO', field: 'Número do Visto Anterior', answer: previousVisa.ocr_json?.document?.number || '' },
        { section: 'F. VISTO', field: 'Tipo do Visto Anterior', answer: previousVisa.ocr_json?.document?.type || '' },
        { section: 'F. VISTO', field: 'Data de Emissão (Visto Anterior)', answer: previousVisa.ocr_json?.document?.date_of_issue || '' },
        { section: 'F. VISTO', field: 'Data de Validade (Visto Anterior)', answer: previousVisa.ocr_json?.document?.date_of_expiry || '' },
      );
    }

    // SEÇÃO G: Casamento (se aplicável)
    if (['married', 'stable_union'].includes(application.data.civil_status)) {
      rows.push(
        { section: 'G. CASAMENTO', field: 'Nome do Cônjuge', answer: marriageCert?.ocr_json?.spouse?.full_name || '' },
        { section: 'G. CASAMENTO', field: 'Data do Casamento', answer: marriageCert?.ocr_json?.marriage?.date || '' },
        { section: 'G. CASAMENTO', field: 'Cartório', answer: marriageCert?.ocr_json?.registry_office?.name || '' },
        { section: 'G. CASAMENTO', field: 'UF do Cartório', answer: marriageCert?.ocr_json?.registry_office?.uf || '' },
      );
    }

    // SEÇÃO H: Documento Brasileiro
    if (brId) {
      rows.push(
        { section: 'H. DOCUMENTO BR', field: 'Tipo de Documento', answer: brId.doc_type.toUpperCase() },
        { section: 'H. DOCUMENTO BR', field: 'Número do Documento', answer: brId.ocr_json?.document?.number || '' },
        { section: 'H. DOCUMENTO BR', field: 'CPF', answer: brId.ocr_json?.holder?.cpf || profile.data?.cpf || '' },
      );
    }

    // SEÇÃO I: Selfie
    rows.push(
      { section: 'I. SELFIE', field: 'Selfie Aprovada', answer: selfie.data ? 'Sim' : 'Não' },
      { section: 'I. SELFIE', field: 'Qualidade', answer: selfie.data?.quality_score ? `${(selfie.data.quality_score * 100).toFixed(0)}%` : 'N/A' },
    );

    // 9. Adicionar linhas ao worksheet
    worksheet.addRows(rows);

    // 10. Estilizar células
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        
        // Seção em negrito
        if (colNumber === 1) {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' },
          };
        }
      });
    });

    // 11. Gerar buffer do Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // 12. Upload para Supabase Storage
    const fileName = `${user.id}/${applicationId}/DS160_${applicationId}_${Date.now()}.xlsx`;
    const storagePath = `documents/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true,
      });

    if (uploadError) {
      console.error('Erro ao fazer upload do DS-160:', uploadError);
      return res.status(500).json({ error: 'Erro ao salvar DS-160' });
    }

    // 13. Gerar URL assinada (válida por 7 dias)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 604800); // 7 dias

    if (urlError || !urlData) {
      console.error('Erro ao gerar URL:', urlError);
      return res.status(500).json({ error: 'Erro ao gerar link de download' });
    }

    // 14. Registrar em audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      application_id: applicationId,
      action: 'ds160.generated',
      details: {
        storage_path: storagePath,
        file_size: buffer.byteLength,
        sections: ['personal', 'passport', 'address', 'contact', 'socials', 'visa', 'marriage', 'br_id', 'selfie'],
      },
    });

    // 15. Retornar URL
    return res.status(200).json({
      success: true,
      file_url: urlData.signedUrl,
      storage_path: storagePath,
      file_size: buffer.byteLength,
      expires_at: new Date(Date.now() + 604800 * 1000).toISOString(), // 7 dias
    });

  } catch (error: any) {
    console.error('Erro ao gerar DS-160:', error);
    return res.status(500).json({ 
      error: 'Erro ao gerar DS-160',
      details: error.message,
    });
  }
}

/**
 * Traduz civil status para português
 */
function translateCivilStatus(status: string): string {
  const map: Record<string, string> = {
    'single': 'Solteiro(a)',
    'married': 'Casado(a)',
    'stable_union': 'União Estável',
    'divorced': 'Divorciado(a)',
    'widowed': 'Viúvo(a)',
  };
  return map[status] || status;
}

/**
 * Capitaliza primeira letra
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

