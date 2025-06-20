import { motion, AnimatePresence } from 'framer-motion';
import { ReactElement } from 'react';
import { useRouter } from 'next/router';

interface PageTransitionProps {
  children: ReactElement | null;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const router = useRouter();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.asPath}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{
          duration: 0.2,
          ease: "easeInOut"
        }}
      >
        {children as ReactElement}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
