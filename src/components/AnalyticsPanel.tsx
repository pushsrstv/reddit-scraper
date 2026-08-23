import React from 'react';
import { Lead } from '../types';
import { Activity, CheckCircle, Bookmark, MessageSquare, TrendingUp } from 'lucide-react';

interface AnalyticsPanelProps {
  leads: Lead[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ leads }) => {
  const total = leads.length;
  const redditCount = leads.filter(l => l.platform === 'reddit').length;
  const twitterCount = leads.filter(l => l.platform === 'twitter').length;
  const contactedCount = leads.filter(l => l.status === 'contacted').length;
  const savedCount = leads.filter(l => l.status === 'saved').length;

  // Keyword frequency counts
  const keywordCounts: Record<string, number> = {};
  leads.forEach(l => {
    l.matchedKeywords.forEach(kw => {
      keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
    });
  });

  const sortedKeywords = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)' }}>
          <Activity size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Scraped</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--reddit-red-bg)', color: 'var(--reddit-red)' }}>
          <MessageSquare size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Reddit Posts</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{redditCount}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--twitter-blue-bg)', color: 'var(--twitter-blue)' }}>
          <TrendingUp size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Twitter Posts</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{twitterCount}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--tag-green)' }}>
          <CheckCircle size={22} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Replied / Contacted</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{contactedCount}</div>
        </div>
      </div>
    </div>
  );
};
