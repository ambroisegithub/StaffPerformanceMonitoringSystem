export const ROLES = {
  OVERALL: 'overall',
  CLIENT: 'client',
  SUPERVISOR: 'supervisor',
  EMPLOYEE: 'employee',
  SYSTEM_LEADER: 'system_leader',
};

export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_BASE_URL,
  LOGIN: '/auth/login',
  FETCH_TASKS: '/tasks',
};
