import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDraftCount } from '../../hooks/useDraftCount';

const navigationTabs = [
  { id: "products", label: "Products", path: "/products" },
  { id: "orders", label: "Orders", path: "/orders" },
  { id: "drafts", label: "Drafts", path: "/drafts" },
];

export function Navigation() {
  const location = useLocation();
  const { draftCount } = useDraftCount();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith('/products')) return 'products';
    if (currentPath.startsWith('/orders')) return 'orders';
    if (currentPath.startsWith('/drafts')) return 'drafts';
    return 'products'; // default
  };
  
  const activeTab = getActiveTab();

  return (
    <nav className="flex items-center">
      <div className="flex space-x-1 bg-white/5 rounded-full p-1">
        {navigationTabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={`${
              activeTab === tab.id ? "" : "hover:text-white/60"
            } relative rounded-full px-4 py-2 text-sm font-medium text-white transition focus-visible:outline-2 focus-visible:outline-violet-500 flex items-center gap-2`}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="nav-bubble"
                className="absolute inset-0 z-10 bg-white mix-blend-difference"
                style={{ borderRadius: 9999 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20">{tab.label}</span>
            {tab.id === 'drafts' && draftCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative z-20 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full"
              >
                {draftCount > 99 ? '99+' : draftCount}
              </motion.span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
} 