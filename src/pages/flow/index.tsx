/**
 * FEDERAL EXPRESS BRASIL
 * Roteador do Fluxo de Aplicação de Visto
 * 
 * Responsável por:
 * - Detectar a aplicação em andamento do usuário
 * - Verificar autenticação
 * - Redirecionar para o step correto
 * - Guardar contra acesso não autorizado
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabase';
import { useApplication } from '@/hooks/useApplication';

export default function FlowRouter() {
  const navigate = useNavigate();
  const { application, loading } = useApplication();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, [application, loading]);

  async function checkAuthAndRedirect() {
    try {
      // 1. Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ Não autenticado - redirecionando para login');
        navigate('/login');
        return;
      }

      // 2. Aguardar carregamento da aplicação
      if (loading) {
        console.log('⏳ Carregando aplicação...');
        return;
      }

      // 3. Verificar se existe aplicação
      if (!application) {
        console.log('❌ Nenhuma aplicação encontrada - redirecionando para dashboard');
        navigate('/dashboard');
        return;
      }

      // 4. Verificar status da aplicação
      if (application.status === 'submitted') {
        console.log('✅ Aplicação já submetida - redirecionando para dashboard');
        navigate('/dashboard');
        return;
      }

      if (application.status === 'approved') {
        console.log('✅ Aplicação aprovada - redirecionando para dashboard');
        navigate('/dashboard');
        return;
      }

      if (application.status === 'rejected') {
        console.log('❌ Aplicação rejeitada - redirecionando para dashboard');
        navigate('/dashboard');
        return;
      }

      // 5. Redirecionar para o step atual
      const currentStep = application.step || 'civil-status';
      console.log(`➡️ Redirecionando para step: ${currentStep}`);
      navigate(`/flow/${currentStep}`);

    } catch (error) {
      console.error('Erro ao verificar aplicação:', error);
      navigate('/dashboard');
    } finally {
      setChecking(false);
    }
  }

  // Loading state
  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando seu fluxo de aplicação...</p>
        </div>
      </div>
    );
  }

  // Este ponto nunca deve ser alcançado (sempre redireciona antes)
  return null;
}

