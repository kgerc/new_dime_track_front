const routes = [
  // Standalone route (no MainLayout) for login/register
  {
    path: '/',
    component: () => import('pages/AuthPage.vue')
  },

  // All logged-in pages use MainLayout
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'overview', component: () => import('pages/Overview.vue') },
      { path: 'settings', component: () => import('pages/Settings.vue') },
      { path: 'savings', component: () => import('pages/Savings.vue') },
      { path: 'expenses', component: () => import('pages/Expenses.vue') },
      { path: 'incomes', component: () => import('pages/Incomes.vue') },
      { path: 'import_transactions', component: () => import('pages/ImportTransactions.vue') },
      { path: 'statistics', component: () => import('pages/Statistics.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
