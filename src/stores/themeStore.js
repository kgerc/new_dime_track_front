import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { Dark, LocalStorage } from 'quasar';

export const useThemeStore = defineStore('themeStore', () => {
  const isDarkMode = ref(LocalStorage.getItem('darkMode') ?? false);

  // Apply the stored theme setting
  Dark.set(isDarkMode.value);

  // Toggle function
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    Dark.set(isDarkMode.value);
    LocalStorage.set('darkMode', isDarkMode.value);
  };

  // Watch for changes to update Quasar dark mode
  watch(isDarkMode, (newValue) => {
    Dark.set(newValue);
    LocalStorage.set('darkMode', newValue);
  });

  return { isDarkMode, toggleDarkMode };
});