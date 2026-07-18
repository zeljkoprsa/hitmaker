import React, { createContext, useContext, useState, useCallback } from 'react';

import LessonModal from '../components/Lessons/LessonModal';

import { useLessonsStore } from './LessonsContext';

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

/** Session-card modal opener. Cards render data-driven from the lessons
 *  store (spec #7), so any stored lesson can be opened by id. */
export const LessonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const { getLesson } = useLessonsStore();

  const openLesson = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId);
  }, []);

  const closeLesson = useCallback(() => {
    setActiveLessonId(null);
  }, []);

  const activeLesson = activeLessonId ? (getLesson(activeLessonId) ?? null) : null;

  return (
    <LessonContext.Provider value={{ openLesson, closeLesson }}>
      {children}
      <LessonModal lesson={activeLesson} onClose={closeLesson} />
    </LessonContext.Provider>
  );
};
