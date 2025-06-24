import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedCardGridProps {
  children: ReactNode;
  className?: string;
}

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  id: string;
  onClick?: () => void;
}

export function AnimatedCardGrid({ children, className = '' }: AnimatedCardGridProps) {
  return (
    <motion.div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </motion.div>
  );
}

export function AnimatedCard({ children, className = '', id, onClick }: AnimatedCardProps) {
  return (
    <motion.div
      key={id}
      className={`bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-colors ${className}`}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)' }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
} 