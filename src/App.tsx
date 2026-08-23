import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Lead, Platform, LeadStatus, ScrapeFilter, UserConfig, ReplyTemplate } from './types';
import { 
  fetchLeads, 
  getUserConfig, 
  saveUserConfig, 
  getTemplates, 
  saveTemplates, 
  saveLeadStatus 
} from './services/api';

import { Header } from './components/Header';
import { LeadCard } from './components/LeadCard';
import { TemplateManager } from './components/TemplateManager';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';

import { Search, Filter, RefreshCw, CheckCircle2, MessageSquareCode, Plus, Sparkles, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Config & Templates
  const [config, setConfig] = useState<UserConfig>(getUserConfig);
  const [templates, setTemplatesState] = useState<ReplyTemplate[]>(getTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(() => templates[0]?.id || 't1');

  // Search & Filters
  const [platformFilter, setPlatformFilter] = useState<Platform>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeKeywords, setActiveKeywords] = useState<string[]>(['12 testers', 'closed testing', '20 testers']);
  const [selectedKeywordFilter, setSelectedKeywordFilter] = useState<string | null>(null);

  // Modals & Toasts
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Play subtle sound alert when new leads arrive
  const playAlertSound = () => {
    if (!config.soundAlertsEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  // Load Leads Service
  const handleFetchLeads = useCallback(async (isManual = false) => {
    setIsScraping(true);
    try {
      const fetched = await fetchLeads(activeKeywords);
      
      setLeads(prev => {
        // Detect if new leads were added
        if (prev.length > 0 && fetched.length > prev.length) {
          playAlertSound();
          if (isManual) {
            triggerToast(`Found ${fetched.length - prev.length} new testing leads! 🎯`);
          }
        }
        return fetched;
      });

      setLastUpdated(Date.now());
      if (isManual) {
        triggerToast('Scraped latest posts from Reddit & Twitter! 🚀');
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      triggerToast('Error fetching leads. Check server connection.');
    } finally {
      setIsScraping(false);
    }
  }, [activeKeywords, config.soundAlertsEnabled]);

  // Initial Load & Auto Refresh Interval
  useEffect(() => {
    handleFetchLeads();
  }, [handleFetchLeads]);

  useEffect(() => {
    if (!config.autoRefreshEnabled || config.refreshIntervalSeconds <= 0) return;

    const timer = setInterval(() => {
      handleFetchLeads();
    }, config.refreshIntervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [config.autoRefreshEnabled, config.refreshIntervalSeconds, handleFetchLeads]);

  // Update lead status
  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    saveLeadStatus(id, newStatus);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    triggerToast(`Lead marked as ${newStatus}`);
  };

  // Active Template
  const activeTemplate = useMemo(() => {
    return templates.find(t => t.id === activeTemplateId) || templates[0] || {
      id: 'default',
      name: 'Default',
      content: 'Hi {author}, I can test your app! Link: {my_app_link}'
    };
  }, [templates, activeTemplateId]);

  // Core Action: Reply & Open Post in New Tab
  const handleOpenReply = (lead: Lead) => {
    // Replace template variables
    const rawTemplate = activeTemplate.content;
    const formattedReply = rawTemplate
      .replace(/{author}/g, lead.author)
      .replace(/{my_app_link}/g, config.myAppLink || '[YOUR_APP_LINK]')
      .replace(/{my_group_link}/g, config.myGroupLink || '[YOUR_GROUP_LINK]');

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formattedReply);
    }

    // Open post URL in new tab
    window.open(lead.url, '_blank', 'noopener,noreferrer');

    // Mark as contacted automatically
    handleStatusChange(lead.id, 'contacted');

    triggerToast(`Copied response template & opened post in new tab! 🚀`);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Platform filter
      if (platformFilter !== 'all' && lead.platform !== platformFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;

      // Keyword chip filter
      if (selectedKeywordFilter) {
        const matchesTerm = lead.matchedKeywords.some(
          k => k.toLowerCase() === selectedKeywordFilter.toLowerCase()
        );
        if (!matchesTerm) return false;
      }

      // Free text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullContent = `${lead.title} ${lead.content} ${lead.author} ${lead.subreddit || ''} ${lead.handle || ''}`.toLowerCase();
        if (!fullContent.includes(q)) return false;
      }

      return true;
    });
  }, [leads, platformFilter, statusFilter, selectedKeywordFilter, searchQuery]);

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <Header 
        config={config}
        lastUpdated={lastUpdated}
        isScraping={isScraping}
        onRefresh={() => handleFetchLeads(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onToggleSound={() => {
          const updated = { ...config, soundAlertsEnabled: !config.soundAlertsEnabled };
          setConfig(updated);
          saveUserConfig(updated);
        }}
        totalLeadsCount={leads.length}
      />

      {/* Analytics Summary Panel */}
      <AnalyticsPanel leads={leads} />

      {/* Control & Filtering Toolbar */}
      <div className="toolbar">
        <div className="toolbar-row">
          {/* Search Bar */}
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input 
              type="text" 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by keyword, title, author, or subreddit..."
            />
          </div>

          {/* Platform Tabs */}
          <div className="platform-tabs">
            <button 
              className={`tab-btn ${platformFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPlatformFilter('all')}
            >
              All Platforms ({leads.length})
            </button>
            <button 
              className={`tab-btn ${platformFilter === 'reddit' ? 'active reddit' : ''}`}
              onClick={() => setPlatformFilter('reddit')}
            >
              r/ Reddit ({leads.filter(l => l.platform === 'reddit').length})
            </button>
            <button 
              className={`tab-btn ${platformFilter === 'twitter' ? 'active twitter' : ''}`}
              onClick={() => setPlatformFilter('twitter')}
            >
              𝕏 Twitter ({leads.filter(l => l.platform === 'twitter').length})
            </button>
          </div>
        </div>

        {/* Second Row: Keywords & Status Filters */}
        <div className="toolbar-row">
          <div className="keyword-chips-container">
            <span className="chip-label">Filters:</span>

            <span 
              className={`keyword-chip ${selectedKeywordFilter === null ? 'active' : ''}`}
              onClick={() => setSelectedKeywordFilter(null)}
            >
              All Terms
            </span>

            {activeKeywords.map((kw, i) => (
              <span 
                key={i} 
                className={`keyword-chip ${selectedKeywordFilter === kw ? 'active' : ''}`}
                onClick={() => setSelectedKeywordFilter(selectedKeywordFilter === kw ? null : kw)}
              >
                🎯 "{kw}"
              </span>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
              <button 
                className="btn btn-sm btn-secondary"
                style={{ color: 'var(--reddit-red)', borderColor: 'rgba(255,69,0,0.3)', fontSize: '0.775rem' }}
                onClick={() => {
                  const q = activeKeywords.map(k => `"${k}"`).join(' OR ');
                  window.open(`https://www.reddit.com/r/AndroidClosedTesting/search/?q=${encodeURIComponent(q)}&sort=new`, '_blank');
                }}
                title="Open real-time live search tab on Reddit"
              >
                <ExternalLink size={12} /> Live Reddit Query
              </button>

              <button 
                className="btn btn-sm btn-secondary"
                style={{ color: 'var(--twitter-blue)', borderColor: 'rgba(29,155,240,0.3)', fontSize: '0.775rem' }}
                onClick={() => {
                  const q = activeKeywords.map(k => `"${k}"`).join(' OR ');
                  window.open(`https://x.com/search?q=${encodeURIComponent(q)}&f=live`, '_blank');
                }}
                title="Open real-time live search tab on Twitter (X)"
              >
                <ExternalLink size={12} /> Live Twitter Query
              </button>
            </div>
          </div>

          {/* Status Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="chip-label">Status:</span>
            <select 
              className="form-input" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="new">New ({leads.filter(l => l.status === 'new').length})</option>
              <option value="contacted">Replied ({leads.filter(l => l.status === 'contacted').length})</option>
              <option value="saved">Bookmarked ({leads.filter(l => l.status === 'saved').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leads Grid */}
      <main>
        <div className="leads-header">
          <h2 className="leads-count-title">
            Matching Testing Leads
            <span className="count-badge">{filteredLeads.length}</span>
          </h2>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} color="var(--accent-primary)" />
            Active Quick Reply Template: <strong>{activeTemplate.name}</strong>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div style={{ background: 'var(--bg-surface)', border: '1px border-color', borderRadius: 'var(--radius-lg)', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No leads match your active filters</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Try broadening your keyword filter or search query, or click "Scrape Now" to fetch recent posts.
            </p>
            <button className="btn btn-primary" onClick={() => handleFetchLeads(true)}>
              <RefreshCw size={16} /> Scrape Live Posts
            </button>
          </div>
        ) : (
          <div className="leads-grid">
            {filteredLeads.map(lead => (
              <LeadCard 
                key={lead.id}
                lead={lead}
                selectedTemplate={activeTemplate}
                config={config}
                onStatusChange={handleStatusChange}
                onOpenReply={handleOpenReply}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showSettingsModal && (
        <SettingsModal 
          config={config}
          activeKeywords={activeKeywords}
          onSaveConfig={(updated) => {
            setConfig(updated);
            saveUserConfig(updated);
          }}
          onSaveKeywords={(kws) => setActiveKeywords(kws)}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showTemplatesModal && (
        <TemplateManager 
          templates={templates}
          config={config}
          activeTemplateId={activeTemplateId}
          onSelectTemplate={(id) => setActiveTemplateId(id)}
          onSaveTemplates={(updated) => {
            setTemplatesState(updated);
            saveTemplates(updated);
          }}
          onSaveConfig={(updated) => {
            setConfig(updated);
            saveUserConfig(updated);
          }}
          onClose={() => setShowTemplatesModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal 
          leads={leads}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} color="var(--tag-green)" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
