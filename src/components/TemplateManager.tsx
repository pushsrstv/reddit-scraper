import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Save, Check, Copy, Link } from 'lucide-react';
import { ReplyTemplate, UserConfig } from '../types';

interface TemplateManagerProps {
  templates: ReplyTemplate[];
  config: UserConfig;
  activeTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onSaveTemplates: (templates: ReplyTemplate[]) => void;
  onSaveConfig: (config: UserConfig) => void;
  onClose: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  config,
  activeTemplateId,
  onSelectTemplate,
  onSaveTemplates,
  onSaveConfig,
  onClose
}) => {
  const [templateList, setTemplateList] = useState<ReplyTemplate[]>(templates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');

  const [myAppLink, setMyAppLink] = useState(config.myAppLink);
  const [myGroupLink, setMyGroupLink] = useState(config.myGroupLink);

  const handleStartEdit = (tmpl: ReplyTemplate) => {
    setEditingId(tmpl.id);
    setEditName(tmpl.name);
    setEditContent(tmpl.content);
  };

  const handleCreateNew = () => {
    const newId = `t_${Date.now()}`;
    const newTmpl: ReplyTemplate = {
      id: newId,
      name: '✨ Custom Tester Offer Template',
      content: `Hey {author}! I can opt into your app closed test for 14 days.\n\nMy App Link: {my_app_link}\nGroup Link: {my_group_link}\n\nLet's test back!`
    };
    const updated = [...templateList, newTmpl];
    setTemplateList(updated);
    handleStartEdit(newTmpl);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const updated = templateList.map(t => {
      if (t.id === editingId) {
        return { ...t, name: editName, content: editContent };
      }
      return t;
    });
    setTemplateList(updated);
    onSaveTemplates(updated);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (templateList.length <= 1) {
      alert('You must keep at least one template.');
      return;
    }
    const updated = templateList.filter(t => t.id !== id);
    setTemplateList(updated);
    onSaveTemplates(updated);
    if (activeTemplateId === id) {
      onSelectTemplate(updated[0].id);
    }
  };

  const handleSaveLinks = () => {
    const newCfg = { ...config, myAppLink, myGroupLink };
    onSaveConfig(newCfg);
  };

  // Preview formatting helper
  const getPreviewText = (raw: string) => {
    return raw
      .replace(/{author}/g, 'dev_user')
      .replace(/{my_app_link}/g, myAppLink || '[YOUR_APP_LINK]')
      .replace(/{my_group_link}/g, myGroupLink || '[YOUR_GROUP_LINK]');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <h2 className="modal-title">✉️ Quick Reply Templates & Links</h2>
          <button className="btn btn-secondary btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Global Links Settings */}
        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Link size={15} /> Your App & Group Links (Auto-inserted into variables)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Google Play Web Opt-In Link ({`{my_app_link}`})</label>
              <input 
                type="text" 
                className="form-input"
                value={myAppLink}
                onChange={(e) => setMyAppLink(e.target.value)}
                placeholder="https://play.google.com/apps/testing/com.yourapp"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Google Group Link ({`{my_group_link}`})</label>
              <input 
                type="text" 
                className="form-input"
                value={myGroupLink}
                onChange={(e) => setMyGroupLink(e.target.value)}
                placeholder="https://groups.google.com/g/your-testers"
              />
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleSaveLinks} style={{ marginTop: '0.75rem' }}>
            <Save size={14} /> Save Links
          </button>
        </div>

        {/* Template Selector & Manager */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select Active Template for 1-Click Reply:</h4>
            <button className="btn btn-primary btn-sm" onClick={handleCreateNew}>
              <Plus size={14} /> New Template
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {templateList.map(t => {
              const isActive = t.id === activeTemplateId;
              const isEditing = t.id === editingId;

              return (
                <div 
                  key={t.id}
                  style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                    border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem'
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Template Name"
                      />
                      <textarea 
                        className="form-textarea" 
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Template message body with {author}, {my_app_link}, {my_group_link}"
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                        <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                          <Save size={14} /> Save Template
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="radio" 
                            name="active_tmpl"
                            checked={isActive}
                            onChange={() => onSelectTemplate(t.id)}
                            style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                          />
                          <strong style={{ fontSize: '0.925rem', color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                            {t.name}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button className="btn btn-secondary btn-icon-only btn-sm" onClick={() => handleStartEdit(t)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-secondary btn-icon-only btn-sm" onClick={() => handleDelete(t.id)}>
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', background: 'var(--bg-dark)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                        {getPreviewText(t.content)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
