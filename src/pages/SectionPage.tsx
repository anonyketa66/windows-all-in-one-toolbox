import { useSearchParams } from 'react-router-dom';
import type { sections } from '../components/Shell';
import { quickActions } from '../data/quickActions';

export function SectionPage({ section }: { section: (typeof sections)[number] }) {
  const [params] = useSearchParams();
  const action = quickActions.find(({ id, path }) => id === params.get('actie') && path === section.path);
  const Icon = action?.icon ?? section.icon;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">WINDOWS ALL-IN-ONE TOOLBOX</p>
          <h1>{section.title}</h1>
          <p>{section.description}</p>
        </div>
      </header>
      <div className="panel empty-state">
        <span className="brand-mark"><Icon size={20} aria-hidden="true" /></span>
        <h2>{action?.title ?? 'Coming soon'}</h2>
        <p>{action ? 'This feature is coming soon.' : 'This page is still being built.'}</p>
      </div>
    </>
  );
}
