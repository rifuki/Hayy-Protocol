import { useContext } from 'react';
import { SuiContext } from '../contexts/SuiContext';

export function useSui() {
  const context = useContext(SuiContext);
  if (context === undefined) {
    throw new Error('useSui must be used within a SuiProvider');
  }
  return context;
}