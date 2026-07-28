import { supabase } from './supabase';
import type { Organization, OrgRole } from '../types';

type MembershipRow = {
  role: OrgRole;
  created_at: string;
  organization: Organization | null;
};

export const organizationsService = {
  // Resolve the active organization for a user from organization_members.
  // Selection rule (no org-switcher UI yet): prefer an `owner` membership,
  // otherwise fall back to the earliest membership by created_at.
  async getCurrentOrganization(userId: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('role, created_at, organization:organizations(*)')
      .eq('user_id', userId);
    if (error) throw error;

    const rows = (data as unknown as MembershipRow[]) ?? [];
    if (rows.length === 0) return null;

    const sorted = [...rows].sort((a, b) => {
      const aOwner = a.role === 'owner' ? 0 : 1;
      const bOwner = b.role === 'owner' ? 0 : 1;
      if (aOwner !== bOwner) return aOwner - bOwner;
      return a.created_at.localeCompare(b.created_at);
    });

    return sorted[0]?.organization ?? null;
  },

  // List every organization the signed-in user belongs to (handy for a future
  // org switcher; unused by the current UI).
  async listOrganizations(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('created_at, organization:organizations(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;

    return ((data as unknown as MembershipRow[]) ?? [])
      .map((r) => r.organization)
      .filter((o): o is Organization => o !== null);
  },
};
