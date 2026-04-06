import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { MotiView, MotiText } from 'moti';
import { COLORS } from '../src/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Wait for the animation to play out nicely
        const timer = setTimeout(() => {
            if (isAuthenticated) {
                router.replace('/(tabs)/dashboard');
            } else {
                router.replace('/(auth)/login');
            }
        }, 2200); // 2.2 seconds display

        return () => clearTimeout(timer);
    }, [isAuthenticated, router]);

    return (
        <MotiView 
            style={styles.container}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 800 }}
        >
            <MotiView
                from={{ scale: 0.5, translateY: 50, opacity: 0 }}
                animate={{ scale: 1, translateY: 0, opacity: 1 }}
                transition={{
                    type: 'spring',
                    delay: 300,
                    damping: 12,
                    stiffness: 90
                }}
                style={styles.logoContainer}
            >
                <MotiText 
                    style={styles.logoText}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', delay: 800, duration: 600 }}
                >
                    Job
                </MotiText>
                <MotiText 
                    style={[styles.logoText, { color: COLORS.primary }]}
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', delay: 800, duration: 600 }}
                >
                    Fusion
                </MotiText>
            </MotiView>
            
            <MotiView 
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', delay: 1500, duration: 500 }}
                style={styles.taglineBox}
            >
                <MotiText style={styles.tagline}>Unlock your career potential</MotiText>
            </MotiView>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F0', // Very soft peach background matching theme
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#1A1A1A',
        letterSpacing: -1.5,
    },
    taglineBox: {
        position: 'absolute',
        bottom: height * 0.15,
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
        letterSpacing: 0.5,
    }
});
