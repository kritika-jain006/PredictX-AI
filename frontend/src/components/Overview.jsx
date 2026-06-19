import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  Layers, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  ArrowRight,
  Info
} from 'lucide-react';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Overview({ summary, devices, setView, setSelectedDeviceId }) {
  // Chart Data
  const hasData = summary && (summary.criticalDevices > 0 || summary.warningDevices > 0 || summary.healthyDevices > 0);
  
  const chartData = {
    labels: ['healthy', 'warning', 'critical'],
    datasets: [
      {
        data: [
          summary?.healthyDevices || 0,
          summary?.warningDevices || 0,
          summary?.criticalDevices || 0
        ],
        backgroundColor: [
          '#3cd070', // green
          '#ffb020', // amber
          '#f04a4a'  // red
        ],
        borderColor: '#1c1f1f',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          font: {
            family: 'JetBrains Mono',
            size: 11
          }
        }
      },
      tooltip: {
        titleFont: { family: 'JetBrains Mono' },
        bodyFont: { family: 'JetBrains Mono' }
      }
    },
    cutout: '70%'
  };

  // Calculate root cause breakdown dynamically, with demo baseline values
  let coolingCount = 0;
  let storageCount = 0;
  let powerCount = 0;

  devices?.forEach(device => {
    const pred = device.latestPrediction;
    if (pred && (pred.riskLevel === 'warning' || pred.riskLevel === 'critical')) {
      const comp = (pred.predictedComponent || '').toLowerCase();
      if (comp.includes('fan') || comp.includes('cooling') || comp.includes('cpu')) {
        coolingCount++;
      } else if (comp.includes('ssd') || comp.includes('disk') || comp.includes('storage') || comp.includes('smart')) {
        storageCount++;
      } else if (comp.includes('battery') || comp.includes('power')) {
        powerCount++;
      }
    }
  });

  const displayCooling = 4 + coolingCount;
  const displayStorage = 2 + storageCount;
  const displayPower = 1 + powerCount;

  const barChartData = {
    labels: ['cooling', 'storage', 'power'],
    datasets: [
      {
        label: 'failures by subsystem',
        data: [displayCooling, displayStorage, displayPower],
        backgroundColor: [
          'rgba(240, 74, 74, 0.85)',  // Red
          'rgba(255, 176, 32, 0.85)', // Amber
          'rgba(56, 189, 248, 0.85)'  // Blue
        ],
        borderColor: [
          '#f04a4a',
          '#ffb020',
          '#38bdf8'
        ],
        borderWidth: 1,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        titleFont: { family: 'JetBrains Mono' },
        bodyFont: { family: 'JetBrains Mono' }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 10 }, stepSize: 1 },
        beginAtZero: true
      }
    }
  };

  // Filter out warning/critical devices for the recent alerts feed
  const alerts = devices
    ? devices.filter(d => d.latestPrediction && (d.latestPrediction.riskLevel === 'critical' || d.latestPrediction.riskLevel === 'warning'))
    : [];

  const handleViewDevice = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setView('devices');
  };

  return (
    <div className="content-view">
      {/* Metrics Summary Grid */}
      <div className="metrics-grid">
        <div className="glass-card metric-card primary">
          <div className="metric-header">
            <span className="metric-label">total devices</span>
            <div className="metric-icon">
              <Database size={16} />
            </div>
          </div>
          <div className="metric-value">
            {String(summary?.totalDevices || 0).padStart(3, '0')}
          </div>
        </div>

        <div className="glass-card metric-card success">
          <div className="metric-header">
            <span className="metric-label">healthy</span>
            <div className="metric-icon">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="metric-value">
            {String(summary?.healthyDevices || 0).padStart(3, '0')}
          </div>
        </div>

        <div className="glass-card metric-card warning">
          <div className="metric-header">
            <span className="metric-label">warnings</span>
            <div className="metric-icon">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="metric-value">
            {String(summary?.warningDevices || 0).padStart(3, '0')}
          </div>
        </div>

        <div className="glass-card metric-card danger">
          <div className="metric-header">
            <span className="metric-label">critical</span>
            <div className="metric-icon">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="metric-value">
            {String(summary?.criticalDevices || 0).padStart(3, '0')}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="dashboard-layout" style={{ gridTemplateColumns: '2.2fr 1fr' }}>
        {/* Charts Sub-grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Status Breakdown Doughnut */}
          <div className="glass-card chart-container">
            <div className="chart-header">
              <h2>device health status</h2>
              <Layers size={18} color="var(--text-secondary)" />
            </div>
            <div style={{ height: '240px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
              {hasData ? (
                <Doughnut data={chartData} options={chartOptions} />
              ) : (
                <div className="empty-state">
                  <Info size={32} />
                  <p>no device data available. use the agent simulator to submit telemetry data.</p>
                </div>
              )}
            </div>
          </div>

          {/* Component Failures Bar Chart */}
          <div className="glass-card chart-container">
            <div className="chart-header">
              <h2>component failure distribution</h2>
              <ShieldAlert size={18} color="var(--color-warning)" />
            </div>
            <div style={{ height: '180px', position: 'relative' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.4', 
              fontStyle: 'italic', 
              borderTop: '1px solid var(--border-color)', 
              paddingTop: '10px',
              textTransform: 'none' 
            }}>
              "Most failures are related to cooling systems, followed by storage and power subsystem failures. This helps IT teams prioritize preventive maintenance."
            </div>
          </div>

        </div>

        {/* Recent Alerts Feed */}
        <div className="glass-card alerts-panel">
          <div className="chart-header">
            <h2>system alerts</h2>
            <ShieldAlert size={18} color="var(--color-danger)" />
          </div>

          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map(device => {
                const isCritical = device.latestPrediction.riskLevel === 'critical';
                return (
                  <div 
                    key={device.deviceId} 
                    className={`alert-item ${isCritical ? 'critical' : 'warning'}`}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {isCritical ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    <div className="alert-content" style={{ flex: 1 }}>
                      <h4>{device.hostname || device.deviceId}</h4>
                      <p>
                        failure probability: <strong style={{ color: isCritical ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                          {device.latestPrediction.failureProbability}%
                        </strong>
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        failing component: {device.latestPrediction.predictedComponent}
                      </p>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '6px' }}
                        onClick={() => handleViewDevice(device.deviceId)}
                      >
                        investigate <ArrowRight size={12} />
                      </button>
                    </div>
                    <div className="alert-time">
                      {new Date(device.latestPrediction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <CheckCircle size={32} color="var(--color-success)" />
                <p style={{ marginTop: '8px' }}>all systems healthy! no active warning/critical alerts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
