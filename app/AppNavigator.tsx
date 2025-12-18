// app/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import { useAuth } from "../src/contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

// Telas
import LoginScreen from "../src/screens/Login";
import CadastroScreen from "../src/screens/Cadastro";
import Home from "../src/screens/Home";
import Profile from "../src/screens/Profile";
import Settings from "../src/screens/Settings";
import CadastrarGesto from "../src/screens/CadastrarGesto";
import Categories from "../src/screens/Categories";
import CategoryItems from "../src/screens/CategoryItems";
import Choices from "../src/screens/Choices";
import MeusGestos from "../src/screens/ListaGestos";
import NotFound from "../src/screens/NotFound";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
            <Stack.Screen name="NotFound" component={NotFound} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="CadastrarGesto" component={CadastrarGesto} />
            <Stack.Screen name="Categories" component={Categories} />
            <Stack.Screen name="CategoryItems" component={CategoryItems} />
            <Stack.Screen name="Choices" component={Choices} />
            <Stack.Screen name="MeusGestos" component={MeusGestos} />
            <Stack.Screen name="NotFound" component={NotFound} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
