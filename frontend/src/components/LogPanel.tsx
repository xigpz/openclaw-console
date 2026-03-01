import { useState, useEffect } from 'react';

export default function LogPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success) setLogs(data.data || []);
    } catch (e) { setLogs([]); }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    keyword ? log.toLowerCase().includes(keyword.toLowerCase()) : true
  );

  const formatLog = (log: string) => {
    try {
      const json = JSON.parse(log);
      return JSON.stringify(json, null, 2);
    } catch {
      return log;
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📋 运行日志</h2>
        <div className="flex gap-3">
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索..." className="input-glass text-sm py-2" style={{ width: '180px' }} />
          <button onClick={loadLogs} className="btn-glow text-sm py-2">🔄</button>
        </div>
      </div>

      <div className="glass-card p-0" style={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>暂无日志</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {filteredLogs.map((log, i) => (
              <div key={i} className="p-3 hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors" onClick={() => setSelectedLog(log)}>
                <pre className="text-xs font-mono whitespace-pre-wrap break-all" style={{ color: 'var(--text-secondary)', maxHeight: '60px', overflow: 'hidden' }}>
                  {formatLog(log)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
          <div className="glass-card p-6 w-full max-w-4xl max-h-[80vh] overflow-auto my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>📝 日志详情</h3>
              <button onClick={() => setSelectedLog(null)} className="text-2xl" style={{ color: 'var(--text-muted)' }}>×</button>
            </div>
            <pre className="text-sm font-mono whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {formatLog(selectedLog)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
