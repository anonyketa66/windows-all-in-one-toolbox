import { ChevronRight, HardDrive, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MetricCard } from '../components/MetricCard';
import { ChipIcon, MotherboardIcon, WindowsIcon } from '../components/HardwareIcons';
import { sections } from '../components/Shell';
import { actionLink, quickActions } from '../data/quickActions';
import { useSystemMetrics } from '../data/useSystemMetrics';

const primaryDetails = [
  { label: 'Operating system', icon: <WindowsIcon />, tone: 'blue' },
  { label: 'Processor', icon: <ChipIcon label="CPU" />, tone: 'cpu' },
  { label: 'Memory', icon: <ChipIcon label="RAM" />, tone: 'ram' },
  { label: 'Graphics cards', icon: <ChipIcon label="GPU" />, tone: 'gpu' },
  { label: 'Motherboard', icon: <MotherboardIcon /> },
];

const deviceDetails = ['Device', 'Architecture', 'Uptime'];
const shortcuts = ['repair', 'windows-update', 'backup', 'office'];
const categories = [
  { path: '/applications', tone: 'blue', caption: 'Manage software' },
  { path: '/tweaks', tone: 'ram', caption: 'Customize Windows' },
  { path: '/system', tone: 'green', caption: 'System information' },
  { path: '/tools', tone: 'orange', caption: 'Maintenance utilities' },
  { path: '/performance', tone: 'purple', caption: 'Monitor performance' },
];

export function Dashboard() {
  const { metrics, details, drives, storage, mode, status } = useSystemMetrics();

  return (
    <div className="dashboard">
      <h1 className="sr-only">Dashboard</h1>
      <div className="dashboard-overview">
        <section className="panel system-panel" aria-labelledby="system-title">
          <div className="section-heading">
            <Monitor aria-hidden="true" /><h2 id="system-title">System information</h2>
            <span className="system-status" role="status">{mode === 'live' ? '' : status}</span>
          </div>
          <div className="system-overview">
            <dl className="hardware-list">
              {primaryDetails.map(({ label, icon, tone }) => (
                <div key={label} data-tone={tone}>
                  <dt>{icon}<span className="sr-only">{label}</span></dt>
                  <dd>{details.find(([name]) => name === label)?.[1] ?? '—'}</dd>
                </div>
              ))}
              {drives.map((model, index) => (
                <div key={`${model}-${index}`} data-tone="disk">
                  <dt><HardDrive aria-hidden="true" /><span className="sr-only">Storage {index + 1}</span></dt>
                  <dd>{model}</dd>
                </div>
              ))}
            </dl>
            <div className="system-summary">
              <figure className="storage-ring">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="ring-track" cx="50" cy="50" r="44" />
                  {storage && <circle className="ring-value" cx="50" cy="50" r="44" pathLength="100"
                    strokeDasharray={`${storage.usage} 100`} transform="rotate(-90 50 50)" />}
                </svg>
                <figcaption><strong>{storage ? `${storage.usage}%` : '—'}</strong>
                  <span>{storage ? `${storage.label} used` : 'System drive'}</span>
                </figcaption>
              </figure>
              <details className="system-details">
                <summary>Device details</summary>
                <dl className="device-details">
                  {deviceDetails.map((label) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{details.find(([name]) => name === label)?.[1] ?? '—'}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </div>
        </section>
        <section className="panel actions-panel" aria-labelledby="actions-title">
          <div className="section-heading"><h2 id="actions-title">Quick actions</h2></div>
          <div className="shortcut-list">
            {shortcuts.map((id) => {
              const action = quickActions.find((entry) => entry.id === id);
              if (!action) return null;
              return (
                <Link key={action.id} to={actionLink(action)}>
                  <action.icon aria-hidden="true" /><span>{action.title}</span><ChevronRight aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="panel monitor-panel" aria-labelledby="monitor-title">
        <div className="section-heading"><h2 id="monitor-title">System monitor</h2></div>
        <div className="metrics-grid">
          {(['cpu', 'ram', 'gpu', 'network'] as const).map((tone) => {
            const metric = metrics.find((entry) => entry.tone === tone);
            return metric && <MetricCard key={tone} metric={metric} />;
          })}
        </div>
      </section>

      <nav className="category-grid" aria-label="Toolbox categories">
        {categories.map(({ path, tone, caption }) => {
          const section = sections.find((entry) => entry.path === path);
          if (!section) return null;
          return (
            <Link to={path} className="action-card" data-tone={tone} key={path}>
              <section.icon aria-hidden="true" /><strong>{section.title}</strong><span>{caption}</span>
            </Link>
          );
        })}
      </nav>

      <footer className="panel dashboard-credits">
        <span>Created by <strong>KetaMingo420</strong></span>
        <span className="discord-credit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8.4 6.2 7.7 4.9A14 14 0 0 0 4 6.4a17 17 0 0 0-2 10.2 14 14 0 0 0 4.7 2.4l1.1-1.8m7.8-11 .7-1.3A14 14 0 0 1 20 6.4a17 17 0 0 1 2 10.2 14 14 0 0 1-4.7 2.4l-1.1-1.8M8.4 6.2a14 14 0 0 1 7.2 0M6.5 16.5a12 12 0 0 0 11 0" />
            <circle cx="8.8" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="15.2" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          <span className="sr-only">Discord </span>ketamingo420
        </span>
      </footer>
    </div>
  );
}
