// src/services/gestos.ts - ATUALIZADO COMPLETO
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

// Lista de categorias válidas - ATUALIZADA para corresponder ao Categories.tsx
const CATEGORIAS_VALIDAS = [
  'comidas',
  'gestos', 
  'sentimentos',
  'sensacoes',
  'essenciais',
  'lugares',      // ADICIONADA
  'objetos',      // ADICIONADA
  'transportes',  // ADICIONADA
  'escola'        // ADICIONADA
];

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

  // Validar categoria - ATUALIZADA para incluir todas as categorias
  if (!CATEGORIAS_VALIDAS.includes(categoria_id)) {
    throw new Error(`Categoria "${categoria_id}" inválida. Categorias válidas: ${CATEGORIAS_VALIDAS.join(', ')}`);
  }

  console.log("📝 Criando gesto com dados:", {
    id_usuario,
    nome,
    descricao,
    categoria_id,
    icone_label: iconeLabel,
    icone_name: iconeName,
    imagem_url: imagemUrl
  });

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
    console.error("❌ Erro ao criar gesto no Supabase:", error);
    throw error;
  }

  console.log("✅ Gesto criado com sucesso:", data);
  return data;
}

/**
 * Buscar gestos por categoria
 */
export async function buscarGestosPorCategoria(categoria_id: string, usuarioId?: string): Promise<Gesto[]> {
  try {
    const session = await usuarioAtual();
    
    if (!session && !usuarioId) {
      console.warn("⚠️ Nenhuma sessão encontrada, usando usuário fornecido");
    }

    const id_usuario = usuarioId || session?.user.id;

    if (!id_usuario) {
      throw new Error("ID do usuário não encontrado.");
    }

    console.log(`🔍 Buscando gestos para categoria: ${categoria_id}, usuário: ${id_usuario}`);

    // Primeiro verificar se a categoria é válida (opcional)
    if (!CATEGORIAS_VALIDAS.includes(categoria_id)) {
      console.warn(`⚠️ Categoria "${categoria_id}" não está na lista de categorias válidas`);
    }

    const { data, error } = await supabase
      .from("gestos")
      .select("*")
      .eq("categoria_id", categoria_id)
      .eq("id_usuario", id_usuario)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erro ao buscar gestos:", error);
      throw error;
    }

    console.log(`✅ Encontrados ${data?.length || 0} gestos na categoria ${categoria_id}`);
    return data || [];

  } catch (error: any) {
    console.error("💥 Erro em buscarGestosPorCategoria:", error);
    throw error;
  }
}

/**
 * Buscar todos os gestos do usuário
 */
export async function buscarMeusGestos(usuarioId?: string): Promise<Gesto[]> {
  try {
    const session = await usuarioAtual();
    
    if (!session && !usuarioId) {
      throw new Error("Você precisa estar logado para buscar gestos.");
    }

    const id_usuario = usuarioId || session?.user.id;

    if (!id_usuario) {
      throw new Error("ID do usuário não encontrado.");
    }

    console.log(`🔍 Buscando todos os gestos do usuário: ${id_usuario}`);

    const { data, error } = await supabase
      .from("gestos")
      .select("*")
      .eq("id_usuario", id_usuario)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erro ao buscar gestos:", error);
      throw error;
    }

    console.log(`✅ Encontrados ${data?.length || 0} gestos no total`);
    return data || [];

  } catch (error: any) {
    console.error("💥 Erro em buscarMeusGestos:", error);
    throw error;
  }
}

/**
 * Buscar gesto por ID
 */
export async function buscarGestoPorId(id: number): Promise<Gesto | null> {
  try {
    const session = await usuarioAtual();

    if (!session) {
      throw new Error("Você precisa estar logado para buscar gestos.");
    }

    console.log(`🔍 Buscando gesto com ID: ${id}`);

    const { data, error } = await supabase
      .from("gestos")
      .select("*")
      .eq("id", id)
      .eq("id_usuario", session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`⚠️ Gesto com ID ${id} não encontrado`);
        return null;
      }
      console.error("❌ Erro ao buscar gesto:", error);
      throw error;
    }

    console.log(`✅ Gesto encontrado: ${data.nome}`);
    return data;

  } catch (error: any) {
    console.error("💥 Erro em buscarGestoPorId:", error);
    throw error;
  }
}

/**
 * Atualizar gesto
 */
