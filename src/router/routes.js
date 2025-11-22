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
      {
        path: '/variedadAnimal',
        component: () => import('pages/variedadAnimal/VariedadPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/destinos',
        component: () => import('pages/destinos/DestinoPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/natalidad-mortalidad',
        component: () => import('pages/natalidadMortalidad/NatalidadMortalidadPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/registro-pecuario',
        name: 'registro-pecuario',
        component: () => import('pages/registroPecuario/RegistroPecuarioPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
