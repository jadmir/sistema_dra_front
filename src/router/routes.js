const routes = [
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), meta: { requiresAuth: true } },
      {
        path: '/usuarios',
        component: () => import('pages/users/UsersPage.vue'),
        meta: { requiresAuth: true, requiresRole: 1 }, // Solo admin
      },
      {
        path: '/roles',
        component: () => import('pages/roles/RolesPage.vue'),
        meta: { requiresAuth: true, requiresRole: 1 }, // Solo admin
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
