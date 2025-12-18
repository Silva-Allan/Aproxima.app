import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Tipos
type UserProfile = {
  id: string;
  email: string;
  nome?: string;
  telefone?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, nome: string, telefone: string, dataNascimento: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar perfil do usuário
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Perfil não encontrado, criando perfil básico...");
        return {
          id: userId,
          email: "",
          nome: "",
          telefone: "",
        };
      }

      return {
        id: data.id,
        email: data.email || "",
        nome: data.nome || "",
        telefone: data.telefone || "",
        avatar_url: data.avatar_url,
      };
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }
  };

  // Login
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cadastro
  const signUp = async (
    email: string,
    password: string,
    nome: string,
    telefone: string,
    dataNascimento: string
  ) => {
    setLoading(true);
    try {
      // 1. Cria usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuário não criado");

      // 2. Cria perfil na tabela usuarios
      const { error: profileError } = await supabase
        .from("usuarios")
        .insert([
          {
            id: authData.user.id,
            nome,
            telefone,
            data_nascimento: dataNascimento,
            created_at: new Date().toISOString(),
          },
        ]);

      if (profileError) throw profileError;

      // Não faz login automático - aguarda confirmação de email
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    setLoading(true);
    try {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("usuarios")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // Atualiza estado local
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Carregar sessão inicial
  useEffect(() => {
    async function loadInitialSession() {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.log("Erro ao obter sessão:", error);
          return;
        }

        if (data.session?.user) {
          const profile = await fetchUserProfile(data.session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error("Erro ao carregar sessão inicial:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        try {
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            setUser(profile);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Erro ao processar mudança de autenticação:", error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}