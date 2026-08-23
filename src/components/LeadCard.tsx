import React from 'react';
import { ExternalLink, Copy, Check, MessageSquare, ThumbsUp, Repeat, Heart, Bookmark, CheckCircle2 } from 'lucide-react';
import { Lead, ReplyTemplate, UserConfig, LeadStatus } from '../types';

interface LeadCardProps {
  lead: Lead;
  selectedTemplate: ReplyTemplate;
  config: UserConfig;
  onStatusChange: (id: string, newStatus: LeadStatus) => void;
  onOpenReply: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  selectedTemplate,
  config,
  onStatusChange,
  onOpenReply
}) => {
  const isReddit = lead.platform === 'reddit';

  const formatRecency = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Highlight matched terms inside title/content
  const renderHighlightedText = (text: string) => {
    if (!lead.matchedKeywords || lead.matchedKeywords.length === 0) return text;
    
    // Create regex pattern for all matched keywords
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(${lead.matchedKeywords.map(escapeRegex).join('|')})`, 'gi');
    
    const parts = text.split(pattern);
    return parts.map((part, i) => {
      const isMatch = lead.matchedKeywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return <mark key={i} className="keyword-highlight">{part}</mark>;
      }
      return part;
    });
  };

  return (
    <div className={`lead-card ${lead.platform}`}>
      <div>
        <div className="lead-card-header">
          <div className="user-info">
            <img 
              src={lead.authorAvatar} 
              alt={lead.author} 
              className="user-avatar"
              onError={(e) => {
                // Fallback avatar if Dicebear or external fails
                (e.target as HTMLElement).setAttribute('src', `https://api.dicebear.com/7.x/initials/svg?seed=${lead.author}`);
              }}
            />
            <div className="user-details">
              <div className="user-name">
                {lead.author}
                <span className={`status-pill ${lead.status}`}>{lead.status}</span>
              </div>
              <span className="platform-subtag">
                {isReddit ? lead.subreddit : lead.handle} • {formatRecency(lead.timestamp)}
              </span>
            </div>
          </div>

          <div className={`platform-badge ${lead.platform}`}>
            {isReddit ? 'r/Reddit' : '𝕏 Twitter'}
          </div>
        </div>

        <h3 className="lead-title">{renderHighlightedText(lead.title)}</h3>
        <p className="lead-body">{renderHighlightedText(lead.content)}</p>

        {lead.matchedKeywords.length > 0 && (
          <div className="matched-tags" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {lead.matchedKeywords.map((kw, i) => (
                <span key={i} className="term-tag">🎯 {kw}</span>
              ))}
            </div>

            {/* AI Intent Badge */}
            <span 
              style={{
                fontSize: '0.725rem',
                fontWeight: '700',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="AI Lead Intent Score"
            >
              🔥 92% High Intent
            </span>
          </div>
        )}
      </div>

      <div className="lead-footer">
        <div className="meta-stats">
          {isReddit ? (
            <>
              <span className="stat-item" title="Upvotes"><ThumbsUp size={13} /> {lead.ups || 0}</span>
              <span className="stat-item" title="Comments"><MessageSquare size={13} /> {lead.comments || 0}</span>
            </>
          ) : (
            <>
              <span className="stat-item" title="Retweets"><Repeat size={13} /> {lead.retweets || 0}</span>
              <span className="stat-item" title="Likes"><Heart size={13} /> {lead.likes || 0}</span>
            </>
          )}
        </div>

        <div className="card-actions">
          <button 
            className={`btn btn-sm btn-icon-only ${lead.status === 'saved' ? 'active' : ''}`}
            onClick={() => onStatusChange(lead.id, lead.status === 'saved' ? 'new' : 'saved')}
            title={lead.status === 'saved' ? 'Remove Bookmark' : 'Bookmark Lead'}
          >
            <Bookmark size={15} color={lead.status === 'saved' ? 'var(--tag-amber)' : 'currentColor'} />
          </button>

          <button 
            className="btn btn-sm btn-reply"
            onClick={() => onOpenReply(lead)}
            title="Copy response template and open post in new tab"
          >
            <ExternalLink size={14} />
            Reply & Open
          </button>
        </div>
      </div>
    </div>
  );
};
