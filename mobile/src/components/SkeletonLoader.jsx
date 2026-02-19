import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const SkeletonLoader = ({ width = '100%', height = 20, borderRadius = 8, style }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: '#e2e8f0',
                    opacity,
                },
                style,
            ]}
        />
    );
};

// Pre-built skeleton card for history/detection items
export const CardSkeleton = () => (
    <View style={skeletonStyles.card}>
        <SkeletonLoader width={80} height={80} borderRadius={12} />
        <View style={skeletonStyles.cardContent}>
            <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="40%" height={12} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="80%" height={12} />
        </View>
    </View>
);

// Pre-built skeleton for stat cards
export const StatSkeleton = () => (
    <View style={skeletonStyles.stat}>
        <SkeletonLoader width={32} height={32} borderRadius={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width={40} height={20} style={{ marginBottom: 4 }} />
        <SkeletonLoader width={60} height={12} />
    </View>
);

const skeletonStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardContent: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    stat: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
});

export default SkeletonLoader;
