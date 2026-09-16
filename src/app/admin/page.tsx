'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAllGuestCodes,
  addGuestCode,
  updateGuestCode,
  deleteGuestCode,
  type GuestCode,
} from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'wedding2024';
const AUTH_KEY = 'admin_auth';

export default function AdminPage() {
  const [guestCodes, setGuestCodes] = useState<GuestCode[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
      loadCodes();
    } else {
      setIsLoaded(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setPassword('');
      loadCodes();
    } else {
      setLoginError('Incorrect password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setPassword('');
    setGuestCodes([]);
  };

  // Load codes from Supabase
  useEffect(() => {
    if (isAuthenticated) {
      loadCodes();
    }
  }, [isAuthenticated]);

  const loadCodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const codes = await getAllGuestCodes();
      setGuestCodes(codes);
    } catch (err) {
      setError('Failed to load guest codes. Make sure Supabase is configured.');
      console.error('Error loading codes:', err);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  const addGuestCodeHandler = async () => {
    if (!newCode.trim() || !newName.trim()) {
      setError('Code and name are required');
      return;
    }

    if (guestCodes.find(g => g.code === newCode.toUpperCase())) {
      setError('Code already exists!');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await addGuestCode(newCode, newName);
      if (result) {
        setGuestCodes([result, ...guestCodes]);
        setNewCode('');
        setNewName('');
      } else {
        setError('Failed to add guest code');
      }
    } catch (err) {
      setError('Error adding guest code');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGuestCodeHandler = async (code: string) => {
    if (!confirm(`Delete code ${code}?`)) return;

    setIsLoading(true);
    setError(null);
    try {
      const success = await deleteGuestCode(code);
      if (success) {
        setGuestCodes(guestCodes.filter(g => g.code !== code));
      } else {
        setError('Failed to delete guest code');
      }
    } catch (err) {
      setError('Error deleting guest code');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGuestCodeHandler = async (code: string, newGuestName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateGuestCode(code, newGuestName);
      if (result) {
        setGuestCodes(guestCodes.map(g => 
          g.code === code ? { ...g, name: newGuestName } : g
        ));
        setEditingCode(null);
        setEditingName('');
      } else {
        setError('Failed to update guest code');
      }
    } catch (err) {
      setError('Error updating guest code');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = (code: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteLink = `${baseUrl}/?code=${code}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6E0] to-[#E8D5CC] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border-2 border-[#D4AF85]">
          <h1 className="text-3xl font-bold text-center text-[#C41E3A] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Admin Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 border-2 border-[#D4AF85] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-800 text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-[#C41E3A] text-white rounded-lg font-semibold hover:bg-[#8B1A2B] transition"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/">
              <button className="text-[#C41E3A] hover:underline font-semibold">
                Back to Invitation
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5E6E0] to-[#E8D5CC] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#C41E3A]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Guest Codes Admin
          </h1>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Logout
            </button>
            <Link href="/">
              <button className="px-4 py-2 bg-[#C41E3A] text-white rounded-lg hover:bg-[#8B1A2B] transition">
                Back to Invitation
              </button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isLoaded && (
          <div className="text-center py-8">
            <p className="text-[#C41E3A] text-lg">Loading guest codes...</p>
          </div>
        )}

        {/* Add New Code Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-[#D4AF85]">
          <h2 className="text-2xl font-semibold text-[#C41E3A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Add New Guest Code
          </h2>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Guest Code (e.g., GUEST001)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              disabled={isLoading}
              className="flex-1 min-w-[200px] px-4 py-2 border border-[#D4AF85] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C41E3A] disabled:opacity-50"
            />
            <input
              type="text"
              placeholder="Guest Name(s)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isLoading}
              className="flex-1 min-w-[200px] px-4 py-2 border border-[#D4AF85] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C41E3A] disabled:opacity-50"
            />
            <button
              onClick={addGuestCodeHandler}
              disabled={isLoading}
              className="px-6 py-2 bg-[#C41E3A] text-white rounded-lg font-semibold hover:bg-[#8B1A2B] transition disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Code'}
            </button>
          </div>
        </div>

        {/* Guest Codes List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#D4AF85]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#C41E3A] text-white">
                  <th className="px-6 py-4 text-left font-semibold">Guest Code</th>
                  <th className="px-6 py-4 text-left font-semibold">Guest Name(s)</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guestCodes.map((guest, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4">
                      <code className="bg-[#F5E6E0] px-3 py-1 rounded text-[#C41E3A] font-mono font-semibold">
                        {guest.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {editingCode === guest.code ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-3 py-1 border border-[#D4AF85] rounded focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                        />
                      ) : (
                        <span className="text-gray-800">{guest.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {editingCode === guest.code ? (
                          <>
                            <button
                              onClick={() => updateGuestCodeHandler(guest.code, editingName)}
                              disabled={isLoading}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCode(null)}
                              disabled={isLoading}
                              className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingCode(guest.code);
                                setEditingName(guest.name);
                              }}
                              disabled={isLoading}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => copyInviteLink(guest.code)}
                              disabled={isLoading}
                              className="px-3 py-1 bg-[#D4AF85] text-white rounded text-sm hover:bg-[#C4A075] transition disabled:opacity-50"
                            >
                              Copy Link
                            </button>
                            <button
                              onClick={() => deleteGuestCodeHandler(guest.code)}
                              disabled={isLoading}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {guestCodes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No guest codes added yet.</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-[#F5E6E0] rounded-xl p-6 border-2 border-[#D4AF85]">
          <h3 className="text-lg font-semibold text-[#C41E3A] mb-3">How it works:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Create a guest code (e.g., GUEST001) and map it to the guest's name</li>
            <li>Click "Copy Link" to copy the personalized invite URL to your clipboard</li>
            <li>Share the invite link with guests - the code is hidden once they visit the page</li>
            <li>Guests can edit their names, but their original name is stored in localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
