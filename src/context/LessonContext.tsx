import React, { createContext, useContext, useState, useCallback } from 'react';

import LessonModal from '../components/Lessons/LessonModal';

interface LessonContextType {
  openLesson: (lessonId: string) => void;
  closeLesson: () => void;
}

const LessonContext = createContext<LessonContextType | null>(null);

export const useLessons = () => {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLessons must be used within LessonProvider');
  }
  return context;
};

export const LessonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const openLesson = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId);
  }, []);

  const closeLesson = useCallback(() => {
    setActiveLessonId(null);
  }, []);

  return (
    <LessonContext.Provider value={{ openLesson, closeLesson }}>
      {children}
      <LessonModal isOpen={activeLessonId === 'groove-is-in-the-heart'} onClose={closeLesson} />
    </LessonContext.Provider>
  );
};
