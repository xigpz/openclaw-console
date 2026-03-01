import { useState, useEffect, useRef } from 'react';

export default function LogPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadLogs(); }, []);
  
  // 5秒自动刷新
  useEffect(() => {
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  // 自动滚动到最新
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // 如果滚动到接近底部，开启自动滚动
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setAutoScroll(true);
    } else {
      setAutoScroll(false);
    }
  };

  if (loading && logs.length === 0) return <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center gap-2 py-2 shrink-0">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>📋 运行日志</h2>
        <div className="flex gap-2 items-center">
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索..." className="input-glass text-sm py-1" style={{ width: '120px' }} />
          <button onClick={loadLogs} className="btn-glow text-xs py-1 px-2">🔄</button>
        </div>
      </div>

      {/* 日志内容 - 自适应高度 */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 glass-card p-2 overflow-auto text-xs font-mono"
        style={{ minHeight: '200px', maxHeight: 'calc(100vh - 280px)' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>暂无日志</div>
        ) : (
          filteredLogs.map((log, i) => (
            <div 
              key={i} 
              className="py-1 px-2 hover:bg-[var(--bg-elevated)] cursor-pointer rounded"
              style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              onClick={() => setSelectedLog(log)}
            >
              {log.slice(0, 200)}
            </div>
          ))
        )}
      </div>

      {/* 状态栏 */}
      <div className="flex justify-between items-center py-1 text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
        <span>{filteredLogs.length} 条日志 {autoScroll ? '✓ 自动滚动' : '○ 手动滚动'}</span>
        <button onClick={() => setAutoScroll(!autoScroll)} className="text-xs">
          {autoScroll ? '⏸ 暂停' : '▶️ 继续'}
        </button>
      </div>

      {/* 详情弹窗 */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <div className="glass-card p-4 w-full max-w-2xl max-h-[60vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>📝 日志详情</h3>
              <button onClick={() => setSelectedLog(null)} className="text-xl" style={{ color: 'var(--text-muted)' }}>×</button>
            </div>
            <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{selectedLog}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
