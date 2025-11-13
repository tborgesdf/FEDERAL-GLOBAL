/**
 * FEDERAL EXPRESS BRASIL
 * Página: Redes Sociais
 * 
 * Coleta informações sobre redes sociais do usuário
 * Condicional: se "Não possui", permite avançar sem preencher
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { useApplication } from '@/hooks/useApplication';
import StepLayout from '@/components/flow/StepLayout';

// Plataformas disponíveis
const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', placeholder: 'facebook.com/seu-usuario' },
  { value: 'instagram', label: 'Instagram', placeholder: '@seu-usuario' },
  { value: 'x', label: 'X (Twitter)', placeholder: '@seu-usuario' },
  { value: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@seu-canal' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/seu-perfil' },
  { value: 'tiktok', label: 'TikTok', placeholder: '@seu-usuario' },
  { value: 'snapchat', label: 'Snapchat', placeholder: 'seu-usuario' },
  { value: 'pinterest', label: 'Pinterest', placeholder: 'pinterest.com/seu-usuario' },
  { value: 'kwai', label: 'Kwai', placeholder: '@seu-usuario' },
  { value: 'messenger', label: 'Messenger', placeholder: 'Nome no Messenger' },
  { value: 'telegram', label: 'Telegram', placeholder: '@seu-usuario' },
  { value: 'other', label: 'Outra', placeholder: 'Especifique a rede e usuário' },
] as const;

type Platform = typeof PLATFORMS[number]['value'];

interface SocialAccount {
  id?: string;
  platform: Platform;
  handle: string;
}

export default function SocialsPage() {
  const navigate = useNavigate();
  const { application, goToNextStep } = useApplication();
  
  const [hasSocials, setHasSocials] = useState<boolean | null>(null);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExistingSocials();
  }, [application?.id]);

  async function loadExistingSocials() {
    if (!application?.id) return;

    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('application_id', application.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setAccounts(data);
        setHasSocials(true);
      } else {
        setHasSocials(false);
      }
    } catch (err) {
      console.error('Erro ao carregar redes sociais:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleToggle(value: boolean) {
    setHasSocials(value);
    setError(null);
    
    if (!value) {
      setAccounts([]);
    } else if (accounts.length === 0) {
      // Adicionar primeira linha vazia
      setAccounts([{ platform: 'facebook', handle: '' }]);
    }
  }

  function addAccount() {
    setAccounts([...accounts, { platform: 'facebook', handle: '' }]);
  }

  function removeAccount(index: number) {
    const newAccounts = accounts.filter((_, i) => i !== index);
    setAccounts(newAccounts);
    
    // Se remover todas, desmarcar "possui redes"
    if (newAccounts.length === 0) {
      setHasSocials(false);
    }
  }

  function updateAccount(index: number, field: 'platform' | 'handle', value: string) {
    const newAccounts = [...accounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setAccounts(newAccounts);
    setError(null);
  }

  async function handleNext() {
    // Validações
    if (hasSocials === null) {
      setError('Por favor, informe se você possui redes sociais.');
      return;
    }

    if (hasSocials && accounts.length === 0) {
      setError('Adicione pelo menos uma rede social ou selecione "Não possuo".');
      return;
    }

    if (hasSocials) {
      // Validar que todos os handles estão preenchidos
      const emptyHandles = accounts.some(acc => !acc.handle.trim());
      if (emptyHandles) {
        setError('Preencha o usuário/link de todas as redes adicionadas.');
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      if (!application?.id) throw new Error('Application ID não encontrado');

      // Remover todas as contas antigas
      const { error: deleteError } = await supabase
        .from('social_accounts')
        .delete()
        .eq('application_id', application.id);

      if (deleteError) throw deleteError;

      // Inserir novas contas (se houver)
      if (hasSocials && accounts.length > 0) {
        const { error: insertError } = await supabase
          .from('social_accounts')
          .insert(
            accounts.map(acc => ({
              application_id: application.id,
              platform: acc.platform,
              handle: acc.handle.trim(),
            }))
          );

        if (insertError) throw insertError;
      }

      // Avançar para o próximo step
      await goToNextStep();
      navigate('/flow/passport');

    } catch (err: any) {
      console.error('Erro ao salvar redes sociais:', err);
      setError(err.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    navigate('/flow/civil-status');
  }

  async function handleSaveDraft() {
    // Apenas salvar sem validações rígidas
    if (!hasSocials || accounts.length === 0) return;

    try {
      if (!application?.id) return;

      await supabase.from('social_accounts').delete().eq('application_id', application.id);

      const validAccounts = accounts.filter(acc => acc.handle.trim());
      if (validAccounts.length > 0) {
        await supabase.from('social_accounts').insert(
          validAccounts.map(acc => ({
            application_id: application.id,
            platform: acc.platform,
            handle: acc.handle.trim(),
          }))
        );
      }
    } catch (err) {
      console.error('Erro ao salvar rascunho:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <StepLayout
      title="Redes Sociais"
      description="Informe suas redes sociais (se possuir). Esta informação é solicitada no formulário DS-160."
      currentStep="socials"
      onBack={handleBack}
      onNext={handleNext}
      onSaveDraft={handleSaveDraft}
      isNextDisabled={hasSocials === null || saving}
      isNextLoading={saving}
    >
      {/* Toggle: Possui redes sociais? */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Você possui redes sociais ativas?
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => handleToggle(true)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
              hasSocials === true
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
            }`}
          >
            Sim, possuo redes sociais
          </button>
          <button
            onClick={() => handleToggle(false)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
              hasSocials === false
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
            }`}
          >
            Não possuo redes sociais
          </button>
        </div>
      </div>

      {/* Lista de contas (se possui) */}
      {hasSocials && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Adicione pelo menos uma rede social que você utiliza regularmente.
            </p>
            <button
              onClick={addAccount}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {accounts.map((account, index) => (
            <div key={index} className="flex gap-3 items-start">
              {/* Select de plataforma */}
              <select
                value={account.platform}
                onChange={(e) => updateAccount(index, 'platform', e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PLATFORMS.map(platform => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>

              {/* Input de handle */}
              <input
                type="text"
                value={account.handle}
                onChange={(e) => updateAccount(index, 'handle', e.target.value)}
                placeholder={PLATFORMS.find(p => p.value === account.platform)?.placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Botão remover */}
              <button
                onClick={() => removeAccount(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma rede social adicionada.</p>
              <p className="text-sm mt-1">Clique em "Adicionar" para começar.</p>
            </div>
          )}
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Nota:</strong> O Departamento de Estado dos EUA solicita informações sobre redes sociais
          nos últimos 5 anos. Forneça os perfis que você utiliza atualmente.
        </p>
      </div>
    </StepLayout>
  );
}

