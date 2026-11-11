import { createContext, useContext } from 'react';

export const ToastContext = createContext({ show: () => {}, dismiss: () => {} });

// useToast().show({ tone: 'success' | 'danger' | 'info', title, message, action?: { label, onClick } })
export const useToast = () => useContext(ToastContext);
