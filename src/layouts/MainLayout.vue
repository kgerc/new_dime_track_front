<template>
  <q-layout view="hHh lpR lFf">
    <!-- Pinned Header -->
    <q-header elevated>
      <q-toolbar>

        <!-- Menu button on the left -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-avatar>
          <q-icon name="savings" size="md"/>
        </q-avatar>
        <q-toolbar-title>Dime Track</q-toolbar-title>

        <!-- Right side: single language avatar + user initials avatar -->
        <div class="row items-center q-gutter-md">
          <q-avatar size="40px" color="grey-8" text-color="white" class="cursor-pointer">
            <q-icon :name="isDarkMode ? 'light_mode' : 'dark_mode'" clickable @click="toggleDarkMode"/>
          </q-avatar>
          <!-- Single Language Avatar with Dropdown -->
          <div>
            <q-avatar
            size="40px"
            color="blue"
            text-color="white"
            class="cursor-pointer"
            >
              <q-icon name="language" />
              <q-menu v-model="languageMenu" class="bg-grey-3" style="min-width: 150px;">
                <q-list separator>
                  <q-item clickable v-ripple @click="toggleLanguage('en')" :active="currentLanguage === 'en'">
                    <q-item-section avatar>
                      <q-avatar size="24px">
                        <img src="https://flagcdn.com/w40/gb.png" alt="English" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>English</q-item-section>
                    <q-item-section side v-if="currentLanguage === 'en'">
                      <q-icon name="check" color="primary" />
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="toggleLanguage('pl')" :active="currentLanguage === 'pl'">
                    <q-item-section avatar>
                      <q-avatar size="24px">
                        <img src="https://flagcdn.com/w40/pl.png" alt="Polski" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>Polski</q-item-section>
                    <q-item-section side v-if="currentLanguage === 'pl'">
                      <q-icon name="check" color="primary" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-avatar>
          </div>

          <!-- User Avatar with initials -->
          <q-avatar size="40px" color="grey-8" text-color="white">
            KG
          </q-avatar>

        </div>
      </q-toolbar>
    </q-header>

    <!-- Left Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      class="bg-primary"
      show-if-above
      bordered
      :width="250"
      :breakpoint="767"
    >
      <q-list>
        <q-item-label class="text-white" header >Navigation</q-item-label>
        <q-separator color="grey" inset />
        <NavLink v-for="link in navLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <!-- Main content container -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useLangStore } from 'src/stores/langStore';
import NavLink from 'src/components/Navigation/NavLink.vue';

// Using the lang store
const langStore = useLangStore();
const { currentLanguage } = storeToRefs(langStore);

// Reactive state variables
const leftDrawerOpen = ref(false);
const languageMenu = ref(false);
const isDarkMode = ref(false);
const navLinks = ref([
  { title: 'Overview', to: '/' },
  { title: 'Savings', to: '/savings' },
  { title: 'Expenses', to: '/expenses' },
  { title: 'Incomes', to: '/incomes' },
  { title: 'Upload Transactions (CSV)', to: '/import_transactions' },
]);

// Methods
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleLanguage = (lang) => {
  langStore.setLanguage(lang);
  languageMenu.value = false;
  currentLanguage.value = lang;
};

// Toggle function
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};
</script>

<style scoped>
/* No absolute positioning needed; Quasar’s "view" prop pins the header automatically. */
</style>
