import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Tabs.css';

interface Tab {
  label: string;
  key: string;
  content: ReactNode;
  icon?: ReactNode; // Optional icon for each tab
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  const activeTab = tabs.find(tab => tab.key === activeKey);
  
  return (
    <div className="tabs-container">
      <div className="tabs-nav" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={tab.key === activeKey}
            className={`tab-button${tab.key === activeKey ? ' active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.key === activeKey && (
              <motion.div 
                className="tab-active-indicator" 
                layoutId="tab-active-indicator"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
          </button>
        ))}
      </div>
      
      <div className="tab-content-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeKey}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="tab-content"
          >
            {activeTab?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
