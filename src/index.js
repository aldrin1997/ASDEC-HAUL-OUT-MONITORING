import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Admin from './Admin';
import './App.css'; 
import logo from './LOGO.png'; 
import { Lock, User, Settings, Camera, X } from 'lucide-react';

const Login = ({ onLogin, onOpenAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  // Facial Recognition States
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);

  const startCamera = async () => {
    setShowFaceLogin(true);
    setIsScanning(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate scanning process
      setTimeout(() => {
        handleFaceMatch();
      }, 3000);
    } catch (err) {
      setError("Cannot access camera. Please check permissions.");
      setShowFaceLogin(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowFaceLogin(false);
    setIsScanning(false);
  };

  const handleFaceMatch = () => {
    const storedUsers = JSON.parse(localStorage.getItem('asdec_users')) || [];
    
    // Looks for a user that has facial data registered from Admin tools
    const authenticatedUser = storedUsers.find(u => u.hasFaceData === true);

    if (authenticatedUser) {
      stopCamera();
      onLogin(authenticatedUser);
    } else {
      setIsScanning(false);
      setError("Face not recognized. Please use manual login or register face in Admin.");
      setTimeout(stopCamera, 2000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('asdec_users')) || [];
    let authenticatedUser = null;

    if (username === 'admin' && password === 'asdec2026') {
      authenticatedUser = { name: 'Super Admin', role: 'System Administrator' };
    } else {
      authenticatedUser = storedUsers.find(u => u.username === username && u.password === password);
    }

    if (authenticatedUser) {
      if (rememberMe) {
        localStorage.setItem('asdec_session', JSON.stringify(authenticatedUser));
      }
      onLogin(authenticatedUser);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="ASDEC" className="login-logo" />
        <h2>ASDEC BUILDERS</h2>
        
        {!showFaceLogin ? (
          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <User size={18} className="login-icon" />
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="login-input-group">
              <Lock size={18} className="login-icon" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <div className="remember-me-container">
              <label className="checkbox-label">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span>Remember Me</span>
              </label>
            </div>

            {error && <p className="error-text">{error}</p>}
            
            <button type="submit" className="login-btn">LOGIN</button>
            
            <div className="divider" style={{textAlign: 'center', margin: '15px 0', color: '#94a3b8', fontSize: '0.8rem'}}>OR</div>
            
            <button type="button" className="face-login-btn" onClick={startCamera} style={{width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer'}}>
              <Camera size={18} /> Login with Face ID
            </button>
          </form>
        ) : (
          <div className="face-scan-container" style={{textAlign: 'center'}}>
            <div className="video-wrapper" style={{width: '200px', height: '200px', margin: '0 auto 15px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #3b82f6'}}>
              <video ref={videoRef} autoPlay muted playsInline style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <p>{isScanning ? "Scanning Face..." : "Processing..."}</p>
            <button type="button" onClick={stopCamera} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: '10px auto'}}>
              <X size={18} /> Cancel
            </button>
          </div>
        )}

        <button className="admin-access-link" onClick={onOpenAdmin}>
          <Settings size={14} /> Admin Tools
        </button>
      </div>
    </div>
  );
};

const Root = () => {
  const [view, setView] = useState('loading'); 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('asdec_session');
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
        setView('app');
      } catch (e) {
        localStorage.removeItem('asdec_session');
        setView('login');
      }
    } else {
      setView('login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('asdec_session'); 
    setUser(null);
    setView('login');
  };

  if (view === 'loading') return <div className="loading-screen">Checking session...</div>;
  if (view === 'admin') return <Admin onBack={() => setView('login')} />;
  if (view === 'app') return <App user={user} onLogout={handleLogout} />;

  return (
    <Login 
      onLogin={(u) => { setUser(u); setView('app'); }} 
      onOpenAdmin={() => setView('admin')} 
    />
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<Root />);