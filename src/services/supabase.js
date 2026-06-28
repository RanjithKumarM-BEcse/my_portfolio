import { createClient } from '@supabase/supabase-js';
import { defaultPortfolioData } from './defaultData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url';

let supabase = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn("Supabase failed to initialize, falling back to LocalStorage:", error);
  }
}

const LOCAL_STORAGE_KEY = 'my_portfolio_data';
const ADMIN_EMAIL = 'ranjithkumar.m.cse@gmail.com';

// LocalStorage helpers
const getLocalData = () => {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error("Error parsing local portfolio data:", e);
    }
  }
  return defaultPortfolioData;
};

const saveLocalData = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

// Database Service interface
export const portfolioService = {
  // Load data
  async load() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('content')
          .eq('id', 'default')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Document doesn't exist, create it with default data
            await this.save(defaultPortfolioData);
            return defaultPortfolioData;
          }
          throw error;
        }
        return data.content;
      } catch (err) {
        console.warn("Supabase load error, falling back to LocalStorage:", err);
        return getLocalData();
      }
    } else {
      return getLocalData();
    }
  },

  // Save data
  async save(content) {
    saveLocalData(content);
    if (supabase) {
      try {
        const { error } = await supabase
          .from('portfolio')
          .upsert({ id: 'default', content, updated_at: new Date() });
        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase save error:", err);
        throw err;
      }
    }
    return true;
  },

  // Upload Asset (Photo or Resume)
  async uploadAsset(file, bucketName = 'portfolio-assets') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    if (supabase) {
      try {
        // Upload the file
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      } catch (err) {
        console.warn("Supabase upload error, using local base64 fallback:", err);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }
    } else {
      // Fallback: Read file as Data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
  },

  // Auth Operations
  async loginWithGoogle() {
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } catch (err) {
        alert("Google Sign-In failed: " + err.message);
      }
    } else {
      // Mock Auth for LocalStorage testing
      const email = prompt("Enter admin email to sign in locally:", ADMIN_EMAIL);
      if (email === ADMIN_EMAIL) {
        const mockUser = {
          email: ADMIN_EMAIL,
          user_metadata: { full_name: "Ranjith Kumar M (Local Admin)" }
        };
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        window.location.reload();
      } else {
        alert("Access Denied: Only the admin email can edit.");
      }
    }
  },

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('mock_user');
      window.location.reload();
    }
  },

  onAuthStateChange(callback) {
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        const user = session?.user || null;
        const isAdmin = user?.email === ADMIN_EMAIL;
        callback(user, isAdmin);
      });
      return () => subscription.unsubscribe();
    } else {
      // Mock auth listener
      const mockUserStr = localStorage.getItem('mock_user');
      const user = mockUserStr ? JSON.parse(mockUserStr) : null;
      const isAdmin = user?.email === ADMIN_EMAIL;
      callback(user, isAdmin);
      return () => {};
    }
  }
};
