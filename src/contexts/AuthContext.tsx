import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Tipo do contexto
type AuthContextType = {
  user: any | null;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Carrega sessão inicial
    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log("Erro ao obter sessão:", error);
      } else {
        setUser(data.session?.user ?? null);
      }
    }

    loadSession();

    // Listener para login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
