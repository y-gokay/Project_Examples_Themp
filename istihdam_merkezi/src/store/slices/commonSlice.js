/**
 * Common Slice - Paylaşılan state ve utility action'lar
 */
export const commonSlice = (set, get) => ({
  // Loading ve Error
  loading: false,
  error: null,

  // Theme
  theme: typeof window !== 'undefined' 
    ? localStorage.getItem('theme') || 'light' 
    : 'light',

  // ===== UTILITY ACTION'LARI =====
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // ===== THEME ACTION'LARI =====
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    set({ theme: newTheme });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      
      // HTML elementine dark class ekle/çıkar
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  setTheme: (theme) => {
    set({ theme });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      
      // HTML elementine dark class ekle/çıkar
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
});


