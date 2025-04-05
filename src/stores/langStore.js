import { defineStore } from "pinia";
import { ref } from "vue";
import { LocalStorage } from "quasar";
import translations from "src/assets/lang.json";

export const useLangStore = defineStore("langStore", () => {
  // Load saved language or default to English
  const currentLanguage = ref(LocalStorage.getItem("language") || "en");

  // Function to change language
  const setLanguage = (lang) => {
    currentLanguage.value = lang;
    LocalStorage.set("language", lang);
  };

  // Function to get translated text
  const t = (key, variables = {}) => {
    let translation = translations[key]?.[currentLanguage.value] || key;
  
    // Replace placeholders in the translation with the dynamic values
    for (const [variable, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${variable}}`, 'g');
      translation = translation.replace(regex, value);
    }
  
    return translation;
  };

  return { currentLanguage, setLanguage, t };
});