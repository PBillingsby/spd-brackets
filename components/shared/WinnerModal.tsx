import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import ConfettiCannon from 'react-native-confetti-cannon';
import { v4 as uuidv4 } from 'uuid';

interface WinnerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ visible, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [confettiBursts, setConfettiBursts] = useState<string[]>([]);
  const burstCounter = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      interval = setInterval(() => {
        burstCounter.current += 1; // increment safely
        setConfettiBursts(prev => [...prev, uuidv4()]);
      }, 1000);
    }

    return () => {
      if (visible) {
        clearInterval(interval);
        setConfettiBursts([]);
      }
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

      <Animated.View
        style={[
          styles.modal,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={require('../../assets/images/navbar/trophy-gold.png')}
            style={{ width: 28, height: 28, marginTop: 8 }}
            resizeMode="contain"
          />
          <Text style={styles.winnerText}>Winner</Text>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>

        <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {confettiBursts.map((id, index) => (
          <ConfettiCannon
            key={`burst-${index}-${id}`}
            count={20}
            origin={{ x: Math.random() * 300, y: 0 }}
            fadeOut
            fallSpeed={3000}
          />
        ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 30,
    borderColor: '#eee',
    borderWidth: 1,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  winnerText: {
    color: '#DAA520',
    fontSize: 24,
    fontFamily: 'Semplicita-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    borderColor: '#eee',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  closeText: {
    color: '#eee',
    fontSize: 16,
    fontFamily: 'Semplicita',
  },
});
