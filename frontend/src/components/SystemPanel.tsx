import { useState, useEffect } from 'react';

export default function SystemPanel() {
  const [status, setStatus] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [sysRes, healthRes] = await Promise.all([
        fetch('/api/system/status'),
        fetch('/api/health')
      ]);
      const sysData = await sysRes.json();
      const healthData = await healthRes.json();
      if (sysData.success) setStatus(sysData.data);
      setHealth(healthData.success);
    } catch (e) {}
    setLoading(false);
  };

  if (loading && !status) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      {/* 健康状态 */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: health ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
            {health ? '✅' : '❌'}
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {health ? '服务正常' : '服务异常'}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              OpenClaw 运行中
            </p>
          </div>
        </div>
        <button onClick={loadStatus} className="btn-glow">🔄 检查</button>
      </div>

      {/* 系统信息 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-4">
          <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>CPU</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{status?.cpu_percent || 0}%</div>
          {status?.load_avg && (
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              负载: {status.load_avg['1min']} / {status.load_avg['5min']} / {status.load_avg['15min']}
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>内存</div>
          <div className="text-2xl font-bold" style={{ color: status?.memory?.percent > 80 ? 'var(--error)' : 'var(--accent)' }}>
            {status?.memory?.percent || 0}%
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {status?.memory?.used_mb}MB / {status?.memory?.total_mb}MB
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>磁盘</div>
          <div className="text-2xl font-bold" style={{ color: status?.disk?.percent?.includes('8') ? 'var(--error)' : 'var(--accent)' }}>
            {status?.disk?.percent || '0%'}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {status?.disk?.used} / {status?.disk?.total}
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>运行时间</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{status?.uptime || '未知'}</div>
        </div>
      </div>
    </div>
  );
}
