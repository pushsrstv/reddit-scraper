import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileJson } from 'lucide-react';
import { Lead } from '../types';

interface ExportModalProps {
  leads: Lead[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ leads, onClose }) => {
  const [exportScope, setExportScope] = useState<'all' | 'contacted' | 'saved'>('all');

  const getFilteredLeads = () => {
    if (exportScope === 'contacted') return leads.filter(l => l.status === 'contacted');
    if (exportScope === 'saved') return leads.filter(l => l.status === 'saved');
    return leads;
  };

  const handleExportCSV = () => {
    const list = getFilteredLeads();
    if (list.length === 0) {
      alert('No leads match the selected scope.');
      return;
    }

    const headers = ['ID', 'Platform', 'Author', 'Title', 'Content', 'URL', 'Keywords', 'Status', 'Date'];
    const rows = list.map(l => [
      `"${l.id}"`,
      `"${l.platform}"`,
      `"${l.author}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.content.replace(/"/g, '""')}"`,
      `"${l.url}"`,
      `"${l.matchedKeywords.join(';')}"`,
      `"${l.status}"`,
      `"${new Date(l.timestamp).toISOString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `testerhunt_leads_${exportScope}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleExportJSON = () => {
    const list = getFilteredLeads();
    if (list.length === 0) {
      alert('No leads match the selected scope.');
      return;
    }

    const jsonString = JSON.stringify(list, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `testerhunt_leads_${exportScope}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2 className="modal-title">📥 Export Scraped Leads</h2>
          <button className="btn btn-secondary btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Select Export Scope:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input 
                type="radio" 
                name="scope" 
                checked={exportScope === 'all'} 
                onChange={() => setExportScope('all')}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              All Scraped Leads ({leads.length})
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input 
                type="radio" 
                name="scope" 
                checked={exportScope === 'contacted'} 
                onChange={() => setExportScope('contacted')}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Replied / Contacted Only ({leads.filter(l => l.status === 'contacted').length})
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input 
                type="radio" 
                name="scope" 
                checked={exportScope === 'saved'} 
                onChange={() => setExportScope('saved')}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Bookmarked / Saved Only ({leads.filter(l => l.status === 'saved').length})
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} color="var(--tag-green)" />
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={handleExportJSON}>
            <FileJson size={16} color="var(--accent-primary)" />
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};
