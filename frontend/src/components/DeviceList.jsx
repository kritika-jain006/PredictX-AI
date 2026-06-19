import React, { useState } from 'react';
import { Search, Monitor, ChevronRight } from 'lucide-react';

export default function DeviceList({ devices, onSelectDevice }) {
  const [search, setSearch] = useState('');

  const filteredDevices = devices
    ? devices.filter(d => 
        (d.hostname || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.deviceId || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.manufacturer || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.model || '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="content-view">
      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="search devices by hostname, id, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.95rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        {filteredDevices.length > 0 ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>device / hostname</th>
                  <th>specs</th>
                  <th>operating system</th>
                  <th>failure risk</th>
                  <th>failing component</th>
                  <th style={{ textAlign: 'right' }}>actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map(device => {
                  const prediction = device.latestPrediction;
                  const riskLevel = prediction?.riskLevel || 'low';
                  const prob = prediction?.failureProbability ?? 0;
                  const comp = prediction?.predictedComponent || 'None';

                  return (
                    <tr key={device.deviceId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-color)'
                          }}>
                            <Monitor size={16} color="var(--text-secondary)" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff' }}>
                              {device.hostname || 'unknown'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              id: {device.deviceId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', textTransform: 'lowercase' }}>
                          {device.cpu}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'lowercase' }}>
                          {device.ram} | {device.storage}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', textTransform: 'lowercase' }}>{device.os}</span>
                      </td>
                      <td>
                        <span className={`badge ${riskLevel}`} style={{ textTransform: 'lowercase' }}>
                          {riskLevel} ({prob}%)
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: 500,
                          color: comp !== 'None' ? 'var(--color-warning)' : 'var(--text-secondary)',
                          textTransform: 'lowercase'
                        }}>
                          {comp}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => onSelectDevice(device.deviceId)}
                        >
                          view details <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <Monitor size={48} />
            <h3 style={{ marginTop: '12px', textTransform: 'lowercase' }}>no devices registered</h3>
            <p style={{ textTransform: 'lowercase' }}>go to the agent simulator tab and submit a telemetry packet to register a device.</p>
          </div>
        )}
      </div>
    </div>
  );
}
