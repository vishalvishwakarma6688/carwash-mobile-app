import { API_BASE_URL } from './config';

export { API_BASE_URL };

export const API_ENDPOINTS = {
  HEALTH: '/health',

  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  BUSINESSES: {
    CREATE: '/businesses',
    LIST: '/businesses',
    DETAILS: (id: string) => `/businesses/${id}`,
    UPDATE: (id: string) => `/businesses/${id}`,
  },

  BRANCHES: {
    CREATE: '/branches',
    LIST_BY_BUSINESS: (businessId: string) => `/branches?businessId=${businessId}`,
    DETAILS: (id: string) => `/branches/${id}`,
    UPDATE: (id: string) => `/branches/${id}`,
  },

  CUSTOMERS: {
    CREATE: '/customers',
    LIST: (businessId: string, search?: string) =>
      `/customers?businessId=${businessId}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    DETAILS: (id: string) => `/customers/${id}`,
    UPDATE: (id: string) => `/customers/${id}`,
  },

  VEHICLES: {
    CREATE: '/vehicles',
    LIST_BY_CUSTOMER: (customerId: string) => `/vehicles/customer/${customerId}`,
    DETAILS: (id: string) => `/vehicles/${id}`,
    UPDATE: (id: string) => `/vehicles/${id}`,
    DELETE: (id: string) => `/vehicles/${id}`,
  },

  SERVICES: {
    CREATE: '/services',
    LIST_BY_BUSINESS: (businessId: string) => `/services?businessId=${businessId}`,
    DETAILS: (id: string) => `/services/${id}`,
    UPDATE: (id: string) => `/services/${id}`,
    PACKAGES: {
      CREATE: '/services/packages/create',
      LIST: (businessId: string) => `/services/packages/list?businessId=${businessId}`,
      DETAILS: (id: string) => `/services/packages/${id}`,
    },
  },

  BOOKINGS: {
    CREATE: '/bookings',
    LIST: (branchId?: string, customerId?: string, status?: string) => {
      const params = new URLSearchParams();
      if (branchId) params.append('branchId', branchId);
      if (customerId) params.append('customerId', customerId);
      if (status) params.append('status', status);
      const query = params.toString();
      return `/bookings${query ? `?${query}` : ''}`;
    },
    DETAILS: (id: string) => `/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
  },

  QUEUE: {
    WALK_IN: '/queue/walk-in',
    LIST_BY_BRANCH: (branchId: string) => `/queue/branch/${branchId}`,
    UPDATE_STATUS: (id: string) => `/queue/${id}/status`,
  },

  PAYMENTS: {
    PROCESS: '/payments',
    LIST_BY_BUSINESS: (businessId: string) => `/payments?businessId=${businessId}`,
    DETAILS: (id: string) => `/payments/${id}`,
  },

  EMPLOYEES: {
    CREATE: '/employees',
    LIST_BY_BRANCH: (branchId: string) => `/employees?branchId=${branchId}`,
    DETAILS: (id: string) => `/employees/${id}`,
    UPDATE: (id: string) => `/employees/${id}`,
  },

  INVENTORY: {
    CREATE: '/inventory',
    LIST_BY_BRANCH: (branchId: string) => `/inventory?branchId=${branchId}`,
    UPDATE_STOCK: (id: string) => `/inventory/${id}/stock`,
  },

  NOTIFICATIONS: {
    SEND: '/notifications/send',
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },

  ANALYTICS: {
    DASHBOARD: (businessId: string, branchId?: string) =>
      `/analytics/dashboard?businessId=${businessId}${branchId ? `&branchId=${branchId}` : ''}`,
    POPULAR_SERVICES: (businessId: string) => `/analytics/popular-services?businessId=${businessId}`,
  },
} as const;
