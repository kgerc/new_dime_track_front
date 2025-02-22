const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Overview.vue') },
      { path: 'settings', component: () => import('pages/Settings.vue') },
      { path: 'savings', component: () => import('pages/Savings.vue') },
      { path: 'expenses', component: () => import('pages/Expenses.vue') },
      { path: 'transactions', component: () => import('pages/Transactions.vue') }
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
