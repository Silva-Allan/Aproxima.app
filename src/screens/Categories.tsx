import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Droplets,
  Hand,
  Home,
  MessageSquare,
  Smile,
  ThumbsUp,
  Apple,
  Pizza,
  IceCream,
  Cookie,
  Milk,
  Coffee,
  Heart as HeartHand,
  Eye,
  Ear,
  Heart,
  Frown,
  Laugh,
  Angry,
  Meh,
  Zap,
  Sun,
  Moon,
  Wind,
  Thermometer,
  Home as HomeWord,
  Bed,
  Toilet,
  Bath,
  School,
  Car,
  Utensils,
  Beef,
  Egg,
  Carrot,
  Banana,
  Baby,
  Volume2,
  Check,
  X,
  House,
  Cloud,
  Building,
  MapPin,
  Store,
  Sofa,
  Tv,
  Book,
  Pen,
  Phone,
  Music,
  Gamepad2,
  Bus,
  Bike,
  Train,
  Plane,
  Church,
  PenTool,
  Pencil,
  Notebook,
  Clipboard,
  GraduationCap,
  Calculator,
  Globe,
  Ruler,
  Scissors,
  Palette,
  Edit,
} from "lucide-react-native";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CategoryButton from "../../components/CategoryButton";

// Interface para os itens das categorias
export interface CategoryItem {
  icon: React.ComponentType<any>;
  label: string;
}

// Interface para as categorias
export interface Category {
  id: string;
  name: string;
  items: CategoryItem[];
}

// Dados das categorias atualizados com ícones apropriados
export const categoryData: Category[] = [
  {
    id: "comidas",
    name: "Comidas",
    items: [
      { icon: Beef, label: "CARNE" },
      { icon: Apple, label: "MAÇÃ" },
      { icon: Carrot, label: "CENOURA" },
      { icon: Banana, label: "BANANA" },
      { icon: Egg, label: "OVO" },
      { icon: Milk, label: "LEITE" },
      { icon: Pizza, label: "PIZZA" },
      { icon: IceCream, label: "SORVETE" },
    ],
  },
  {
    id: "gestos",
    name: "Gestos",
    items: [
      { icon: ThumbsUp, label: "POSITIVO" },
      { icon: Hand, label: "PARAR" },
      { icon: Hand, label: "OI/TCHAU" },
      { icon: HeartHand, label: "AMOR" },
      { icon: Eye, label: "VER" },
      { icon: Ear, label: "OUVIR" },
      { icon: Check, label: "CERTO" },
      { icon: X, label: "ERRADO" },
      { icon: Baby, label: "BEBÊ" },
    ],
  },
  {
    id: "sentimentos",
    name: "Sentimentos",
    items: [
      { icon: Heart, label: "TE AMO" },
      { icon: Smile, label: "FELIZ" },
      { icon: Frown, label: "TRISTE" },
      { icon: Laugh, label: "ALEGRE" },
      { icon: Angry, label: "BRAVO" },
      { icon: Meh, label: "NORMAL" },
      { icon: Heart, label: "APAixonADO" },
      { icon: Frown, label: "CANSADO" },
      { icon: Smile, label: "CONTENTE" },
    ],
  },
  {
    id: "sensacoes",
    name: "Sensações",
    items: [
      { icon: Droplets, label: "SEDE" },
      { icon: Utensils, label: "FOME" },
      { icon: Sun, label: "CALOR" },
      { icon: Moon, label: "SONO" },
      { icon: Wind, label: "FRIO" },
      { icon: Thermometer, label: "FEBRE" },
      { icon: Zap, label: "DOR" },
      { icon: Cloud, label: "ENJOO" },
      { icon: Sun, label: "COCEIRA" },
    ],
  },
  {
    id: "essenciais",
    name: "Palavras Essenciais",
    items: [
      { icon: Bed, label: "CAMA" },
      { icon: Toilet, label: "BANHEIRO" },
      { icon: Bath, label: "BANHO" },
      { icon: School, label: "ESCOLA" },
      { icon: Car, label: "CARRO" },
      { icon: Utensils, label: "COMIDA" },
      { icon: Droplets, label: "ÁGUA" },
      { icon: Heart, label: "AMOR" },
    ],
  },
  {
    id: "lugares",
    name: "Lugares",
    items: [
      { icon: House, label: "CASA" },
      { icon: School, label: "ESCOLA" },
      { icon: Store, label: "MERCADO" },
      { icon: Building, label: "HOSPITAL" },
      { icon: MapPin, label: "PRAIA" },
      { icon: Church, label: "IGREJA" },
    ],
  },
  {
    id: "objetos",
    name: "Objetos",
    items: [
      { icon: Tv, label: "TV" },
      { icon: Sofa, label: "SOFÁ" },
      { icon: Bed, label: "CAMA" },
      { icon: Book, label: "LIVRO" },
      { icon: Pen, label: "CANETA" },
      { icon: Phone, label: "CELULAR" },
      { icon: Utensils, label: "GARFO" },
      { icon: Music, label: "RÁDIO" },
      { icon: Gamepad2, label: "VIDEOGAME" },
    ],
  },
  {
    id: "transportes",
    name: "Transportes",
    items: [
      { icon: Car, label: "CARRO" },
      { icon: Bike, label: "BICICLETA" },
      { icon: Bus, label: "ÔNIBUS" },
      { icon: Train, label: "TREM" },
      { icon: Plane, label: "AVIÃO" },
    ],
  },
  {
    id: "escola",
    name: "Escola",
    items: [
      { icon: Book, label: "LIVRO" },
      { icon: Pen, label: "CANETA" },
      { icon: Pencil, label: "LÁPIS" },
      { icon: Notebook, label: "CADERNO" },
      { icon: Clipboard, label: "PRANCHETA" },
      { icon: GraduationCap, label: "FORMATURA" },
      { icon: Calculator, label: "CALCULADORA" },
      { icon: Globe, label: "GLOBO" },
      { icon: Ruler, label: "RÉGUA" },
      { icon: Scissors, label: "TESOURA" },
      { icon: Palette, label: "TINTAS" },
      { icon: Music, label: "MÚSICA" },
    ],
  },
];

