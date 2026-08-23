import React, { useState } from 'react';
import { X, Save, Key, RefreshCw, Volume2, Plus, Trash2 } from 'lucide-react';
import { UserConfig } from '../types';

interface SettingsModalProps {
  config: UserConfig;
  activeKeywords: string[];
  onSaveConfig: (config: UserConfig) => void;
  onSaveKeywords: (keywords: string[]) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  activeKeywords,
  onSaveConfig,
  onSaveKeywords,
  onClose
}) => {
  const [myAppLink, setMyAppLink] = useState(config.myAppLink);
  const [myGroupLink, setMyGroupLink] = useState(config.myGroupLink);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(config.autoRefreshEnabled);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState(config.refreshIntervalSeconds);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(config.soundAlertsEnabled);
  const [twitterBearerToken, setTwitterBearerToken] = useState(config.twitterBearerToken || '');

  const [keywords, setKeywords] = useState<string[]>(activeKeywords);
  const [newKeywordInput, setNewKeywordInput] = useState('');

  const handleAddKeyword = () => {
    const trimmed = newKeywordInput.trim();
    if (!trimmed) return;
    if (keywords.some(k => k.toLowerCase() === trimmed.toLowerCase())) {
      alert('Keyword already exists.');
      return;
    }
    const updated = [...keywords, trimmed];
    setKeywords(updated);
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    if (keywords.length <= 1) {
      alert('You must have at least one search keyword.');
      return;
    }
    const updated = keywords.filter(k => k !== kw);
    setKeywords(updated);
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      myAppLink,
      myGroupLink,
      autoRefreshEnabled,
      refreshIntervalSeconds,
      soundAlertsEnabled,
      twitterBearerToken
    });
    onSaveKeywords(keywords);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Scraper & App Settings</h2>
          <button className="btn btn-secondary btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Target Keyword Manager */}
        <div className="form-group">
          <label className="form-label">🎯 Target Search Terms & Keywords</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-input" 
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder="Add keyword (e.g. 12 testers, closed testing)"
            />
            <button className="btn btn-primary btn-sm" onClick={handleAddKeyword}>
              <Plus size={14} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
            {keywords.map((kw, i) => (
              <span key={i} className="keyword-chip active" style={{ fontSize: '0.8rem' }}>
                {kw}
                <X 
                  size={12} 
                  style={{ cursor: 'pointer', marginLeft: '0.25rem' }} 
                  onClick={() => handleRemoveKeyword(kw)}
                />
              </span>
            ))}
          </div>
        </div>

        {/* Auto Refresh & Alerts */}
        <div className="form-group">
          <label className="form-label">⏱️ Auto-Scrape Polling Interval</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input 
                type="checkbox" 
                checked={autoRefreshEnabled} 
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Enable Background Polling
            </label>

            <select 
              className="form-input" 
              value={refreshIntervalSeconds}
              onChange={(e) => setRefreshIntervalSeconds(Number(e.target.value))}
              disabled={!autoRefreshEnabled}
              style={{ width: 'auto' }}
            >
              <option value={30}>Every 30 seconds</option>
              <option value={60}>Every 1 minute</option>
              <option value={300}>Every 5 minutes</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">🔔 Audio Notification Alerts</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={soundAlertsEnabled} 
              onChange={(e) => setSoundAlertsEnabled(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            Play chime sound when new matching leads arrive
          </label>
        </div>

        {/* Twitter Bearer Token Settings */}
        <div className="form-group" style={{ background: 'var(--twitter-blue-bg)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(29, 155, 240, 0.3)' }}>
          <label className="form-label" style={{ color: 'var(--twitter-blue)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Key size={14} /> Twitter / 𝕏 API Bearer Token (Optional for Live Twitter Extraction)
          </label>
          <input 
            type="password" 
            className="form-input" 
            value={config.twitterBearerToken || ''}
            onChange={(e) => setTwitterBearerToken(e.target.value)}
            placeholder="AAAAAAAAAAAAAAAAAAAAA..."
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Enter your free Twitter Developer API v2 Bearer Token to extract live tweets directly from Twitter search endpoints.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">👥 Default Google Group Link</label>
          <input 
            type="text" 
            className="form-input" 
            value={myGroupLink}
            onChange={(e) => setMyGroupLink(e.target.value)}
            placeholder="https://groups.google.com/g/your-testers"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
