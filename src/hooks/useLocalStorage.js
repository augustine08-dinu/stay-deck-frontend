import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Default value if key doesn't exist
 * @returns {[any, Function]} - [storedValue, setValue]
 */
export function useLocalStorage(key, initialValue) {
  // Get stored value from localStorage
  const readValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState(readValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook for managing user preferences in localStorage
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    notifications: true,
    language: 'en'
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return { preferences, updatePreference };
}

/**
 * Hook for managing recently viewed items
 */
export function useRecentItems(key = 'recentItems', maxItems = 10) {
  const [items, setItems] = useLocalStorage(key, []);

  const addItem = (item) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      return [item, ...filtered].slice(0, maxItems);
    });
  };

  const clearItems = () => {
    setItems([]);
  };

  return { items, addItem, clearItems };
}