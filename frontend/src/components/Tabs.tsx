import { ReactNode } from 'react';
import './Tabs.css';

interface Tab {
  label: string;
  key: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="tabs-root">
      <div className="tabs-list">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn${tab.key === activeKey ? ' active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs.find(tab => tab.key === activeKey)?.content}
      </div>
    </div>
  );
}
