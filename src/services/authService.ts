/**
 * AUTH SERVICE - Autenticação com cadastro rico
 */

import { supabase } from "@/utils/supabase";
import { SignUpRichPayload, UserProfile, Address } from "@/types/user";
import cep from "cep-promise";
import { cpf as cpfValidator } from "cpf-cnpj-validator";

/**
 * Buscar endereço por CEP
 */
export async function fetchAddressByCep(cep: string): Promise<Address | null> {
  try {
    const cleanCep = cep.replace(/\D/g, "");
    const address = await cep(cleanCep);
    return address;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
}

/**
 * Validar CPF
 */
export function validateCpf(cpf: string): boolean {
  return cpfValidator.isValid(cpf);
}

/**
 * Cadastro rico com perfil completo
 */
export async function signUpRich(payload: SignUpRichPayload) {
  try {
    // 1. Validar CPF
    if (!validateCpf(payload.cpf)) {
      throw new Error("CPF inválido");
    }

    // 2. Buscar endereço por CEP se fornecido
    let addressData: Address | null = null;
    if (payload.cep) {
      addressData = await fetchAddressByCep(payload.cep);
    }

    // 3. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Falha ao criar usuário");

    // 4. Criar perfil estendido
    const { error: profileError } = await supabase.from("user_profiles").insert({
      user_id: authData.user.id,
      cpf: payload.cpf.replace(/\D/g, ""), // Remove formatação
      full_name: payload.full_name,
      email: payload.email,
      phone_mobile: payload.phone_mobile,
      phone_home: payload.phone_home,
      address_cep: payload.cep,
      address_street: addressData?.logradouro || "",
      address_number: payload.number,
      address_complement: payload.complement,
      address_district: addressData?.bairro || "",
      address_city: addressData?.localidade || "",
      address_state: addressData?.uf || "",
    });

    if (profileError) {
      console.error("Erro ao criar perfil:", profileError);
      throw new Error("Erro ao criar perfil de usuário");
    }

    return authData.user;
  } catch (error: any) {
    console.error("Erro no signUpRich:", error);
    throw error;
  }
}

/**
 * Login
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Logout
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Obter perfil do usuário atual
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }
}

/**
 * Atualizar perfil
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("user_id", userId);

  if (error) throw error;
}

