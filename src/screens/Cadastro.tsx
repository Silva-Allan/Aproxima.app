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
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  Mail, 
  Lock, 
  UserPlus,
  Eye, 
  EyeOff,
  Check
} from "lucide-react-native";
import { cadastrar, login } from "../services/auth";
import { useToast } from "../../components/Toast"; 
import { ConfirmModal } from "../../components/ConfirmModal"; 

export default function CadastroScreen() {
  const navigation = useNavigation();
  const showToast = useToast();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para o modal de confirmação
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalOnConfirm, setModalOnConfirm] = useState<() => void>(() => {});
  const [modalConfirmText, setModalConfirmText] = useState("OK");

  const handleBack = () => {
    navigation.goBack();
  };

  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatDate = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return numbers.replace(/(\d{2})(\d{2})/, '$1/$2');
    } else {
      return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    }
  };

  const validateForm = () => {
    if (!nome.trim()) return "Por favor, insira seu nome completo.";
    if (!telefone.trim() || telefone.replace(/\D/g, '').length < 10) return "Por favor, insira um telefone válido.";
    if (!dataNascimento.trim() || dataNascimento.length < 10) return "Por favor, insira uma data de nascimento válida.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Por favor, insira um email válido.";
    if (!senha.trim() || senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    if (senha !== confirmarSenha) return "As senhas não coincidem.";
    return null;
  };

  async function handleCadastroAutomatico() {
    const error = validateForm();
    if (error) {
      showToast({
        message: error,
        type: 'warning'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Cadastra
      await cadastrar(email, senha, nome, telefone, dataNascimento);
      
      // Tenta login automático
      try {
        await login(email, senha);
        showToast({
          message: "Conta criada com sucesso!",
          type: 'success'
        });
        navigation.navigate("Home" as never);
      } catch (loginError) {
        // Login falhou, mas conta foi criada
        setModalTitle("Sucesso!");
        setModalMessage("Conta criada! Faça login para começar.");
        setModalConfirmText("Ir para Login");
        setModalOnConfirm(() => () => {
          setShowSuccessModal(false);
          navigation.navigate("Login" as never);
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Não foi possível completar o cadastro.",
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }

  const navigateToLogin = () => {
    navigation.navigate("Login" as never);
  };

  const isFormValid = () => {
    return nome.trim() && 
           telefone.replace(/\D/g, '').length >= 10 && 
           dataNascimento.length >= 10 && 
           email.trim() && 
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
           senha.length >= 6 && 
           senha === confirmarSenha;
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={28} color="#8BC5E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Conta</Text>
        </View>

        {/* Conteúdo */}
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cabeçalho */}
          <View style={styles.welcomeSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <UserPlus size={50} color="#8BC5E5" />
              </View>
            </View>
            <Text style={styles.welcomeTitle}>Junte-se a nós!</Text>
            <Text style={styles.welcomeSubtitle}>
              Crie sua conta e comece a usar agora mesmo
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.formCard}>
            {/* Informações Pessoais */}
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            {/* Nome */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#8BC5E5" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#999"
                  value={nome}
                  onChangeText={setNome}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Telefone */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Telefone *</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#8BC5E5" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={telefone}
                  onChangeText={(text) => setTelefone(formatPhone(text))}
                  maxLength={15}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Data de Nascimento */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Data de Nascimento *</Text>
              <View style={styles.inputWrapper}>
                <Calendar size={20} color="#8BC5E5" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#999"
                  value={dataNascimento}
                  onChangeText={(text) => setDataNascimento(formatDate(text))}
                  maxLength={10}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Informações de Acesso */}
            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Informações de Acesso</Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email *</Text>
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
              {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <Text style={styles.errorText}>Email inválido</Text>
              )}
            </View>

            {/* Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#8BC5E5" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
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
              {senha && senha.length < 6 && (
                <Text style={styles.errorText}>Mínimo 6 caracteres</Text>
              )}
            </View>

            {/* Confirmar Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar Senha *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#8BC5E5" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite a senha novamente"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                  activeOpacity={0.7}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#666" />
                  ) : (
                    <Eye size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>
              {confirmarSenha && senha !== confirmarSenha && (
                <Text style={styles.errorText}>As senhas não coincidem</Text>
              )}
            </View>

            {/* Regras de Senha */}
            <View style={styles.passwordRules}>
              <Text style={styles.rulesTitle}>Sua senha deve conter:</Text>
              <View style={styles.ruleItem}>
                <View style={[
                  styles.ruleIndicator, 
                  senha.length >= 6 && styles.ruleIndicatorValid
                ]}>
                  {senha.length >= 6 && <Check size={12} color="white" />}
                </View>
                <Text style={[
                  styles.ruleText,
                  senha.length >= 6 && styles.ruleTextValid
                ]}>Pelo menos 6 caracteres</Text>
              </View>
              <View style={styles.ruleItem}>
                <View style={[
                  styles.ruleIndicator, 
                  senha === confirmarSenha && confirmarSenha && styles.ruleIndicatorValid
                ]}>
                  {senha === confirmarSenha && confirmarSenha && <Check size={12} color="white" />}
                </View>
                <Text style={[
                  styles.ruleText,
                  senha === confirmarSenha && confirmarSenha && styles.ruleTextValid
                ]}>As senhas coincidem</Text>
              </View>
            </View>

            {/* Botão Cadastrar */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
                !isFormValid() && styles.registerButtonDisabled
              ]}
              onPress={handleCadastroAutomatico}
              activeOpacity={0.7}
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <UserPlus size={20} color="white" />
                  <Text style={styles.registerButtonText}>Criar Conta e Entrar</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Já tem conta */}
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
                <Text style={styles.loginLinkText}>Faça login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Informação adicional */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Ao criar sua conta, você será conectado automaticamente.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={showSuccessModal}
        title={modalTitle}
        message={modalMessage}
        confirmText={modalConfirmText}
        cancelText=""
        onConfirm={() => {
          modalOnConfirm();
          setShowSuccessModal(false);
        }}
        onCancel={() => setShowSuccessModal(false)}
      />
    </>
  );
}

// Mantenha os mesmos estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
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
    borderWidth: 1,
    borderColor: "#f0f0f0",
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
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
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
  errorText: {
    fontSize: 12,
    color: "#ff6b6b",
    marginTop: 4,
    marginLeft: 4,
  },
  passwordRules: {
    backgroundColor: "rgba(139, 197, 229, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(139, 197, 229, 0.1)",
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ruleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e9ecef",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ruleIndicatorValid: {
    backgroundColor: "#8BC5E5",
  },
  ruleText: {
    fontSize: 14,
    color: "#666",
  },
  ruleTextValid: {
    color: "#8BC5E5",
    fontWeight: "500",
  },
  registerButton: {
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
  registerButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLinkText: {
    fontSize: 14,
    color: "#8BC5E5",
    fontWeight: "600",
  },
  infoSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(139, 197, 229, 0.2)",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});