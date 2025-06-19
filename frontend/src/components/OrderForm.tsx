import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
}

interface OrderFormProps {
  onCreated?: () => void;
}

export function OrderForm({ onCreated }: OrderFormProps) {
  const [name, setName] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.ok ? res.json() : [])
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const addLineItem = () => setLineItems([...lineItems, { productId: products[0]?.id || '', quantity: 1 }]);
  const updateLineItem = (idx: number, field: string, value: string | number) => {
    setLineItems(items => items.map((li, i) => i === idx ? { ...li, [field]: value } : li));
  };
  const removeLineItem = (idx: number) => setLineItems(items => items.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          creationDate,
          purchaseDate,
          lineItems,
        }),
      });
      if (!res.ok) throw new Error('Failed to create order');
      setName('');
      setCreationDate('');
      setPurchaseDate('');
      setLineItems([]);
      if (onCreated) onCreated();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <h3>Add Order</h3>
      <div>
        <input
          type="text"
          placeholder="Order Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="date"
          placeholder="Creation Date"
          value={creationDate}
          onChange={e => setCreationDate(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="date"
          placeholder="Purchase Date"
          value={purchaseDate}
          onChange={e => setPurchaseDate(e.target.value)}
          required
        />
      </div>
      <div>
        <h4>Line Items</h4>
        {lineItems.map((li, idx) => (
          <div key={idx} className="order-line-item-form">
            <select
              value={li.productId}
              onChange={e => updateLineItem(idx, 'productId', e.target.value)}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={li.quantity}
              onChange={e => updateLineItem(idx, 'quantity', Number(e.target.value))}
              required
            />
            <button type="button" onClick={() => removeLineItem(idx)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addLineItem} disabled={products.length === 0}>
          Add Line Item
        </button>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Order'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
