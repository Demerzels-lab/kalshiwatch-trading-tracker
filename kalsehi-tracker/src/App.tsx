import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Markets } from './components/Markets';
import { Watchlist } from './components/Watchlist';
import { Alerts } from './components/Alerts';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'markets':
        return <Markets />;
      case 'watchlist':
        return <Watchlist />;
      case 'alerts':
        return <Alerts />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </AuthProvider>
  );
}

export default App;
