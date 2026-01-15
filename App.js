import React, { useState, useRef } from 'react';
import './App.css'; 
import logo from './LOGO.png'; 
import { Calendar, Camera, Plus, Trash2, Building2, User, LogOut, History, ArrowLeft, Download } from 'lucide-react';

function App({ user, onLogout }) {
  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState('form'); 
  const [submittedReports, setSubmittedReports] = useState([]); 
  
  const [entries, setEntries] = useState([
    { 
      id: Date.now(), 
      name: '', plate: '', length: 0, width: 0, height: 0, 
      timeIn: '', timeOut: '',
      images: { entry: null, loading: null, load: null, exit: null } 
    }
  ]);
  
  const fileInputRef = useRef(null);
  const [activeCapture, setActiveCapture] = useState({ id: null, type: null });

  // ... (getLocation and applyWatermark functions remain the same)
  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("GPS Not Supported");
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve(`LAT: ${latitude.toFixed(5)} LONG: ${longitude.toFixed(5)}`);
          },
          () => resolve("Location Denied"),
          { enableHighAccuracy: true, timeout: 7000 }
        );
      }
    });
  };

  const applyWatermark = async (file, timestamp, location) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const fontSize = Math.floor(canvas.width * 0.035); 
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, canvas.height - (fontSize * 3.5), canvas.width, fontSize * 3.5);
          ctx.fillStyle = 'white';
          ctx.fillText(`📅 ${timestamp}`, 20, canvas.height - (fontSize * 2));
          ctx.fillText(`📍 ${location}`, 20, canvas.height - (fontSize * 0.6));
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleInputChange = (id, field, value) => {
    setEntries(prevEntries => 
      prevEntries.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + 
           now.getMinutes().toString().padStart(2, '0');
  };

  const triggerCamera = (id, type) => {
    setActiveCapture({ id, type });
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (file && activeCapture.id) {
      const timestamp = new Date().toLocaleString();
      const location = await getLocation(); 
      const watermarkedImageUrl = await applyWatermark(file, timestamp, location);
      setEntries(prevEntries => prevEntries.map(entry => {
        if (entry.id === activeCapture.id) {
          const updatedImages = { ...entry.images, [activeCapture.type]: watermarkedImageUrl };
          let updatedTime = {};
          if (activeCapture.type === 'entry') updatedTime = { timeIn: getCurrentTime() };
          if (activeCapture.type === 'exit') updatedTime = { timeOut: getCurrentTime() };
          return { ...entry, ...updatedTime, images: updatedImages };
        }
        return entry;
      }));
    }
    e.target.value = '';
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { 
      id: Date.now(), name: '', plate: '', length: 0, width: 0, height: 0, 
      timeIn: '', timeOut: '', 
      images: { entry: null, loading: null, load: null, exit: null } 
    }]);
  };

  const removeEntry = (id) => {
    if (entries.length > 1) setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleSubmitReport = async () => {
    if (!projectName.trim()) {
      alert("Please enter a Project Name.");
      return;
    }
    setIsSubmitting(true);
    const newReport = {
      reportId: `REP-${Date.now()}`,
      project: projectName,
      submittedBy: user.name,
      timestamp: new Date().toLocaleString(),
      entries: entries.map(e => ({
        ...e,
        totalCbm: (e.length * e.width * e.height).toFixed(3)
      }))
    };
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmittedReports(prev => [newReport, ...prev]);
      alert("Report Submitted Successfully!");
      setProjectName('');
      setEntries([{ 
        id: Date.now(), name: '', plate: '', length: 0, width: 0, height: 0, 
        timeIn: '', timeOut: '', 
        images: { entry: null, loading: null, load: null, exit: null } 
      }]);
    } catch (error) {
      alert("Error submitting report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="profile-bar">
        <div className="profile-info">
          {/* UPDATED: Profile Image logic */}
          <div className="avatar" style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            background: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #3b82f6'
          }}>
            {user.faceId ? (
              <img 
                src={user.faceId} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <User size={20} color="#64748b" />
            )}
          </div>
          <div className="user-details">
            <span className="user-name" style={{ fontWeight: 'bold' }}>{user.name}</span>
            <span className="user-role" style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.role}</span>
          </div>
        </div>
        <div className="profile-actions" style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="history-btn" 
            onClick={() => setView(view === 'form' ? 'history' : 'form')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
          >
            {view === 'form' ? <><History size={16} /> History</> : <><ArrowLeft size={16} /> Back</>}
          </button>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} ref={fileInputRef} onChange={handleCapture} />

      {/* ... (Rest of the component: header, form, and history remain the same) */}
      {view === 'form' ? (
        <>
          <header className="main-header">
            <div className="header-left">
              <img src={logo} alt="ASDEC Logo" className="company-logo-vertical" />
              <div className="title-group">
                <h1 className="company-name">ASDEC BUILDERS CORP</h1>
                <p className="app-subtitle">AUTO-TIME HAULING MONITOR</p>
              </div>
            </div>
            <div className="header-right">
              <div className="project-container">
                <Building2 size={16} className="icon-blue" />
                <input 
                  type="text" 
                  placeholder="Project Name" 
                  className="project-field" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                />
              </div>
              <div className="date-display-small">
                <span>01/15/2026</span>
                <Calendar size={14} />
              </div>
            </div>
          </header>

          <div className="form-card">
            <div className="description-header desktop-only">
              <span>HAULER NAME</span><span>PLATE NO.</span><span>LENGTH</span><span>WIDTH</span><span>HEIGHT</span><span className="text-red">TOTAL CBM</span><span>TIME IN / OUT</span><span>ATTACHMENTS</span><span></span>
            </div>

            {entries.map((entry) => {
              const totalCbm = (entry.length * entry.width * entry.height).toFixed(3);
              return (
                <div key={entry.id} className="entry-row">
                  <div className="input-wrapper" data-label="HAULER NAME">
                    <input type="text" placeholder="Name" className="input-field" value={entry.name} onChange={(e) => handleInputChange(entry.id, 'name', e.target.value)} />
                  </div>
                  <div className="input-wrapper" data-label="PLATE NO.">
                    <input type="text" placeholder="Plate No." className="input-field" value={entry.plate} onChange={(e) => handleInputChange(entry.id, 'plate', e.target.value)} />
                  </div>
                  <div className="input-wrapper" data-label="LENGTH">
                    <input type="number" placeholder="L" className="input-num" value={entry.length || ''} onChange={(e) => handleInputChange(entry.id, 'length', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="input-wrapper" data-label="WIDTH">
                    <input type="number" placeholder="W" className="input-num" value={entry.width || ''} onChange={(e) => handleInputChange(entry.id, 'width', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="input-wrapper" data-label="HEIGHT">
                    <input type="number" placeholder="H" className="input-num" value={entry.height || ''} onChange={(e) => handleInputChange(entry.id, 'height', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="input-wrapper" data-label="TOTAL CBM"><div className="total-value">{totalCbm}</div></div>
                  <div className="input-wrapper" data-label="TIME IN/OUT">
                    <div className="time-section">
                      <input type="time" className="time-input" value={entry.timeIn} readOnly />
                      <input type="time" className="time-input" value={entry.timeOut} readOnly />
                    </div>
                  </div>
                  <div className="input-wrapper" data-label="ATTACHMENTS">
                    <div className="photo-grid">
                      {['entry', 'loading', 'load', 'exit'].map((type) => (
                        <button key={type} className="photo-box-large preview-mode" onClick={() => triggerCamera(entry.id, type)}>
                          {entry.images[type] ? (
                            <img src={entry.images[type]} alt="preview" className="captured-preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                          ) : (
                            <><Camera size={18} /><span>{type.toUpperCase()}</span></>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="delete-btn" onClick={() => removeEntry(entry.id)}><Trash2 size={18} /></button>
                </div>
              );
            })}
            
            <button className="add-entry-btn" onClick={addEntry} style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontWeight: '600' }}>
              <Plus size={18} /> ADD NEW HAULER ROW
            </button>
          </div>

          <button className={`submit-btn ${isSubmitting ? 'submitting' : ''}`} onClick={handleSubmitReport} disabled={isSubmitting}>
            {isSubmitting ? 'UPLOADING...' : 'SUBMIT VERIFIED REPORT'}
          </button>
        </>
      ) : (
        <div className="history-section" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Submission History</h2>
            <button className="export-btn" style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} /> Export
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px' }}>Project</th>
                  <th style={{ padding: '12px' }}>Date/Time</th>
                  <th style={{ padding: '12px' }}>Hauler</th>
                  <th style={{ padding: '12px' }}>Plate No.</th>
                  <th style={{ padding: '12px' }}>Total CBM</th>
                  <th style={{ padding: '12px' }}>Time In</th>
                  <th style={{ padding: '12px' }}>Time Out</th>
                </tr>
              </thead>
              <tbody>
                {submittedReports.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No records yet.</td></tr>
                ) : (
                  submittedReports.map((report) => (
                    report.entries.map((entry, idx) => (
                      <tr key={`${report.reportId}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {idx === 0 ? (
                          <>
                            <td rowSpan={report.entries.length} style={{ padding: '12px', fontWeight: 'bold', verticalAlign: 'top' }}>{report.project}</td>
                            <td rowSpan={report.entries.length} style={{ padding: '12px', color: '#64748b', verticalAlign: 'top' }}>{report.timestamp}</td>
                          </>
                        ) : null}
                        <td style={{ padding: '12px' }}>{entry.name}</td>
                        <td style={{ padding: '12px' }}>{entry.plate}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#dc2626' }}>{entry.totalCbm}</td>
                        <td style={{ padding: '12px' }}>{entry.timeIn}</td>
                        <td style={{ padding: '12px' }}>{entry.timeOut}</td>
                      </tr>
                    ))
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;