export async function atualizarGesto(id: number, updates: Partial<GestoCreateData>): Promise<Gesto> {
  try {
    const session = await usuarioAtual();

    if (!session) {
      throw new Error("Você precisa estar logado para atualizar gestos.");
    }

    console.log(`✏️ Atualizando gesto ID: ${id}`, updates);

    const updateData: any = {};
    
    if (updates.categoria_id !== undefined) {
      // Validar nova categoria se for fornecida
      if (!CATEGORIAS_VALIDAS.includes(updates.categoria_id)) {
        throw new Error(`Categoria "${updates.categoria_id}" inválida. Categorias válidas: ${CATEGORIAS_VALIDAS.join(', ')}`);
      }
      updateData.categoria_id = updates.categoria_id;
    }
    
    if (updates.nome !== undefined) updateData.nome = updates.nome;
    if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
    if (updates.imagemUrl !== undefined) updateData.imagem_url = updates.imagemUrl;
    if (updates.iconeLabel !== undefined) updateData.icone_label = updates.iconeLabel;
    if (updates.iconeName !== undefined) updateData.icone_name = updates.iconeName;
    
    updateData.updated_at = new Date().toISOString();

    console.log("📦 Dados de atualização:", updateData);

    const { data, error } = await supabase
      .from("gestos")
      .update(updateData)
      .eq("id", id)
      .eq("id_usuario", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao atualizar gesto:", error);
      throw error;
    }

    console.log(`✅ Gesto atualizado com sucesso: ${data.nome}`);
    return data;

  } catch (error: any) {
    console.error("💥 Erro em atualizarGesto:", error);
    throw error;
  }
}

/**
 * Excluir gesto
 */
export async function excluirGesto(id: number): Promise<boolean> {
  try {
    const session = await usuarioAtual();

    if (!session) {
      throw new Error("Você precisa estar logado para excluir gestos.");
    }

    console.log(`🗑️ Excluindo gesto ID: ${id}`);

    const { error } = await supabase
      .from("gestos")
      .delete()
      .eq("id", id)
      .eq("id_usuario", session.user.id);

    if (error) {
      console.error("❌ Erro ao excluir gesto:", error);
      throw error;
    }

    console.log(`✅ Gesto excluído com sucesso`);
    return true;

  } catch (error: any) {
    console.error("💥 Erro em excluirGesto:", error);
    throw error;
  }
}

/**
 * Buscar gestos por nome (busca)
 */
export async function buscarGestosPorNome(nome: string, usuarioId?: string): Promise<Gesto[]> {
  try {
    const session = await usuarioAtual();
    
    if (!session && !usuarioId) {
      throw new Error("Você precisa estar logado para buscar gestos.");
    }

    const id_usuario = usuarioId || session?.user.id;

    if (!id_usuario) {
      throw new Error("ID do usuário não encontrado.");
    }

    console.log(`🔍 Buscando gestos por nome: "${nome}"`);

    const { data, error } = await supabase
      .from("gestos")
      .select("*")
      .eq("id_usuario", id_usuario)
      .ilike("nome", `%${nome}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ Erro ao buscar gestos por nome:", error);
      throw error;
    }

    console.log(`✅ Encontrados ${data?.length || 0} gestos com nome contendo "${nome}"`);
    return data || [];

  } catch (error: any) {
    console.error("💥 Erro em buscarGestosPorNome:", error);
    throw error;
  }
}

/**
 * Contar gestos por categoria
 */
export async function contarGestosPorCategoria(usuarioId?: string): Promise<Record<string, number>> {
  try {
    const session = await usuarioAtual();
    
    if (!session && !usuarioId) {
      throw new Error("Você precisa estar logado para contar gestos.");
    }

    const id_usuario = usuarioId || session?.user.id;

    if (!id_usuario) {
      throw new Error("ID do usuário não encontrado.");
    }

    console.log(`📊 Contando gestos por categoria para usuário: ${id_usuario}`);

    const { data, error } = await supabase
      .from("gestos")
      .select("categoria_id")
      .eq("id_usuario", id_usuario);

    if (error) {
      console.error("❌ Erro ao contar gestos:", error);
      throw error;
    }

    const contagem: Record<string, number> = {};
    
    // Inicializar todas as categorias com 0
    CATEGORIAS_VALIDAS.forEach(categoria => {
      contagem[categoria] = 0;
    });

    // Contar gestos por categoria
    data?.forEach(gesto => {
      if (gesto.categoria_id && contagem[gesto.categoria_id] !== undefined) {
        contagem[gesto.categoria_id]++;
      }
    });

    console.log("📈 Contagem por categoria:", contagem);
    return contagem;

  } catch (error: any) {
    console.error("💥 Erro em contarGestosPorCategoria:", error);
    throw error;
  }
}

// Função auxiliar para verificar se categoria é válida
export function categoriaValida(categoria_id: string): boolean {
  const valida = CATEGORIAS_VALIDAS.includes(categoria_id);
  console.log(`✅ Categoria "${categoria_id}" é válida? ${valida}`);
  return valida;
}

// Função para obter todas as categorias válidas
export function getCategoriasValidas(): string[] {
  console.log(`📋 Categorias válidas: ${CATEGORIAS_VALIDAS.join(', ')}`);
  return [...CATEGORIAS_VALIDAS];
}

// Função para obter o nome amigável da categoria
export function getNomeCategoria(categoria_id: string): string {
  const nomes: Record<string, string> = {
    'comidas': 'Comidas',
    'gestos': 'Gestos',
    'sentimentos': 'Sentimentos',
    'sensacoes': 'Sensações',
    'essenciais': 'Palavras Essenciais',
    'lugares': 'Lugares',
    'objetos': 'Objetos',
    'transportes': 'Transportes',
    'escola': 'Escola'
  };
  
  return nomes[categoria_id] || categoria_id;
}