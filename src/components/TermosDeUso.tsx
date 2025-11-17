import { useState } from "react";
import { X, MapPin, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import type { ForensicData } from "@/services/forensicsService";
import { generateGoogleMapsUrl } from "@/services/forensicsService";

interface TermosDeUsoProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  forensicData: ForensicData | null;
}

export default function TermosDeUso({
  isOpen,
  onClose,
  onAccept,
  forensicData,
}: TermosDeUsoProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isOpen) return null;

  const hasDeviceLocation =
    forensicData?.geolocalizacaoDispositivo.lat &&
    forensicData?.geolocalizacaoDispositivo.lng;

  const handleAccept = () => {
    if (acceptedTerms) {
      onAccept();
    }
  };

  const openGoogleMaps = () => {
    if (hasDeviceLocation) {
      const url = generateGoogleMapsUrl(
        forensicData.geolocalizacaoDispositivo.lat!,
        forensicData.geolocalizacaoDispositivo.lng!
      );
      window.open(url, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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
          {/* Dados Capturados */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-[#0A4B9E] mb-3 flex items-center gap-2">
              <span className="text-xl">📊</span>
              Dados que serão registrados com seu aceite:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Data/Hora:</span>
                <span className="ml-2 text-gray-600">
                  {new Date().toLocaleString("pt-BR")}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">IP do Usuário:</span>
                <span className="ml-2 text-gray-600">
                  {forensicData?.ip || "Carregando..."}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Geolocalização IP:</span>
                <span className="ml-2 text-gray-600">
                  {forensicData?.geolocalizacaoIP.cidade && forensicData?.geolocalizacaoIP.estado
                    ? `${forensicData.geolocalizacaoIP.cidade}, ${forensicData.geolocalizacaoIP.estado}`
                    : "Carregando..."}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Tipo de Conexão:</span>
                <span className="ml-2 text-gray-600">
                  {forensicData?.conexao.tipo || "Desconhecido"}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Operadora:</span>
                <span className="ml-2 text-gray-600">
                  {forensicData?.conexao.operadora || "Não identificada"}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Sistema Operacional:</span>
                <span className="ml-2 text-gray-600">
                  {forensicData?.dispositivo.sistemaOperacional || "Desconhecido"}{" "}
                  {forensicData?.dispositivo.versaoSistemaOperacional}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Navegador:</span>
                <span className="ml-2 text-gray-600">
                  {forensicData?.dispositivo.navegador || "Desconhecido"}{" "}
                  {forensicData?.dispositivo.versaoNavegador}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Dispositivo:</span>
                <span className="ml-2 text-gray-600">
                  {forensicData?.dispositivo.marca || "Desconhecido"}{" "}
                  {forensicData?.dispositivo.modelo}
                </span>
              </div>
            </div>

            {/* Botão Ver Localização no Mapa */}
            {hasDeviceLocation && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <Button
                  type="button"
                  onClick={openGoogleMaps}
                  className="bg-[#4285F4] hover:bg-[#357ABD] text-white flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Ver Localização do Dispositivo no Mapa
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Precisão: ±{forensicData.geolocalizacaoDispositivo.precisao?.toFixed(0)}m
                </p>
              </div>
            )}
          </div>

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
                <li>Dados de localização (GPS e localização por IP)</li>
                <li>Dados do dispositivo (sistema operacional, navegador, modelo)</li>
                <li>Dados de conexão (IP, operadora, tipo de conexão)</li>
                <li>Dados técnicos (user agent, idioma, timezone)</li>
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
              <h4 className="font-bold text-gray-800 mb-2">7. CONSENTIMENTO</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ao aceitar estes termos, você consente livre e expressamente com:
              </p>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                <li>A coleta, armazenamento e processamento de seus dados pessoais</li>
                <li>A captura de sua localização geográfica precisa</li>
                <li>O registro de informações sobre seu dispositivo e conexão</li>
                <li>O uso dessas informações para os fins descritos nestes termos</li>
              </ul>
            </section>

            <section className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">8. CONTATO</h4>
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

        {/* Footer com Checkbox e Botões */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 space-y-4">
          {/* Checkbox de Aceite */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="accept-terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="accept-terms"
              className="text-sm text-gray-700 leading-relaxed cursor-pointer"
            >
              Li e aceito os <strong>Termos de Uso e Política de Privacidade</strong>, 
              concordando expressamente com a coleta e tratamento dos meus dados pessoais, 
              incluindo minha localização geográfica precisa, para os fins descritos acima.
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAccept}
              disabled={!acceptedTerms}
              className="flex-1 bg-[#2BA84A] hover:bg-[#229639] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aceitar e Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

