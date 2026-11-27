import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileStoreProvider } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileStoreProvider>
        <StatusBar style="dark" backgroundColor={GPTBazaarTheme.colors.surface} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: GPTBazaarTheme.colors.canvas },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="location" />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="search" />
          <Stack.Screen name="category/[id]" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="payment" />
          <Stack.Screen name="track/[id]" />
          <Stack.Screen name="wishlist" />
          <Stack.Screen name="addresses" />
          <Stack.Screen name="notifications" />
        </Stack>
      </MobileStoreProvider>
    </SafeAreaProvider>
  );
}
