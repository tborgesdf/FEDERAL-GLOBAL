/**
 * UTILITÁRIOS ICAO - Segmentação de Nomes de Passaporte
 */

/**
 * Divide nome completo em Surname (sobrenome) e Given Names (primeiro + meios)
 * Baseado em padrão ICAO de passaportes
 */
export function splitIcaoName(fullName: string): {
  surname: string;
  givenNames: string;
} {
  const cleaned = fullName.trim().toUpperCase();
  const parts = cleaned.split(/\s+/);

  if (parts.length === 1) {
    return { surname: parts[0], givenNames: "" };
  }

  // Último token é o sobrenome
  const surname = parts[parts.length - 1];
  // Restante são given names
  const givenNames = parts.slice(0, -1).join(" ");

  return { surname, givenNames };
}

/**
 * Formata nome para padrão ICAO (tudo maiúsculo, sem acentos)
 */
export function normalizeIcaoName(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Extrai surname e given names de um nome completo e normaliza
 */
export function parseIcaoName(fullName: string): {
  surname: string;
  givenNames: string;
  fullNameNormalized: string;
} {
  const normalized = normalizeIcaoName(fullName);
  const { surname, givenNames } = splitIcaoName(normalized);

  return {
    surname,
    givenNames,
    fullNameNormalized: normalized,
  };
}

