import { useState, useEffect } from 'react';

export default function SystemPanel() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      if (data.success) setStatus(data.data);
    } catch (e) {}
    setLoading(false);
  };

  if (loading || !status) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🖥️ 系统状态</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* CPU */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>CPU</h3>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>{status.cpu_percent || 0}%</div>
            {status.load_avg && (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div>1min: {status.load_avg['1min']}</div>
                <div>5min: {status.load_avg['5min']}</div>
                <div>15min: {status.load_avg['15min']}</div>
              </div>
            )}
          </div>
        </div>

        {/* 内存 */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>内存</h3>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold" style={{ color: status.memory?.percent > 80 ? 'var(--error)' : 'var(--accent)' }}>
              {status.memory?.percent || 0}%
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div>已用: {status.memory?.used_mb} MB</div>
              <div>总计: {status.memory?.total_mb} MB</div>
              <div>空闲: {status.memory?.free_mb} MB</div>
            </div>
          </div>
        </div>

        {/* 磁盘 */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>磁盘</h3>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold" style={{ color: status.disk?.percent?.includes('8') ? 'var(--error)' : 'var(--accent)' }}>
              {status.disk?.percent || '0%'}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div>已用: {status.disk?.used}</div>
              <div>总计: {status.disk?.total}</div>
              <div>空闲: {status.disk?.available}</div>
            </div>
          </div>
        </div>

        {/* 运行时间 */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>运行时间</h3>
          <div className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>{status.uptime || '未知'}</div>
        </div>
      </div>
    </div>
  );
}
