import { supabase } from './supabase';
import type { Profile } from '../types';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp({ email, password, full_name }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Signup only sets the user's profile metadata. Per-application resources
      // (e.g. the expense project) are provisioned by each app via
      // projectsService.ensureProject, not by the signup trigger.
      options: { data: { full_name } },
    });
    if (error) throw error;
    return { ...data, needsConfirmation: !data.session };
  },

  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Supabase returns the same "Invalid login credentials" message for both
      // wrong passwords and unconfirmed-email accounts in many setups. Surface
      // a code the UI can map to a localized message.
      const raw = error.message || '';
      const code =
        /email not confirmed/i.test(raw) ? 'EMAIL_NOT_CONFIRMED'
        : /invalid login credentials/i.test(raw) ? 'INVALID_CREDENTIALS'
        : 'SIGN_IN_FAILED';
      const e = new Error(code);
      (e as Error & { code: string }).code = code;
      throw e;
    }
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    // The live `profiles` table has no `updated_at` column, so we must not
    // write one here — doing so makes the UPDATE fail at runtime.
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
