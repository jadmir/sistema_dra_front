/**
 * Utilidades para manejo de permisos
 */

/**
 * Verifica si el usuario tiene un permiso específico
 * @param {Object} user - Usuario actual
 * @param {String} permission - Nombre del permiso a verificar
 * @returns {Boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.rol_id) return false

  // El Administrador tiene todos los permisos (por nombre o por rol_id = 1)
  if (user.rol?.nombre === 'Administrador' || user.rol_id === 1) return true

  // Verifica si el rol tiene el permiso específico
  const permisos = user.rol?.permisos || []
  return permisos.some((p) => p.nombre === permission)
}

/**
 * Verifica si el usuario tiene alguno de los permisos listados
 * @param {Object} user - Usuario actual
 * @param {Array<String>} permissions - Array de nombres de permisos
 * @returns {Boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !user.rol_id) return false
  if (user.rol?.nombre === 'Administrador' || user.rol_id === 1) return true

  return permissions.some((permission) => hasPermission(user, permission))
}

/**
 * Verifica si el usuario tiene todos los permisos listados
 * @param {Object} user - Usuario actual
 * @param {Array<String>} permissions - Array de nombres de permisos
 * @returns {Boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !user.rol_id) return false
  if (user.rol?.nombre === 'Administrador' || user.rol_id === 1) return true

  return permissions.every((permission) => hasPermission(user, permission))
}

/**
 * Verifica si el usuario tiene un rol específico
 * @param {Object} user - Usuario actual
 * @param {String} roleName - Nombre del rol
 * @returns {Boolean}
 */
export function hasRole(user, roleName) {
  if (!user || !user.rol) return false
  return user.rol.nombre === roleName
}

/**
 * Verifica si el usuario tiene alguno de los roles listados
 * @param {Object} user - Usuario actual
 * @param {Array<String>} roleNames - Array de nombres de roles
 * @returns {Boolean}
 */
export function hasAnyRole(user, roleNames) {
  if (!user || !user.rol) return false
  return roleNames.includes(user.rol.nombre)
}

/**
 * Permisos predefinidos del sistema
 */
export const PERMISSIONS = {
  // Usuarios
  USERS_VIEW: 'ver_usuarios',
  USERS_CREATE: 'crear_usuarios',
  USERS_EDIT: 'editar_usuarios',
  USERS_DELETE: 'eliminar_usuarios',

  // Roles y Permisos
  ROLES_VIEW: 'ver_roles',
  ROLES_CREATE: 'crear_roles',
  ROLES_EDIT: 'editar_roles',
  ROLES_DELETE: 'eliminar_roles',
  ROLES_ASSIGN_PERMISSIONS: 'asignar_permisos',

  // Datos (genérico para Técnico Editor)
  DATA_VIEW: 'ver_datos',
  DATA_CREATE: 'crear_datos',
  DATA_EDIT: 'editar_datos',
  DATA_DELETE: 'eliminar_datos',

  // Validación (para Supervisor)
  DATA_VALIDATE: 'validar_datos',
  DATA_APPROVE: 'aprobar_datos',
  DATA_REJECT: 'rechazar_datos',

  // Consulta Pública
  PUBLIC_VIEW: 'consulta_publica',
}

/**
 * Roles predefinidos del sistema
 */
export const ROLES = {
  ADMIN: 'Administrador',
  EDITOR: 'Técnico Editor',
  SUPERVISOR: 'Supervisor',
  PUBLIC: 'Consulta Pública',
}
