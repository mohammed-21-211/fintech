import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, ArrowLeftRight, Target, BarChart2,
  Settings, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { useAuth } from '../../../hooks/useAuth';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard',      icon: LayoutDashboard,  labelKey: 'dashboard.overview' },
  { to: '/dashboard/transactions', icon: ArrowLeftRight, labelKey: 'dashboard.transactions' },
  { to: '/dashboard/budgets', icon: Target,          labelKey: 'dashboard.budgets' },
  { to: '/dashboard/analytics', icon: BarChart2,    labelKey: 'dashboard.analytics' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onMobileClose} />}

      <aside
        className={[
          styles.sidebar,
          sidebarCollapsed ? styles.collapsed : '',
          mobileOpen ? styles.mobileOpen : '',
        ].filter(Boolean).join(' ')}
      >
        <div className={styles.header}>
          <a className={styles.logo} onClick={() => navigate('/dashboard')}>
            <span className={styles.logoMark}>F</span>
            <span className={styles.logoText}>Fintech</span>
          </a>
          <button
            className={styles.collapseBtn}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navSectionLabel}>{t('sidebar.main')}</span>
            {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  [styles.navItem, isActive ? styles.active : ''].filter(Boolean).join(' ')
                }
                onClick={onMobileClose}
              >
                <Icon size={18} className={styles.navIcon} />
                <span className={styles.navLabel}>{t(labelKey)}</span>
              </NavLink>
            ))}
          </div>

          <div className={styles.navSection}>
            <span className={styles.navSectionLabel}>{t('sidebar.account')}</span>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.active : ''].filter(Boolean).join(' ')
              }
              onClick={onMobileClose}
            >
              <Settings size={18} className={styles.navIcon} />
              <span className={styles.navLabel}>{t('dashboard.settings')}</span>
            </NavLink>
          </div>
        </nav>

        <div className={styles.bottom}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userText}>
              <div className={styles.userName}>{user?.full_name ?? t('sidebar.userFallback')}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button
            className={styles.navItem}
            style={{ width: '100%', marginTop: '4px' }}
            onClick={handleSignOut}
          >
            <LogOut size={18} className={styles.navIcon} />
            <span className={styles.navLabel}>{t('sidebar.signOut')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
