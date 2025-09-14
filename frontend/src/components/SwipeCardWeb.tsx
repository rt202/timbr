import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HouseCard from './HouseCard';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeCardWebProps {
  house: any;
  onSwipe: (direction: 'LEFT' | 'RIGHT') => void;
  currentIndex: number;
  totalHouses: number;
}

export default function SwipeCardWeb({ house, onSwipe, currentIndex, totalHouses }: SwipeCardWebProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Add keyboard support for web
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isAnimating) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleSwipe('LEFT');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleSwipe('RIGHT');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isAnimating]);

  const handleSwipe = (direction: 'LEFT' | 'RIGHT') => {
    setIsAnimating(true);
    setTimeout(() => {
      onSwipe(direction);
      setIsAnimating(false);
    }, 200);
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${((currentIndex + 1) / totalHouses) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {totalHouses}
        </Text>
      </View>

      {/* Main card area */}
      <View style={styles.cardContainer}>
        <View style={[styles.card, isAnimating && styles.cardAnimating]}>
          <HouseCard house={house} />
        </View>
      </View>

      {/* Web-optimized action buttons */}
      <View style={styles.actionArea}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]} 
          onPress={() => handleSwipe('LEFT')}
          disabled={isAnimating}
        >
          <Ionicons name="close" size={24} color="white" />
          <Text style={styles.buttonText}>Pass</Text>
        </TouchableOpacity>

        <View style={styles.centerInfo}>
          <Text style={styles.swipeHint}>
            Click buttons or use arrow keys ← →
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]} 
          onPress={() => handleSwipe('RIGHT')}
          disabled={isAnimating}
        >
          <Ionicons name="heart" size={24} color="white" />
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff6b6b',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 80,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: Math.min(screenWidth - 40, 600),
    height: '90%',
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    transition: 'all 0.2s ease',
  },
  cardAnimating: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  actionArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passButton: {
    backgroundColor: '#ff4458',
  },
  likeButton: {
    backgroundColor: '#66d7d2',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  centerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  swipeHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
