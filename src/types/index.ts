export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';
export type Theme = 'dark' | 'light';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'food'
  | 'transport'
  | 'housing'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'travel'
  | 'other';

export type OrgRole = 'owner' | 'admin' | 'member';

// Mirrors the live `public.profiles` columns exactly.
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Mirrors the live `public.organizations` columns exactly. Ownership is tracked
// via `created_by`; membership/role lives in `organization_members`.
export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  created_by: string | null;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  organization?: Organization;
}

export type ProjectStatus = 'active' | 'archived';

export interface Project {
  id: string;
  organization_id: string;
  // Machine identifier, unique per organization (e.g. 'expense').
  key: string;
  name: string;
  status: ProjectStatus;
  created_at: string;
}

export interface Category {
  id: string;
  // null = global/default category shared across all tenants
  organization_id: string | null;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  created_at: string;
}

export interface Transaction {
  id: string;
  organization_id: string;
  created_by: string | null;
  category_id: string | null;
  category?: Category;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  organization_id: string;
  created_by: string | null;
  category_id: string;
  category?: Category;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface ToastType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface AuthState {
  user: Profile | null;
  session: unknown | null;
  loading: boolean;
  error: string | null;
}

export interface TransactionFilters {
  type?: TransactionType;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
