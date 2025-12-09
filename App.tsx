// App.tsx na raiz
import App from './app/index';
import { AuthProvider } from "./src/contexts/AuthContext";

export default function Main() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}