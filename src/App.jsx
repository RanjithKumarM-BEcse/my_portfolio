import React, { useState, useEffect } from 'react';
import { portfolioService } from './services/supabase';
import { defaultPortfolioData } from './services/defaultData';
import PortfolioView from './components/PortfolioView';
import EditorDashboard from './components/EditorDashboard';

export default function App() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load portfolio content
  useEffect(() => {
    async function loadData() {
      try {
        const data = await portfolioService.load();
        setPortfolioData(data || defaultPortfolioData);
      } catch (err) {
        console.error("Failed to load portfolio:", err);
        setPortfolioData(defaultPortfolioData);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = portfolioService.onAuthStateChange((user, isAdmin) => {
      setUser(user);
      setIsAdmin(isAdmin);
      // Close editor if signed out
      if (!isAdmin) {
        setIsEditing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveData = async (newData) => {
    await portfolioService.save(newData);
    setPortfolioData(newData);
  };

  if (isLoading || !portfolioData) {
    return null;
  }

  if (isEditing && isAdmin) {
    return (
      <EditorDashboard 
        data={portfolioData} 
        onSave={handleSaveData} 
        onClose={() => setIsEditing(false)} 
      />
    );
  }

  return (
    <PortfolioView 
      data={portfolioData} 
      isAdmin={isAdmin}
      onEditClick={() => setIsEditing(true)}
      onLoginClick={() => portfolioService.loginWithGoogle()}
      onLogoutClick={() => portfolioService.signOut()}
    />
  );
}
