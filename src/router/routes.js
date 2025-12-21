const routes = [
  // Standalone route (no MainLayout) for login/register
  {
    path: '/',
    component: () => import('src/pages/AuthPage.vue')
  },

  // All logged-in pages use MainLayout
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      { path: 'overview', component: () => import('src/pages/Overview.vue') },
      { path: 'settings', component: () => import('src/pages/Settings.vue') },
      { path: 'savings', component: () => import('src/pages/Savings.vue') },
      { path: 'expenses', component: () => import('src/pages/Expenses.vue') },
      { path: 'incomes', component: () => import('src/pages/Incomes.vue') },
      { path: 'import_transactions', component: () => import('src/pages/ImportTransactions.vue') },
      { path: 'statistics', component: () => import('src/pages/Statistics.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue')
  }
]

export default routes
