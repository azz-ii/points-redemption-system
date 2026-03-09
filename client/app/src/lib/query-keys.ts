export const queryKeys = {
  requests: {
    all: ['requests'] as const,
    list: (filters?: Record<string, unknown>) => ['requests', 'list', filters] as const,
    detail: (id: number) => ['requests', 'detail', id] as const,
    history: ['requests', 'history'] as const,
    marketingHistory: ['requests', 'marketing-history'] as const,
  },
  customers: {
    all: ['customers'] as const,
    page: (page: number, pageSize: number, search: string, showArchived?: boolean) =>
      ['customers', 'page', { page, pageSize, search, showArchived }] as const,
    listAll: ['customers', 'list-all'] as const,
  },
  distributors: {
    all: ['distributors'] as const,
    page: (page: number, pageSize: number, search: string, showArchived?: boolean) =>
      ['distributors', 'page', { page, pageSize, search, showArchived }] as const,
    listAll: ['distributors', 'list-all'] as const,
  },
  accounts: {
    all: ['accounts'] as const,
    page: (page: number, pageSize: number, search: string, showArchived?: boolean) =>
      ['accounts', 'page', { page, pageSize, search, showArchived }] as const,
  },
  teams: {
    all: ['teams'] as const,
    detail: (id: number) => ['teams', 'detail', id] as const,
  },
  catalogue: {
    all: ['catalogue'] as const,
    page: (page: number, pageSize: number, search: string, showArchived?: boolean) =>
      ['catalogue', 'page', { page, pageSize, search, showArchived }] as const,
    redeemItems: ['catalogue', 'redeem-items'] as const,
    assignedItems: (page: number, pageSize: number, search: string) =>
      ['catalogue', 'assigned-items', { page, pageSize, search }] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    page: (page: number, pageSize: number, search: string) =>
      ['inventory', 'page', { page, pageSize, search }] as const,
  },
  cart: ['cart'] as const,
  currentUser: ['current-user'] as const,
  dashboard: {
    agent: ['dashboard', 'agent'] as const,
    approver: ['dashboard', 'approver'] as const,
    marketing: ['dashboard', 'marketing'] as const,
    superadmin: (range: string) => ['dashboard', 'superadmin', range] as const,
  },
  marketing: {
    all: ['marketing'] as const,
    page: (page: number, pageSize: number, search: string) =>
      ['marketing', 'page', { page, pageSize, search }] as const,
    bulkAssign: ['marketing', 'bulk-assign'] as const,
  },
};
