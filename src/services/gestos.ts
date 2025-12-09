import { supabase } from "../lib/supabase";
import { usuarioAtual } from "./auth";

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
  return data[0];
}
