import React, { useState, useEffect } from 'react';
import { registerRootComponent } from 'expo';
import * as Font from 'expo-font';
import { Poppins_400Regular, Poppins_600SemiBold,Poppins_700Bold,Poppins_500Medium } from '@expo-google-fonts/poppins';
import AppLoading from 'expo-app-loading';
import App from './App';

function RootApp() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      Poppins: Poppins_400Regular,
      PoppinsSemiBold: Poppins_600SemiBold,
      PoppinsBold :Poppins_700Bold,
      PoppinsMedium:Poppins_500Medium
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return <App />;
}

registerRootComponent(RootApp);