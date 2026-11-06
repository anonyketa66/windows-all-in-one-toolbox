import {
  Gauge, Grid2X2, House, Monitor, Settings, SlidersHorizontal, Wrench,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { actionLink, quickActions } from '../data/quickActions';
import { TopBar } from './TopBar';

export const sections = [
  { path: '/applications', title: 'Applications', icon: Grid2X2, description: 'Manage installed apps and available updates.' },
  { path: '/tweaks', title: 'Tweaks', icon: SlidersHorizontal, description: 'See which Windows settings you can adjust.' },
  { path: '/system', title: 'System', icon: Monitor, description: 'Detailed information about Windows and your hardware.' },
  { path: '/tools', title: 'Tools', icon: Wrench, description: 'Tools for troubleshooting and maintenance.' },
  { path: '/performance', title: 'Performance', icon: Gauge, description: 'Historical measurements and process details.' },
  { path: '/settings', title: 'Settings', icon: Settings, description: 'Preferences for Windows All-in-One Toolbox.' },
];

const navigation = [{ path: '/', title: 'Dashboard', icon: House }, ...sections];
const destinations = [...navigation, ...quickActions.map((action) => ({ title: action.title, path: actionLink(action) }))];

export function Shell() {
  return (
    <div className="shell">
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>Skip to content</a>
      <TopBar destinations={destinations} />
      <aside className="sidebar">
        <nav aria-label="Main navigation">
          {navigation.map(({ path, title, icon: Icon }) => (
            <NavLink key={path} to={path} end aria-label={title} title={title}>
              <Icon size={24} aria-hidden="true" /><span>{title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">v0.1.0</div>
      </aside>
      <main id="main-content" tabIndex={-1}><Outlet /></main>
    </div>
  );
}
