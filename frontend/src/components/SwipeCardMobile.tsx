import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import HouseCard from './HouseCard';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeCardMobileProps {
  house: any;
  onSwipe: (direction: 'LEFT' | 'RIGHT') => void;
  isNext?: boolean;
}

export default function SwipeCardMobile({ house, onSwipe, isNext = false }: SwipeCardMobileProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isNext ? 0.95 : 1);
  const opacity = useSharedValue(isNext ? 0.8 : 1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      if (!isNext) {
        scale.value = withSpring(0.95);
      }
    },
    onActive: (event) => {
      if (!isNext) {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.5;
      }
    },
    onEnd: (event) => {
      if (!isNext) {
        scale.value = withSpring(1);
        
        if (Math.abs(event.translationX) > screenWidth * 0.3) {
          if (event.translationX > 0) {
            translateX.value = withTiming(screenWidth * 1.5, { duration: 300 });
            runOnJS(onSwipe)('RIGHT');
          } else {
            translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 });
            runOnJS(onSwipe)('LEFT');
          }
          setTimeout(() => {
            translateX.value = 0;
            translateY.value = 0;
          }, 300);
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = (translateX.value / screenWidth) * 30;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={!isNext}>
      <Animated.View style={[styles.card, animatedStyle, isNext && styles.nextCard]}>
        <HouseCard house={house} />
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: screenWidth - 40,
    height: '100%',
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextCard: {
    zIndex: -1,
  },
});
