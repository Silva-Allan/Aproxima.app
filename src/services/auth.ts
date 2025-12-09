import { supabase } from "../lib/supabase";

// CADASTRO COMPLETO DO USUÁRIO
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

// BUSCAR PERFIL COMPLETO
export async function buscarPerfil(id: string) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
