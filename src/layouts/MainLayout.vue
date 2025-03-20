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

          <!-- Single Language Avatar with Dropdown -->
          <div>
            <q-avatar
              size="40px"
              color="blue"
              text-color="white"
              class="cursor-pointer"
              @click="languageMenu = true"
            >
              <q-icon name="language" />
            </q-avatar>

            <q-menu v-model="languageMenu" anchor="top right" self="top right">
              <q-list>
                <q-item clickable v-ripple @click="toggleLanguage('EN')">
                  <q-item-section>EN</q-item-section>
                </q-item>
                <q-item clickable v-ripple @click="toggleLanguage('PL')">
                  <q-item-section>PL</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
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

<script>
import NavLink from 'src/components/Navigation/NavLink.vue';

export default {
  components: { NavLink },
  data() {
    return {
      leftDrawerOpen: false,
      languageMenu: false,
      navLinks: [
        { title: 'Overview', to: '/' },
        { title: 'Savings', to: '/savings' },
        { title: 'Expenses', to: '/expenses' },
        { title: 'Incomes', to: '/incomes' },
        { title: 'Upload Transactions (CSV)', to: '/import_transactions' },
      ],
    };
  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    toggleLanguage(lang) {
      // Implement logic to change app language here
      console.log(`Language switched to: ${lang}`);
      this.languageMenu = false;
    },
  },
};
</script>

<style scoped>
/* No absolute positioning needed; Quasar’s "view" prop pins the header automatically. */
</style>
