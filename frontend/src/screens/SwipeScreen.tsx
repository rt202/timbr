import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import HouseCard from '../components/HouseCard';
import SwipeCardMobile from '../components/SwipeCardMobile';
import SwipeCardWeb from '../components/SwipeCardWeb';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface House {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  addressLine1: string;
  city: string;
  state: string;
  images: { url: string; caption?: string }[];
  agent?: {
    user: { displayName: string };
    rating?: number;
  };
}

export default function SwipeScreen() {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const swipeStartTime = useRef(Date.now());

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/houses?take=50');
      const data = await response.json();
      setHouses(data.houses);
    } catch (error) {
      Alert.alert('Error', 'Failed to load houses');
    } finally {
      setLoading(false);
    }
  };

  const recordSwipe = async (houseId: string, direction: 'LEFT' | 'RIGHT') => {
    const dwellMs = Date.now() - swipeStartTime.current;
    try {
      await fetch('http://localhost:4000/api/swipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          houseId,
          direction,
          dwellMs,
        }),
      });
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }
  };

  const onSwipeComplete = (direction: 'LEFT' | 'RIGHT') => {
    if (currentIndex < houses.length) {
      recordSwipe(houses[currentIndex].id, direction);
      setCurrentIndex(currentIndex + 1);
      swipeStartTime.current = Date.now();
    }
  };

  const swipeLeft = () => {
    onSwipeComplete('LEFT');
  };

  const swipeRight = () => {
    onSwipeComplete('RIGHT');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>🏠</Text>
          <Text style={styles.loadingText}>Loading houses...</Text>
          <View style={styles.loadingBar}>
            <View style={styles.loadingBarFill} />
          </View>
          <Text style={styles.loadingSubtext}>Finding your perfect matches</Text>
        </View>
      </View>
    );
  }

  if (currentIndex >= houses.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.endText}>🎉 You've seen all available houses!</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => {
          setCurrentIndex(0);
          fetchHouses();
        }}>
          <Text style={styles.refreshButtonText}>Load More Houses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentHouse = houses[currentIndex];

  // Render platform-specific UI
  if (Platform.OS === 'web') {
    return (
      <SwipeCardWeb
        house={currentHouse}
        onSwipe={onSwipeComplete}
        currentIndex={currentIndex}
        totalHouses={houses.length}
      />
    );
  }

  // Mobile UI with gesture-based swiping
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Next card (slightly visible behind) */}
        {currentIndex + 1 < houses.length && (
          <SwipeCardMobile
            house={houses[currentIndex + 1]}
            onSwipe={() => {}}
            isNext={true}
          />
        )}

        {/* Current card */}
        <SwipeCardMobile
          house={currentHouse}
          onSwipe={onSwipeComplete}
        />
      </View>

      {/* Mobile action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={swipeLeft}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={swipeRight}>
          <Ionicons name="heart" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {houses.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  loadingBarFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#ff6b6b',
    borderRadius: 2,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: screenWidth - 40,
    height: screenHeight * 0.7,
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextCard: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 50,
    paddingBottom: 50,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  passButton: {
    backgroundColor: '#ff4458',
  },
  likeButton: {
    backgroundColor: '#66d7d2',
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  endText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
