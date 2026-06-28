import React, { useState } from 'react';
import { portfolioService } from '../services/supabase';
import PortfolioView from './PortfolioView';

export default function EditorDashboard({ data, onSave, onClose }) {
  const [editedData, setEditedData] = useState(JSON.parse(JSON.stringify(data)));
  const [activeTab, setActiveTab] = useState('about');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const tabs = [
    { id: 'about', label: 'About', icon: 'fa-regular fa-user' },
    { id: 'education', label: 'Education', icon: 'fa-solid fa-graduation-cap' },
    { id: 'skills', label: 'Skills', icon: 'fa-solid fa-code' },
    { id: 'certificates', label: 'Certificates', icon: 'fa-regular fa-newspaper' },
    { id: 'projects', label: 'Projects', icon: 'fa-solid fa-laptop-code' },
    { id: 'experience', label: 'Experience', icon: 'fa-solid fa-briefcase' },
    { id: 'contact', label: 'Contact', icon: 'fa-regular fa-envelope' },
  ];

  const handleInputChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };


  // List manipulation helpers
  const handleAddItem = (section, template) => {
    const newItem = { id: `${section}-${Date.now()}`, ...template };
    setEditedData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem]
    }));
  };

  const handleListItemChange = (section, index, field, value) => {
    setEditedData(prev => {
      const list = [...prev[section]];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [section]: list };
    });
  };

  const handleRemoveItem = (section, index) => {
    setEditedData(prev => {
      const list = [...prev[section]];
      list.splice(index, 1);
      return { ...prev, [section]: list };
    });
  };

  const handleMoveItem = (section, index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= editedData[section].length) return;

    setEditedData(prev => {
      const list = [...prev[section]];
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, [section]: list };
    });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onSave(editedData);
      alert("Portfolio published successfully!");
    } catch (err) {
      alert("Failed to publish: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="editor-container">
      {/* Editor Sidebar */}
      <aside className="editor-sidebar">
        <div className="editor-logo-section">
          <h2>FlowCV <span>Editor</span></h2>
        </div>
        <ul className="editor-tabs">
          {tabs.map(tab => (
            <li key={tab.id}>
              <button 
                className={`editor-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`${tab.icon} tab-icon`}></i>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="editor-footer-actions">
          <button 
            className="btn btn-outline btn-preview-toggle"
            onClick={() => setShowPreview(true)}
            style={{ marginBottom: '0.4rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            <i className="fa-regular fa-eye"></i> Preview Portfolio
          </button>
          <button 
            className="btn btn-primary btn-publish"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
            Publish
          </button>
          <button className="btn btn-outline btn-close-editor" onClick={onClose}>
            Back to View
          </button>
        </div>
      </aside>

      {/* Editor Content Forms */}
      <main className="editor-content-panel">
        <div className="form-wrapper">
          <h2 className="editor-section-title">Edit {tabs.find(t => t.id === activeTab)?.label}</h2>
          
          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="editor-form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={editedData.about.name || ''} 
                onChange={e => handleInputChange('about', 'name', e.target.value)} 
              />

              <label>Hero Subtitle</label>
              <input 
                type="text" 
                value={editedData.about.subtitle || ''} 
                onChange={e => handleInputChange('about', 'subtitle', e.target.value)} 
              />

              <label>Biography</label>
              <textarea 
                rows="6"
                value={editedData.about.bio || ''} 
                onChange={e => handleInputChange('about', 'bio', e.target.value)}
              />

              <div className="file-upload-row">
                <div className="file-upload-col">
                  <label>Profile Picture Path or URL</label>
                  <input 
                    type="text" 
                    value={editedData.about.photoUrl || ''} 
                    onChange={e => handleInputChange('about', 'photoUrl', e.target.value)} 
                    placeholder="photo.jpg"
                  />
                </div>
                <div className="file-upload-col">
                  <label>Resume Link (Google Drive, etc.)</label>
                  <input 
                    type="text" 
                    value={editedData.about.resumeUrl || ''} 
                    onChange={e => handleInputChange('about', 'resumeUrl', e.target.value)} 
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>

              <div className="checkbox-row">
                <input 
                  type="checkbox" 
                  id="avail-check"
                  checked={editedData.about.isAvailable || false} 
                  onChange={e => handleInputChange('about', 'isAvailable', e.target.checked)} 
                />
                <label htmlFor="avail-check">Available for Internships</label>
              </div>
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === 'education' && (
            <div className="editor-list-form">
              {editedData.education.map((item, idx) => (
                <div className="list-editor-card" key={item.id}>
                  <div className="card-controls">
                    <span className="card-index-label">Education #{idx + 1}</span>
                    <div className="control-btn-group">
                      <button disabled={idx === 0} onClick={() => handleMoveItem('education', idx, -1)}><i className="fa-solid fa-arrow-up"></i></button>
                      <button disabled={idx === editedData.education.length - 1} onClick={() => handleMoveItem('education', idx, 1)}><i className="fa-solid fa-arrow-down"></i></button>
                      <button className="btn-delete" onClick={() => handleRemoveItem('education', idx)}><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                  <div className="editor-form-grid">
                    <div>
                      <label>Degree / Qualification</label>
                      <input 
                        type="text" 
                        value={item.degree || ''} 
                        onChange={e => handleListItemChange('education', idx, 'degree', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>School / College Name & Dates</label>
                      <input 
                        type="text" 
                        value={item.institution || ''} 
                        onChange={e => handleListItemChange('education', idx, 'institution', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Grade / CGPA (Optional)</label>
                      <input 
                        type="text" 
                        value={item.grade || ''} 
                        onChange={e => handleListItemChange('education', idx, 'grade', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                className="btn btn-outline btn-add-item" 
                onClick={() => handleAddItem('education', { degree: '', institution: '', grade: '' })}
              >
                + Add Education
              </button>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="editor-list-form">
              {editedData.skills.map((item, idx) => (
                <div className="list-editor-card" key={item.id}>
                  <div className="card-controls">
                    <span className="card-index-label">Skill Group #{idx + 1}</span>
                    <div className="control-btn-group">
                      <button disabled={idx === 0} onClick={() => handleMoveItem('skills', idx, -1)}><i className="fa-solid fa-arrow-up"></i></button>
                      <button disabled={idx === editedData.skills.length - 1} onClick={() => handleMoveItem('skills', idx, 1)}><i className="fa-solid fa-arrow-down"></i></button>
                      <button className="btn-delete" onClick={() => handleRemoveItem('skills', idx)}><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                  <label>Skill Category Title</label>
                  <input 
                    type="text" 
                    value={item.category || ''} 
                    onChange={e => handleListItemChange('skills', idx, 'category', e.target.value)}
                  />
                  <label>Skill Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={item.items ? item.items.join(', ') : ''} 
                    onChange={e => handleListItemChange('skills', idx, 'items', e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>
              ))}
              <button 
                className="btn btn-outline btn-add-item" 
                onClick={() => handleAddItem('skills', { category: '', items: [] })}
              >
                + Add Skill Group
              </button>
            </div>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === 'certificates' && (
            <div className="editor-list-form">
              {editedData.certificates.map((item, idx) => (
                <div className="list-editor-card" key={item.id}>
                  <div className="card-controls">
                    <span className="card-index-label">Certificate #{idx + 1}</span>
                    <div className="control-btn-group">
                      <button disabled={idx === 0} onClick={() => handleMoveItem('certificates', idx, -1)}><i className="fa-solid fa-arrow-up"></i></button>
                      <button disabled={idx === editedData.certificates.length - 1} onClick={() => handleMoveItem('certificates', idx, 1)}><i className="fa-solid fa-arrow-down"></i></button>
                      <button className="btn-delete" onClick={() => handleRemoveItem('certificates', idx)}><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                  <div className="editor-form-grid">
                    <div>
                      <label>Certificate Title</label>
                      <input 
                        type="text" 
                        value={item.title || ''} 
                        onChange={e => handleListItemChange('certificates', idx, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Issuer / Body</label>
                      <input 
                        type="text" 
                        value={item.issuer || ''} 
                        onChange={e => handleListItemChange('certificates', idx, 'issuer', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Date Earned</label>
                      <input 
                        type="text" 
                        value={item.date || ''} 
                        onChange={e => handleListItemChange('certificates', idx, 'date', e.target.value)}
                        placeholder="Nov 2025"
                      />
                    </div>
                    <div>
                      <label>Verification Link URL</label>
                      <input 
                        type="text" 
                        value={item.url || ''} 
                        onChange={e => handleListItemChange('certificates', idx, 'url', e.target.value)}
                      />
                    </div>
                    <div className="full-width-field">
                      <label>Description / Details</label>
                      <textarea 
                        rows="3"
                        value={item.description || ''} 
                        onChange={e => handleListItemChange('certificates', idx, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                className="btn btn-outline btn-add-item" 
                onClick={() => handleAddItem('certificates', { title: '', issuer: '', date: '', description: '', url: '' })}
              >
                + Add Certificate
              </button>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="editor-list-form">
              {editedData.projects.map((item, idx) => (
                <div className="list-editor-card" key={item.id}>
                  <div className="card-controls">
                    <span className="card-index-label">Project #{idx + 1}</span>
                    <div className="control-btn-group">
                      <button disabled={idx === 0} onClick={() => handleMoveItem('projects', idx, -1)}><i className="fa-solid fa-arrow-up"></i></button>
                      <button disabled={idx === editedData.projects.length - 1} onClick={() => handleMoveItem('projects', idx, 1)}><i className="fa-solid fa-arrow-down"></i></button>
                      <button className="btn-delete" onClick={() => handleRemoveItem('projects', idx)}><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                  <div className="editor-form-grid">
                    <div>
                      <label>Project Title</label>
                      <input 
                        type="text" 
                        value={item.title || ''} 
                        onChange={e => handleListItemChange('projects', idx, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Project Date</label>
                      <input 
                        type="text" 
                        value={item.date || ''} 
                        onChange={e => handleListItemChange('projects', idx, 'date', e.target.value)}
                      />
                    </div>
                    <div className="full-width-field">
                      <label>Technology Tags (comma separated)</label>
                      <input 
                        type="text" 
                        value={item.tags ? item.tags.join(', ') : ''} 
                        onChange={e => handleListItemChange('projects', idx, 'tags', e.target.value.split(',').map(s => s.trim()))}
                      />
                    </div>
                    <div className="full-width-field">
                      <label>Description</label>
                      <textarea 
                        rows="4"
                        value={item.description || ''} 
                        onChange={e => handleListItemChange('projects', idx, 'description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>GitHub Repository URL</label>
                      <input 
                        type="text" 
                        value={item.githubUrl || ''} 
                        onChange={e => handleListItemChange('projects', idx, 'githubUrl', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Live App Demo URL</label>
                      <input 
                        type="text" 
                        value={item.liveUrl || ''} 
                        onChange={e => handleListItemChange('projects', idx, 'liveUrl', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                className="btn btn-outline btn-add-item" 
                onClick={() => handleAddItem('projects', { title: '', date: '', tags: [], description: '', githubUrl: '', liveUrl: '' })}
              >
                + Add Project
              </button>
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="editor-list-form">
              {editedData.experience.map((item, idx) => (
                <div className="list-editor-card" key={item.id}>
                  <div className="card-controls">
                    <span className="card-index-label">Experience #{idx + 1}</span>
                    <div className="control-btn-group">
                      <button disabled={idx === 0} onClick={() => handleMoveItem('experience', idx, -1)}><i className="fa-solid fa-arrow-up"></i></button>
                      <button disabled={idx === editedData.experience.length - 1} onClick={() => handleMoveItem('experience', idx, 1)}><i className="fa-solid fa-arrow-down"></i></button>
                      <button className="btn-delete" onClick={() => handleRemoveItem('experience', idx)}><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                  <div className="editor-form-grid">
                    <div>
                      <label>Role / Job Title</label>
                      <input 
                        type="text" 
                        value={item.role || ''} 
                        onChange={e => handleListItemChange('experience', idx, 'role', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Experience Date / Period</label>
                      <input 
                        type="text" 
                        value={item.date || ''} 
                        onChange={e => handleListItemChange('experience', idx, 'date', e.target.value)}
                      />
                    </div>
                    <div className="full-width-field">
                      <label>Description Details</label>
                      <textarea 
                        rows="4"
                        value={item.description || ''} 
                        onChange={e => handleListItemChange('experience', idx, 'description', e.target.value)}
                      />
                    </div>
                    <div className="full-width-field">
                      <label>Workshop / Certificate URL</label>
                      <input 
                        type="text" 
                        value={item.certificateUrl || ''} 
                        onChange={e => handleListItemChange('experience', idx, 'certificateUrl', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                className="btn btn-outline btn-add-item" 
                onClick={() => handleAddItem('experience', { role: '', date: '', description: '', certificateUrl: '' })}
              >
                + Add Experience
              </button>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="editor-form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={editedData.contact.email || ''} 
                onChange={e => handleInputChange('contact', 'email', e.target.value)} 
              />

              <label>Phone Number</label>
              <input 
                type="text" 
                value={editedData.contact.phone || ''} 
                onChange={e => handleInputChange('contact', 'phone', e.target.value)} 
              />

              <label>LinkedIn Username</label>
              <input 
                type="text" 
                value={editedData.contact.linkedin || ''} 
                onChange={e => handleInputChange('contact', 'linkedin', e.target.value)} 
              />

              <label>GitHub Username</label>
              <input 
                type="text" 
                value={editedData.contact.github || ''} 
                onChange={e => handleInputChange('contact', 'github', e.target.value)} 
              />
            </div>
          )}

        </div>
      </main>

      {showPreview && (
        <div className="preview-modal-overlay">
          <button className="btn-close-preview-floating" onClick={() => setShowPreview(false)}>
            <i className="fa-solid fa-xmark"></i> Close Preview
          </button>
          <PortfolioView data={editedData} isAdmin={false} />
        </div>
      )}
    </div>
  );
}
