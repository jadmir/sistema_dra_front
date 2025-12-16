import { PERMISSIONS } from 'src/utils/permissions'

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
        path: '/perfil',
        component: () => import('pages/PerfilPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/usuarios',
        component: () => import('pages/users/UsersPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.USERS_VIEW,
        },
      },
      {
        path: '/roles',
        component: () => import('pages/roles/RolesPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.ROLES_VIEW,
        },
      },
      {
        path: '/permisos',
        component: () => import('pages/Permisos/PermisosPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.ROLES_VIEW,
        },
      },
    ],
  },
  {
    path: '/pecuario',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/saca-clases',
        name: 'PecuarioSacaClases',
        component: () => import('pages/saca_clases/SacaClasesPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'variedades',
        name: 'PecuarioVariedades',
        component: () => import('pages/variedades/VariedadPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
    ],
  },
  {
    path: '/agricola',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/regiones',
        name: 'AgricolaRegiones',
        component: () => import('pages/agricola/regiones/RegionesPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: '/provincias',
        name: 'AgricolaProvincias',
        component: () => import('pages/agricola/provincias/ProvinciasPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: '/distritos',
        name: 'AgricolaDistritos',
        component: () => import('pages/agricola/distritos/DistritosPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: '/cultivos',
        name: 'AgricolaCultivos',
        component: () => import('pages/agricola/cultivos/CultivoCatalogosPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: '/unidades',
        name: 'AgricolaUnidades',
        component: () => import('pages/agricola/unidades/UnidadesPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: '/variable-catalogo',
        name: 'AgricolaVariableCatalogo',
        component: () => import('pages/agricola/variableCatalogo/VariablesCatalogoPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: '/registro-agricola',
        name: 'RegistroAgricola',
        component: () => import('pages/agricola/AgricolaPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
    ],
  },
  {
    path: '/agricultura',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'subsectores',
        name: 'AgriculturaSubsectores',
        component: () => import('pages/cultivos/SubsectoresPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'grupos',
        name: 'AgriculturaGrupos',
        component: () => import('pages/cultivos/GruposPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'subgrupos',
        name: 'AgriculturaSubgrupos',
        component: () => import('pages/cultivos/SubgruposPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'cultivos',
        name: 'AgriculturaCultivos',
        component: () => import('pages/cultivos/CultivosPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
    ],
  },
  {
    path: '/precios',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'registro',
        name: 'PreciosRegistro',
        component: () => import('pages/precios/RegistroMuestrasPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'validacion',
        name: 'PreciosValidacion',
        component: () => import('pages/precios/ValidacionMuestrasPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'reportes',
        name: 'PreciosReportes',
        component: () => import('pages/precios/ReportesPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'productos',
        name: 'PreciosProductos',
        component: () => import('pages/precios/ProductosPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'categorias',
        name: 'PreciosCategorias',
        component: () => import('pages/precios/CategoriasPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'mercados',
        name: 'PreciosMercados',
        component: () => import('pages/precios/MercadosPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'encuestadores',
        name: 'PreciosEncuestadores',
        component: () => import('pages/precios/EncuestadoresPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'productividad-encuestadores',
        name: 'PreciosProductividadEncuestadores',
        component: () => import('pages/precios/ProductividadEncuestadoresPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
    ],
  },
  {
    path: '/siea',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'encuestas',
        name: 'SieaEncuestas',
        component: () => import('pages/siea/EncuestasPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'encuestas/validacion',
        name: 'SieaEncuestasValidacion',
        component: () => import('pages/siea/EncuestasValidacionPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW, // TODO: Cambiar a PERMISSIONS.ENCUESTAS_VALIDAR
        },
      },
      {
        path: 'encuestas/estadisticas',
        name: 'SieaEncuestasEstadisticas',
        component: () => import('pages/siea/EncuestasEstadisticasPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW, // TODO: Cambiar a PERMISSIONS.ENCUESTAS_ESTADISTICAS
        },
      },
      {
        path: 'encuestadores',
        name: 'SieaEncuestadores',
        component: () => import('pages/siea/EncuestadoresPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'supervisores',
        name: 'SieaSupervisores',
        component: () => import('pages/siea/SupervisoresPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'maquinaria',
        name: 'SieaMaquinaria',
        component: () => import('pages/siea/MaquinariaPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'fertilizantes',
        name: 'SieaFertilizantes',
        component: () => import('pages/siea/FertilizantesPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'agroquimicos',
        name: 'SieaAgroquimicos',
        component: () => import('pages/siea/AgroquimicosPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'reportes-maquinaria',
        name: 'SieaReportesMaquinaria',
        component: () => import('pages/siea/ReportesMaquinariaPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'reportes-fertilizantes',
        name: 'SieaReportesFertilizantes',
        component: () => import('pages/siea/ReportesFertilizantesPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'reportes-agroquimicos',
        name: 'SieaReportesAgroquimicos',
        component: () => import('pages/siea/ReportesAgroquimicosPage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
      {
        path: 'reportes-transporte',
        name: 'SieaReportesTransporte',
        component: () => import('pages/siea/ReportesTransportePage.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: PERMISSIONS.DATA_VIEW,
        },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
