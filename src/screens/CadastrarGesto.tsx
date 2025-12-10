import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert
} from "react-native";
import { ArrowLeft, Save } from "lucide-react-native";
import { criarGesto } from "../services/gestos";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function CadastrarGesto() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  async function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Por favor, insira um nome para o gesto.");
      return;
    }

    setIsLoading(true);
    try {
      await criarGesto({ nome, descricao });
      Alert.alert(
        "Sucesso!",
        "Gesto criado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível criar o gesto. Tente novamente.");
      console.error("Erro ao criar gesto:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={28} color="#8BC5E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Gesto</Text>
      </View>

      {/* Conteúdo */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informações do Gesto</Text>
          
          {/* Campo Nome */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome do Gesto *</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              placeholder="Ex: Sim, Não, Mais"
              placeholderTextColor="#999"
              maxLength={50}
            />
            <Text style={styles.charCount}>{nome.length}/50</Text>
          </View>

          {/* Campo Descrição */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              style={[styles.input, styles.textArea]}
              placeholder="Descreva como fazer este gesto..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.charCount}>{descricao.length}/200</Text>
          </View>

          {/* Informações de exemplo */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Dicas:</Text>
            <Text style={styles.infoText}>
              • Use nomes simples e diretos{"\n"}
              • Descreva movimentos claros{"\n"}
              • Pense em gestos do dia a dia
            </Text>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isLoading && styles.saveButtonDisabled,
              !nome.trim() && styles.saveButtonDisabled
            ]}
            onPress={handleSalvar}
            activeOpacity={0.7}
            disabled={isLoading || !nome.trim()}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Salvando...</Text>
            ) : (
              <>
                <Save size={20} color="white" />
                <Text style={styles.saveButtonText}>Salvar Gesto</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.quickActions}>
          <Text style={styles.actionsTitle}>Ações Rápidas</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Home" as never)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setNome("Sim")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Exemplo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
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
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    paddingBottom: 16,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
    marginRight: 4,
  },
  infoBox: {
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#8BC5E5",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8BC5E5",
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  quickActions: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(139, 197, 229, 0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 197, 229, 0.3)",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8BC5E5",
  },
});