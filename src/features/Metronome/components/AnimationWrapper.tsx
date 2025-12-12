import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import React, { ReactNode, FC } from 'react';

interface AnimationWrapperProps {
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
}

// Create a type-safe wrapper for AnimatePresence
// This is necessary because of type incompatibilities in framer-motion v11+
const TypeSafeAnimatePresence: FC<{
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
}> = AnimatePresence as unknown as FC<{
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
}>;

/**
 * Wrapper component for AnimatePresence to fix type issues with newer versions of framer-motion
 */
export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  mode = 'sync',
  initial = false,
}) => {
  return (
    <LazyMotion features={domAnimation}>
      <TypeSafeAnimatePresence mode={mode} initial={initial}>
        {children}
      </TypeSafeAnimatePresence>
    </LazyMotion>
  );
};
