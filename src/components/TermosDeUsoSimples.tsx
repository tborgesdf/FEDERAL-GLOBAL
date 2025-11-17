import { X } from "lucide-react";
import { Button } from "./ui/button";

interface TermosDeUsoSimplesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermosDeUsoSimples({
  isOpen,
  onClose,
}: TermosDeUsoSimplesProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A4B9E] to-[#083A7A] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Termos de Uso e Política de Privacidade</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Termos de Uso */}
          <div className="prose prose-sm max-w-none">
            <h3 className="text-xl font-bold text-[#0A4B9E] mb-4">
              Termos de Uso - Federal Global (v1.0)
            </h3>

            <section className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">1. ACEITAÇÃO DOS TERMOS</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ao utilizar os serviços da Federal Global, você concorda integralmente com os presentes
                Termos de Uso e Política de Privacidade. Caso não concorde com qualquer disposição,
                solicitamos que não utilize nossos serviços.
              </p>
            </section>

            <section className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">2. COLETA DE DADOS</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-2">
                Para prestação de nossos serviços consulares e cambiais, coletamos:
              </p>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                <li>Dados pessoais (nome, CPF, data de nascimento, e-mail, telefone)</li>
                <li>Informações de uso dos serviços</li>
                <li>Dados de comunicação</li>
              </ul>
            </section>

            <section className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">3. USO DOS DADOS</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Os dados coletados serão utilizados exclusivamente para:
              </p>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                <li>Processamento de serviços consulares e cambiais</li>
                <li>Verificação de identidade e prevenção de fraudes</li>
                <li>Comunicação sobre serviços contratados</li>
                <li>Cumprimento de obrigações legais e regulatórias</li>
                <li>Melhoria contínua de nossos serviços</li>
              </ul>
            </section>

            <section className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">4. SEGURANÇA E PROTEÇÃO</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Implementamos medidas técnicas e administrativas de segurança para proteger suas
                informações contra acesso não autorizado, alteração, divulgação ou destruição.
                Seus dados são armazenados em servidores seguros e criptografados.
              </p>
            </section>

            <section className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">5. COMPARTILHAMENTO DE DADOS</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Seus dados não serão compartilhados com terceiros, exceto quando:
              </p>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                <li>Exigido por lei ou ordem judicial</li>
                <li>Necessário para prestação do serviço contratado</li>
                <li>Com seu consentimento expresso</li>
              </ul>
            </section>

            <section className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">6. SEUS DIREITOS (LGPD)</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-2">
                Conforme Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                <li>Confirmar a existência de tratamento dos seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                <li>Revogar o consentimento</li>
              </ul>
            </section>

            <section className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">7. CONTATO</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre estes termos, entre em contato:
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Federal Global</strong><br />
                E-mail: privacidade@federalglobal.com.br<br />
                Telefone: (11) 3000-0000
              </p>
            </section>
          </div>
        </div>

        {/* Footer com Botão Fechar */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-[#0A4B9E] hover:bg-[#083A7A] text-white font-semibold"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

