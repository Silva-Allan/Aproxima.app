// src/services/gestos.ts - COMPLETO
import { supabase } from "../lib/supabase";
import { usuarioAtual } from "./auth";

export interface GestoCreateData {
  nome: string;
  descricao?: string;
  categoria_id: string;
  iconeLabel?: string;
  imagemUrl: string;
  iconeName?: string;
}

export interface Gesto {
  id: number;
  nome: string;
  descricao: string | null;
  imagem_url: string | null;
  som_url: string | null;
  id_usuario: string;
  categoria_id: string;
  icone_label?: string;
  icone_name?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Criar novo gesto
 */
export async function criarGesto({ 
  nome, 
  descricao = "", 
  categoria_id, 
  iconeLabel = "", 
  imagemUrl,
  iconeName = ""
}: GestoCreateData): Promise<Gesto> {
  const session = await usuarioAtual();

  if (!session) {
    throw new Error("Você precisa estar logado para criar um gesto.");
  }

  const id_usuario = session.user.id;

  // Validar categoria
  const CATEGORIAS_VALIDAS = ['comidas', 'gestos', 'sentimentos', 'sensacoes', 'essenciais'];
  if (!CATEGORIAS_VALIDAS.includes(categoria_id)) {
    throw new Error(`Categoria "${categoria_id}" inválida. Categorias válidas: ${CATEGORIAS_VALIDAS.join(', ')}`);
  }

  const { data, error } = await supabase
    .from("gestos")
    .insert([{ 
      id_usuario, 
      nome, 
      descricao,
      categoria_id: categoria_id,
      icone_label: iconeLabel,
      icone_name: iconeName,
      imagem_url: imagemUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar gesto no Supabase:", error);
    throw error;
  }
  
  return data;
}

/**
 * Buscar gestos por categoria
 */
export async function buscarGestosPorCategoria(categoria_id: string): Promise<Gesto[]> {
  const session = await usuarioAtual();

  if (!session) {
    throw new Error("Você precisa estar logado para buscar gestos.");
  }

  const id_usuario = session.user.id;

  const { data, error } = await supabase
    .from("gestos")
    .select("*")
    .eq("categoria_id", categoria_id)
    .eq("id_usuario", id_usuario)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar gestos:", error);
    throw error;
  }

  return data || [];
}

/**
 * Buscar todos os gestos do usuário
 */
export async function buscarMeusGestos(): Promise<Gesto[]> {
  const session = await usuarioAtual();

  if (!session) {
    throw new Error("Você precisa estar logado para buscar gestos.");
  }

  const id_usuario = session.user.id;

  const { data, error } = await supabase
    .from("gestos")
    .select("*")
    .eq("id_usuario", id_usuario)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar gestos:", error);
    throw error;
  }

  return data || [];
}

/**
 * Atualizar gesto
 */
export async function atualizarGesto(id: number, updates: Partial<GestoCreateData>): Promise<Gesto> {
  const session = await usuarioAtual();

  if (!session) {
    throw new Error("Você precisa estar logado para atualizar gestos.");
  }

  const updateData: any = {};
  
  if (updates.categoria_id !== undefined) {
    updateData.categoria_id = updates.categoria_id;
  }
  if (updates.nome !== undefined) updateData.nome = updates.nome;
  if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
  if (updates.imagemUrl !== undefined) updateData.imagem_url = updates.imagemUrl;
  if (updates.iconeLabel !== undefined) updateData.icone_label = updates.iconeLabel;
  if (updates.iconeName !== undefined) updateData.icone_name = updates.iconeName;
  
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("gestos")
    .update(updateData)
    .eq("id", id)
    .eq("id_usuario", session.user.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar gesto:", error);
    throw error;
  }

  return data;
}

/**
 * Excluir gesto
 */
export async function excluirGesto(id: number): Promise<boolean> {
  const session = await usuarioAtual();

  if (!session) {
    throw new Error("Você precisa estar logado para excluir gestos.");
  }

  const { error } = await supabase
    .from("gestos")
    .delete()
    .eq("id", id)
    .eq("id_usuario", session.user.id);

  if (error) {
    console.error("Erro ao excluir gesto:", error);
    throw error;
  }

  return true;
}