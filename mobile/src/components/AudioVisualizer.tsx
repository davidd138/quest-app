import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

type Props = {
  isActive: boolean;
};

const BAR_COUNT = 5;
const BAR_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#8b5cf6', '#7c3aed'];

export default function AudioVisualizer({ isActive }: Props) {
  const animations = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isActive) {
      const anims = animations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.5 + Math.random() * 0.5,
              duration: 200 + index * 80,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2 + Math.random() * 0.3,
              duration: 200 + index * 60,
              useNativeDriver: true,
            }),
          ])
        )
      );
      Animated.parallel(anims).start();

      return () => {
        anims.forEach((a) => a.stop());
      };
    } else {
      animations.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: BAR_COLORS[index],
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 4,
    marginTop: 16,
  },
  bar: {
    width: 6,
    height: 40,
    borderRadius: 3,
  },
});