// Ícone personalizado para frango (se não existir no lucide)
const Chicken = ({ size, color, strokeWidth }: any) => (
  <Text style={{ fontSize: size, color }}>🍗</Text>
);

export default function Categories() {
  const navigation = useNavigation();

  // Categorias principais atualizadas
  const categories = [
    { icon: Utensils, label: "COMIDAS", route: "CategoryItems", params: { categoryId: "comidas" } },
    { icon: Hand, label: "GESTOS", route: "CategoryItems", params: { categoryId: "gestos" } },
    { icon: Heart, label: "SENTIMENTOS", route: "CategoryItems", params: { categoryId: "sentimentos" } },
    { icon: Thermometer, label: "SENSAÇÕES", route: "CategoryItems", params: { categoryId: "sensacoes" } },
    { icon: HomeWord, label: "PALAVRAS ESSENCIAIS", route: "CategoryItems", params: { categoryId: "essenciais" } },
    { icon: MapPin, label: "LUGARES", route: "CategoryItems", params: { categoryId: "lugares" } },
    { icon: Tv, label: "OBJETOS", route: "CategoryItems", params: { categoryId: "objetos" } },
    { icon: Car, label: "TRANSPORTES", route: "CategoryItems", params: { categoryId: "transportes" } },
    { icon: ThumbsUp, label: "ESCOLHAS", route: "Choices" },
    { icon: Notebook, label: "ESCOLA", route: "CategoryItems", params: { categoryId: "escola" } },
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
              <Edit size={32} color="white" strokeWidth={2.5} />
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
});