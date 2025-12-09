import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { criarGesto } from "../services/gestos";
import { useAuth } from "../contexts/AuthContext";

export default function CadastrarGesto({ navigation }: any) {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function handleSalvar() {
    try {
      await criarGesto({ nome, descricao });
      setMensagem("Gesto criado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      setMensagem("Erro: " + error.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Cadastro de Gesto
      </Text>

      <Text>Nome:</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Text>Descrição:</Text>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Button title="Salvar" onPress={handleSalvar} />

      <Text
        style={styles.link}
        onPress={() => (navigation as any).navigate("Home")}
        >
            Voltar para Home
        </Text>

      {mensagem ? <Text>{mensagem}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "blue",
  },
});
