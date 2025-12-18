import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react-native";
import { login } from "../services/auth";
import { useToast } from "../../components/Toast";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Hook para toast
  const showToast = useToast();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      showToast({
        message: "Por favor, preencha todos os campos.",
        type: 'warning'
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, senha);
      showToast({
        message: "Login realizado com sucesso!",
        type: 'success'
      });
    } catch (error: any) {
      showToast({
        message: error.message || "Credenciais inválidas. Tente novamente.",
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate("Cadastro" as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Entrar na Conta</Text>
      </View>

      {/* Conteúdo */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Boas-vindas */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <LogIn size={50} color="#8BC5E5" />
            </View>
          </View>
          <Text style={styles.welcomeTitle}>Bem-vindo de volta!</Text>
          <Text style={styles.welcomeSubtitle}>Entre para acessar seus gestos personalizados</Text>
        </View>

        {/* Formulário de Login */}
        <View style={styles.formCard}>
          {/* Campo Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#8BC5E5" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Campo Senha */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#8BC5E5" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Esqueci a senha */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Botão Entrar */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
              (!email.trim() || !senha.trim()) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            activeOpacity={0.7}
            disabled={isLoading || !email.trim() || !senha.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <LogIn size={20} color="white" />
                <Text style={styles.loginButtonText}>Entrar</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botão Criar Conta */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={navigateToRegister}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <UserPlus size={20} color="#8BC5E5" />
            <Text style={styles.registerButtonText}>Criar uma conta</Text>
          </TouchableOpacity>
        </View>

        {/* Acesso Rápido */}
        <View style={styles.quickAccess}>
          <Text style={styles.quickAccessTitle}>Acesso Rápido</Text>
          <View style={styles.quickAccessButtons}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => {
                setEmail("demo@aproxima.com");
                setSenha("demo123");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickButtonText}>Demo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 32,
    padding: 24,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(139, 197, 229, 0.3)",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 16,
    paddingRight: 8,
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#8BC5E5",
    fontWeight: "500",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8BC5E5",
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 197, 229, 0.3)",
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8BC5E5",
  },
  quickAccess: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  quickAccessButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 197, 229, 0.3)",
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8BC5E5",
  },
  infoSection: {
    padding: 16,
    backgroundColor: "rgba(139, 197, 229, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 197, 229, 0.1)",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
});