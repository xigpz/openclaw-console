import { useState, useEffect } from 'react';

interface VersionInfo {
  current: string;
  latest: string;
  update_available: boolean;
}

export default function UpdatePanel() {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadVersion();
  }, []);

  const loadVersion = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/openclaw/version');
      const data = await res.json();
      if (data.success) {
        setVersion(data.data);
      }
    } catch (e) {
      console.error('Failed to load version:', e);
    }
    setLoading(false);
  };

  const doUpdate = async () => {
    if (!confirm('确定要更新 OpenClaw 吗？')) return;
    
    setUpdating(true);
    try {
      const res = await fetch('/api/openclaw/update', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('更新成功！\n' + data.data);
        loadVersion();
      } else {
        alert('更新失败: ' + data.message);
      }
    } catch (e) {
      alert('请求失败');
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        🔄 系统更新
      </h2>

      {/* 版本信息卡片 */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                boxShadow: '0 0 30px var(--primary-glow)'
              }}
            >
              🦞
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                OpenClaw
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                当前版本: <span className="font-mono">{version?.current || '未知'}</span>
              </div>
            </div>
          </div>

          {!version?.update_available && (
            <span className="tag tag-success">已是最新</span>
          )}
        </div>
      </div>

      {/* 版本详情 */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          版本详情
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>当前版本</span>
            <span className="font-mono">{version?.current || '未知'}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>最新版本</span>
            <span className="font-mono">{version?.latest || '未知'}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>状态</span>
            <span style={{ color: version?.update_available ? 'var(--warning)' : 'var(--success)' }}>
              {version?.update_available ? '有可用更新' : '已是最新版本'}
            </span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <button onClick={loadVersion} className="btn-glow">
          🔍 检查更新
        </button>
        {version?.update_available && (
          <button 
            onClick={doUpdate} 
            disabled={updating}
            className="btn-glow"
          >
            {updating ? '更新中...' : '🚀 立即更新'}
          </button>
        )}
      </div>
    </div>
  );
}
