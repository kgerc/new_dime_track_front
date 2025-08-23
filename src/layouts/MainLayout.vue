<template>
  <q-layout view="hHh lpR lFf">
    <!-- Pinned Header -->
    <q-header :elevated="!isDarkMode" :class="headerClasses">
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

        <q-avatar style="margin-left: 12px;">
          <q-icon name="track_changes" size="md"/>
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
            :color="isDarkMode ? 'grey-8' : 'blue'"
            text-color="white"
            class="cursor-pointer"
            >
              <q-icon name="language" />
              <q-menu v-model="languageMenu" :class="isDarkMode ? 'bg-grey-9' : 'bg-grey-3'" style="min-width: 150px;">
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
      :class="footerClasses"
      show-if-above
      :mini="miniState"
      @mouseenter="miniState = false"
      @mouseleave="miniState = true"
      mini-to-overlay
      bordered
      :width="250"
      :breakpoint="767"

    >
      <q-list style="margin-top: 5px;">
        <q-item v-for="link in navLinks" :key="link.title" clickable @click="navigate(link)">
          <q-item-section avatar>
            <q-icon :name="link.icon" style="margin-bottom: 2px;" :color="isDarkMode ? 'lightgray' : 'white'"/>
          </q-item-section>
          <q-item-section :style="isDarkMode ? 'color: lightgray;' : 'color: white;'">{{ link.title }}</q-item-section>
        </q-item>
      </q-list>
      <!-- Icon at the bottom -->
      <q-item clickable class="absolute-bottom">
        <q-item-section avatar>
          <q-icon name="logout" :color="isDarkMode ? 'lightgray' : 'white'"/>
        </q-item-section>
        <q-item-section :style="isDarkMode ? 'color: lightgray;' : 'color: white;'" @click="logout">Logout</q-item-section>
      </q-item>
    </q-drawer>


    <!-- Main content container -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useLangStore } from 'src/stores/langStore';
import { useThemeStore } from 'src/stores/themeStore';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore'
import { useBalancesStore } from 'src/stores/balancesStore'
import { Dark } from 'quasar';

// Using the lang store
const langStore = useLangStore();
const { t, currentLanguage } = useLangStore();
// Using the theme store
const themeStore = useThemeStore();
const { isDarkMode } = storeToRefs(themeStore);
const { toggleDarkMode } = themeStore;
const router = useRouter();
const authStore = useAuthStore()
const balancesStore = useBalancesStore()
const { hasInitialized } = storeToRefs(balancesStore)


// Reactive state variables
const leftDrawerOpen = ref(false);
const miniState = ref(true);
const languageMenu = ref(false);
const navLinks = ref([
  { title: t('overview'), to: '/', icon: 'home' },
  { title: t('savings'), to: '/savings', icon: 'savings' },
  { title: t('expenses'), to: '/expenses', icon: 'credit_card' },
  { title: t('incomes'), to: '/incomes', icon: 'attach_money' },
  { title: t('statistics'), to: '/statistics', icon: 'insert_chart' },
  { title: t('uploadTansactions'), to: '/import_transactions', icon: 'upload' }
]);

onMounted(async () => {
  Dark.set(isDarkMode.value);
})

// Methods
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleLanguage = (lang) => {
  langStore.setLanguage(lang);
  languageMenu.value = false;
  currentLanguage.value = lang;
};

const footerClasses = computed(() =>  isDarkMode.value ? 'bg-dark text-white' : 'bg-primary');

const headerClasses = computed(() =>  isDarkMode.value ? 'bg-grey-9' : 'bg-primary');

const navigate = (link) => {
  router.push(link.to);
};

function logout() {
   hasInitialized.value = false;
   authStore.logout();
}

</script>

<style scoped>
/* No absolute positioning needed; Quasar’s "view" prop pins the header automatically. */
</style>
