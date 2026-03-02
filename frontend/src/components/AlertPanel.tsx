import { useState, useEffect } from 'react';

export default function AlertPanel() {
  const [alerts, setAlerts] = useState<Array<{id: number; type: string; message: string; enabled: boolean}>>([]);

  useEffect(() => {
    // 从localStorage加载
    const saved = localStorage.getItem('alerts');
    if (saved) {
      setAlerts(JSON.parse(saved));
    } else {
      // 默认告警
      const defaults = [
        { id: 1, type: 'error', message: '服务宕机', enabled: false },
        { id: 2, type: 'warning', message: '内存使用>80%', enabled: false },
        { id: 3, type: 'info', message: '定时任务失败', enabled: false },
      ];
      setAlerts(defaults);
      localStorage.setItem('alerts', JSON.stringify(defaults));
    }
  }, []);

  const toggle = (id: number) => {
    const updated = alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    setAlerts(updated);
    localStorage.setItem('alerts', JSON.stringify(updated));
  };

  const addAlert = () => {
    const msg = prompt('告警消息:');
    if (msg) {
      const updated = [...alerts, { id: Date.now(), type: 'info', message: msg, enabled: true }];
      setAlerts(updated);
      localStorage.setItem('alerts', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🔔 告警通知</h2>
        <button onClick={addAlert} className="btn-glow">➕ 添加</button>
      </div>

      {alerts.length === 0 ? (
        <div className="glass-card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          <p className="text-4xl mb-2">🔔</p>
          <p>暂无告警配置</p>
        </div>
      ) : (
      <div className="grid gap-4">
        {alerts.map(alert => (
          <div key={alert.id} className="glass-card p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {alert.type === 'error' ? '🔴' : alert.type === 'warning' ? '🟡' : '🔵'}
              </span>
              <span style={{ color: 'var(--text-primary)' }}>{alert.message}</span>
            </div>
            <button
              onClick={() => toggle(alert.id)}
              className="px-3 py-1 rounded text-sm"
              style={{ background: alert.enabled ? 'var(--primary)' : 'var(--bg-elevated)', color: alert.enabled ? 'white' : 'var(--text-muted)' }}
            >
              {alert.enabled ? '启用' : '禁用'}
            </button>
          </div>
        ))}
      </div>
      )}

      <div className="glass-card p-6">
        <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>通知方式</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          告警将通过飞书/Telegram发送通知。
        </p>
      </div>
    </div>
  );
}
