import React, { useState, useRef } from 'react';
import { UserPlus, Shield, Trash2, ArrowLeft, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

const Admin = ({ onBack }) => {
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'Field Staff' });
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem('asdec_users')) || []);
  
  // Facial Registration States
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);

const startCamera = async () => {
  setCameraError('');
  
  // 1. Check if the browser supports the API at all
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setCameraError("Camera API not available. Ensure you are using HTTPS or localhost.");
    return;
  }

  setIsCapturing(true);

  try {
    const constraints = { 
      video: { 
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  } catch (err) {
    setIsCapturing(false);
    // 2. Specific error handling for permissions
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setCameraError("Access Denied. Please enable camera in browser settings.");
    } else {
      setCameraError("Error: " + err.message);
    }
  }
};
  const captureFace = () => {
    // Simulated face data storage
    setFaceDescriptor("SIMULATED_FACE_DATA_2026"); 
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    const newUser = { 
      ...formData, 
      id: Date.now(),
      hasFaceData: !!faceDescriptor,
      faceId: faceDescriptor 
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('asdec_users', JSON.stringify(updatedUsers)); //
    
    setFormData({ name: '', username: '', password: '', role: 'Field Staff' });
    setFaceDescriptor(null);
    alert('User registered successfully!');
  };

  const deleteUser = (id) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem('asdec_users', JSON.stringify(updated)); //
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Exit Admin</button>
        <h2>User Registration & Management</h2>
      </header>

      <div className="admin-grid">
        <section className="admin-card">
          <h3><UserPlus size={18} /> Add New Staff</h3>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Field Staff">Field Staff</option>
              <option value="Project Supervisor">Project Supervisor</option>
              <option value="Admin">Admin</option>
            </select>

            <div className="face-reg-section" style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#475569' }}>Facial ID Registration</label>
              
              {cameraError && (
                <div style={{ color: '#ef4444', background: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={14} /> {cameraError}
                </div>
              )}

              {!isCapturing && !faceDescriptor && (
                <button type="button" className="action-btn-outline" onClick={startCamera} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', background: 'white' }}>
                  <Camera size={16} /> Enable Camera & Setup Face
                </button>
              )}

              {isCapturing && (
                <div className="camera-preview-box">
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={captureFace} style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Capture Face Scan</button>
                    <button type="button" onClick={stopCamera} style={{ background: '#64748b', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}><X size={18} /></button>
                  </div>
                </div>
              )}

              {faceDescriptor && (
                <div style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', background: '#f0fdf4', padding: '10px', borderRadius: '6px' }}>
                  <CheckCircle size={18} /> Face Identity Ready
                  <button type="button" onClick={() => {setFaceDescriptor(null); startCamera();}} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#16a34a', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem' }}>Retake</button>
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Complete Registration</button>
          </form>
        </section>

        <section className="admin-card">
          <h3><Shield size={18} /> Staff Directory</h3>
          <div className="user-list">
            {users.map(u => (
              <div key={u.id} className="user-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <strong style={{ display: 'block' }}>{u.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.username} • {u.role}</span>
                  {u.hasFaceData && (
                    <span style={{ marginLeft: '8px', color: '#16a34a', fontSize: '0.75rem', fontWeight: 'bold', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>FACE ENABLED</span>
                  )}
                </div>
                <button onClick={() => deleteUser(u.id)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;