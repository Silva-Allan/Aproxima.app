// src/components/LoadingPuzzleSimple.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Text } from 'react-native';

const { width, height } = Dimensions.get('window');
const PUZZLE_SIZE = 80;
const COLORS = ['#8BC5E5', '#FF9E5E', '#6ED6A3', '#FF6B8B'];

export default function LoadingPuzzleSimple() {
  const [dots, setDots] = useState('.  ');
  
  // Animações simplificadas
  const animations = useRef(
    Array(4).fill(0).map(() => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Animar cada peça
    animations.forEach((anim, index) => {
      // Posições finais
      const finalX = (index % 2 === 0 ? -1 : 1) * 40;
      const finalY = (index < 2 ? -1 : 1) * 40;

      Animated.parallel([
        Animated.spring(anim.translateX, {
          toValue: finalX,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(anim.translateY, {
          toValue: finalY,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(anim.rotate, {
            toValue: 1,
            duration: 2000 + index * 500,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
      ]).start();
    });

    // Animação dos pontos
    let dotCount = 0;
    const dotInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setDots(['.  ', '.. ', '...', '.  '][dotCount]);
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  const renderPiece = (index: number) => {
    const anim = animations[index];
    const rotation = anim.rotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    let borderRadiusStyle = {};
    switch(index) {
      case 0: borderRadiusStyle = { borderTopLeftRadius: 20 }; break;
      case 1: borderRadiusStyle = { borderTopRightRadius: 20 }; break;
      case 2: borderRadiusStyle = { borderBottomLeftRadius: 20 }; break;
      case 3: borderRadiusStyle = { borderBottomRightRadius: 20 }; break;
    }

    return (
      <Animated.View
        key={index}
        style={[
          styles.piece,
          borderRadiusStyle,
          { backgroundColor: COLORS[index] },
          {
            transform: [
              { translateX: anim.translateX },
              { translateY: anim.translateY },
              { rotate: rotation },
            ],
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.puzzleContainer}>
        {animations.map((_, index) => renderPiece(index))}
      </View>
      
      <View style={styles.textContainer}>
        <View style={styles.loadingTextRow}>
          <Text style={styles.loadingText}>Montando seu mundo</Text>
          <Text style={styles.dots}>{dots}</Text>
        </View>
        <Text style={styles.subText}>
          Preparando uma experiência incrível para você
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8D8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  puzzleContainer: {
    position: 'relative',
    width: PUZZLE_SIZE * 2,
    height: PUZZLE_SIZE * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  piece: {
    position: 'absolute',
    width: PUZZLE_SIZE,
    height: PUZZLE_SIZE,
    borderRadius: 10,
  },
  textContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  loadingTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  dots: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8BC5E5',
    width: 40,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});