import { useState, useEffect } from 'react';

interface Session {
  id: string;
  created: string;
  updated: string;
  message_count: number;
  preview: string;
}

export default function SessionPanel() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadMessages = async (id: string) => {
    setSelected(id);
    try {
      const res = await fetch(`/api/sessions/${id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString('zh-CN', { hour12: false });
  };

  const deleteSession = async (id: string) => {
    if (!confirm('确定删除该会话？')) return;
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      loadSessions();
      if (selected === id) setSelected(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>💬 会话管理</h2>
        <button onClick={loadSessions} className="btn-glow">🔄 刷新</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 左侧：会话列表 */}
        <div className="glass-card p-4">
          <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>会话列表 ({sessions.length})</h3>
          <div className="space-y-2 max-h-96 overflow-auto">
            {sessions.map(s => (
              <div 
                key={s.id}
                onClick={() => loadMessages(s.id)}
                className="p-3 rounded-lg cursor-pointer transition-colors"
                style={{ 
                  background: selected === s.id ? 'var(--primary)' : 'var(--bg-primary)',
                  color: selected === s.id ? 'white' : 'var(--text-secondary)'
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-xs font-mono truncate flex-1">{s.id.slice(0, 8)}...</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                    className="text-xs ml-2 opacity-60 hover:opacity-100"
                  >
                    🗑️
                  </button>
                </div>
                <div className="text-xs mt-1 opacity-70">{formatTime(Number(s.updated) * 1000)}</div>
                <div className="text-xs mt-1 truncate opacity-60">{s.preview}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：消息详情 */}
        <div className="glass-card p-4">
          <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            {selected ? `消息详情 (${messages.length})` : '选择会话查看详情'}
          </h3>
          {selected ? (
            <div className="space-y-3 max-h-96 overflow-auto">
              {messages.map((msg, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: msg.role === 'user' ? 'var(--primary)' : 'var(--accent)' }}>
                      {msg.role === 'user' ? '👤 用户' : '🤖 AI'}
                    </span>
                    <span className="text-xs opacity-50">{formatTime(msg.timestamp || 0)}</span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {msg.content?.[0]?.text?.slice(0, 200) || msg.content?.text?.slice(0, 200) || '[无内容]'}
                    {(msg.content?.[0]?.text?.length > 200 || msg.content?.text?.length > 200) && '...'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 opacity-50" style={{ color: 'var(--text-muted)' }}>
              点击左侧会话查看消息
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
