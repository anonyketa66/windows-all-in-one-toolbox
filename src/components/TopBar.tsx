import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Bell, Minus, Search, Settings, Square, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function TopBar({ destinations }: { destinations: { title: string; path: string }[] }) {
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [windowError, setWindowError] = useState(false);
  const navigate = useNavigate();
  const desktopWindow = isTauri() ? getCurrentWindow() : null;
  const search = query.trim().toLowerCase();
  const matches = search ? destinations.filter(({ title }) => title.toLowerCase().includes(search)) : [];

  function runWindowAction(action: () => Promise<void>) {
    setWindowError(false);
    void action().catch(() => setWindowError(true));
  }

  return (
    <header className="topbar" data-tauri-drag-region>
      <Link to="/" className="brand" aria-label="Windows All-in-One Toolbox dashboard">
        <svg className="brand-logo" viewBox="0 0 56 40" aria-hidden="true">
          <path d="M2 5C17 11 25 1 35 3c12 2 18 9 18 17 0 11-11 19-24 18 9-4 17-11 16-19-1-6-9-8-15-3C22 13 12 13 2 5Z" />
          <path d="M2 37c12-4 20-10 26-18 4-5 10-6 13-2-5 0-8 9-13 13-7 5-15 7-26 7Z" />
        </svg>
        <span className="brand-name">Windows All-in-One Toolbox<small>Optimize · Install · Monitor · Restore</small></span>
      </Link>
      <div className="topbar-spacer" data-tauri-drag-region />
      <form className="toolkit-search" role="search" onSubmit={(event) => {
        event.preventDefault();
        if (matches[0]) { navigate(matches[0].path); setQuery(''); }
      }} onKeyDown={(event) => { if (event.key === 'Escape') setQuery(''); }}>
        <Search size={18} aria-hidden="true" />
        <input type="search" aria-label="Search the toolbox" placeholder="Search the toolbox…" value={query}
          onChange={(event) => setQuery(event.target.value)} />
        {search && (
          <div className="topbar-popover search-results">
            {matches.length ? matches.map(({ title, path }) => (
              <Link key={path} to={path} onClick={() => setQuery('')}>{title}</Link>
            )) : <p>No results</p>}
          </div>
        )}
      </form>
      <div className="notification-control">
        <button type="button" className="icon-button" aria-label="Notifications" aria-expanded={notifications}
          onClick={() => setNotifications(!notifications)}><Bell size={21} /></button>
        {notifications && <div className="topbar-popover" role="status"><p>No notifications</p></div>}
      </div>
      <Link to="/settings" className="icon-button" aria-label="Settings"><Settings size={22} /></Link>
      {desktopWindow && (
        <div className="window-controls">
          <button type="button" className="icon-button" aria-label="Minimize"
            onClick={() => runWindowAction(() => desktopWindow.minimize())}><Minus size={17} /></button>
          <button type="button" className="icon-button" aria-label="Maximize or restore"
            onClick={() => runWindowAction(() => desktopWindow.toggleMaximize())}><Square size={13} /></button>
          <button type="button" className="icon-button close-window" aria-label="Close window"
            onClick={() => runWindowAction(() => desktopWindow.close())}><X size={18} /></button>
          {windowError && <div className="topbar-popover" role="alert"><p>Window action unavailable</p></div>}
        </div>
      )}
    </header>
  );
}
