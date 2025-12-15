import React, { createContext, useContext, useState, useCallback } from 'react';

import { TimeSignature } from '../../../core/types/MetronomeTypes';

interface TimeSignatureContextProps {
  timeSignature: TimeSignature;
  setTimeSignature: (timeSignature: TimeSignature) => void;
}

const TimeSignatureContext = createContext<TimeSignatureContextProps | undefined>(undefined);

export const useTimeSignature = () => {
  const context = useContext(TimeSignatureContext);
  if (context === undefined) {
    throw new Error('useTimeSignature must be used within a TimeSignatureProvider');
  }
  return context;
};

export const TimeSignatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeSignature, setTimeSignatureState] = useState({ beats: 4, noteValue: 4 });

  const setTimeSignature = useCallback((newTimeSignature: TimeSignature) => {
    setTimeSignatureState(newTimeSignature);
  }, []);

  return (
    <TimeSignatureContext.Provider value={{ timeSignature, setTimeSignature }}>
      {children}
    </TimeSignatureContext.Provider>
  );
};
