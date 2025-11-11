'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { FullPageLoader } from '@/components/LoadingSpinner';
import { AdminMenuErrorBoundary } from '@/components/PageErrorBoundary';

function AdminMenuContent() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    items: [{ name: '', description: '' }],
    description: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles_new')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/login');
        return;
      }

      setCurrentUser(user);
      await fetchMenus();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menu?action=get-all');
      if (response.ok) {
        const data = await response.json();
        setMenus(data.menus || []);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', description: '' }]
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validate
    if (!formData.date) {
      setMessage('Please select a date');
      return;
    }

    if (formData.items.some(item => !item.name.trim())) {
      setMessage('All menu items must have a name');
      return;
    }

    try {
      const url = '/api/menu';
      const action = editingId ? 'update-menu' : 'create-menu';
      const payload = {
        action,
        date: formData.date,
        items: formData.items,
        description: formData.description
      };

      if (editingId) {
        payload.id = editingId;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        const action = editingId ? 'updated' : 'created';
        setMessage(`✅ Menu ${action} successfully!`);
        setFormData({ date: '', items: [{ name: '', description: '' }], description: '' });
        setEditingId(null);
        setShowForm(false);
        await fetchMenus();
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to save menu');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      setMessage('Error saving menu');
    }
  };

  const handleEdit = (menu) => {
    setEditingId(menu.id);
    setFormData({
      date: menu.date,
      items: menu.items || [{ name: '', description: '' }],
      description: menu.description || ''
    });
    setShowForm(true);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this menu?')) return;

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-menu', id })
      });

      if (response.ok) {
        setMessage('✅ Menu deleted successfully');
        await fetchMenus();
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete menu');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      setMessage('Error deleting menu');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ date: '', items: [{ name: '', description: '' }], description: '' });
    setMessage('');
  };

  if (loading) {
    return <FullPageLoader text="Loading menu management..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-1">Create and manage daily menus for the canteen</p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ date: '', items: [{ name: '', description: '' }], description: '' });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              New Menu
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">
              {editingId ? 'Edit Menu' : 'Create New Menu'}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="E.g., Special lunch menu for the day"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              {/* Menu Items */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Menu Items <span className="text-red-500">*</span>
                </label>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Item Name
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(index, 'name', e.target.value)
                            }
                            placeholder="E.g., Veg Thali, Paneer Roll"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(index, 'description', e.target.value)
                            }
                            placeholder="E.g., includes dal, rice, roti"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="mt-2 text-red-600 text-sm hover:text-red-800"
                        >
                          Remove Item
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-4 text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Item
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update Menu' : 'Create Menu'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Menus List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Menus</h2>

          {menus.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No menus created yet. Create one to get started!</p>
            </div>
          ) : (
            menus.map((menu) => (
              <div key={menu.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {new Date(menu.date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    {menu.description && (
                      <p className="text-gray-600 text-sm mt-1">{menu.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit menu"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete menu"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {menu.items && menu.items.map((item, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-gray-600 text-xs">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminMenuPage() {
  return (
    <AdminMenuErrorBoundary>
      <AdminMenuContent />
    </AdminMenuErrorBoundary>
  );
}
