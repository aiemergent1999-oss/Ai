import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);

  const handlePlayGame = (map, car) => {
    setSelectedMap(map);
    setSelectedCar(car);
    setCurrentScreen('game');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedMap(null);
    setSelectedCar(null);
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'home' ? (
        <HomeScreen onPlayGame={handlePlayGame} />
      ) : (
        <GameScreen
          map={selectedMap}
          car={selectedCar}
          onBack={handleBackToHome}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
