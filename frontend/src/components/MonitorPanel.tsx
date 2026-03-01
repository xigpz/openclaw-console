import { useState, useEffect, useRef } from 'react';

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

export default function MonitorPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'user' | 'assistant'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // 每3秒轮询
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/monitor');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (ts: string) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false });
    } catch {
      return ts.slice(11, 19);
    }
  };

  const filtered = filter === 'all' ? messages : messages.filter(m => m.role === filter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📡 实时监控</h2>
        <button onClick={loadMessages} className="btn-glow">🔄 刷新</button>
      </div>

      <div className="flex gap-2">
        {(['all', 'user', 'assistant'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-lg text-sm"
            style={{ 
              background: filter === f ? 'var(--primary)' : 'var(--bg-elevated)',
              color: filter === f ? 'white' : 'var(--text-secondary)'
            }}
          >
            {f === 'all' ? '全部' : f === 'user' ? '👤 用户' : '🤖 AI'}
          </button>
        ))}
      </div>

      <div 
        ref={scrollRef}
        className="glass-card p-4 h-96 overflow-auto space-y-2"
      >
        {filtered.length === 0 ? (
          <div className="text-center py-12 opacity-50" style={{ color: 'var(--text-muted)' }}>
            等待消息...
          </div>
        ) : (
          filtered.map((msg, i) => (
            <div 
              key={i} 
              className="p-3 rounded-lg"
              style={{ 
                background: msg.role === 'user' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-primary)',
                borderLeft: msg.role === 'user' ? '3px solid var(--primary)' : '3px solid var(--accent)'
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium" style={{ color: msg.role === 'user' ? 'var(--primary)' : 'var(--accent)' }}>
                  {msg.role === 'user' ? '👤 用户' : '🤖 AI'}
                </span>
                <span className="text-xs opacity-50">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {msg.content?.slice(0, 200) || '[无内容]'}
                {msg.content?.length > 200 && '...'}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="glass-card p-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
        <p className="text-sm" style={{ color: 'var(--success)' }}>
          💡 自动每3秒刷新，显示最近50条消息
        </p>
      </div>
    </div>
  );
}
