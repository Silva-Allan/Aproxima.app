// app/index.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Importe suas telas do src/
import Home from "../src/Home";
import Categories from "../src/Categories";
import CategoryItems from "../src/CategoryItems";
import Choices from "../src/Choices";
import Profile from "../src/Profile";
import Settings from "../src/Settings";
import NotFound from "../src/NotFound";

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
        <Stack.Screen name="Choices" component={Choices} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="NotFound" component={NotFound} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}