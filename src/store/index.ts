import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Profile,
  Organization,
  Transaction,
  Budget,
  Category,
  ToastType,
  Language,
  FinancialSummary,
  MonthlyData,
} from '../types';

interface AppState {
  // Auth
  user: Profile | null;
  session: unknown | null;
  authLoading: boolean;
  setUser: (user: Profile | null) => void;
  setSession: (session: unknown | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // Active tenant (resolved from organization_members after sign-in)
  organization: Organization | null;
  setOrganization: (organization: Organization | null) => void;

  // Transactions
  transactions: Transaction[];
  transactionsLoading: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  removeTransaction: (id: string) => void;
  setTransactionsLoading: (loading: boolean) => void;

  // Budgets
  budgets: Budget[];
  budgetsLoading: boolean;
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (b: Budget) => void;
  updateBudget: (b: Budget) => void;
  removeBudget: (id: string) => void;
  setBudgetsLoading: (loading: boolean) => void;

  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;

  // Financial Summary
  summary: FinancialSummary | null;
  setSummary: (summary: FinancialSummary) => void;
  monthlyData: MonthlyData[];
  setMonthlyData: (data: MonthlyData[]) => void;

  // UI
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, 'id'>) => void;
  removeToast: (id: string) => void;

  // Preferences (persisted)
  language: Language;
  setLanguage: (lang: Language) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;

  // Modal state
  addTransactionOpen: boolean;
  setAddTransactionOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      session: null,
      authLoading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setAuthLoading: (authLoading) => set({ authLoading }),

      // Active tenant
      organization: null,
      setOrganization: (organization) => set({ organization }),

      // Transactions
      transactions: [],
      transactionsLoading: false,
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
      updateTransaction: (t) =>
        set((s) => ({ transactions: s.transactions.map((x) => (x.id === t.id ? t : x)) })),
      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      setTransactionsLoading: (transactionsLoading) => set({ transactionsLoading }),

      // Budgets
      budgets: [],
      budgetsLoading: false,
      setBudgets: (budgets) => set({ budgets }),
      addBudget: (b) => set((s) => ({ budgets: [b, ...s.budgets] })),
      updateBudget: (b) =>
        set((s) => ({ budgets: s.budgets.map((x) => (x.id === b.id ? b : x)) })),
      removeBudget: (id) => set((s) => ({ budgets: s.budgets.filter((x) => x.id !== id) })),
      setBudgetsLoading: (budgetsLoading) => set({ budgetsLoading }),

      // Categories
      categories: [],
      setCategories: (categories) => set({ categories }),

      // Summary
      summary: null,
      setSummary: (summary) => set({ summary }),
      monthlyData: [],
      setMonthlyData: (monthlyData) => set({ monthlyData }),

      // UI Toasts
      toasts: [],
      addToast: (toast) =>
        set((s) => ({
          toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
        })),
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // Preferences
      language: 'en',
      setLanguage: (language) => set({ language }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      // Modal
      addTransactionOpen: false,
      setAddTransactionOpen: (addTransactionOpen) => set({ addTransactionOpen }),
    }),
    {
      name: 'fintech-prefs',
      partialize: (s) => ({ language: s.language, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
