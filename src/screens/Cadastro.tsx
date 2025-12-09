import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { cadastrar } from "../services/auth";
import { useNavigation } from "@react-navigation/native";

export default function CadastroScreen() {
  const navigation = useNavigation();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleCadastro() {
    try {
      await cadastrar(email, senha, nome, telefone, dataNascimento);
      Alert.alert("Conta criada!", "Você já pode fazer login.");
      (navigation as any).navigate("Login");
    } catch (error: any) {
      Alert.alert("Erro ao cadastrar", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={setTelefone}
      />

      <TextInput
        style={styles.input}
        placeholder="Data de nascimento (YYYY-MM-DD)"
        value={dataNascimento}
        onChangeText={setDataNascimento}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <Button title="Cadastrar" onPress={handleCadastro} />

      <Text style={styles.link} onPress={() => navigation.goBack()}>
        Já tenho conta
      </Text>

      <Text
        style={styles.link}
        onPress={() => (navigation as any).navigate("Home")}
      >
        Voltar para Home
      </Text>
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
