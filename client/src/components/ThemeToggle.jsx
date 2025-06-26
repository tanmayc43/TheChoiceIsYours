import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="relative overflow-hidden glass-effect border-rose-red/30 hover:bg-rose-red/20"
    >
      <motion.div
        className="relative w-5 h-5"
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            opacity: theme === 'light' ? 1 : 0,
            scale: theme === 'light' ? 1 : 0.5
          }}
          transition={{ duration: 0.3 }}
        >
          <Sun className="w-5 h-5 text-cream" />
        </motion.div>
        
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            opacity: theme === 'dark' ? 1 : 0,
            scale: theme === 'dark' ? 1 : 0.5
          }}
          transition={{ duration: 0.3 }}
        >
          <Moon className="w-5 h-5 text-cream" />
        </motion.div>
      </motion.div>
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;