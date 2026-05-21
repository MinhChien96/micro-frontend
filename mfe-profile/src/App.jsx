import React from 'react';
import { ToastProvider } from 'shared/ui';
import ProfilePage from './components/ProfilePage';
import './styles.css';

export default function App() {
  return (
    <ToastProvider>
      <div style={{ padding: 24 }}>
        <div className="standalone-banner">
          Running standalone — <code>mfe-profile</code> on port 3005
        </div>
        <ProfilePage />
      </div>
    </ToastProvider>
  );
}
