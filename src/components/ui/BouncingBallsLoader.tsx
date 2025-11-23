import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

interface BouncingBallsLoaderProps {
    size?: number;
    color?: string;
}

export const BouncingBallsLoader: React.FC<BouncingBallsLoaderProps> = ({
    size = 12,
    color = '#06b6d4', // Neon blue
}) => {
    const animations = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    useEffect(() => {
        const createAnimation = (anim: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: -size, // Bounce up
                        duration: 400,
                        easing: Easing.ease,
                        useNativeDriver: true,
                        delay: delay,
                    }),
                    Animated.timing(anim, {
                        toValue: 0, // Return down
                        duration: 400,
                        easing: Easing.bounce,
                        useNativeDriver: true,
                    }),
                    Animated.delay(400), // Pause before next bounce
                ])
            );
        };

        const anim1 = createAnimation(animations[0], 0);
        const anim2 = createAnimation(animations[1], 150);
        const anim3 = createAnimation(animations[2], 300);

        Animated.parallel([anim1, anim2, anim3]).start();

        return () => {
            anim1.stop();
            anim2.stop();
            anim3.stop();
        };
    }, [size]);

    return (
        <View style={styles.container}>
            {animations.map((anim, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.ball,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: color,
                            marginHorizontal: size / 4,
                            transform: [{ translateY: anim }],
                            shadowColor: color,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            shadowRadius: 6,
                            elevation: 5, // For Android neon glow effect
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40, // Ensure enough height for the bounce
    },
    ball: {
        // Base styles, overridden by props
    },
});
