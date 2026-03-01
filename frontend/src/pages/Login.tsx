import { useState } from 'react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'openclaw') {
      localStorage.setItem('logged_in', 'true');
      onLogin();
    } else {
      setError('密码错误，请重试');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'var(--bg-primary)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
      <div className="glass-card p-10 w-full max-w-md text-center">
        {/* Logo */}
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
          style={{
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            boxShadow: '0 0 40px var(--primary-glow)'
          }}
        >
          <span className="text-4xl">⚡</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          OpenClaw Console
        </h1>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          可视化管理后台
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入访问密码"
            className="input-glass text-center"
            style={{ padding: '16px' }}
          />
          {error && <p style={{ color: 'var(--error)' }}>{error}</p>}
          <button
            type="submit"
            className="btn-glow w-full py-4 text-lg"
          >
            进入控制台
          </button>
        </form>
      </div>
    </div>
  );
}
