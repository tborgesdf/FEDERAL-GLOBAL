/**
 * UTILITÁRIOS DE CRIPTOGRAFIA
 * Verificação de assinaturas e hashing
 */

import crypto from "crypto";

/**
 * Verifica assinatura HMAC-SHA256 do InfinitePay
 */
export function verifyInfinitePaySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Hash SHA-256 de uma string
 */
export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

