import React from 'react';
import { Radar, RefreshCw, Sliders, MessageSquareCode, Download, Volume2, VolumeX } from 'lucide-react';
import { UserConfig } from '../types';

interface HeaderProps {
  config: UserConfig;
  lastUpdated: number | null;
  isScraping: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onToggleSound: () => void;
  totalLeadsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  lastUpdated,
  isScraping,
  onRefresh,
  onOpenSettings,
  onOpenTemplates,
  onOpenExport,
  onToggleSound,
  totalLeadsCount
}) => {
  const formatTime = (ts: number | null) => {
    if (!ts) return 'Never';
    const elapsed = Math.floor((Date.now() - ts) / 1000);
    if (elapsed < 10) return 'Just now';
    if (elapsed < 60) return `${elapsed}s ago`;
    return `${Math.floor(elapsed / 60)}m ago`;
  };

  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="logo-badge">
          <span>🎯</span>
          <div className="radar-pulse"></div>
        </div>
        <div>
          <h1 className="brand-title">
            TesterHunt
            <span className="count-badge">{totalLeadsCount} Leads</span>
          </h1>
          <p className="brand-subtitle">
            Live Reddit & Twitter Scraper for App Testers ("12 testers", "closed testing")
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Radar size={14} className={isScraping ? 'spin-icon' : ''} style={{ color: 'var(--tag-green)' }} />
          <span>Last scraped: <strong>{formatTime(lastUpdated)}</strong></span>
        </div>

        <button 
          className="btn btn-primary btn-sm"
          onClick={onRefresh}
          disabled={isScraping}
        >
          <RefreshCw size={14} className={isScraping ? 'spin-icon' : ''} />
          {isScraping ? 'Scraping...' : 'Scrape Now'}
        </button>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={onOpenTemplates}
          title="Quick Reply Templates"
        >
          <MessageSquareCode size={14} />
          Templates
        </button>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={onOpenExport}
          title="Export Leads"
        >
          <Download size={14} />
          Export
        </button>

        <button 
          className="btn btn-secondary btn-icon-only"
          onClick={onToggleSound}
          title={config.soundAlertsEnabled ? 'Sound Alerts On' : 'Sound Alerts Muted'}
        >
          {config.soundAlertsEnabled ? <Volume2 size={16} color="var(--tag-green)" /> : <VolumeX size={16} color="var(--text-muted)" />}
        </button>

        <button 
          className="btn btn-secondary btn-icon-only"
          onClick={onOpenSettings}
          title="App Settings & Testing Links"
        >
          <Sliders size={16} />
        </button>
      </div>
    </header>
  );
};
