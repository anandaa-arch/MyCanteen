// components/inventory/SalesForm.js
'use client'
import { useState, useEffect } from 'react';

export default function SalesForm({ onAdded }) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: '',
    unit_price: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/inventory-items');
      const data = await res.json();
      setItems(data.filter(item => item.selling_price && item.current_stock > 0) || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_id || !formData.quantity || !formData.unit_price) {
      alert('Please fill in all fields');
      return;
    }

    const selectedItem = items.find(item => item.id === formData.item_id);
    if (parseInt(formData.quantity) > selectedItem.current_stock) {
      alert('Not enough stock available');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/revenues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setFormData({ item_id: '', quantity: '', unit_price: '' });
        onAdded?.(data);
        fetchItems(); // Refresh items to update stock
      } else {
        alert(data.error || 'Failed to record sale');
      }
    } catch (error) {
      alert('Error recording sale');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-fill selling price when item is selected
    if (name === 'item_id' && value) {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem?.selling_price) {
        setFormData(prev => ({ ...prev, [name]: value, unit_price: selectedItem.selling_price }));
      }
    }
  };

  const selectedItem = items.find(item => item.id === formData.item_id);
  const total = formData.quantity && formData.unit_price ? 
    (parseInt(formData.quantity) * parseFloat(formData.unit_price)).toFixed(2) : '0.00';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Record Sale</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Item</label>
          <select
            name="item_id"
            value={formData.item_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose an item...</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} (Stock: {item.current_stock} {item.unit}) - ₹{item.selling_price}
              </option>
            ))}
          </select>
        </div>

        {selectedItem && (
          <div className="p-3 bg-blue-50 rounded-md text-sm">
            <div><strong>Available Stock:</strong> {selectedItem.current_stock} {selectedItem.unit}</div>
            <div><strong>Selling Price:</strong> ₹{parseFloat(selectedItem.selling_price).toFixed(2)}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              max={selectedItem?.current_stock || 1}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹)</label>
            <input
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {formData.quantity && formData.unit_price && (
          <div className="p-3 bg-green-50 rounded-md">
            <div className="text-lg font-semibold text-green-800">
              Total: ₹{total}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.item_id}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Recording...' : 'Record Sale'}
        </button>
      </form>
    </div>
  );
}