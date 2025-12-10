import { 
  Apple, Milk, Cookie, Pizza, IceCream, Coffee, MessageSquare,
  ThumbsUp, Hand, Smile as WaveIcon, Heart as HeartHand, Eye, Ear,
  Heart, Smile, Frown, Laugh, Angry, Meh,
  Droplets, Zap, Sun, Moon, Wind, Thermometer,
  Home as HomeWord, Bed, Toilet, Bath, School, Car,
} from "lucide-react-native";

/**
 * Dados das categorias e seus itens
 * Cada categoria contém uma lista de itens com ícone e texto
 */

export interface CategoryItem {
  icon: React.ComponentType<any>; // Tipo para ícones do lucide-react-native
  label: string;
}

export interface Category {
  id: string;
  name: string;
  items: CategoryItem[];
}

export const categoryData: Category[] = [
  {
    id: "comidas",
    name: "Comidas",
    items: [
      { icon: MessageSquare, label: "FRANGO" },
      { icon: Pizza, label: "CARNE" },
      { icon: Apple, label: "ARROZ" },
      { icon: IceCream, label: "SALADA" },
      { icon: Apple, label: "TOMATE" },
      { icon: Cookie, label: "PÃO" },
      { icon: Apple, label: "BANANA" },
      { icon: IceCream, label: "MORANGO" },
    ],
  },
  {
    id: "gestos",
    name: "Gestos",
    items: [
      { icon: ThumbsUp, label: "Positivo" },
      { icon: Hand, label: "Parar" },
      { icon: WaveIcon, label: "Oi/Tchau" },
      { icon: HeartHand, label: "Amor" },
      { icon: Eye, label: "Ver" },
      { icon: Ear, label: "Ouvir" },
    ],
  },
  {
    id: "sentimentos",
    name: "Sentimentos",
    items: [
      { icon: Heart, label: "Te amo" },
      { icon: Smile, label: "Feliz" },
      { icon: Frown, label: "Triste" },
      { icon: Laugh, label: "Alegre" },
      { icon: Angry, label: "Bravo" },
      { icon: Meh, label: "Normal" },
    ],
  },
  {
    id: "sensacoes",
    name: "Sensações",
    items: [
      { icon: Droplets, label: "Água/Sede" },
      { icon: Zap, label: "Energia" },
      { icon: Sun, label: "Calor" },
      { icon: Moon, label: "Sono" },
      { icon: Wind, label: "Frio" },
      { icon: Thermometer, label: "Febre" },
    ],
  },
  {
    id: "essenciais",
    name: "Palavras Essenciais",
    items: [
      { icon: HomeWord, label: "Casa" },
      { icon: Bed, label: "Cama" },
      { icon: Toilet, label: "Banheiro" },
      { icon: Bath, label: "Banho" },
      { icon: School, label: "Escola" },
      { icon: Car, label: "Carro" },
    ],
  },
];