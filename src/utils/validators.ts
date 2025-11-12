/**
 * VALIDADORES
 */

import { cpf as cpfValidator } from "cpf-cnpj-validator";

/**
 * Validar CPF
 */
export function validateCPF(value: string): boolean {
  return cpfValidator.isValid(value);
}

/**
 * Formatar CPF (000.000.000-00)
 */
export function formatCPF(value: string): string {
  return cpfValidator.format(value);
}

/**
 * Limpar CPF (remover formatação)
 */
export function cleanCPF(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validar Email
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validar Telefone (10 ou 11 dígitos)
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Formatar Telefone
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  return phone;
}

/**
 * Validar CEP
 */
export function validateCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.length === 8;
}

/**
 * Formatar CEP (00000-000)
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

/**
 * Limpar CEP (remover formatação)
 */
export function cleanCEP(cep: string): string {
  return cep.replace(/\D/g, "");
}

/**
 * Validar senha (mínimo 8 caracteres)
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validar URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

