'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Save } from 'lucide-react';
import { RegistryItem } from '@/lib/registryTypes';

export default function RegistryAdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const authenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    fetchItems();
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/registry-admin', {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (!response.ok) {
        setError('Invalid password');
        setIsAuthenticated(false);
        return;
      }

      const data = await response.json();
      setItems(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (item: RegistryItem) => {
    try {
      const response = await fetch('/api/registry-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        setError('Failed to update item');
        return;
      }

      setSuccess('Item updated successfully!');
      setEditingId(null);
      await fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error updating item');
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/registry-admin?itemId=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (!response.ok) {
        setError('Failed to delete item');
        return;
      }

      setSuccess('Item deleted successfully!');
      await fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error deleting item');
      console.error(err);
    }
  };

  const handleAddItem = async () => {
    const newItem: RegistryItem = {
      id: String(Date.now()),
      title: 'New Item',
      price: 0,
      image: '',
      link: '',
      purchased: 0,
      quantity: 1,
      lastUpdated: new Date().toISOString(),
    };

    await handleUpdateItem(newItem);
  };

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100svh', background: '#F7F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px rgba(139,115,85,0.15)',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: '1.5rem', color: '#3D3229' }}>
            Registry Admin
          </h1>
          <form onSubmit={authenticate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8B7355', fontWeight: 600 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E8E0D5',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0.75rem',
                background: '#8B7355',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          </form>
          {error && <p style={{ color: '#C85A54', marginTop: '1rem' }}>{error}</p>}
        </motion.div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100svh', background: '#F7F3EE', padding: '2rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ maxWidth: '1000px', margin: '0 auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#3D3229' }}>
            Registry Admin
          </h1>
          <button
            onClick={handleAddItem}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: '#D4AF85',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={18} /> Add Item
          </button>
        </div>

        {error && (
          <div style={{
            background: '#FFE8E8',
            color: '#C85A54',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}>
            {success}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#8B7355', textAlign: 'center' }}>Loading items...</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #E8E0D5',
                }}
              >
                {editingId === item.id ? (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, title: e.target.value } : i))}
                        placeholder="Title"
                        style={{ padding: '0.5rem', border: '1px solid #E8E0D5', borderRadius: '0.5rem' }}
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, price: parseFloat(e.target.value) } : i))}
                        placeholder="Price"
                        style={{ padding: '0.5rem', border: '1px solid #E8E0D5', borderRadius: '0.5rem' }}
                      />
                    </div>
                    <input
                      type="text"
                      value={item.link}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, link: e.target.value } : i))}
                      placeholder="Amazon Link"
                      style={{ padding: '0.5rem', border: '1px solid #E8E0D5', borderRadius: '0.5rem' }}
                    />
                    <input
                      type="text"
                      value={item.image}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, image: e.target.value } : i))}
                      placeholder="Image URL"
                      style={{ padding: '0.5rem', border: '1px solid #E8E0D5', borderRadius: '0.5rem' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: '#8B7355' }}>
                          Purchased
                        </label>
                        <input
                          type="number"
                          value={item.purchased}
                          onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, purchased: parseInt(e.target.value) } : i))}
                          placeholder="0"
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #E8E0D5', borderRadius: '0.5rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: '#8B7355' }}>
                          Total Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, quantity: parseInt(e.target.value) } : i))}
                          placeholder="1"
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #E8E0D5', borderRadius: '0.5rem' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUpdateItem(item)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: '#8B7355',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        <Save size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: '#E8E0D5',
                          color: '#8B7355',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '0.5rem',
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#3D3229' }}>
                        {item.title}
                      </h3>
                      <p style={{ color: '#8B7355', marginBottom: '0.25rem' }}>
                        ${item.price.toFixed(2)}
                      </p>
                      <p style={{ color: '#8B7355', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Purchased: {item.purchased}/{item.quantity}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setEditingId(item.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#D4AF85',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#FFE8E8',
                            color: '#C85A54',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                          }}
                        >
                          <Trash2 size={16} style={{ display: 'inline' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
