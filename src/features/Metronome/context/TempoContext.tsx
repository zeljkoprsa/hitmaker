import React, { createContext, useContext, useState, useCallback } from 'react';

interface TempoContextProps {
  tempo: number;
  setTempo: (tempo: number) => void;
}

const TempoContext = createContext<TempoContextProps | undefined>(undefined);

export const useTempo = () => {
  const context = useContext(TempoContext);
  if (context === undefined) {
    throw new Error('useTempo must be used within a TempoProvider');
  }
  return context;
};

export const TempoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tempo, setTempoState] = useState(120);

  const setTempo = useCallback((newTempo: number) => {
    setTempoState(newTempo);
  }, []);

  return <TempoContext.Provider value={{ tempo, setTempo }}>{children}</TempoContext.Provider>;
};
