/**
 * OCR REVIEW CARD
 * Componente para revisar e editar dados extraídos via OCR
 */

import { useState } from "react";
import { Check, Edit2, AlertCircle } from "lucide-react";

interface OcrField {
  key: string;
  label: string;
  value: string;
  type?: "text" | "date" | "number";
  required?: boolean;
}

interface OcrReviewCardProps {
  title: string;
  subtitle?: string;
  fields: OcrField[];
  onSave: (updatedFields: Record<string, string>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function OcrReviewCard({
  title,
  subtitle,
  fields,
  onSave,
  onCancel,
  isLoading = false,
}: OcrReviewCardProps) {
  const [editedFields, setEditedFields] = useState<Record<string, string>>(
    fields.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, string>)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Limpar erro ao editar
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !editedFields[field.key]?.trim()) {
        newErrors[field.key] = "Campo obrigatório";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }
    onSave(editedFields);
  };

  // Verificar se houve alterações
  const hasChanges = fields.some(
    (field) => editedFields[field.key] !== field.value
  );

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
        <div className="text-blue-600 mt-0.5">
          <Edit2 className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3
            className="text-lg font-bold text-gray-900 mb-1"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Alert se extraiu dados automaticamente */}
      {fields.some((f) => f.value) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800" style={{ fontFamily: "Inter, sans-serif" }}>
            Extraímos automaticamente os dados do documento. Revise e corrija se necessário.
          </p>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {fields.map((field) => {
          const hasError = !!errors[field.key];

          return (
            <div key={field.key}>
              <label
                htmlFor={field.key}
                className="block text-sm font-semibold text-gray-900 mb-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {field.label}
                {field.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <input
                id={field.key}
                type={field.type || "text"}
                value={editedFields[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 rounded-lg border-2 transition-colors
                  ${
                    hasError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-[#0A4B9E] focus:ring-[#0A4B9E]"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                `}
                style={{ fontFamily: "Inter, sans-serif" }}
              />
              {hasError && (
                <p className="mt-1 text-sm text-red-500" style={{ fontFamily: "Inter, sans-serif" }}>
                  {errors[field.key]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {isLoading ? (
            "Salvando..."
          ) : (
            <>
              <Check className="h-5 w-5" />
              {hasChanges ? "Salvar Alterações" : "Confirmar"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

