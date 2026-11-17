// Modo de la build. En la versión de clientes se eliminan las rutas y los
// accesos de administración (no solo se ocultan).
export const IS_CLIENT_BUILD = import.meta.env.VITE_APP_MODE === 'client'
