/** Cuenta con acceso a todas las secciones de arena (sin límite de progreso). */
export function isAdminUser(user) {
  return Boolean(user?.is_admin)
}
