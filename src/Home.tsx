import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { User, Home as HomeIcon, Edit } from 'lucide-react-native';

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

  const handleHome = () => {
    (navigation as any).navigate('Home');
  };

  return (
    <LinearGradient
      colors={['#FFD6EC', '#FFC4E1']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Header com logo */}
      <View style={styles.header}>
        {/* Use require() que é mais confiável */}
        <Image 
          source={require('../assets/images/LogoAproximaPng.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
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
            onPress={handleHome}
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

// Remova o logoPlaceholder e logoText dos estilos se não vai usar
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 100,
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