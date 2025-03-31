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
  const t = (key) => {
    return translations[key]?.[currentLanguage.value] || key;
  };

  return { currentLanguage, setLanguage, t };
});