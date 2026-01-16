# 🌾 Sistema DRA - Frontend

Sistema de Información Agraria (DRA) - Aplicación Frontend

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Quasar](https://img.shields.io/badge/Quasar-v2.16-1976D2?logo=quasar)]()
[![Vue.js](https://img.shields.io/badge/Vue.js-v3.5-4FC08D?logo=vue.js)]()
[![Production Ready](https://img.shields.io/badge/production-ready-success)]()

## 📋 Descripción

Sistema web para la gestión de información agraria, incluyendo módulos para:
- 📊 Sistema de Encuestas Agrícolas (SIEA)
- 💰 Módulo de Precios
- 🌾 Gestión de Cultivos
- 👥 Administración de Usuarios y Permisos
- 📈 Reportes y Estadísticas

---

## 🚀 Inicio Rápido

### Pre-requisitos

- Node.js >= 20
- npm >= 6.13.4 o yarn >= 1.21.1

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jadmir/sistema_dra_front.git
cd sistema_dra_front

# Instalar dependencias
npm install
# o
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración
```

### Configuración de Variables de Entorno

Crear archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Sistema DRA
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

---

## 💻 Desarrollo

### Modo Desarrollo

```bash
npm run dev
# o
quasar dev
```

La aplicación estará disponible en `http://localhost:9000`

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

---

## 🏗️ Build para Producción

### Build

```bash
npm run build
```

El build se generará en `dist/spa/`

### Probar Build Localmente

```bash
npx serve dist/spa
```

---

## 📦 Estructura del Proyecto

```
src/
├── boot/              # Plugins de inicialización
│   ├── axios.js       # Configuración de API
│   ├── auth-guard.js  # Guards de autenticación
│   └── permissions.js # Sistema de permisos
├── components/        # Componentes reutilizables
├── composables/       # Composables de Vue
├── layouts/           # Layouts de la aplicación
├── pages/             # Páginas/Vistas
│   ├── agricola/      # Módulo agrícola
│   ├── precios/       # Módulo de precios
│   ├── siea/          # Sistema de encuestas
│   ├── users/         # Gestión de usuarios
│   └── Roles/         # Gestión de roles
├── router/            # Configuración de rutas
├── services/          # Servicios de API
├── stores/            # Pinia stores (estado global)
└── utils/             # Utilidades
    └── logger.js      # Sistema de logging
```

---

## 🔒 Seguridad

### Sistema de Logging

El proyecto incluye un sistema de logging condicional:

```javascript
import { logger } from 'src/utils/logger'

logger.log('Mensaje de debug')    // Solo en desarrollo
logger.error('Error crítico')      // Siempre visible
logger.warn('Advertencia')         // Solo en desarrollo
```

### Autenticación

- JWT tokens con refresh automático
- Guards de ruta basados en permisos
- Sesión persistente en localStorage

---

## 🌐 Despliegue

### Nginx

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/sistema-dra/dist/spa;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Variables de Entorno para Producción

```env
VITE_API_URL=https://api.tudominio.com/api
VITE_APP_ENVIRONMENT=production
```

---

## 📚 Tecnologías

- **Framework:** Quasar v2.16 / Vue.js v3.5
- **Estado:** Pinia v3
- **HTTP:** Axios
- **Router:** Vue Router v4
- **Build:** Vite v7
- **Lint:** ESLint v9
- **UI:** Material Design (Quasar)

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Convenciones de Código

- ESLint para mantener calidad de código
- Prettier para formateo consistente
- Vue 3 Composition API
- Pinia para gestión de estado
- Sistema de permisos basado en roles

---

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor abre un [issue](https://github.com/jadmir/sistema_dra_front/issues) con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado
- Screenshots (si aplica)

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 👥 Equipo

Desarrollado por el equipo de Dirección de Estadística e Información Agraria

---

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo.

---

**Última actualización:** 16 de enero de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para Producción


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
