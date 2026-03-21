import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { HistoryProvider } from './src/context/HistoryContext';
import SolverScreen from './src/screens/SolverScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

// ─── Accent colour used across both themes ───────────────────────────────────
const ACCENT = '#6750A4'; // Material You primary purple

const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: ACCENT,
  },
};

const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF',
  },
};

// ─── Inner navigator that reads the current theme ────────────────────────────
function AppNavigator() {
  const { isDark } = useTheme();

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, primary: '#D0BCFF' } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: ACCENT } };

  const paperTheme = isDark ? darkPaperTheme : lightPaperTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: isDark ? '#D0BCFF' : ACCENT,
            tabBarInactiveTintColor: isDark ? '#9E9E9E' : '#757575',
            tabBarStyle: {
              backgroundColor: isDark ? '#1C1B1F' : '#FFFFFF',
              borderTopColor: isDark ? '#2C2C2E' : '#E0E0E0',
            },
            headerStyle: {
              backgroundColor: isDark ? '#1C1B1F' : '#FFFFFF',
            },
            headerTintColor: isDark ? '#FFFFFF' : '#1C1B1F',
            tabBarIcon: ({ color, size }) => {
              const icons = {
                Solver: 'calculator',
                History: 'history',
              };
              return (
                <MaterialCommunityIcons
                  name={icons[route.name] || 'help'}
                  size={size}
                  color={color}
                />
              );
            },
          })}
        >
          <Tab.Screen
            name="Solver"
            component={SolverScreen}
            options={{ title: 'MathSolver' }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: 'History' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// ─── Root component – wraps everything in context providers ──────────────────
export default function App() {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <AppNavigator />
      </HistoryProvider>
    </ThemeProvider>
  );
}
