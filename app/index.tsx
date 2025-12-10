// app/index.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { View, StyleSheet } from "react-native";

// Importe suas telas
import NotFound from "../src/screens/NotFound";
import Profile from "../src/screens/Profile";
import CadastrarGesto from "../src/screens/CadastrarGesto";
import CadastroScreen from "../src/screens/Cadastro";
import Categories from "../src/screens/Categories";
import CategoryItems from "../src/screens/CategoryItems";
import Choices from "../src/screens/Choices";
import Home from "../src/screens/Home";
import LoginScreen from "../src/screens/Login";
import Settings from "../src/screens/Settings";
import MeusGestos from '../src/screens/ListaGestos';

import { useAuth } from "../src/contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#A8D8F0' }
        }}
      >
        {/* ROTAS PÚBLICAS */}
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
            <Stack.Screen name="NotFound" component={NotFound} />
          </>
        ) : (
          /* ROTAS PROTEGIDAS */
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Categories" component={Categories} />
            <Stack.Screen name="CategoryItems" component={CategoryItems} />
            <Stack.Screen name="CadastrarGesto" component={CadastrarGesto} />
            <Stack.Screen name="Choices" component={Choices} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="MeusGestos" component={MeusGestos} />
            <Stack.Screen name="NotFound" component={NotFound} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}