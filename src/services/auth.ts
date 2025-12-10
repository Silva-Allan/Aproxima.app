// src/services/auth.ts
import { supabase } from "../lib/supabase";

// Interface do usuário atualizada
export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  data_nascimento?: string;
  avatar_url?: string;          // ← NOVO
  avatar_updated_at?: string;   // ← NOVO
  created_at: string;
  updated_at?: string;
}

// CADASTRO COMPLETO DO USUÁRIO (atualizado)
export async function cadastrar(
  email: string,
  senha: string,
  nome: string,
  telefone: string,
  dataNascimento: string
) {
  console.log("=== TENTANDO SIGNUP ===", email, senha, nome, telefone, dataNascimento);

  // 1. Cria usuário no Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
  });

  console.log("SIGNUP RESULT:", { data, error });

  if (error) throw error;

  const user = data.user;
  console.log("USER:", user);

  if (!user) throw new Error("Usuário não foi criado.");

  // 2. Cria perfil na tabela usuarios
  const { error: insertError } = await supabase.from("usuarios").insert([
    {
      id: user.id,
      nome,
      telefone,
      data_nascimento: dataNascimento,
      created_at: new Date().toISOString(),
    },
  ]);

  console.log("INSERT PERFIL RESULT:", insertError);

  if (insertError) throw insertError;

  return user;
}

// LOGIN DE USUÁRIO
export async function login(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) throw error;
  return data;
}

// LOGOUT
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// USUÁRIO ATUAL (com sessão)
export async function usuarioAtual() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// BUSCAR PERFIL COMPLETO DO USUÁRIO LOGADO (atualizado)
export async function buscarPerfilUsuario() {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", userId);

    if (error) throw error;

    // Se não tem dados, retornar estrutura vazia
    if (!data || data.length === 0) {
      console.warn("Usuário não tem perfil na tabela usuarios");

      return {
        id: userId,
        email: session.user.email || '',
        nome: '',
        telefone: '',
        data_nascimento: '',
        avatar_url: undefined,
        avatar_updated_at: undefined,
        created_at: session.user.created_at,
        updated_at: undefined,
      } as UserProfile;
    }

    // Se tem dados, retornar o primeiro
    const perfil = data[0];

    return {
      id: userId,
      email: session.user.email || '',
      nome: perfil.nome || '',
      telefone: perfil.telefone || '',
      data_nascimento: perfil.data_nascimento || '',
      avatar_url: perfil.avatar_url || undefined,
      avatar_updated_at: perfil.avatar_updated_at || undefined,
      created_at: perfil.created_at || session.user.created_at,
      updated_at: perfil.updated_at,
    } as UserProfile;

  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    throw error;
  }
}

// ATUALIZAR PERFIL DO USUÁRIO (atualizado)
export async function atualizarPerfil(updates: {
  nome?: string;
  telefone?: string;
  data_nascimento?: string;
  avatar_url?: string;  // ← NOVO
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Preparar dados incluindo avatar
    const dadosAtualizacao: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Se tem avatar_url, atualiza avatar_updated_at também
    if (updates.avatar_url) {
      dadosAtualizacao.avatar_updated_at = new Date().toISOString();
    }

    // Usar upsert (update ou insert) - mais robusto
    const { data, error } = await supabase
      .from("usuarios")
      .upsert({
        id: userId,
        ...dadosAtualizacao,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: userId,
      email: userEmail || '',
      nome: data?.nome || updates.nome || '',
      telefone: data?.telefone || updates.telefone || '',
      data_nascimento: data?.data_nascimento || updates.data_nascimento || '',
      avatar_url: data?.avatar_url || updates.avatar_url || undefined,
      avatar_updated_at: data?.avatar_updated_at,
      created_at: data?.created_at || session.user.created_at,
      updated_at: data?.updated_at,
    } as UserProfile;

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
}

// VERIFICAR SE USUÁRIO ESTÁ LOGADO
export async function verificarAutenticacao() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
}

// ALTERAR EMAIL (requer confirmação)
export async function alterarEmail(novoEmail: string) {
  const { data, error } = await supabase.auth.updateUser({
    email: novoEmail,
  });

  if (error) throw error;
  return data;
}

// CRIAR GESTO (corrigido - sem import duplicado)
export async function criarGesto({ nome, descricao }: { nome: string; descricao: string; }) {
  const session = await usuarioAtual();

  if (!session) {
    throw new Error("Você precisa estar logado para criar um gesto.");
  }

  const id_usuario = session.user.id;

  const { data, error } = await supabase
    .from("gestos")
    .insert([{ id_usuario, nome, descricao }])
    .select();

  if (error) throw error;
  return data ? data[0] : null;
}