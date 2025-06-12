import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';

// Define transition types
export type TransitionType = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'none';

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
}

// Define transition variants
const transitions = {
  'fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  'slide-down': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  'slide-left': {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  'slide-right': {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  'zoom': {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  'none': {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
  },
};

export const PageTransitionWrapper = ({ 
  children, 
  type = 'fade', 
  duration = 0.3 
}: PageTransitionProps) => {
  const router = useRouter();
  const transition = transitions[type] || transitions['fade'];
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.asPath}
        initial={transition.initial}
        animate={transition.animate}
        exit={transition.exit}
        transition={{
          duration: duration,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Backward compatibility for existing code
const PageTransition = ({ children, type = 'fade', duration = 0.3 }: PageTransitionProps) => {
  return <PageTransitionWrapper type={type} duration={duration}>{children}</PageTransitionWrapper>;
};

export default PageTransition;

