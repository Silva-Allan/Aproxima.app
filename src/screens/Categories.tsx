import { useNavigation } from "@react-navigation/native";
import {
    ArrowLeft,
    Baby,
    Droplets,
    Hand,
    Home,
    MessageSquare,
    Smile,
    ThumbsUp,
} from "lucide-react-native";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CategoryButton from "../../components/CategoryButton";

export default function Categories() {
  const navigation = useNavigation();

  // Atualizei os routes para corresponder aos nomes das telas no seu Stack Navigator
  const categories = [
    { icon: Baby, label: "COMIDAS", route: "CategoryItems", params: { categoryId: "comidas" } },
    { icon: Hand, label: "GESTOS", route: "CategoryItems", params: { categoryId: "gestos" } },
    { icon: Smile, label: "SENTIMENTOS", route: "CategoryItems", params: { categoryId: "sentimentos" } },
    { icon: Droplets, label: "SENSAÇÕES", route: "CategoryItems", params: { categoryId: "sensacoes" } },
    { icon: ThumbsUp, label: "ESCOLHAS", route: "Choices" }, // Tela direta
    { icon: MessageSquare, label: "PALAVRAS ESSENCIAIS", route: "CategoryItems", params: { categoryId: "essenciais" } },
  ];

  const handleHome = () => {
    navigation.navigate("Home" as never);
  };

  const screenWidth = Dimensions.get('window').width;
  const buttonSize = (screenWidth - 48) / 2; // 24px padding de cada lado

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Eu quero falar</Text>
        </TouchableOpacity>
      </View>

      {/* GRID DE CATEGORIAS */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {categories.map((c, index) => (
            <View key={c.label} style={{ width: buttonSize, marginBottom: 16 }}>
              <CategoryButton
                icon={c.icon}
                label={c.label}
                route={c.route}
                params={c.params}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* NAV INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleHome}
          activeOpacity={0.7}
        >
          <Home size={32} color="white" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Settings" as never)}
        >
          <View style={styles.settingsWrapper}>
            <View style={styles.settingsIcon}>
              <ArrowLeft size={32} color="white" strokeWidth={2.5} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A8D8F0",
  },

  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  headerButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: "#8BC5E5",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  headerButtonText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "#A8D8F0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navButton: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },

  circleIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },

  settingsWrapper: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  settingsIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  settingsCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: "white",
    borderWidth: 2,
  },
});