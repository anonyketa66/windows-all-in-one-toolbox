import { AppWindow, DatabaseBackup, Disc3, Layers3, PanelsTopLeft, Wrench } from 'lucide-react';

export const quickActions = [
  { id: 'windows-update', title: 'Windows Update', description: 'Manage updates', icon: PanelsTopLeft, tone: 'blue', path: '/system' },
  { id: 'repair', title: 'SFC / DISM', description: 'Scan & repair', icon: Wrench, tone: 'blue', path: '/tools' },
  { id: 'backup', title: 'Backup & Restore', description: 'Backup & restore', icon: DatabaseBackup, tone: 'green', path: '/tools' },
  { id: 'windows-iso', title: 'Windows ISO', description: 'Windows 10 / 11', icon: Disc3, tone: 'blue', path: '/tools' },
  { id: 'office', title: 'Office', description: 'License & status', icon: AppWindow, tone: 'orange', path: '/applications' },
  { id: 'windows-mods', title: 'Windows Mods', description: 'Customize Windows', icon: Layers3, tone: 'purple', path: '/tweaks' },
];

export function actionLink(action: (typeof quickActions)[number]) {
  return `${action.path}?actie=${action.id}`;
}
