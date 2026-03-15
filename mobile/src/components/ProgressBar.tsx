import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

type Props = {
  progress: number; // 0 to 1
  height?: number;
};

function getColor(progress: number): string {
  if (progress >= 0.75) return '#10b981';
  if (progress >= 0.5) return '#f59e0b';
  if (progress >= 0.25) return '#7c3aed';
  return '#6366f1';
}

export default function ProgressBar({ progress, height = 6 }: Props) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(Math.max(progress, 0), 1),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const color = getColor(progress);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthInterpolation,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
});
