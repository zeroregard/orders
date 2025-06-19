import { useState } from 'react';
import { Tabs } from './components/Tabs';
import { ProductList } from './components/ProductList';
import { ProductForm } from './components/ProductForm';
import { OrderList } from './components/OrderList';
import { OrderForm } from './components/OrderForm';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [productRefresh, setProductRefresh] = useState(0);
  const [orderRefresh, setOrderRefresh] = useState(0);

  const productTabContent = (
    <div>
      <ProductForm onCreated={() => setProductRefresh(r => r + 1)} />
      <ProductList key={productRefresh} />
    </div>
  );
  const orderTabContent = (
    <div>
      <OrderForm onCreated={() => setOrderRefresh(r => r + 1)} />
      <OrderList key={orderRefresh} />
    </div>
  );

  return (
    <div className="app dark-mode">
      <header className="app-header">
        <h1>Auto-Order System</h1>
      </header>
      <main className="app-content">
        <Tabs
          tabs={[
            { label: 'Products', key: 'products', content: productTabContent },
            { label: 'Orders', key: 'orders', content: orderTabContent }
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </main>
      <footer className="app-footer">
        <p>Auto-Order System &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
