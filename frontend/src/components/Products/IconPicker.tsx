import { useState } from 'react';
import { motion } from 'framer-motion';
import { icons } from 'lucide-react';

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
}

// Get all icon names from Lucide
const iconNames = Object.keys(icons).sort();

export function IconPicker({ selectedIcon, onIconSelect }: IconPickerProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  // Filter and sort icons based on search
  const filteredIcons = iconSearch
    ? Object.keys(icons)
        .filter(name => name.toLowerCase().includes(iconSearch.toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 20)
    : iconNames.slice(0, 20);

  const SelectedIcon = icons[selectedIcon as keyof typeof icons] || icons.Package;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowIconPicker(!showIconPicker)}
        className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 flex items-center gap-3"
      >
        <SelectedIcon size={20} />
        <span>{selectedIcon}</span>
      </button>
      {showIconPicker && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-900/95 border border-white/20 rounded-lg shadow-xl backdrop-blur-sm z-[100] max-h-[320px] overflow-y-auto"
          style={{
            width: '100%',
            minWidth: '280px'
          }}
        >
          <div className="sticky top-0 bg-gray-900/95 pb-4 backdrop-blur-sm">
            <input
              type="text"
              placeholder="Search icons..."
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filteredIcons.map(iconName => {
              const Icon = icons[iconName as keyof typeof icons];
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onIconSelect(iconName);
                    setShowIconPicker(false);
                    setIconSearch('');
                  }}
                  className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all duration-200 hover:bg-white/10 ${
                    selectedIcon === iconName ? 'bg-violet-500/20 text-violet-400' : 'text-white/70'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs text-center break-all line-clamp-2 px-1">{iconName}</span>
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-center text-white/40 py-4">
              No icons found. Try a different search.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
} 