import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, LayoutGrid, Package, ShoppingCart, User } from 'lucide-react-native';
import { useMobileStore } from '../../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../../src/theme/tokens';

export default function TabsLayout() {
  const { cartSummary } = useMobileStore();
  const cartBadge = cartSummary.totalQty > 0 ? cartSummary.totalQty : undefined;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GPTBazaarTheme.colors.brandPrimary,
        tabBarInactiveTintColor: GPTBazaarTheme.colors.inkMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: GPTBazaarTheme.colors.surface,
          borderTopColor: GPTBazaarTheme.colors.borderSubtle,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Package size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: cartBadge,
          tabBarBadgeStyle: {
            backgroundColor: GPTBazaarTheme.colors.offerCrimson,
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '800',
          },
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
