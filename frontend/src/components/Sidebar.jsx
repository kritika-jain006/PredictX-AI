import React from 'react';
import { 
  Activity, 
  Layers, 
  Terminal, 
  ShieldAlert, 
  AlertTriangle,
  Wrench
} from 'lucide-react';

export default function Sidebar({ currentView, setView, backendOnline, summary }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Activity size={20} color="var(--color-primary)" />
        </div>
        <span className="logo-text">PREDICTX</span>
      </div>

      <ul className="sidebar-menu">
        <li 
          className={`menu-item ${currentView === 'overview' ? 'active' : ''}`}
          onClick={() => setView('overview')}
        >
          <Layers size={18} />
          <span>overview</span>
          {summary && summary.criticalDevices > 0 && (
            <span style={{ 
              marginLeft: 'auto', 
              backgroundColor: 'var(--color-danger)', 
              color: '#fff', 
              fontSize: '0.7rem', 
              padding: '2px 6px', 
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              {summary.criticalDevices}
            </span>
          )}
        </li>

        <li 
          className={`menu-item ${currentView === 'devices' ? 'active' : ''}`}
          onClick={() => setView('devices')}
        >
          <Activity size={18} />
          <span>devices</span>
          {summary && summary.warningDevices > 0 && (
            <span style={{ 
              marginLeft: 'auto', 
              backgroundColor: 'var(--color-warning)',
              color: '#000', 
              fontSize: '0.7rem', 
              padding: '2px 6px', 
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              {summary.warningDevices}
            </span>
          )}
        </li>

        <li 
          className={`menu-item ${currentView === 'maintenance' ? 'active' : ''}`}
          onClick={() => setView('maintenance')}
        >
          <Wrench size={18} />
          <span>maintenance</span>
        </li>

        <li 
          className={`menu-item ${currentView === 'simulator' ? 'active' : ''}`}
          onClick={() => setView('simulator')}
        >
          <Terminal size={18} />
          <span>agent sim</span>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="server-status">
          <div className={`status-dot ${backendOnline ? 'online' : 'offline'}`}></div>
          <span>api: {backendOnline ? 'connected' : 'disconnected'}</span>
        </div>
      </div>
    </aside>
  );
}
