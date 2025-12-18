// app/index.tsx
import React from "react";
import { AuthProvider } from "../src/contexts/AuthContext";
import AppNavigator from "./AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
