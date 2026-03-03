import { useState, useEffect } from 'react';

interface GatewayStatus {
  running: boolean;
  pid: number | null;
  uptime: string | null;
}

export default function GatewayPanel() {
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000); // 每5秒刷新
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const res = await fetch('/api/gateway/status');
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (e) {
      console.error('Failed to load status:', e);
    }
    setLoading(false);
  };

  const restartGateway = async () => {
    if (!confirm('确定要重启 Gateway 吗？')) return;
    
    setRestarting(true);
    try {
      const res = await fetch('/api/gateway/restart', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Gateway 正在重启...');
        // 等待几秒后刷新状态
        setTimeout(loadStatus, 5000);
      } else {
        alert('重启失败: ' + data.message);
      }
    } catch (e) {
      alert('请求失败');
    }
    setRestarting(false);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Gateway 管理</h2>

      {/* 状态卡片 */}
      <div className="rounded-lg p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${status?.running ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {status?.running ? '运行中' : '已停止'}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                OpenClaw Gateway
              </div>
            </div>
          </div>

          <button
            onClick={restartGateway}
            disabled={restarting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
          >
            {restarting ? '重启中...' : '重启 Gateway'}
          </button>
        </div>
      </div>

      {/* 信息 */}
      <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>状态信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>运行状态</span>
            <span className={status?.running ? 'text-green-500' : 'text-red-500'}>
              {status?.running ? '运行中' : '已停止'}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>最后更新</span>
            <span style={{ color: 'var(--text-primary)' }}>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
