import { Navigate, Route, Routes } from 'react-router-dom';
import { Shell, sections } from './components/Shell';
import { Dashboard } from './pages/Dashboard';
import { SectionPage } from './pages/SectionPage';

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        {sections.map((section) => (
          <Route key={section.path} path={section.path} element={<SectionPage section={section} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
