/**
 * PERMISSION MODAL
 * Modal para solicitar permissões de câmera/arquivos
 */

import { Camera, Upload, X } from "lucide-react";
import { ReactNode } from "react";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon?: ReactNode;
  permissions: Array<{
    name: string;
    description: string;
    icon: ReactNode;
  }>;
  onGrant: () => void;
}

export default function PermissionModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  permissions,
  onGrant,
}: PermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && <div className="text-[#0A4B9E]">{icon}</div>}
            <h2
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
          {description}
        </p>

        {/* Permissions List */}
        <div className="space-y-3 mb-6">
          {permissions.map((perm, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="text-[#0A4B9E] mt-0.5">{perm.icon}</div>
              <div>
                <p className="font-semibold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {perm.name}
                </p>
                <p className="text-sm text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
                  {perm.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onGrant();
              onClose();
            }}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white font-semibold hover:opacity-90 transition-all duration-200 shadow-lg"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Permitir
          </button>
        </div>
      </div>
    </div>
  );
}

