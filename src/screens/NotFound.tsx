import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Home, ArrowLeft } from 'lucide-react-native';

const NotFound = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const pathname = route.name || 'unknown';

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  const handleGoHome = () => {
    // Solução para TypeScript
    (navigation as any).navigate('Home');
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as any).navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        
        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.errorTitle}>Página não encontrada</Text>
        <Text style={styles.errorDescription}>
          A rota que você está tentando acessar não existe ou foi movida.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={[styles.button, styles.secondaryButton]}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#8BC5E5" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleGoHome}
            style={[styles.button, styles.primaryButton]}
            activeOpacity={0.7}
          >
            <Home size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Ir para Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8D8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 400,
    width: '100%',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  errorCode: {
    fontSize: 64,
    fontWeight: '900',
    color: '#8BC5E5',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#8BC5E5',
  },
  secondaryButton: {
    backgroundColor: 'rgba(139, 197, 229, 0.1)',
    borderWidth: 2,
    borderColor: '#8BC5E5',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8BC5E5',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default NotFound;