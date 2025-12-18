import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  message: string;
  type: ToastType;
}

const ToastContext = createContext<(data: ToastData) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((data: ToastData) => {
    setToast(data);
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <View style={[styles.toast, styles[toast.type]]}>
          <Text style={styles.text}>{toast.message}</Text>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
  },
  success: { backgroundColor: '#4CAF50' },
  error: { backgroundColor: '#F44336' },
  warning: { backgroundColor: '#FF9800' },
  info: { backgroundColor: '#2196F3' },
});
