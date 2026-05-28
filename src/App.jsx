import React from 'react';
import LandingPage from './landing.jsx';
import EmployeeApp from './employee-app.jsx';
import ManagerDashboard from './manager-dashboard.jsx';

const views = ['landing', 'employee', 'manager'];

export default function App() {
  const initial = window.location.hash.replace('#', '') || 'landing';
  const [view, setView] = React.useState(views.includes(initial) ? initial : 'landing');

  React.useEffect(() => {
    window.location.hash = view;
  }, [view]);

  React.useEffect(() => {
    const onHash = () => {
      const nextView = window.location.hash.replace('#', '') || 'landing';
      if (views.includes(nextView)) setView(nextView);
    };

    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (view === 'employee') return <EmployeeApp onExitToLanding={() => setView('landing')} />;
  if (view === 'manager') return <ManagerDashboard onExitToLanding={() => setView('landing')} />;
  return <LandingPage onSelect={setView} />;
}
