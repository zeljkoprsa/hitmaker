import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, Fragment } from 'react';
import { useRouter } from 'next/router';

interface PageTransitionProps {
  children: ReactNode;
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
        <Fragment>{children}</Fragment>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
