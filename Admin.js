import React, { useState, useRef } from 'react';
import { UserPlus, Shield, Trash2, ArrowLeft, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

const Admin = ({ onBack }) => {
  // Initial state includes the 'project' field
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    password: '', 
    role: 'Field Staff',
    project: '' 
  });
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem('asdec_users')) || []);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera API not available. Ensure you are using HTTPS or localhost.");
      return;
    }
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setIsCapturing(false);
      setCameraError("Error: " + err.message);
    }
  };

  const captureFace = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setFaceDescriptor(imageData); // Captures actual image data for the profile
      stopCamera();
    }
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
    
    // Creates the new user object including the project and face data
    const newUser = { 
      ...formData, 
      id: Date.now(),
      hasFaceData: !!faceDescriptor,
      faceId: faceDescriptor 
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('asdec_users', JSON.stringify(updatedUsers)); // Saves to persistent storage
    
    // Resets the form including the project field
    setFormData({ name: '', username: '', password: '', role: 'Field Staff', project: '' });
    setFaceDescriptor(null);
    alert('User registered successfully!');
  };

  const deleteUser = (id) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem('asdec_users', JSON.stringify(updated));
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
            
            {/* Project Assignment Input Field */}
            <input 
              type="text" 
              placeholder="Assign Project Name (e.g., Site Alpha)" 
              value={formData.project} 
              onChange={e => setFormData({...formData, project: e.target.value})} 
              required 
            />

            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Field Staff">Field Staff</option>
              <option value="Project Supervisor">Project Supervisor</option>
              <option value="Admin">Admin</option>
            </select>

            <div className="face-reg-section" style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Facial ID Registration</label>
              
              {cameraError && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}><AlertCircle size={14} /> {cameraError}</div>}

              {!isCapturing && !faceDescriptor && (
                <button type="button" className="action-btn-outline" onClick={startCamera} style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
                  <Camera size={16} /> Setup Face
                </button>
              )}

              {isCapturing && (
                <div className="camera-preview-box">
                  <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: '6px' }} />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={captureFace} style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '4px' }}>Capture</button>
                    <button type="button" onClick={stopCamera} style={{ background: '#64748b', color: 'white', border: 'none', padding: '10px', borderRadius: '4px' }}><X size={18} /></button>
                  </div>
                </div>
              )}

              {faceDescriptor && (
                <div style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '10px', borderRadius: '6px' }}>
                  <CheckCircle size={18} /> Face Identity Ready
                  <button type="button" onClick={() => {setFaceDescriptor(null); startCamera();}} style={{ marginLeft: 'auto', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Retake</button>
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Complete Registration</button>
          </form>
        </section>

        <section className="admin-card">
          <h3><Shield size={18} /> Staff Directory</h3>
          <div className="user-list">
            {users.map(u => (
              <div key={u.id} className="user-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <strong style={{ display: 'block' }}>{u.name}</strong>
                  {/* Displays assigned project in the directory */}
                  <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 'bold', display: 'block' }}>
                    Project: {u.project || 'None Assigned'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.username} • {u.role}</span>
                </div>
                <button onClick={() => deleteUser(u.id)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;