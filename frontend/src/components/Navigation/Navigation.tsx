import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navigation.css';

export function Navigation() {
  return (
    <nav className="navigation">
      <motion.div
        className="nav-links"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <NavLink 
          to="/products" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Products
        </NavLink>
        <NavLink 
          to="/orders" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Orders
        </NavLink>
      </motion.div>
    </nav>
  );
} 