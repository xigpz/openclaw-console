import { useState, useEffect } from 'react';

export default function ConfigPanel() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success) setConfig(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const displayConfig = filter && config ? (JSON.stringify(config).includes(filter) ? config : null) : config;

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center flex-wrap gap-4 shrink-0">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>⚙️ 系统配置</h2>
        <div className="flex gap-2">
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="搜索..." className="input-glass text-sm py-2" style={{ width: '140px' }} />
          <button onClick={loadConfig} className="btn-glow text-sm py-2">🔄</button>
        </div>
      </div>

      <div className="glass-card p-4 flex-1 overflow-auto">
        <pre className="text-xs font-mono whitespace-pre-wrap break-all" style={{ color: 'var(--text-secondary)' }}>
          {displayConfig ? JSON.stringify(displayConfig, null, 2) : '无匹配结果'}
        </pre>
      </div>
    </div>
  );
}
