import { useState, useEffect } from 'react';

interface Stats {
  totalMessages: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheRead: number;
  totalCacheWrite: number;
  estimatedCost: number;
  sessionCount: number;
}

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatNum = (n: number) => n.toLocaleString();
  const formatCost = (c: number) => c < 0.01 ? '¥0.01' : `¥${c.toFixed(2)}`;

  if (loading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!stats) {
    return <div className="text-center p-12" style={{ color: 'var(--text-muted)' }}>加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📊 使用统计</h2>
        <button onClick={loadStats} className="btn-glow">🔄 刷新</button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{stats.sessionCount}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>会话数</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{formatNum(stats.totalMessages)}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>消息数</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>{formatNum(stats.totalInputTokens + stats.totalOutputTokens)}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>总Tokens</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>{formatCost(stats.estimatedCost)}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>预估成本</div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Token 详情</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)' }}>输入 Tokens</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{formatNum(stats.totalInputTokens)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)' }}>输出 Tokens</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{formatNum(stats.totalOutputTokens)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)' }}>缓存读取</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{formatNum(stats.totalCacheRead)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-secondary)' }}>缓存写入</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{formatNum(stats.totalCacheWrite)}</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
        <p className="text-sm" style={{ color: 'var(--success)' }}>
          💡 基于 MiniMax M2.5 定价：输入¥1/1M，输出¥1/1M，缓存¥0.1/1M
        </p>
      </div>
    </div>
  );
}
