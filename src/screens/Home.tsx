import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit, Home as HomeIcon, User } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const navigation = useNavigation();

  const handleSpeak = () => {
    (navigation as any).navigate('Categories');
  };

  const handleProfile = () => {
    (navigation as any).navigate('Profile');
  };

  const handleSettings = () => {
    (navigation as any).navigate('Settings');
  };

  const { user } = useAuth();

  const handleCriarGesto = () => {
    if (!user) {
      (navigation as any).navigate("Login");
      return;
    }
    (navigation as any).navigate("CadastrarGesto");
  };

  return (
    <LinearGradient
      colors={['#FFD6EC', '#FFC4E1']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Header com logo - Simplificado */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/LogoAproximaPng.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Frase abaixo da logo */}
        <Text style={styles.logoSubtitle}>Comunicação por Gestos</Text>
      </View>

      {/* Área central com botão principal */}
      <View style={styles.mainContent}>
        <TouchableOpacity
          onPress={handleSpeak}
          style={styles.mainButton}
          activeOpacity={0.7}
          accessibilityLabel="Eu quero falar"
        >
          <Text style={styles.mainButtonText}>Eu quero falar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCriarGesto}
          style={[styles.mainButton, { backgroundColor: "#9B3FA3", marginTop: 20 }]}
          activeOpacity={0.7}
          accessibilityLabel="Criar Gesto"
        >
          <Text style={styles.mainButtonText}>Criar Gesto</Text>
        </TouchableOpacity>
      </View>

      {/* Navegação inferior */}
      <View style={styles.bottomNav}>
        <View style={styles.navContent}>
          <TouchableOpacity
            onPress={handleProfile}
            style={styles.navButton}
            activeOpacity={0.7}
            accessibilityLabel="Perfil"
          >
            <User size={32} color="#D946A6" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.homeButton]}
            activeOpacity={0.7}
            accessibilityLabel="Home"
          >
            <HomeIcon size={32} color="white" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSettings}
            style={styles.navButton}
            activeOpacity={0.7}
            accessibilityLabel="Editar"
          >
            <Edit size={32} color="#D946A6" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 175,
    // Sombra mais suave e natural
    shadowColor: '#9B3FA3',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    // Pequeno brilho interno (se o PNG tiver transparência)
    // Se não funcionar, remova estas linhas:
    // backgroundColor: 'transparent',
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoSubtitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#9B3FA3',
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  mainButton: {
    width: '100%',
    maxWidth: 300,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: '#D946A6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
  },
  bottomNav: {
    padding: 24,
    paddingBottom: 40,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxWidth: 400,
    marginHorizontal: 'auto',
    gap: 32,
  },
  navButton: {
    padding: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 70, 166, 0.3)',
  },
  homeButton: {
    backgroundColor: '#D946A6',
  },
});

export default Home;