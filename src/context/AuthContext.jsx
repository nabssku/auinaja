import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const GOOGLE_CLIENT_ID = "784742931833-ugfbgnrjgi9cso4cp4rehaf6m8aost09.apps.googleusercontent.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auinaja_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Sync user profile with Neon DB
  const syncUserData = async (userData) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('auinaja_user', JSON.stringify(data.user));
      } else {
        const errBody = await res.text();
        console.error('API Error Response:', res.status, errBody);
        // Fallback local if offline/server issue
        const fallbackUser = {
          ...userData,
          plan: 'free',
          dailyExportsCount: 0,
          dailyLimit: 1,
          remainingExports: 1
        };
        setUser(fallbackUser);
        localStorage.setItem('auinaja_user', JSON.stringify(fallbackUser));
      }
    } catch (err) {
      console.error('Failed to sync user with DB:', err);
      const fallbackUser = {
        ...userData,
        plan: 'free',
        dailyExportsCount: 0,
        dailyLimit: 1,
        remainingExports: 1
      };
      setUser(fallbackUser);
      localStorage.setItem('auinaja_user', JSON.stringify(fallbackUser));
    }
  };

  // Login via Google Credential Response
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const decoded = jwtDecode(credentialResponse.credential);
      const payload = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture
      };
      await syncUserData(payload);
    } catch (err) {
      console.error('Google decode error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Demo / Guest Login for Instant Testing
  const handleDemoLogin = async (role = 'bronze') => {
    setLoading(true);
    const demoPayload = {
      id: 'demo_user_101',
      email: 'creator.au@gmail.com',
      name: 'Nabil (AU Creator)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    await syncUserData(demoPayload);
    if (role !== 'free') {
      await handleUpgrade(role, 'demo_user_101');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('auinaja_user');
  };

  // Refresh quota from server
  const refreshUserQuota = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('auinaja_user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to refresh user quota:', err);
    }
  };

  // Upgrade Plan
  const handleUpgrade = async (plan, explicitUserId) => {
    const uid = explicitUserId || user?.id;
    if (!uid) {
      setUpgradeModalOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, plan })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({
          ...prev,
          plan: data.user.plan,
          dailyLimit: data.user.dailyLimit,
          remainingExports: data.user.remainingExports
        }));
        setUpgradeModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to upgrade:', err);
    }
  };

  // Record an export action & verify quota with Neon DB
  const recordExport = async (projectId, type) => {
    if (!user) {
      return { allow: true };
    }

    try {
      const res = await fetch('/api/export/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          projectId,
          type
        })
      });

      const data = await res.json();

      if (res.status === 403 || data.reachedLimit) {
        setUpgradeModalOpen(true);
        return {
          allow: false,
          error: data.error || 'Batas export harian kamu sudah habis!'
        };
      }

      if (res.ok && data.success) {
        setUser(prev => ({
          ...prev,
          dailyExportsCount: data.dailyExportsCount,
          remainingExports: data.remainingExports
        }));
        return { allow: true };
      }

      return { allow: true };
    } catch (err) {
      console.error('Failed to record export quota:', err);
      return { allow: true };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      upgradeModalOpen,
      setUpgradeModalOpen,
      handleGoogleSuccess,
      handleDemoLogin,
      handleLogout,
      refreshUserQuota,
      handleUpgrade,
      recordExport,
      googleClientId: GOOGLE_CLIENT_ID
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
