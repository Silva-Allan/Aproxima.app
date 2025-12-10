// app/index.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Importe suas telas do src/
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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#A8D8F0' }
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Categories" component={Categories} />
        <Stack.Screen name="CategoryItems" component={CategoryItems} />
        <Stack.Screen name="CadastrarGesto" component={CadastrarGesto} />
        <Stack.Screen name="Choices" component={Choices} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="NotFound" component={NotFound} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}