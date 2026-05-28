import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function GameScreen({ map, car, onBack }) {
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [steeringAngle, setSteeringAngle] = useState(0);
  
  const steeringRotation = useRef(new Animated.Value(0)).current;
  const speedBarAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(steeringRotation, {
      toValue: steeringAngle * 45,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [steeringAngle, steeringRotation]);

  useEffect(() => {
    Animated.timing(speedBarAnimation, {
      toValue: (speed / 200) * 100,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [speed, speedBarAnimation]);

  useEffect(() => {
    if (speed > 100) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [speed, pulseAnimation]);

  const handleAccelerate = () => {
    setSpeed((prev) => Math.min(prev + 5, 200));
    setScore((prev) => prev + Math.floor(speed / 10));
  };

  const handleBrake = () => {
    setSpeed((prev) => Math.max(prev - 8, 0));
  };

  const handleSteerLeft = () => {
    setSteeringAngle((prev) => Math.max(prev - 1, -1));
  };

  const handleSteerRight = () => {
    setSteeringAngle((prev) => Math.min(prev + 1, 1));
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleExitGame = () => {
    Alert.alert('Exit Game', 'Are you sure you want to exit?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      { text: 'Exit', onPress: () => onBack(), style: 'destructive' },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Game Background */}
      <View style={styles.gameView}>
        <View style={[styles.roadContainer, { backgroundColor: ['#333', '#555', '#444', '#666', '#CD853F'][map?.id - 1] }]}>
          <View style={styles.road} />
          <View style={styles.roadMarkings} />
        </View>
      </View>

      {/* HUD Overlay */}
      <View style={styles.hud}>
        {/* Top Info */}
        <View style={styles.topInfo}>
          <Animated.View style={[styles.infoBox, { transform: [{ scale: pulseAnimation }] }]}>
            <Text style={styles.infoLabel}>Map</Text>
            <Text style={styles.infoValue}>{map?.name}</Text>
          </Animated.View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Car</Text>
            <Text style={styles.infoValue}>{car?.name}</Text>
          </View>
          <Animated.View style={[styles.infoBox, { transform: [{ scale: pulseAnimation }] }]}>
            <Text style={styles.infoLabel}>Score</Text>
            <Text style={styles.infoValue}>{score}</Text>
          </Animated.View>
        </View>

        {/* Speed Gauge */}
        <View style={styles.speedometer}>
          <View style={styles.speedDisplay}>
            <Animated.Text style={[styles.speedValue, { transform: [{ scale: pulseAnimation }] }]}>
              {Math.round(speed)}
            </Animated.Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
          <View style={styles.speedBar}>
            <Animated.View
              style={[
                styles.speedBarFill,
                {
                  width: speedBarAnimation.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Steering Indicator */}
        <View style={styles.steeringContainer}>
          <Text style={styles.steeringLabel}>STEERING</Text>
          <View style={styles.steeringWheel}>
            <Animated.View
              style={[
                styles.steeringIndicator,
                { transform: [{ rotate: steeringRotation }] },
              ]}
            />
          </View>
          <Text style={styles.steeringValue}>
            {steeringAngle === 0 ? 'STRAIGHT' : steeringAngle > 0 ? 'RIGHT' : 'LEFT'}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.steeringControls}>
          <TouchableOpacity style={styles.steerButton} onPress={handleSteerLeft} activeOpacity={0.7}>
            <Text style={styles.steerButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.steerButton} onPress={handleSteerRight} activeOpacity={0.7}>
            <Text style={styles.steerButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accelerationControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleBrake} activeOpacity={0.7}>
            <Text style={styles.controlButtonText}>🛑 BRAKE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.accelButton]} onPress={handleAccelerate} activeOpacity={0.7}>
            <Text style={styles.controlButtonText}>⚡ ACCELERATE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.topButton} onPress={handlePauseToggle} activeOpacity={0.7}>
          <Text style={styles.topButtonText}>{isPaused ? '▶️' : '⏸️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton} onPress={handleExitGame} activeOpacity={0.7}>
          <Text style={styles.topButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Pause Screen */}
      {isPaused && (
        <View style={styles.pauseScreen}>
          <View style={styles.pauseBox}>
            <Text style={styles.pauseTitle}>GAME PAUSED</Text>
            <Text style={styles.pauseScore}>Score: {score}</Text>
            <Text style={styles.pauseMapInfo}>{map?.name} • {car?.name}</Text>
            <TouchableOpacity style={styles.pauseButton} onPress={handlePauseToggle}>
              <Text style={styles.pauseButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pauseButton, styles.exitButton]} onPress={handleExitGame}>
              <Text style={styles.pauseButtonText}>Exit to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gameView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  roadContainer: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  road: { width: '80%', height: '100%', backgroundColor: '#444', opacity: 0.8 },
  roadMarkings: { position: 'absolute', width: '10%', height: '100%', backgroundColor: '#FFD700' },
  hud: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
  topInfo: { flexDirection: 'row', paddingTop: 10, paddingHorizontal: 10, justifyContent: 'space-around' },
  infoBox: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#667eea' },
  infoLabel: { color: '#aaa', fontSize: 10, fontWeight: 'bold' },
  infoValue: { color: '#667eea', fontSize: 14, fontWeight: 'bold' },
  speedometer: { position: 'absolute', bottom: 150, left: 20, width: 130, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, padding: 15, borderWidth: 2, borderColor: '#667eea' },
  speedDisplay: { alignItems: 'center', marginBottom: 10 },
  speedValue: { fontSize: 32, fontWeight: 'bold', color: '#ff6b6b' },
  speedUnit: { fontSize: 12, color: '#aaa' },
  speedBar: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  speedBarFill: { height: '100%', backgroundColor: '#667eea', borderRadius: 4 },
  steeringContainer: { position: 'absolute', bottom: 150, right: 20, width: 130, alignItems: 'center' },
  steeringLabel: { fontSize: 12, fontWeight: 'bold', color: '#667eea', marginBottom: 10 },
  steeringWheel: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(0,0,0,0.8)', borderWidth: 3, borderColor: '#667eea', justifyContent: 'center', alignItems: 'center' },
  steeringIndicator: { width: 3, height: 40, backgroundColor: '#ff6b6b', borderRadius: 2 },
  steeringValue: { marginTop: 10, fontSize: 11, color: '#667eea', fontWeight: 'bold' },
  controls: { position: 'absolute', bottom: 20, left: 0, right: 0, pointerEvents: 'auto' },
  steeringControls: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  steerButton: { flex: 1, paddingVertical: 12, backgroundColor: '#764ba2', borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#667eea' },
  steerButtonText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  accelerationControls: { flexDirection: 'row', paddingHorizontal: 20, gap: 15 },
  controlButton: { flex: 1, paddingVertical: 15, backgroundColor: '#ff6b6b', borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#cc5555' },
  accelButton: { backgroundColor: '#667eea', borderColor: '#5566cc' },
  controlButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  topControls: { position: 'absolute', top: 40, right: 20, flexDirection: 'row', gap: 10, pointerEvents: 'auto' },
  topButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(102, 126, 234, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#667eea' },
  topButtonText: { fontSize: 24 },
  pauseScreen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', pointerEvents: 'auto' },
  pauseBox: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 30, width: width * 0.85, alignItems: 'center', borderWidth: 2, borderColor: '#667eea' },
  pauseTitle: { fontSize: 36, fontWeight: 'bold', color: '#667eea', marginBottom: 20 },
  pauseScore: { fontSize: 22, color: '#fff', marginBottom: 10 },
  pauseMapInfo: { fontSize: 14, color: '#aaa', marginBottom: 30 },
  pauseButton: { width: '100%', paddingVertical: 15, backgroundColor: '#667eea', borderRadius: 10, alignItems: 'center', marginVertical: 10 },
  exitButton: { backgroundColor: '#ff6b6b' },
  pauseButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
