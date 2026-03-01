import { useState } from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  danger: boolean;
  action: string;
}

export default function QuickPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const actions: QuickAction[] = [
    { id: 'restart-gateway', label: '重启Gateway', icon: '🔄', danger: true, action: 'systemctl restart openclaw-gateway' },
    { id: 'restart-console', label: '重启Console', icon: '🔃', danger: true, action: 'systemctl restart openclaw-console' },
    { id: 'clear-cache', label: '清理缓存', icon: '🗑️', danger: false, action: 'rm -rf /root/.openclaw/cache/*' },
    { id: 'clear-logs', label: '清理日志', icon: '📜', danger: false, action: 'rm -rf /root/.openclaw/logs/*.log' },
    { id: 'sync-memory', label: '同步记忆', icon: '🧠', danger: false, action: '/root/.openclaw/workspace/sync-memory.sh' },
    { id: 'check-health', label: '健康检查', icon: '💚', danger: false, action: 'openclaw doctor' },
  ];

  const runAction = async (item: QuickAction) => {
    if (item.danger) {
      if (!confirm(`确定执行"${item.label}"？`)) return;
    }
    
    setLoading(item.id);
    try {
      const res = await fetch('/api/quick/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: item.action })
      });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ✅ ${item.label}: ${data.output || '成功'}`, ...prev.slice(0, 49)]);
      } else {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ❌ ${item.label}: ${data.error}`, ...prev.slice(0, 49)]);
      }
    } catch (e) {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ❌ ${item.label}: 请求失败`, ...prev.slice(0, 49)]);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>⚡ 快捷操作</h2>

      <div className="grid gap-3 md:grid-cols-3">
        {actions.map(item => (
          <button
            key={item.id}
            onClick={() => runAction(item)}
            disabled={loading !== null}
            className="glass-card p-4 flex items-center gap-3 hover:opacity-80 transition-opacity"
            style={{ 
              borderColor: item.danger ? 'rgba(239,68,68,0.3)' : 'var(--border-subtle)',
              opacity: loading === item.id ? 0.5 : 1
            }}
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="text-left">
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.danger ? '⚠️ 危险操作' : '安全操作'}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>操作日志</h3>
          <button 
            onClick={() => setLogs([])}
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            清空
          </button>
        </div>
        <div className="h-64 overflow-auto font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-muted)' }}>
              点击上方按钮执行操作
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="p-1 rounded" style={{ background: log.includes('✅') ? 'rgba(16,185,129,0.1)' : log.includes('❌') ? 'rgba(239,68,68,0.1)' : 'var(--bg-primary)' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
