import { useEffect } from 'react';
import { authService } from '../services/auth.service';
import { organizationsService } from '../services/organizations.service';
import { categoriesService } from '../services/categories.service';
import { projectsService } from '../services/projects.service';
import { useAppStore } from '../store';

// This client IS the Expense Manager, so it owns the 'expense' project key.
// Other applications declare their own identity and call ensureProject the same way.
const EXPENSE_PROJECT = { key: 'expense', name: 'Expense Manager' } as const;

export function useAuth() {
  const {
    user,
    session,
    organization,
    authLoading,
    setUser,
    setSession,
    setOrganization,
    setAuthLoading,
    addToast,
  } = useAppStore();

  useEffect(() => {
    // onAuthStateChange is the single source of truth for auth state.
    // We resolve authLoading as soon as the session is known (INITIAL_SESSION),
    // then fetch the profile + active organization in the background so the UI
    // never blocks on them.
    const { data } = authService.onAuthStateChange(async (_event, sess) => {
      setSession(sess);

      if (sess?.user) {
        // Resolve loading immediately — routing only needs to know if a
        // session exists, not whether the profile/org have loaded yet.
        setAuthLoading(false);

        authService.getProfile(sess.user.id)
          .then(async (profile) => {
            setUser(profile);
            if (!profile) return;

            // Resolve the active tenant; all data queries are scoped to it.
            const org = await organizationsService
              .getCurrentOrganization(profile.id)
              .catch(() => null);
            setOrganization(org);

            if (org) {
              // Each application provisions its own resources for the active
              // org. The signup trigger only creates the tenant primitives
              // (profile + org + membership); the expense project is owned by
              // this app and ensured idempotently here on every sign-in.
              await Promise.all([
                categoriesService.seedDefaults(org.id).catch(() => null),
                projectsService
                  .ensureProject(org.id, EXPENSE_PROJECT.key, EXPENSE_PROJECT.name)
                  .catch(() => null),
              ]);
            }
          })
          .catch(() => {
            setUser(null);
            setOrganization(null);
          });
      } else {
        setUser(null);
        setOrganization(null);
        setAuthLoading(false);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [setUser, setSession, setOrganization, setAuthLoading]);

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setOrganization(null);
    } catch {
      addToast({ type: 'error', title: 'Sign out failed', message: 'Please try again.' });
    }
  };

  return { user, session, organization, authLoading, signOut };
}
