import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function FadeInWrapper({ children, dependencyKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={dependencyKey}  // key triggers animation when data changes
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
