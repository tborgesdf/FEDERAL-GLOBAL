/**
 * TIPOS DE USUÁRIO E PERFIL
 */

export interface UserProfile {
  user_id: string;
  cpf: string;
  full_name: string;
  email: string;
  phone_mobile?: string;
  phone_home?: string;
  address_cep?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_district?: string;
  address_city?: string;
  address_state?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpRichPayload {
  email: string;
  password: string;
  cpf: string;
  full_name: string;
  phone_mobile?: string;
  phone_home?: string;
  cep?: string;
  number?: string;
  complement?: string;
}

export interface Address {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
}

