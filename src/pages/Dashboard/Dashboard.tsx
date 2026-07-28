import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Sidebar } from '../../components/layout/Sidebar/Sidebar';
import { AddTransaction } from '../../components/dashboard/AddTransaction/AddTransaction';
import { ToastContainer } from '../../components/ui/Toast/Toast';
import { setLanguage } from '../../i18n';
import { useAppStore } from '../../store';
import styles from './Dashboard.module.css';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/budgets': 'Budgets',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
};

export function DashboardLayout() {
  const location = useLocation();
  const { sidebarCollapsed, language, setLanguage: storeLang, addTransactionOpen, setAddTransactionOpen } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLang = () => {
    const next = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
    storeLang(next);
  };

  const crumb = BREADCRUMBS[location.pathname] ?? 'Dashboard';

  return (
    <div className={styles.layout}>
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className={[styles.content, sidebarCollapsed ? styles.collapsed : ''].join(' ')}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.hamburger} onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>
            <span className={styles.breadcrumb}>{crumb}</span>
          </div>

          <div className={styles.topbarRight}>
            <button className={styles.langToggle} onClick={toggleLang} aria-label="Toggle language">
              <Globe size={13} />
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      <AddTransaction
        open={addTransactionOpen}
        onClose={() => setAddTransactionOpen(false)}
      />
      <ToastContainer />
    </div>
  );
}
