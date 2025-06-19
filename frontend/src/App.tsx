import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ProductsPage } from './components/ProductsPage';
import { OrdersPage } from './components/OrdersPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app dark-mode">
        <header className="app-header">
          <div className="header-content">
            <h1>Auto-Order System</h1>
            <Navigation />
          </div>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>Auto-Order System &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
