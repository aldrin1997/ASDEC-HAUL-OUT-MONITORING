import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Admin from './Admin';
import './App.css'; 
import logo from './LOGO.png'; 
import { Lock, User, Settings, Camera, X, RefreshCw } from 'lucide-react';

const Login = ({ onLogin, onOpenAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  // Facial Recognition States
  // showFaceLogin is true by default to hide the manual form initially
  const [showFaceLogin, setShowFaceLogin] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const videoRef = useRef(null);

  // Automatically trigger camera on component mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setShowFaceLogin(true);
    setIsScanning(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate the scan process
      setTimeout(() => {
        handleFaceMatch();
      }, 3000);
    } catch (err) {
      setError("Camera access denied. Switching to manual login.");
      setShowFaceLogin(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const handleFaceMatch = () => {
    const storedUsers = JSON.parse(localStorage.getItem('asdec_users')) || [];
    const authenticatedUser = storedUsers.find(u => u.hasFaceData === true);

    if (authenticatedUser) {
      stopCamera();
      onLogin(authenticatedUser);
    } else {
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      
      if (nextAttempt >= 3) {
        // After 3 attempts, hide face scan and show the login form
        setError("Face not recognized. Please login manually.");
        stopCamera();
        setShowFaceLogin(false);
      } else {
        setError(`Attempt ${nextAttempt} failed. Retrying...`);
        // Loop the scan again
        setTimeout(startCamera, 1500);
      }
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
        
        {showFaceLogin ? (
          /* ONLY Face Recognition shows initially */
          <div className="face-scan-container" style={{textAlign: 'center'}}>
            <div className="video-wrapper" style={{
              width: '220px', 
              height: '220px', 
              margin: '0 auto 20px', 
              borderRadius: '50%', 
              overflow: 'hidden', 
              border: '4px solid #3b82f6',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
            }}>
              <video ref={videoRef} autoPlay muted playsInline style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <p style={{fontWeight: '600'}}>{isScanning ? "Scanning Face..." : "Verifying..."}</p>
            {error && <p className="error-text" style={{fontSize: '0.8rem', color: '#ef4444'}}>{error}</p>}
            
            <button 
              type="button" 
              onClick={() => { stopCamera(); setShowFaceLogin(false); }} 
              style={{marginTop: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem'}}
            >
              Cancel and use Password
            </button>
          </div>
        ) : (
          /* Username/Password Form - Hidden until face scan fails or is canceled */
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
            
            <button type="button" className="face-login-btn" onClick={() => { setAttempts(0); startCamera(); }} style={{width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer'}}>
              <RefreshCw size={18} /> Retry Face ID
            </button>
          </form>
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