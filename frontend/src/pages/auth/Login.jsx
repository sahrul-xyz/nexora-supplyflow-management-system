import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sneaker, LockKey, Envelope, ArrowRight, ShieldCheck, Factory, Truck } from '@phosphor-icons/react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: '#f4f6fa' }}>
      <div className="card-nexora p-4 p-md-5" style={{ maxWidth: '440px', width: '100%', background: '#ffffff', borderRadius: '24px' }}>
        {/* Brand Icon & Heading */}
        <div className="text-center mb-4">
          <div 
            className="d-inline-flex align-items-center justify-content-center text-white rounded-4 shadow-sm mb-3"
            style={{ 
              width: '56px', 
              height: '56px', 
              background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)' 
            }}
          >
            <Sneaker size={32} weight="bold" />
          </div>
          <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.03em' }}>Nexora SupplyFlow</h3>
          <p className="text-muted small">Modern B2B Supply Chain & Manufacturing SaaS</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Pengguna</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '12px 0 0 12px' }}>
                <Envelope size={18} />
              </span>
              <input 
                type="email" 
                className="form-control border-start-0 ps-0" 
                style={{ borderRadius: '0 12px 12px 0' }}
                placeholder="nama@supplyflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Kata Sandi</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '12px 0 0 12px' }}>
                <LockKey size={18} />
              </span>
              <input 
                type="password" 
                className="form-control border-start-0 ps-0" 
                style={{ borderRadius: '0 12px 12px 0' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 py-2 justify-content-center shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={18} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-4 pt-3 border-top">
          <div className="text-center text-muted small fw-semibold mb-2" style={{ fontSize: '0.725rem', letterSpacing: '0.05em' }}>
            DEMO AKUN CEPAT (1-KLIK)
          </div>
          <div className="d-flex flex-column gap-2">
            <button 
              type="button" 
              className="btn btn-light border btn-sm justify-content-start text-start py-2 px-3 rounded-3"
              onClick={() => setDemoAccount('admin@supplyflow.com')}
            >
              <ShieldCheck size={18} className="text-primary me-2" weight="duotone" />
              <div className="lh-1">
                <div className="fw-bold small text-dark">Super Admin</div>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>admin@supplyflow.com</small>
              </div>
            </button>
            <button 
              type="button" 
              className="btn btn-light border btn-sm justify-content-start text-start py-2 px-3 rounded-3"
              onClick={() => setDemoAccount('supplychain@supplyflow.com')}
            >
              <Truck size={18} className="text-info me-2" weight="duotone" />
              <div className="lh-1">
                <div className="fw-bold small text-dark">Staf Supply Chain</div>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>supplychain@supplyflow.com</small>
              </div>
            </button>
            <button 
              type="button" 
              className="btn btn-light border btn-sm justify-content-start text-start py-2 px-3 rounded-3"
              onClick={() => setDemoAccount('production@supplyflow.com')}
            >
              <Factory size={18} className="text-warning me-2" weight="duotone" />
              <div className="lh-1">
                <div className="fw-bold small text-dark">Staf Produksi (QC & Planning)</div>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>production@supplyflow.com</small>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
